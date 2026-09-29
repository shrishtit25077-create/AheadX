#!/usr/bin/env python3
"""
Unit and Integration Tests for Phase 2: Object Tracking (ByteTrack).
"""

import os
import sys
import tempfile
import cv2
import numpy as np

# Add src to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from src.track import calculate_center, get_track_color, process_video_tracking


def test_calculate_center():
    box = [100, 200, 300, 400]
    cx, cy = calculate_center(box)
    assert cx == 200, f"Expected cx=200, got {cx}"
    assert cy == 300, f"Expected cy=300, got {cy}"
    print("[✓] test_calculate_center passed")


def test_track_color():
    c1 = get_track_color(1)
    c2 = get_track_color(1)
    assert c1 == c2, "Colors for same ID must be identical"
    assert len(c1) == 3, "Color must be a 3-tuple (BGR)"
    print("[✓] test_track_color passed")


def test_tracking_pipeline_synthetic():
    with tempfile.TemporaryDirectory() as tmp_dir:
        input_video = os.path.join(tmp_dir, "test_input.mp4")
        output_video = os.path.join(tmp_dir, "test_output.mp4")

        # Create a small synthetic video with a moving rectangle
        w, h, fps = 640, 360, 30
        writer = cv2.VideoWriter(input_video, cv2.VideoWriter_fourcc(*"mp4v"), fps, (w, h))
        for i in range(25):
            frame = np.zeros((h, w, 3), dtype=np.uint8)
            cv2.rectangle(frame, (50 + i * 5, 100), (150 + i * 5, 200), (255, 255, 255), -1)
            writer.write(frame)
        writer.release()

        # Run tracking pipeline
        success, stats = process_video_tracking(
            input_path=input_video,
            output_path=output_video,
            model_name="yolov8n.pt",
            tracker_config="bytetrack.yaml",
            conf_thresh=0.2,
            trail_len=15,
            show_preview=False,
        )

        assert success, "Tracking failed on synthetic video"
        assert os.path.exists(output_video), "Output video was not saved"

        # Verify output video properties
        cap = cv2.VideoCapture(output_video)
        assert cap.isOpened(), "Could not open output video"
        out_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        cap.release()
        assert out_frames == 25, f"Expected 25 frames, got {out_frames}"

        print(f"[✓] test_tracking_pipeline_synthetic passed (Processed {out_frames} frames)")


def main():
    print("=" * 60)
    print("Running Phase 2 Tracking Tests")
    print("=" * 60)
    test_calculate_center()
    test_track_color()
    test_tracking_pipeline_synthetic()
    print("=" * 60)
    print("ALL PHASE 2 TESTS PASSED!")
    print("=" * 60)


if __name__ == "__main__":
    main()
