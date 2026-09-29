#!/usr/bin/env python3
"""
AHEADX - Wrong-Side Driving Detection Pipeline
Phase 3: Direction Analysis and Suspected Wrong-Side Vehicle Detection

Pipeline:
  traffic.mp4
  -> OpenCV
  -> YOLO vehicle detection
  -> ByteTrack object tracking
  -> Persistent vehicle IDs & center points
  -> Trajectory movement vector calculation
  -> Comparison against configured allowed road direction
  -> Suspected wrong-side event generation
  -> Output annotated video (data/output/traffic_wrong_side.mp4)
"""

import argparse
from collections import defaultdict, deque
import json
import math
import os
import sys
import time
import cv2
import numpy as np
from ultralytics import YOLO

# Evaluated vehicle classes for wrong-side detection (COCO IDs):
# 2: car, 3: motorcycle, 5: bus, 7: truck
RELEVANT_CLASSES = {
    2: "car",
    3: "motorcycle",
    5: "bus",
    7: "truck",
}

# Standard cardinal direction unit vectors (x, y) where +x is right, +y is down (OpenCV screen coords)
DIRECTION_VECTORS = {
    "right": (1.0, 0.0),
    "left": (-1.0, 0.0),
    "down": (0.0, 1.0),
    "up": (0.0, -1.0),
}


class DirectionAnalyzer:
    """
    Analyzes vehicle trajectory to calculate movement vectors,
    cardinal directions, and suspected wrong-side events.
    """

    def __init__(
        self,
        allowed_direction: str = "right",
        min_movement_px: float = 25.0,
        history_window: int = 15,
        wrong_side_angle_thresh_deg: float = 120.0,
    ):
        """
        Args:
            allowed_direction: Allowed road flow direction ('right', 'left', 'down', 'up').
            min_movement_px: Minimum Euclidean pixel displacement required to classify movement.
            history_window: Number of trajectory frames back to compute movement vector.
            wrong_side_angle_thresh_deg: Minimum angle difference (degrees) from allowed direction
                                         to classify as suspected wrong-side (default 120°).
        """
        allowed_norm = allowed_direction.strip().lower()
        if allowed_norm not in DIRECTION_VECTORS:
            raise ValueError(
                f"Unknown allowed_direction '{allowed_direction}'. "
                f"Must be one of: {list(DIRECTION_VECTORS.keys())}"
            )
        self.allowed_direction = allowed_norm
        self.allowed_vector = DIRECTION_VECTORS[allowed_norm]
        self.min_movement_px = float(min_movement_px)
        self.history_window = int(history_window)
        self.wrong_side_angle_thresh_deg = float(wrong_side_angle_thresh_deg)

    def calculate_vector(self, trajectory_pts):
        """
        Calculate movement vector (dx, dy) across the history window.
        Returns:
            (dx, dy), displacement_magnitude
        """
        if len(trajectory_pts) < 2:
            return (0.0, 0.0), 0.0

        # Compare current point with point N frames back
        idx_past = max(0, len(trajectory_pts) - self.history_window)
        x_past, y_past = trajectory_pts[idx_past]
        x_curr, y_curr = trajectory_pts[-1]

        dx = float(x_curr - x_past)
        dy = float(y_curr - y_past)
        magnitude = math.hypot(dx, dy)
        return (dx, dy), magnitude

    def get_cardinal_direction(self, dx: float, dy: float, magnitude: float) -> str:
        """Map movement vector (dx, dy) to primary cardinal direction."""
        if magnitude < self.min_movement_px:
            return "STATIONARY"
        if abs(dx) >= abs(dy):
            return "RIGHT" if dx > 0 else "LEFT"
        else:
            return "DOWN" if dy > 0 else "UP"

    def evaluate_vehicle(
        self,
        vehicle_id: int,
        class_name: str,
        confidence: float,
        trajectory_pts,
        timestamp_sec: float = 0.0,
        frame_idx: int = 0,
    ):
        """
        Evaluate if a tracked vehicle is moving in the allowed direction or
        suspected of wrong-side driving.

        Returns a dictionary with:
            vehicle_id, class, movement_direction, movement_vector,
            confidence, wrong_side, status_label, event (if suspected)
        """
        (dx, dy), magnitude = self.calculate_vector(trajectory_pts)
        cardinal_dir = self.get_cardinal_direction(dx, dy, magnitude)

        # 1. If displacement is below threshold, vehicle is stationary or hasn't moved enough
        if magnitude < self.min_movement_px:
            return {
                "vehicle_id": vehicle_id,
                "class": class_name,
                "movement_direction": cardinal_dir,
                "movement_vector": [round(dx, 2), round(dy, 2)],
                "displacement_px": round(magnitude, 2),
                "confidence": round(float(confidence), 2),
                "wrong_side": False,
                "status_label": "STATIONARY" if len(trajectory_pts) >= self.history_window else "INITIALIZING",
                "angle_diff_deg": 0.0,
                "event": None,
            }

        # 2. Compute angle between vehicle movement vector and allowed vector
        # dot product = dx * ax + dy * ay
        ax, ay = self.allowed_vector
        dot = (dx * ax + dy * ay) / magnitude
        dot_clamped = max(-1.0, min(1.0, dot))
        angle_diff_deg = math.degrees(math.acos(dot_clamped))

        # 3. Check if angle difference exceeds wrong-side threshold
        is_wrong_side = angle_diff_deg >= self.wrong_side_angle_thresh_deg
        status_label = "SUSPECTED WRONG SIDE" if is_wrong_side else "NORMAL"

        # 4. Structured event representation if suspected
        event = None
        if is_wrong_side:
            event = {
                "event_type": "suspected_wrong_side",
                "vehicle_id": vehicle_id,
                "vehicle_class": class_name,
                "direction": cardinal_dir.lower(),
                "allowed_direction": self.allowed_direction,
                "confidence": round(float(confidence), 2),
                "movement_vector": [round(dx, 2), round(dy, 2)],
                "displacement_px": round(magnitude, 2),
                "angle_difference_deg": round(angle_diff_deg, 1),
                "timestamp_sec": round(float(timestamp_sec), 2),
                "frame_index": frame_idx,
            }

        return {
            "vehicle_id": vehicle_id,
            "class": class_name,
            "movement_direction": cardinal_dir,
            "movement_vector": [round(dx, 2), round(dy, 2)],
            "displacement_px": round(magnitude, 2),
            "confidence": round(float(confidence), 2),
            "wrong_side": is_wrong_side,
            "status_label": status_label,
            "angle_diff_deg": round(angle_diff_deg, 1),
            "event": event,
        }


def draw_wrong_side_annotation(frame, box, eval_result, trajectory_pts):
    """
    Renders visual indicators:
      - Normal vehicle: Green bounding box, trajectory, and status banner.
      - Suspected wrong-side vehicle: High-visibility RED box, warning banner, warning symbol.
      - Stationary / Initializing: Cyan / muted color.
    """
    x1, y1, x2, y2 = [int(v) for v in box]
    status = eval_result["status_label"]
    vehicle_id = eval_result["vehicle_id"]
    cardinal_dir = eval_result["movement_direction"]
    is_wrong_side = eval_result["wrong_side"]

    if is_wrong_side:
        box_color = (0, 0, 255)       # Bright Red for suspected wrong side
        trail_color = (0, 69, 255)    # Orange-Red for path
        thickness = 3
    elif status == "NORMAL":
        box_color = (0, 255, 0)       # Green for normal vehicles
        trail_color = (0, 215, 255)   # Yellow for path
        thickness = 2
    else:
        box_color = (255, 200, 0)     # Light Cyan/Blue for stationary/initializing
        trail_color = (200, 200, 200)
        thickness = 1

    # 1. Draw trajectory path trail
    if len(trajectory_pts) > 1:
        points = np.array(trajectory_pts, dtype=np.int32).reshape((-1, 1, 2))
        cv2.polylines(frame, [points], isClosed=False, color=trail_color, thickness=2, lineType=cv2.LINE_AA)

    # 2. Draw vehicle center point
    cx = int((x1 + x2) / 2.0)
    cy = int((y1 + y2) / 2.0)
    cv2.circle(frame, (cx, cy), 4, box_color, -1, lineType=cv2.LINE_AA)

    # 3. Draw bounding box
    cv2.rectangle(frame, (x1, y1), (x2, y2), box_color, thickness, lineType=cv2.LINE_AA)

    # 4. Label banner text: e.g. "ID 54 | LEFT | WRONG SIDE" or "ID 27 | RIGHT | NORMAL"
    if is_wrong_side:
        label = f"ID {vehicle_id} | {cardinal_dir} | SUSPECTED WRONG SIDE"
    elif status == "NORMAL":
        label = f"ID {vehicle_id} | {cardinal_dir} | NORMAL"
    else:
        label = f"ID {vehicle_id} | {cardinal_dir}"

    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.52
    text_thickness = 1 if not is_wrong_side else 2
    (text_w, text_h), baseline = cv2.getTextSize(label, font, font_scale, text_thickness)

    banner_y1 = max(0, y1 - text_h - baseline - 6)
    banner_y2 = y1
    banner_x2 = x1 + text_w + 8

    cv2.rectangle(frame, (x1, banner_y1), (banner_x2, banner_y2), box_color, -1)
    text_color = (255, 255, 255) if is_wrong_side else (0, 0, 0)
    text_origin = (x1 + 4, banner_y2 - baseline - 3)
    cv2.putText(frame, label, text_origin, font, font_scale, text_color, text_thickness, cv2.LINE_AA)


def process_video_wrong_side(
    input_path: str = "data/videos/traffic.mp4",
    output_path: str = "data/output/traffic_wrong_side.mp4",
    allowed_direction: str = "right",
    min_movement_px: float = 25.0,
    history_window: int = 15,
    wrong_side_angle_thresh_deg: float = 120.0,
    model_name: str = "yolov8n.pt",
    tracker_config: str = "bytetrack.yaml",
    conf_thresh: float = 0.35,
    show_preview: bool = False,
    events_json_path: str = None,
):
    """
    Executes the full wrong-side detection pipeline on a video file.
    """
    # 1. Validate input video
    if not os.path.exists(input_path):
        for candidate in ["data/videos/traffic.mp4", "data/input/traffic.mp4"]:
            if os.path.exists(candidate):
                input_path = candidate
                break
        if not os.path.exists(input_path):
            print(f"[!] ERROR: Input traffic video not found at: {input_path}")
            return False, {}

    # 2. Initialize analyzer
    analyzer = DirectionAnalyzer(
        allowed_direction=allowed_direction,
        min_movement_px=min_movement_px,
        history_window=history_window,
        wrong_side_angle_thresh_deg=wrong_side_angle_thresh_deg,
    )

    # 3. Setup OpenCV VideoCapture
    print(f"\n[+] Opening input video: {input_path}")
    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        print(f"[!] ERROR: Could not open video file: {input_path}")
        return False, {}

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0 or fps is None:
        fps = 30.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    print(f"[+] Video Properties: {width}x{height} @ {fps:.2f} FPS | Total Frames: {total_frames}")

    # 4. Setup VideoWriter
    output_dir = os.path.dirname(output_path)
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    if not writer.isOpened():
        print(f"[!] ERROR: Could not initialize VideoWriter for: {output_path}")
        cap.release()
        return False, {}

    # 5. Load YOLO
    print(f"[+] Loading YOLO model: {model_name}...")
    model = YOLO(model_name)
    print(f"[+] Allowed Road Direction: '{analyzer.allowed_direction.upper()}'")
    print(f"[+] Evaluated Vehicle Classes: {list(RELEVANT_CLASSES.values())}")
    print(f"[+] Movement Threshold: {min_movement_px}px | Angle Tolerance: {wrong_side_angle_thresh_deg}°")

    # 6. Tracking and Event structures
    track_trajectories = defaultdict(lambda: deque(maxlen=45))
    unique_tracked_vehicles = set()
    suspected_wrong_side_events = {}  # vehicle_id -> event dict (deduplicated)
    frame_idx = 0
    start_time = time.time()

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            frame_idx += 1
            timestamp_sec = frame_idx / fps

            # ByteTrack tracking
            results = model.track(
                source=frame,
                persist=True,
                tracker=tracker_config,
                classes=list(RELEVANT_CLASSES.keys()),
                conf=conf_thresh,
                verbose=False,
            )

            current_wrong_side_count = 0

            if results and len(results) > 0:
                boxes = results[0].boxes
                if boxes is not None and len(boxes) > 0:
                    for box in boxes:
                        coords = box.xyxy[0].cpu().numpy()
                        cls_id = int(box.cls[0].item())
                        cls_name = RELEVANT_CLASSES.get(cls_id, model.names.get(cls_id, str(cls_id)))
                        conf = float(box.conf[0].item())

                        if box.id is None:
                            continue

                        track_id = int(box.id[0].item())
                        unique_tracked_vehicles.add(track_id)

                        # Center coordinate & trajectory update
                        cx = int((coords[0] + coords[2]) / 2.0)
                        cy = int((coords[1] + coords[3]) / 2.0)
                        track_trajectories[track_id].append((cx, cy))

                        # Evaluate direction and wrong-side driving
                        eval_res = analyzer.evaluate_vehicle(
                            vehicle_id=track_id,
                            class_name=cls_name,
                            confidence=conf,
                            trajectory_pts=list(track_trajectories[track_id]),
                            timestamp_sec=timestamp_sec,
                            frame_idx=frame_idx,
                        )

                        if eval_res["wrong_side"]:
                            current_wrong_side_count += 1
                            if track_id not in suspected_wrong_side_events:
                                suspected_wrong_side_events[track_id] = eval_res["event"]

                        # Draw annotations
                        draw_wrong_side_annotation(
                            frame,
                            coords,
                            eval_res,
                            list(track_trajectories[track_id]),
                        )

            # Draw HUD overlay
            hud_bg_w = 660
            cv2.rectangle(frame, (10, 10), (hud_bg_w, 75), (20, 20, 20), -1)
            cv2.rectangle(frame, (10, 10), (hud_bg_w, 75), (60, 60, 60), 1)

            cv2.putText(
                frame,
                f"AHEADX | Allowed Flow: {analyzer.allowed_direction.upper()} | Frame: {frame_idx}/{total_frames}",
                (18, 33),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.58,
                (255, 255, 255),
                1,
                cv2.LINE_AA,
            )

            status_color = (0, 0, 255) if len(suspected_wrong_side_events) > 0 else (0, 255, 0)
            cv2.putText(
                frame,
                f"Tracked Vehicles: {len(unique_tracked_vehicles)} | "
                f"Suspected Wrong-Side Events: {len(suspected_wrong_side_events)}",
                (18, 60),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.58,
                status_color,
                2,
                cv2.LINE_AA,
            )

            writer.write(frame)

            if show_preview:
                cv2.imshow("AHEADX - Wrong-Side Driving Detection", frame)
                if cv2.waitKey(1) & 0xFF == ord("q"):
                    print("\n[!] Processing stopped by user.")
                    break

            if frame_idx % 15 == 0 or frame_idx == total_frames:
                elapsed = time.time() - start_time
                fps_proc = frame_idx / elapsed if elapsed > 0 else 0
                pct = (frame_idx / total_frames * 100) if total_frames > 0 else 0
                sys.stdout.write(
                    f"\r--> Processing: Frame {frame_idx}/{total_frames} ({pct:.1f}%) | "
                    f"Speed: {fps_proc:.1f} FPS | Tracked: {len(unique_tracked_vehicles)} | "
                    f"Suspected Wrong-Side: {len(suspected_wrong_side_events)}"
                )
                sys.stdout.flush()

    finally:
        cap.release()
        writer.release()
        if show_preview:
            cv2.destroyAllWindows()

    total_time = time.time() - start_time
    avg_fps = frame_idx / total_time if total_time > 0 else 0

    # Save structured events to JSON if path provided
    events_list = list(suspected_wrong_side_events.values())
    if events_json_path:
        os.makedirs(os.path.dirname(events_json_path), exist_ok=True)
        with open(events_json_path, "w") as f:
            json.dump(events_list, f, indent=2)

    stats = {
        "frames_processed": frame_idx,
        "total_frames": total_frames,
        "tracked_vehicles": len(unique_tracked_vehicles),
        "suspected_wrong_side_events": len(events_list),
        "events": events_list,
        "output_path": os.path.abspath(output_path),
        "time_taken_seconds": total_time,
        "average_fps": avg_fps,
    }

    print("\n" + "=" * 70)
    print(" [✓] Wrong-Side Driving Detection Complete!")
    print(f" Frames Processed: {frame_idx}/{total_frames}")
    print(f" Total Tracked Vehicles: {len(unique_tracked_vehicles)}")
    print(f" Suspected Wrong-Side Events: {len(events_list)}")
    print(f" Output Video Saved to: {stats['output_path']}")
    if events_json_path:
        print(f" Structured Events JSON: {os.path.abspath(events_json_path)}")
    print("=" * 70 + "\n")

    return True, stats


def parse_args():
    parser = argparse.ArgumentParser(
        description="AHEADX Phase 3: Wrong-Side Driving Detection"
    )
    parser.add_argument(
        "--input",
        "-i",
        type=str,
        default="data/videos/traffic.mp4",
        help="Path to input video (default: data/videos/traffic.mp4)",
    )
    parser.add_argument(
        "--output",
        "-o",
        type=str,
        default="data/output/traffic_wrong_side.mp4",
        help="Path to output video (default: data/output/traffic_wrong_side.mp4)",
    )
    parser.add_argument(
        "--allowed-direction",
        "-d",
        type=str,
        default="right",
        choices=["right", "left", "down", "up"],
        help="Configured allowed road flow direction (default: right)",
    )
    parser.add_argument(
        "--min-movement",
        type=float,
        default=25.0,
        help="Minimum pixel displacement threshold to avoid stationary false positives (default: 25.0)",
    )
    parser.add_argument(
        "--history-window",
        type=int,
        default=15,
        help="Number of frames across which to compute movement vector (default: 15)",
    )
    parser.add_argument(
        "--angle-thresh",
        type=float,
        default=120.0,
        help="Angle threshold in degrees from allowed direction for wrong-side detection (default: 120.0)",
    )
    parser.add_argument(
        "--conf",
        "-c",
        type=float,
        default=0.35,
        help="Detection confidence threshold (default: 0.35)",
    )
    parser.add_argument(
        "--events-json",
        type=str,
        default="data/output/wrong_side_events.json",
        help="Optional path to save structured events as JSON (default: data/output/wrong_side_events.json)",
    )
    parser.add_argument(
        "--show",
        action="store_true",
        help="Display live preview window while processing",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    success, stats = process_video_wrong_side(
        input_path=args.input,
        output_path=args.output,
        allowed_direction=args.allowed_direction,
        min_movement_px=args.min_movement,
        history_window=args.history_window,
        wrong_side_angle_thresh_deg=args.angle_thresh,
        conf_thresh=args.conf,
        show_preview=args.show,
        events_json_path=args.events_json,
    )
    if not success:
        sys.exit(1)


if __name__ == "__main__":
    main()
