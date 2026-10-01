#!/usr/bin/env python3
"""
Unit Tests for Phase 4: Road Blockage Detection (BlockageDetector).

Tests blockage detection logic using synthetic trajectory histories:
1. Moving vehicle (not blockage)
2. Briefly stopped vehicle (not blockage)
3. Long stationary vehicle inside road ROI (triggers possible blockage)
4. Long stationary vehicle outside road ROI (ignored, not blockage)
5. Insufficient trajectory history (ignored, not blockage)
6. Structured event schema verification
"""

import os
import sys
import unittest

# Add src to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from src.blockage import BlockageDetector


class TestBlockageDetector(unittest.TestCase):

    def setUp(self):
        # Road ROI defined as a central rectangle in 1000x1000 coordinate space
        self.road_roi = [
            (200, 200),
            (800, 200),
            (800, 800),
            (200, 800),
        ]
        self.detector = BlockageDetector(
            min_stationary_duration_sec=3.0,
            movement_threshold_px=20.0,
            min_trajectory_history=15,
            road_roi=self.road_roi,
        )

    def test_moving_vehicle(self):
        """Moving vehicle should never be classified as a blockage."""
        # 30 frames at 10 fps (3 seconds), moving 10px per frame (total 300px)
        for i in range(30):
            t = i * 0.1
            cx = 300 + i * 10
            cy = 400
            res = self.detector.update(
                vehicle_id=1,
                class_name="car",
                cx=cx,
                cy=cy,
                confidence=0.90,
                timestamp_sec=t,
            )

        self.assertFalse(res["possible_blockage"])
        self.assertEqual(res["status_label"], "MOVING")
        self.assertIsNone(res["event"])
        self.assertEqual(len(self.detector.get_events()), 0)

    def test_briefly_stopped_vehicle(self):
        """A vehicle stopped for only 1.0 second (< 3.0s threshold) must NOT be a blockage."""
        # 15 frames of movement, then 10 frames stopped at 10 fps (1.0 second stopped)
        for i in range(15):
            t = i * 0.1
            res = self.detector.update(
                vehicle_id=2,
                class_name="car",
                cx=300 + i * 5,
                cy=400,
                confidence=0.88,
                timestamp_sec=t,
            )

        # Stopped at (375, 400) for 10 frames = 1.0s
        for i in range(10):
            t = 1.5 + i * 0.1
            res = self.detector.update(
                vehicle_id=2,
                class_name="car",
                cx=375 + (i % 2),  # small jitter
                cy=400,
                confidence=0.88,
                timestamp_sec=t,
            )

        self.assertFalse(res["possible_blockage"])
        self.assertLess(res["stationary_duration"], 3.0)
        self.assertIsNone(res["event"])

    def test_long_stationary_vehicle(self):
        """Vehicle stopped for >= 3.0 seconds inside ROI must trigger possible blockage."""
        # 15 frames leading up, then stationary for 35 frames at 10 fps (3.5 seconds)
        for i in range(15):
            t = i * 0.1
            res = self.detector.update(
                vehicle_id=3,
                class_name="truck",
                cx=400 + i * 2,
                cy=500,
                confidence=0.92,
                timestamp_sec=t,
            )

        # Stationary at (430, 500) for 35 frames = 3.5s
        for i in range(35):
            t = 1.5 + i * 0.1
            res = self.detector.update(
                vehicle_id=3,
                class_name="truck",
                cx=430 + (i % 2),  # sub-pixel jitter
                cy=500 + (i % 3),
                confidence=0.92,
                timestamp_sec=t,
            )

        self.assertTrue(res["possible_blockage"])
        self.assertEqual(res["status_label"], "POSSIBLE BLOCKAGE")
        self.assertGreaterEqual(res["stationary_duration"], 3.0)
        self.assertIsNotNone(res["event"])

        event = res["event"]
        self.assertEqual(event["event_type"], "possible_blockage")
        self.assertEqual(event["vehicle_id"], 3)
        self.assertEqual(event["vehicle_class"], "truck")
        self.assertIn("stationary_duration", event)
        self.assertIn("location", event)
        self.assertEqual(event["location"]["x"], int(res["location"][0]))
        self.assertEqual(event["location"]["y"], int(res["location"][1]))
        self.assertEqual(event["confidence"], 0.92)

    def test_long_stationary_outside_roi(self):
        """Stationary vehicle outside road ROI (e.g. parked off-road) must NOT be flagged."""
        # Location (100, 100) is outside the road_roi [(200, 200) -> (800, 800)]
        for i in range(50):
            t = i * 0.1
            res = self.detector.update(
                vehicle_id=4,
                class_name="car",
                cx=100 + (i % 2),
                cy=100 + (i % 2),
                confidence=0.85,
                timestamp_sec=t,
            )

        self.assertFalse(res["possible_blockage"])
        self.assertFalse(res["inside_roi"])
        self.assertEqual(res["status_label"], "OUTSIDE_ROI")
        self.assertIsNone(res["event"])

    def test_insufficient_trajectory_history(self):
        """Short-lived tracks (< 15 frames) must NOT be flagged as blockage even if stopped."""
        # Only 5 frames
        for i in range(5):
            t = i * 0.1
            res = self.detector.update(
                vehicle_id=5,
                class_name="motorcycle",
                cx=500,
                cy=500,
                confidence=0.80,
                timestamp_sec=t,
            )

        self.assertFalse(res["possible_blockage"])
        self.assertEqual(res["status_label"], "TRACKING")
        self.assertIsNone(res["event"])


if __name__ == "__main__":
    unittest.main(verbosity=2)
