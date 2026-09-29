#!/usr/bin/env python3
"""
AHEADX - Vehicle Tracking Pipeline
Phase 2: Object Tracking with ByteTrack

Pipeline:
  Traffic video
  -> OpenCV
  -> YOLO vehicle detection
  -> ByteTrack tracking
  -> Persistent vehicle IDs
  -> Vehicle center coordinates
  -> Vehicle trajectory history
  -> Output video with IDs & trails
"""

import argparse
from collections import defaultdict, deque
import os
import sys
import time
import cv2
import numpy as np
from ultralytics import YOLO

# Standard COCO vehicle class IDs:
# 1: bicycle, 2: car, 3: motorcycle, 5: bus, 7: truck
DEFAULT_VEHICLE_CLASSES = [1, 2, 3, 5, 7]

# Distinct palette of high-contrast BGR colors for tracking visualization
TRACK_PALETTE = [
    (0, 255, 0),      # Bright Green
    (0, 215, 255),    # Gold / Yellow
    (255, 128, 0),    # Vivid Cyan/Blue
    (0, 165, 255),    # Orange
    (255, 0, 255),    # Magenta
    (0, 255, 255),    # Pure Yellow
    (255, 51, 153),   # Pink
    (50, 205, 50),    # Lime Green
    (255, 191, 0),    # Deep Sky Blue
    (147, 20, 255),   # Deep Pink
    (0, 128, 255),    # Light Orange
    (255, 255, 0),    # Cyan
]


def get_track_color(track_id: int):
    """Return a consistent color for a given track ID."""
    if track_id is None:
        return (200, 200, 200)
    return TRACK_PALETTE[abs(int(track_id)) % len(TRACK_PALETTE)]


def parse_args():
    parser = argparse.ArgumentParser(
        description="AHEADX Phase 2: YOLO + ByteTrack Vehicle Tracking"
    )
    parser.add_argument(
        "--input",
        "-i",
        type=str,
        default="data/videos/traffic.mp4",
        help="Path to input traffic video (default: data/videos/traffic.mp4)",
    )
    parser.add_argument(
        "--output",
        "-o",
        type=str,
        default="data/output/traffic_tracked.mp4",
        help="Path to save output video (default: data/output/traffic_tracked.mp4)",
    )
    parser.add_argument(
        "--tracker",
        "-t",
        type=str,
        default="bytetrack.yaml",
        help="Tracker configuration file (default: bytetrack.yaml)",
    )
    parser.add_argument(
        "--model",
        "-m",
        type=str,
        default="yolov8n.pt",
        help="YOLO model path or model name (default: yolov8n.pt)",
    )
    parser.add_argument(
        "--conf",
        "-c",
        type=float,
        default=0.35,
        help="Confidence threshold for vehicle detection (default: 0.35)",
    )
    parser.add_argument(
        "--trail-len",
        type=int,
        default=30,
        help="Maximum length of vehicle trajectory path in frames (default: 30)",
    )
    parser.add_argument(
        "--show",
        action="store_true",
        help="Display live preview window while processing",
    )
    return parser.parse_args()


def calculate_center(box):
    """
    Calculate the center point (cx, cy) of a bounding box [x1, y1, x2, y2].
    """
    x1, y1, x2, y2 = box
    cx = int((x1 + x2) / 2.0)
    cy = int((y1 + y2) / 2.0)
    return cx, cy


def draw_track_visualization(frame, box, track_id, class_name, confidence, trajectory_pts):
    """
    Draw:
      1. Bounding box colored by tracking ID
      2. Label banner with ID, class name, and confidence score
      3. Vehicle center point dot
      4. Trajectory path history trail
    """
    x1, y1, x2, y2 = [int(v) for v in box]
    color = get_track_color(track_id)

    # 1. Draw trajectory path trail
    if len(trajectory_pts) > 1:
        points = np.array(trajectory_pts, dtype=np.int32).reshape((-1, 1, 2))
        cv2.polylines(frame, [points], isClosed=False, color=color, thickness=2, lineType=cv2.LINE_AA)

    # 2. Draw vehicle center point
    cx, cy = calculate_center((x1, y1, x2, y2))
    cv2.circle(frame, (cx, cy), 4, color, -1, lineType=cv2.LINE_AA)
    cv2.circle(frame, (cx, cy), 6, (255, 255, 255), 1, lineType=cv2.LINE_AA)

    # 3. Draw bounding box
    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2, lineType=cv2.LINE_AA)

    # 4. Label banner with ID, class, and confidence score
    id_str = f"#{track_id}" if track_id is not None else "#?"
    label = f"{id_str} {class_name} {confidence:.2f}"
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.55
    thickness = 1
    (text_w, text_h), baseline = cv2.getTextSize(label, font, font_scale, thickness)

    banner_y1 = max(0, y1 - text_h - baseline - 4)
    banner_y2 = y1
    banner_x2 = x1 + text_w + 6

    cv2.rectangle(frame, (x1, banner_y1), (banner_x2, banner_y2), color, -1)
    text_origin = (x1 + 3, banner_y2 - baseline - 2)
    cv2.putText(
        frame,
        label,
        text_origin,
        font,
        font_scale,
        (0, 0, 0),
        thickness,
        cv2.LINE_AA,
    )


def process_video_tracking(
    input_path,
    output_path,
    tracker_config="bytetrack.yaml",
    model_name="yolov8n.pt",
    conf_thresh=0.35,
    trail_len=30,
    show_preview=False,
):
    """
    Run YOLO + ByteTrack vehicle tracking pipeline on traffic video.
    """
    # 1. Resolve and validate input video path
    if not os.path.exists(input_path):
        # Check alternative common locations
        candidates = [
            "data/videos/traffic.mp4",
            "data/input/traffic.mp4",
        ]
        found = False
        for c in candidates:
            if os.path.exists(c):
                input_path = c
                found = True
                break
        if not found:
            abs_input = os.path.abspath(input_path)
            print("\n" + "=" * 70)
            print(" [!] ERROR: Input traffic video not found!")
            print(f" Checked path: {abs_input}")
            print(" Please verify that traffic.mp4 exists in data/videos/ or data/input/.")
            print("=" * 70 + "\n")
            return False, {}

    # 2. Open input video with OpenCV
    print(f"\n[+] Opening input video: {input_path}")
    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        print(f"[!] ERROR: OpenCV could not open video file: {input_path}")
        return False, {}

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0 or fps is None:
        fps = 30.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    print(f"[+] Video Properties: {width}x{height} @ {fps:.2f} FPS | Total Frames: {total_frames}")

    # 3. Setup OpenCV VideoWriter
    output_dir = os.path.dirname(output_path)
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    if not writer.isOpened():
        print(f"[!] ERROR: OpenCV could not initialize VideoWriter for: {output_path}")
        cap.release()
        return False, {}

    # 4. Load YOLO model
    print(f"[+] Loading YOLO model: {model_name}...")
    try:
        model = YOLO(model_name)
    except Exception as e:
        print(f"[!] ERROR loading YOLO model: {e}")
        cap.release()
        writer.release()
        return False, {}

    print(f"[+] Tracking with: {tracker_config} (ByteTrack)")
    print(f"[+] Target vehicle classes: {[model.names.get(cid, cid) for cid in DEFAULT_VEHICLE_CLASSES]}")
    print(f"[+] Confidence threshold: {conf_thresh} | Trajectory trail length: {trail_len} frames")

    # 5. Initialize tracking data structures
    # Stores deque of (cx, cy) center points per track ID
    track_trajectories = defaultdict(lambda: deque(maxlen=trail_len))
    unique_track_ids = set()
    frame_idx = 0
    start_time = time.time()

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            frame_idx += 1

            # Run tracking with ByteTrack and persistent state
            results = model.track(
                source=frame,
                persist=True,
                tracker=tracker_config,
                classes=DEFAULT_VEHICLE_CLASSES,
                conf=conf_thresh,
                verbose=False,
            )

            active_in_frame = 0

            if results and len(results) > 0:
                result = results[0]
                boxes = result.boxes
                if boxes is not None and len(boxes) > 0:
                    for box in boxes:
                        coords = box.xyxy[0].cpu().numpy()
                        cls_id = int(box.cls[0].item())
                        cls_name = model.names.get(cls_id, str(cls_id))
                        conf = float(box.conf[0].item())

                        # Extract persistent tracking ID
                        track_id = None
                        if box.id is not None:
                            track_id = int(box.id[0].item())
                            unique_track_ids.add(track_id)
                            active_in_frame += 1

                            # Calculate vehicle center point
                            cx, cy = calculate_center(coords)
                            track_trajectories[track_id].append((cx, cy))

                        # Draw bounding box, ID, class, confidence, center, and trajectory
                        trajectory_pts = list(track_trajectories[track_id]) if track_id is not None else []
                        draw_track_visualization(
                            frame,
                            coords,
                            track_id,
                            cls_name,
                            conf,
                            trajectory_pts,
                        )

            # Draw HUD status banner on frame
            hud_text = (
                f"AHEADX Tracking (ByteTrack) | Frame: {frame_idx}/{total_frames} | "
                f"Active Tracks: {active_in_frame} | Total Unique Vehicles: {len(unique_track_ids)}"
            )
            cv2.rectangle(frame, (10, 8), (10 + len(hud_text) * 11, 40), (20, 20, 20), -1)
            cv2.putText(
                frame,
                hud_text,
                (16, 30),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (0, 255, 255),
                2,
                cv2.LINE_AA,
            )

            # Write annotated frame
            writer.write(frame)

            # Show live preview if enabled
            if show_preview:
                cv2.imshow("AHEADX - Vehicle Tracking (ByteTrack)", frame)
                if cv2.waitKey(1) & 0xFF == ord("q"):
                    print("\n[!] Tracking stopped by user.")
                    break

            # Progress log
            if frame_idx % 15 == 0 or frame_idx == total_frames:
                elapsed = time.time() - start_time
                fps_proc = frame_idx / elapsed if elapsed > 0 else 0
                pct = (frame_idx / total_frames * 100) if total_frames > 0 else 0
                sys.stdout.write(
                    f"\r--> Tracking: Frame {frame_idx}/{total_frames} ({pct:.1f}%) | "
                    f"Speed: {fps_proc:.1f} FPS | Active: {active_in_frame} | "
                    f"Unique IDs: {len(unique_track_ids)}"
                )
                sys.stdout.flush()

    finally:
        cap.release()
        writer.release()
        if show_preview:
            cv2.destroyAllWindows()

    total_time = time.time() - start_time
    avg_fps = frame_idx / total_time if total_time > 0 else 0

    stats = {
        "frames_processed": frame_idx,
        "total_frames": total_frames,
        "unique_ids_count": len(unique_track_ids),
        "total_time_seconds": total_time,
        "average_fps": avg_fps,
        "output_path": os.path.abspath(output_path),
    }

    print("\n" + "=" * 70)
    print(" [✓] Vehicle Tracking Complete!")
    print(f" Frames Processed: {frame_idx}/{total_frames}")
    print(f" Unique Vehicles Tracked (Persistent IDs): {len(unique_track_ids)}")
    print(f" Time Taken: {total_time:.2f}s (Average: {avg_fps:.1f} FPS)")
    print(f" Output Video Saved to: {stats['output_path']}")
    print("=" * 70 + "\n")

    return True, stats


def main():
    args = parse_args()
    success, stats = process_video_tracking(
        input_path=args.input,
        output_path=args.output,
        tracker_config=args.tracker,
        model_name=args.model,
        conf_thresh=args.conf,
        trail_len=args.trail_len,
        show_preview=args.show,
    )
    if not success:
        sys.exit(1)


if __name__ == "__main__":
    main()
