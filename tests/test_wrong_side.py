#!/usr/bin/env python3
"""
Unit Tests for Phase 3: Wrong-Side Driving Detection (DirectionAnalyzer).

Tests direction-classification logic using synthetic trajectory points.
"""

import os
import sys
import unittest

# Add src to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from src.wrong_side import DirectionAnalyzer


class TestDirectionAnalyzer(unittest.TestCase):

    def setUp(self):
        # Default analyzer with allowed direction = "right"
        self.analyzer_right = DirectionAnalyzer(
            allowed_direction="right",
            min_movement_px=25.0,
            history_window=10,
            wrong_side_angle_thresh_deg=120.0,
        )

    def test_normal_movement_right(self):
        """Vehicle moving steadily to the right should be NORMAL."""
        trajectory = [(100 + i * 10, 200) for i in range(15)]
        result = self.analyzer_right.evaluate_vehicle(
            vehicle_id=1,
            class_name="car",
            confidence=0.92,
            trajectory_pts=trajectory,
        )
        self.assertFalse(result["wrong_side"])
        self.assertEqual(result["status_label"], "NORMAL")
        self.assertEqual(result["movement_direction"], "RIGHT")
        self.assertIsNone(result["event"])
        self.assertGreater(result["displacement_px"], 25.0)

    def test_suspected_wrong_side_movement_left(self):
        """Vehicle moving steadily to the left against 'right' flow should be SUSPECTED WRONG SIDE."""
        trajectory = [(500 - i * 10, 200) for i in range(15)]
        result = self.analyzer_right.evaluate_vehicle(
            vehicle_id=2,
            class_name="car",
            confidence=0.88,
            trajectory_pts=trajectory,
            timestamp_sec=2.5,
            frame_idx=60,
        )
        self.assertTrue(result["wrong_side"])
        self.assertEqual(result["status_label"], "SUSPECTED WRONG SIDE")
        self.assertEqual(result["movement_direction"], "LEFT")
        self.assertIsNotNone(result["event"])

        event = result["event"]
        self.assertEqual(event["event_type"], "suspected_wrong_side")
        self.assertEqual(event["vehicle_id"], 2)
        self.assertEqual(event["vehicle_class"], "car")
        self.assertEqual(event["direction"], "left")
        self.assertEqual(event["allowed_direction"], "right")
        self.assertEqual(event["confidence"], 0.88)
        self.assertAlmostEqual(event["angle_difference_deg"], 180.0, places=1)

    def test_stationary_vehicle_not_wrong_side(self):
        """Stationary vehicle (displacement < 25px) must NOT be flagged as wrong-side."""
        # Vehicle fluctuating slightly in place (jitter < 25px)
        trajectory = [(200 + (i % 2), 200 + (i % 3)) for i in range(20)]
        result = self.analyzer_right.evaluate_vehicle(
            vehicle_id=3,
            class_name="truck",
            confidence=0.85,
            trajectory_pts=trajectory,
        )
        self.assertFalse(result["wrong_side"])
        self.assertEqual(result["movement_direction"], "STATIONARY")
        self.assertIn("STATIONARY", result["status_label"])
        self.assertIsNone(result["event"])
        self.assertLess(result["displacement_px"], 25.0)

    def test_direction_tolerance(self):
        """Vehicle moving right with slight diagonal angle (e.g. 30°) should be NORMAL."""
        # dx = 100, dy = 50 -> angle ~26.5° < 120°
        trajectory = [(100 + i * 10, 200 + i * 5) for i in range(15)]
        result = self.analyzer_right.evaluate_vehicle(
            vehicle_id=4,
            class_name="motorcycle",
            confidence=0.90,
            trajectory_pts=trajectory,
        )
        self.assertFalse(result["wrong_side"])
        self.assertEqual(result["status_label"], "NORMAL")
        self.assertLess(result["angle_diff_deg"], 120.0)

    def test_configurable_allowed_direction_left(self):
        """Test road where allowed_direction = 'left'."""
        analyzer_left = DirectionAnalyzer(
            allowed_direction="left",
            min_movement_px=25.0,
            history_window=10,
        )
        # Left-moving vehicle -> NORMAL
        traj_left = [(500 - i * 10, 200) for i in range(15)]
        res_left = analyzer_left.evaluate_vehicle(5, "bus", 0.9, traj_left)
        self.assertFalse(res_left["wrong_side"])
        self.assertEqual(res_left["status_label"], "NORMAL")

        # Right-moving vehicle -> SUSPECTED WRONG SIDE
        traj_right = [(100 + i * 10, 200) for i in range(15)]
        res_right = analyzer_left.evaluate_vehicle(6, "bus", 0.9, traj_right)
        self.assertTrue(res_right["wrong_side"])
        self.assertEqual(res_right["status_label"], "SUSPECTED WRONG SIDE")
        self.assertEqual(res_right["event"]["allowed_direction"], "left")

    def test_configurable_allowed_direction_down_and_up(self):
        """Test vertical roads with allowed_direction = 'down' and 'up'."""
        analyzer_down = DirectionAnalyzer(allowed_direction="down", min_movement_px=25.0)
        # Moving down (+y in screen space) -> NORMAL
        traj_down = [(200, 100 + i * 10) for i in range(15)]
        res_down = analyzer_down.evaluate_vehicle(7, "car", 0.85, traj_down)
        self.assertFalse(res_down["wrong_side"])
        self.assertEqual(res_down["movement_direction"], "DOWN")

        # Moving up (-y in screen space) against 'down' flow -> SUSPECTED WRONG SIDE
        traj_up = [(200, 300 - i * 10) for i in range(15)]
        res_up = analyzer_down.evaluate_vehicle(8, "car", 0.85, traj_up)
        self.assertTrue(res_up["wrong_side"])
        self.assertEqual(res_up["status_label"], "SUSPECTED WRONG SIDE")


if __name__ == "__main__":
    unittest.main(verbosity=2)
