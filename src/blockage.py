#!/usr/bin/env python3
"""
AHEADX - Road Blockage Detection Pipeline
Phase 4: Prolonged Stationary Vehicle Detection within Road ROI

Pipeline:
  traffic.mp4
  -> OpenCV
  -> YOLO vehicle detection
  -> ByteTrack object tracking
  -> Persistent vehicle IDs & center points
  -> Trajectory & stationary duration analysis
  -> Road ROI spatial verification
  -> Possible blockage event generation
  -> Output annotated video (data/output/traffic_blockage.mp4)
"""

import argparse
from collections import defaultdict, deque
import json
import os
import sys
import time
import cv2
import numpy as np
from ultralytics import YOLO

# Evaluated vehicle classes for blockage detection (COCO IDs):
# 2: car, 3: motorcycle, 5: bus, 7: truck
RELEVANT_CLASSES = {
    2: "car",
    3: "motorcycle",
    5: "bus",
    7: "truck",
}


class BlockageDetector:
    """
    Modular detector for identifying prolonged stationary vehicles
    within a configured road Region of Interest (ROI).
    """

    def __init__(
        self,
        min_stationary_duration_sec: float = 3.0,
        movement_threshold_px: float = 35.0,
        min_trajectory_history: int = 15,
        road_roi: list = None,
    ):
        """
        Args:
            min_stationary_duration_sec: Minimum stationary duration (seconds) before flagging.
            movement_threshold_px: Maximum pixel displacement allowed to be considered stationary.
            min_trajectory_history: Minimum trajectory points required before evaluation.
            road_roi: List of (x, y) tuples defining the road polygon. If None, entire frame is ROI.
        """
        self.min_stationary_duration_sec = float(min_stationary_duration_sec)
        self.movement_threshold_px = float(movement_threshold_px)
        self.min_trajectory_history = int(min_trajectory_history)

        self.road_roi = road_roi
        self.roi_contour = None
        if self.road_roi and len(self.road_roi) >= 3:
            self.roi_contour = np.array(self.road_roi, dtype=np.int32).reshape((-1, 1, 2))

        # Per-vehicle tracking state
        # track_id -> {
        #   'anchor': (x, y),
        #   'stationary_since': timestamp_sec,
        #   'trajectory': deque of (t, x, y)
        # }
        self.vehicle_states = {}
        self.events = {}  # track_id -> structured event dict

    def is_inside_roi(self, x: float, y: float) -> bool:
        """Check if point (x, y) is inside the road ROI polygon."""
        if self.roi_contour is None:
            return True
        dist = cv2.pointPolygonTest(self.roi_contour, (float(x), float(y)), False)
        return dist >= 0

    def update(
        self,
        vehicle_id: int,
        class_name: str,
        cx: float,
        cy: float,
        confidence: float,
        timestamp_sec: float,
    ) -> dict:
        """
        Update vehicle trajectory and evaluate stationary duration.

        Returns:
            Dict containing evaluation results for the vehicle in the current frame.
        """
        if vehicle_id not in self.vehicle_states:
            self.vehicle_states[vehicle_id] = {
                "anchor": (cx, cy),
                "stationary_since": timestamp_sec,
                "trajectory": deque(maxlen=60),
            }

        state = self.vehicle_states[vehicle_id]
        state["trajectory"].append((timestamp_sec, cx, cy))

        # 1. Check ROI containment
        inside_roi = self.is_inside_roi(cx, cy)

        # 2. Check displacement from stationary anchor
        anchor_x, anchor_y = state["anchor"]
        displacement = ((cx - anchor_x) ** 2 + (cy - anchor_y) ** 2) ** 0.5

        if displacement > self.movement_threshold_px:
            # Vehicle has moved significantly -> Reset stationary tracking
            state["anchor"] = (cx, cy)
            state["stationary_since"] = timestamp_sec
            stationary_duration = 0.0
            is_stationary = False
        else:
            # Vehicle remains within stationary jitter radius
            is_stationary = True
            stationary_duration = max(0.0, timestamp_sec - state["stationary_since"])

        # 3. Check sufficiency of history
        has_sufficient_history = len(state["trajectory"]) >= self.min_trajectory_history

        # 4. Check for possible blockage
        # Must be stationary for >= min duration, inside road ROI, and have sufficient track history
        is_possible_blockage = (
            inside_roi
            and is_stationary
            and has_sufficient_history
            and (stationary_duration >= self.min_stationary_duration_sec)
        )

        # Determine readable status label
        if not inside_roi:
            status_label = "OUTSIDE_ROI"
        elif not has_sufficient_history:
            status_label = "TRACKING"
        elif is_possible_blockage:
            status_label = "POSSIBLE BLOCKAGE"
        elif is_stationary and stationary_duration > 0.5:
            status_label = "SLOW / STOPPED"
        else:
            status_label = "MOVING"

        # 5. Generate or update structured event
        event = None
        if is_possible_blockage:
            event = {
                "event_type": "possible_blockage",
                "vehicle_id": vehicle_id,
                "vehicle_class": class_name,
                "stationary_duration": round(float(stationary_duration), 2),
                "location": {
                    "x": int(cx),
                    "y": int(cy),
                },
                "confidence": round(float(confidence), 2),
                "timestamp": round(float(timestamp_sec), 2),
            }
            # Record or update latest event state
            self.events[vehicle_id] = event

        return {
            "vehicle_id": vehicle_id,
            "class": class_name,
            "confidence": round(float(confidence), 2),
            "location": (int(cx), int(cy)),
            "inside_roi": inside_roi,
            "is_stationary": is_stationary,
            "stationary_duration": round(float(stationary_duration), 2),
            "displacement_from_anchor": round(float(displacement), 2),
            "possible_blockage": is_possible_blockage,
            "status_label": status_label,
            "event": event,
        }

    def get_events(self) -> list:
        """Return list of all recorded blockage events."""
        return list(self.events.values())


def draw_blockage_annotation(frame, box, eval_result):
    """
    Renders visual indicators:
      - Possible Blockage: Warning Amber/Orange double-box and prominent banner.
      - Moving / Normal: Standard clean green box.
      - Stopped / Slow: Light yellow box.
      - Outside ROI: Subtle gray box.
    """
    x1, y1, x2, y2 = [int(v) for v in box]
    status = eval_result["status_label"]
    vehicle_id = eval_result["vehicle_id"]
    duration = eval_result["stationary_duration"]
    cx, cy = eval_result["location"]
    is_blockage = eval_result["possible_blockage"]

    if is_blockage:
        # High-visibility Warning Amber/Orange (BGR: 0, 140, 255)
        color = (0, 140, 255)
        # Double bounding box for emphasis
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 3, lineType=cv2.LINE_AA)
        cv2.rectangle(frame, (x1 - 3, y1 - 3), (x2 + 3, y2 + 3), (0, 69, 255), 1, lineType=cv2.LINE_AA)
        cv2.circle(frame, (cx, cy), 5, (0, 0, 255), -1, lineType=cv2.LINE_AA)

        # Multi-line banner
        line1 = f"ID {vehicle_id} | POSSIBLE BLOCKAGE"
        line2 = f"Stationary: {duration:.1f}s"

        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.55
        thickness = 2
        (w1, h1), _ = cv2.getTextSize(line1, font, font_scale, thickness)
        (w2, h2), _ = cv2.getTextSize(line2, font, 0.50, 1)

        banner_w = max(w1, w2) + 12
        banner_h = h1 + h2 + 14
        banner_y1 = max(0, y1 - banner_h)
        banner_y2 = y1

        cv2.rectangle(frame, (x1, banner_y1), (x1 + banner_w, banner_y2), color, -1)
        cv2.putText(frame, line1, (x1 + 6, banner_y1 + h1 + 3), font, font_scale, (0, 0, 0), thickness, cv2.LINE_AA)
        cv2.putText(frame, line2, (x1 + 6, banner_y2 - 4), font, 0.50, (0, 0, 0), 1, cv2.LINE_AA)

    elif status == "SLOW / STOPPED":
        color = (0, 215, 255)  # Yellow
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2, lineType=cv2.LINE_AA)
        cv2.circle(frame, (cx, cy), 4, color, -1)
        label = f"ID {vehicle_id} | STOPPED ({duration:.1f}s)"
        (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.48, 1)
        cv2.rectangle(frame, (x1, max(0, y1 - th - 6)), (x1 + tw + 6, y1), color, -1)
        cv2.putText(frame, label, (x1 + 3, y1 - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.48, (0, 0, 0), 1, cv2.LINE_AA)

    elif status == "OUTSIDE_ROI":
        color = (150, 150, 150)  # Muted Gray
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 1, lineType=cv2.LINE_AA)
        label = f"ID {vehicle_id} | OFF-ROAD"
        (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.45, 1)
        cv2.rectangle(frame, (x1, max(0, y1 - th - 4)), (x1 + tw + 4, y1), color, -1)
        cv2.putText(frame, label, (x1 + 2, y1 - 3), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 0), 1, cv2.LINE_AA)

    else:
        color = (0, 255, 0)  # Green
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2, lineType=cv2.LINE_AA)
        cv2.circle(frame, (cx, cy), 4, color, -1)
        label = f"ID {vehicle_id} | MOVING"
        (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.48, 1)
        cv2.rectangle(frame, (x1, max(0, y1 - th - 6)), (x1 + tw + 6, y1), color, -1)
        cv2.putText(frame, label, (x1 + 3, y1 - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.48, (0, 0, 0), 1, cv2.LINE_AA)


def draw_roi_overlay(frame, roi_polygon):
    """Draws a subtle road ROI boundary on the frame."""
    if not roi_polygon or len(roi_polygon) < 3:
        return
    pts = np.array(roi_polygon, dtype=np.int32).reshape((-1, 1, 2))
    # Draw road boundary outline in subtle dashed/colored cyan
    cv2.polylines(frame, [pts], isClosed=True, color=(255, 255, 0), thickness=2, lineType=cv2.LINE_AA)
    # ROI label tag
    top_pt = min(roi_polygon, key=lambda p: p[1])
    cv2.putText(
        frame,
        "MONITORED ROAD ROI",
        (top_pt[0] + 10, top_pt[1] + 25),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.55,
        (255, 255, 0),
        2,
        cv2.LINE_AA,
    )


def process_video_blockage(
    input_path: str = "data/videos/traffic.mp4",
    output_path: str = "data/output/traffic_blockage.mp4",
    min_stationary_duration_sec: float = 3.0,
    movement_threshold_px: float = 35.0,
    min_trajectory_history: int = 15,
    road_roi: list = None,
    model_name: str = "yolov8n.pt",
    tracker_config: str = "bytetrack.yaml",
    conf_thresh: float = 0.35,
    show_preview: bool = False,
    events_json_path: str = "data/output/blockage_events.json",
):
    """
    Executes the full Road Blockage Detection pipeline on a traffic video.
    """
    # 1. Resolve input video
    if not os.path.exists(input_path):
        for candidate in ["data/videos/traffic.mp4", "data/input/traffic.mp4"]:
            if os.path.exists(candidate):
                input_path = candidate
                break
        if not os.path.exists(input_path):
            print(f"[!] ERROR: Input traffic video not found at: {input_path}")
            return False, {}

    # 2. Setup OpenCV VideoCapture
    print(f"\n[+] Opening input video: {input_path}")
    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        print(f"[!] ERROR: Could not open video file: {input_path}")
        return False, {}

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0 or fps is None:
        fps = 23.98
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    print(f"[+] Video Properties: {width}x{height} @ {fps:.2f} FPS | Total Frames: {total_frames}")

    # 3. Default ROI covering active roadway if none provided
    # Standard perspective road polygon spanning the driving lanes
    if road_roi is None:
        road_roi = [
            (int(width * 0.05), int(height * 0.95)),
            (int(width * 0.25), int(height * 0.15)),
            (int(width * 0.85), int(height * 0.15)),
            (int(width * 0.98), int(height * 0.95)),
        ]

    # 4. Initialize BlockageDetector
    detector = BlockageDetector(
        min_stationary_duration_sec=min_stationary_duration_sec,
        movement_threshold_px=movement_threshold_px,
        min_trajectory_history=min_trajectory_history,
        road_roi=road_roi,
    )

    # 5. Setup VideoWriter
    output_dir = os.path.dirname(output_path)
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    if not writer.isOpened():
        print(f"[!] ERROR: Could not initialize VideoWriter for: {output_path}")
        cap.release()
        return False, {}

    # 6. Load YOLO
    print(f"[+] Loading YOLO model: {model_name}...")
    model = YOLO(model_name)
    print(f"[+] Min Stationary Duration Threshold: {min_stationary_duration_sec}s")
    print(f"[+] Movement Threshold: {movement_threshold_px}px | Min History: {min_trajectory_history} frames")
    print(f"[+] Evaluated Vehicle Classes: {list(RELEVANT_CLASSES.values())}")
    print(f"[+] Road ROI Polygon: {road_roi}")

    unique_tracked_vehicles = set()
    active_blockages = set()
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

            current_blockages = 0

            # Draw ROI boundary on frame
            draw_roi_overlay(frame, road_roi)

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

                        cx = int((coords[0] + coords[2]) / 2.0)
                        cy = int((coords[1] + coords[3]) / 2.0)

                        # Update blockage detector
                        eval_res = detector.update(
                            vehicle_id=track_id,
                            class_name=cls_name,
                            cx=cx,
                            cy=cy,
                            confidence=conf,
                            timestamp_sec=timestamp_sec,
                        )

                        if eval_res["possible_blockage"]:
                            current_blockages += 1
                            active_blockages.add(track_id)

                        # Draw bounding box and blockage banners
                        draw_blockage_annotation(frame, coords, eval_res)

            # Draw HUD overlay
            hud_bg_w = 680
            cv2.rectangle(frame, (10, 10), (hud_bg_w, 75), (20, 20, 20), -1)
            cv2.rectangle(frame, (10, 10), (hud_bg_w, 75), (60, 60, 60), 1)

            cv2.putText(
                frame,
                f"AHEADX | Road Blockage Detection | Frame: {frame_idx}/{total_frames}",
                (18, 33),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.58,
                (255, 255, 255),
                1,
                cv2.LINE_AA,
            )

            status_color = (0, 140, 255) if len(active_blockages) > 0 else (0, 255, 0)
            cv2.putText(
                frame,
                f"Tracked Vehicles: {len(unique_tracked_vehicles)} | "
                f"Possible Blockages: {len(active_blockages)} | Threshold: {min_stationary_duration_sec:.1f}s",
                (18, 60),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.55,
                status_color,
                2,
                cv2.LINE_AA,
            )

            writer.write(frame)

            if show_preview:
                cv2.imshow("AHEADX - Road Blockage Detection", frame)
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
                    f"Possible Blockages: {len(active_blockages)}"
                )
                sys.stdout.flush()

    finally:
        cap.release()
        writer.release()
        if show_preview:
            cv2.destroyAllWindows()

    total_time = time.time() - start_time
    avg_fps = frame_idx / total_time if total_time > 0 else 0

    # Save structured events to JSON
    events_list = detector.get_events()
    if events_json_path:
        os.makedirs(os.path.dirname(events_json_path), exist_ok=True)
        with open(events_json_path, "w") as f:
            json.dump(events_list, f, indent=2)

    stats = {
        "frames_processed": frame_idx,
        "total_frames": total_frames,
        "tracked_vehicles": len(unique_tracked_vehicles),
        "possible_blockage_events": len(events_list),
        "events": events_list,
        "output_path": os.path.abspath(output_path),
        "events_json_path": os.path.abspath(events_json_path) if events_json_path else None,
        "time_taken_seconds": total_time,
        "average_fps": avg_fps,
        "min_stationary_duration_sec": min_stationary_duration_sec,
    }

    print("\n" + "=" * 70)
    print(" [✓] Road Blockage Detection Complete!")
    print(f" Frames Processed: {frame_idx}/{total_frames}")
    print(f" Total Tracked Vehicles: {len(unique_tracked_vehicles)}")
    print(f" Possible Blockage Events: {len(events_list)}")
    print(f" Configured Stationary Threshold: {min_stationary_duration_sec}s")
    print(f" Output Video Saved to: {stats['output_path']}")
    if events_json_path:
        print(f" Structured Events JSON: {stats['events_json_path']}")
    print("=" * 70 + "\n")

    return True, stats


def parse_args():
    parser = argparse.ArgumentParser(
        description="AHEADX Phase 4: Road Blockage Detection"
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
        default="data/output/traffic_blockage.mp4",
        help="Path to output video (default: data/output/traffic_blockage.mp4)",
    )
    parser.add_argument(
        "--min-stationary-duration",
        "-s",
        type=float,
        default=3.0,
        help="Minimum stationary duration in seconds to trigger possible blockage (default: 3.0)",
    )
    parser.add_argument(
        "--movement-threshold",
        type=float,
        default=35.0,
        help="Maximum displacement (px) within which vehicle is considered stationary (default: 35.0)",
    )
    parser.add_argument(
        "--min-history",
        type=int,
        default=15,
        help="Minimum trajectory points required before evaluation (default: 15)",
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
        default="data/output/blockage_events.json",
        help="Path to save structured events as JSON (default: data/output/blockage_events.json)",
    )
    parser.add_argument(
        "--show",
        action="store_true",
        help="Display live preview window while processing",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    success, stats = process_video_blockage(
        input_path=args.input,
        output_path=args.output,
        min_stationary_duration_sec=args.min_stationary_duration,
        movement_threshold_px=args.movement_threshold,
        min_trajectory_history=args.min_history,
        conf_thresh=args.conf,
        show_preview=args.show,
        events_json_path=args.events_json,
    )
    if not success:
        sys.exit(1)


if __name__ == "__main__":
    main()
