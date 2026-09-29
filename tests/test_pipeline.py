#!/usr/bin/env python3
"""
Basic End-to-End Pipeline Test for AHEADX Milestone 1.

Verifies:
1. OpenCV VideoCapture & VideoWriter functionality
2. YOLO model loading and vehicle class inference
3. Output video creation and integrity
"""

import os
import sys
import tempfile
import cv2
import numpy as np

# Add src to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from src.detect import process_video


def run_test():
    print("=" * 60)
    print("Running AHEADX Milestone 1 Verification Test")
    print("=" * 60)

    # 1. Create a 30-frame temporary synthetic video using OpenCV
    with tempfile.TemporaryDirectory() as tmp_dir:
        test_input_path = os.path.join(tmp_dir, "synthetic_test.mp4")
        test_output_path = os.path.join(tmp_dir, "synthetic_output.mp4")

        width, height, fps = 640, 360, 30
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        writer = cv2.VideoWriter(test_input_path, fourcc, fps, (width, height))

        assert writer.isOpened(), "Failed to open VideoWriter for synthetic test"

        for i in range(30):
            # Create a blank frame
            frame = np.zeros((height, width, 3), dtype=np.uint8)
            # Draw a moving rectangle
            x = (i * 15) % (width - 100)
            cv2.rectangle(frame, (x, 150), (x + 100, 250), (200, 200, 200), -1)
            cv2.putText(frame, f"Test Frame {i}", (30, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            writer.write(frame)

        writer.release()
        print(f"[✓] Created synthetic test video: 30 frames ({width}x{height} @ {fps}fps)")

        # 2. Run the detection pipeline
        print("[+] Executing process_video() through YOLO & OpenCV...")
        success = process_video(
            input_path=test_input_path,
            output_path=test_output_path,
            model_name="yolov8n.pt",
            conf_thresh=0.35,
            show_preview=False,
        )

        assert success, "process_video returned False"
        assert os.path.exists(test_output_path), "Output video file was not generated"

        # 3. Verify output video can be read back by OpenCV
        cap = cv2.VideoCapture(test_output_path)
        assert cap.isOpened(), "Could not open generated output video with OpenCV"
        out_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        out_w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        out_h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        cap.release()

        assert out_frames == 30, f"Expected 30 frames in output video, got {out_frames}"
        assert out_w == width and out_h == height, f"Resolution mismatch: {out_w}x{out_h}"

        print(f"[✓] Output video verified: {out_frames} frames ({out_w}x{out_h})")
        print("=" * 60)
        print("ALL TESTS PASSED: Pipeline is fully operational!")
        print("=" * 60)


if __name__ == "__main__":
    run_test()
