#!/usr/bin/env python3
"""
AHEADX - Vehicle Detection Pipeline
Milestone 1: Computer Vision Foundation

Pipeline:
  Traffic video -> OpenCV -> YOLO -> Vehicle detection -> Bounding boxes -> Output video
"""

import argparse
import os
import sys
import time
import cv2
from ultralytics import YOLO

# Standard COCO vehicle class IDs:
# 1: bicycle, 2: car, 3: motorcycle, 5: bus, 7: truck
DEFAULT_VEHICLE_CLASSES = [1, 2, 3, 5, 7]

# Distinct BGR color palette for vehicle classes
CLASS_COLORS = {
    1: (0, 215, 255),   # bicycle (gold / yellow)
    2: (0, 255, 0),     # car (green)
    3: (255, 128, 0),   # motorcycle (blue-cyan)
    5: (0, 165, 255),   # bus (orange)
    7: (255, 0, 255),   # truck (magenta)
}
DEFAULT_COLOR = (0, 255, 128)


def parse_args():
    parser = argparse.ArgumentParser(
        description="AHEADX Milestone 1: YOLO Vehicle Detection on Traffic Video"
    )
    parser.add_argument(
        "--input",
        "-i",
        type=str,
        default="data/input/traffic.mp4",
        help="Path to input traffic video (default: data/input/traffic.mp4)",
    )
    parser.add_argument(
        "--output",
        "-o",
        type=str,
        default="data/output/traffic_detected.mp4",
        help="Path to save output video (default: data/output/traffic_detected.mp4)",
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
        "--show",
        action="store_true",
        help="Display live preview window while processing",
    )
    return parser.parse_args()


def draw_detection(frame, box, class_id, class_name, confidence):
    """Draw a styled bounding box and label banner on the frame."""
    x1, y1, x2, y2 = [int(v) for v in box]
    color = CLASS_COLORS.get(class_id, DEFAULT_COLOR)

    # Bounding rectangle
    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)

    # Label text
    label = f"{class_name} {confidence:.2f}"
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.55
    thickness = 1
    (text_w, text_h), baseline = cv2.getTextSize(label, font, font_scale, thickness)

    # Label background banner
    banner_y1 = max(0, y1 - text_h - baseline - 4)
    banner_y2 = y1
    banner_x2 = x1 + text_w + 6

    cv2.rectangle(
        frame,
        (x1, banner_y1),
        (banner_x2, banner_y2),
        color,
        -1,
    )

    # Label text inside banner (black text for readability against bright colors)
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


def process_video(input_path, output_path, model_name="yolov8n.pt", conf_thresh=0.35, show_preview=False):
    """Run YOLO vehicle detection on a traffic video and save the result."""
    # 1. Validate input video existence
    if not os.path.exists(input_path):
        # Fallback check for data/videos/traffic.mp4 if using default data/input/traffic.mp4
        if input_path == "data/input/traffic.mp4" and os.path.exists("data/videos/traffic.mp4"):
            input_path = "data/videos/traffic.mp4"
        else:
            abs_input = os.path.abspath(input_path)
            print("\n" + "=" * 70)
            print(" [!] ERROR: Input traffic video not found!")
            print(f" Checked path: {abs_input}")
            print("=" * 70)
            print(" To run vehicle detection, please place your traffic video at:")
            print(f"   {abs_input}")
            print("   or at data/videos/traffic.mp4")
            print("=" * 70 + "\n")
            return False

    # 2. Open input video with OpenCV
    print(f"\n[+] Opening input video: {input_path}")
    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        print(f"[!] ERROR: OpenCV could not open video file: {input_path}")
        return False

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0 or fps is None:
        fps = 30.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    print(f"[+] Video Properties: {width}x{height} @ {fps:.2f} FPS | Total Frames: {total_frames}")

    # 3. Ensure output directory exists and setup OpenCV VideoWriter
    output_dir = os.path.dirname(output_path)
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    if not writer.isOpened():
        print(f"[!] ERROR: OpenCV could not initialize VideoWriter for: {output_path}")
        cap.release()
        return False

    # 4. Load YOLO model
    print(f"[+] Loading YOLO model: {model_name}...")
    try:
        model = YOLO(model_name)
    except Exception as e:
        print(f"[!] ERROR loading YOLO model: {e}")
        cap.release()
        writer.release()
        return False

    print(f"[+] Filtering for vehicle classes: {[model.names.get(cid, cid) for cid in DEFAULT_VEHICLE_CLASSES]}")
    print(f"[+] Processing video frames with confidence threshold: {conf_thresh}...")

    # 5. Process video frames
    frame_idx = 0
    start_time = time.time()
    total_vehicles_detected = 0

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            frame_idx += 1

            # Run inference on frame filtered to vehicle classes
            results = model.predict(
                source=frame,
                classes=DEFAULT_VEHICLE_CLASSES,
                conf=conf_thresh,
                verbose=False,
            )

            vehicles_in_frame = 0
            if results and len(results) > 0:
                result = results[0]
                boxes = result.boxes
                if boxes is not None and len(boxes) > 0:
                    vehicles_in_frame = len(boxes)
                    total_vehicles_detected += vehicles_in_frame
                    for box in boxes:
                        coords = box.xyxy[0].cpu().numpy()
                        cls_id = int(box.cls[0].item())
                        cls_name = model.names.get(cls_id, str(cls_id))
                        conf = float(box.conf[0].item())
                        draw_detection(frame, coords, cls_id, cls_name, conf)

            # Draw minimal status overlay (frame & vehicle count)
            cv2.putText(
                frame,
                f"AHEADX CV | Frame: {frame_idx}/{total_frames} | Vehicles: {vehicles_in_frame}",
                (15, 30),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (255, 255, 255),
                2,
                cv2.LINE_AA,
            )

            # Write annotated frame
            writer.write(frame)

            # Preview window if requested
            if show_preview:
                cv2.imshow("AHEADX - Vehicle Detection", frame)
                if cv2.waitKey(1) & 0xFF == ord("q"):
                    print("\n[!] Processing stopped by user.")
                    break

            # Progress log
            if frame_idx % 15 == 0 or frame_idx == total_frames:
                elapsed = time.time() - start_time
                fps_proc = frame_idx / elapsed if elapsed > 0 else 0
                pct = (frame_idx / total_frames * 100) if total_frames > 0 else 0
                sys.stdout.write(
                    f"\r--> Processing: Frame {frame_idx}/{total_frames} ({pct:.1f}%) | "
                    f"Speed: {fps_proc:.1f} FPS | Detected: {total_vehicles_detected} vehicles"
                )
                sys.stdout.flush()

    finally:
        cap.release()
        writer.release()
        if show_preview:
            cv2.destroyAllWindows()

    total_time = time.time() - start_time
    avg_fps = frame_idx / total_time if total_time > 0 else 0

    print("\n" + "=" * 70)
    print(" [✓] Video processing complete!")
    print(f" Processed Frames: {frame_idx}")
    print(f" Total Detection Instances: {total_vehicles_detected}")
    print(f" Time Taken: {total_time:.2f}s (Average: {avg_fps:.1f} FPS)")
    print(f" Output Video Saved to: {os.path.abspath(output_path)}")
    print("=" * 70 + "\n")
    return True


def main():
    args = parse_args()
    success = process_video(
        input_path=args.input,
        output_path=args.output,
        model_name=args.model,
        conf_thresh=args.conf,
        show_preview=args.show,
    )
    if not success:
        sys.exit(1)


if __name__ == "__main__":
    main()
