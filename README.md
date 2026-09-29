# AHEADX - Real-Time Road Safety & Traffic Intelligence Platform

AHEADX is an intelligent road safety and traffic intelligence platform.

---

## Architecture & Phases

### Phase 1: Computer Vision Foundation (Detection)
- **Engine:** YOLOv8 Object Detection (`yolov8n.pt`)
- **Classes:** Car, Motorcycle, Bus, Truck, Bicycle
- **Output:** Annotated video with vehicle bounding boxes and confidence labels

### Phase 2: Object Tracking (ByteTrack)
- **Engine:** ByteTrack Multi-Object Tracker (`bytetrack.yaml`)
- **Features:**
  - Persistent tracking IDs per vehicle across frames
  - Bounding box center coordinates `(cx, cy)`
  - Vehicle motion trajectory history trail (30-frame memory)
  - Real-time HUD (active tracks & cumulative unique vehicles)
- **Output:** Annotated video with persistent IDs, trajectory paths, and center coordinates

### Phase 3: Wrong-Side Driving Detection
- **Engine:** Vector-based Trajectory & Angular Flow Analysis
- **Features:**
  - Multi-frame trajectory movement vector calculation $(\Delta x, \Delta y)$
  - Configurable allowed road flow direction (`right`, `left`, `down`, `up`)
  - Minimum displacement threshold to filter out stationary vehicles
  - Directional tolerance angle to prevent false positives from lane changes/tracking jitter
  - Structured event schema for suspected wrong-side instances
  - High-visibility visual alert indicators on video (Red bounding box & warning banners)
- **Output:** Annotated video (`data/output/traffic_wrong_side.mp4`) and structured events JSON (`data/output/wrong_side_events.json`)

---

## Direction Analysis & Detection Logic

### 1. Movement Vector Calculation
Rather than relying on single-frame differences (which are sensitive to bounding-box jitter), the movement vector is calculated across a sliding window of historical trajectory points:
$$\vec{v} = (x_{\text{current}} - x_{\text{past}}, y_{\text{current}} - y_{\text{past}})$$
$$\|\vec{v}\| = \sqrt{\Delta x^2 + \Delta y^2}$$

### 2. Configurable Allowed Direction
Road direction is fully configurable and not hardcoded:
- `--allowed-direction right`: Flow along $+x$ axis $(1, 0)$
- `--allowed-direction left`: Flow along $-x$ axis $(-1, 0)$
- `--allowed-direction down`: Flow along $+y$ axis $(0, 1)$
- `--allowed-direction up`: Flow along $-y$ axis $(0, -1)$

### 3. Minimum Movement Threshold
To ensure stationary or parked vehicles are never falsely flagged, a vehicle's displacement $\|\vec{v}\|$ must exceed `--min-movement` (default: `25.0` pixels). Vehicles below this threshold are labeled as `STATIONARY`.

### 4. Direction Tolerance
The angular deviation $\phi$ between the vehicle's movement vector $\vec{v}$ and the allowed unit vector $\vec{u}_{\text{allowed}}$ is calculated using the dot product:
$$\cos(\phi) = \frac{\vec{v} \cdot \vec{u}_{\text{allowed}}}{\|\vec{v}\|}$$
$$\phi = \arccos(\text{clamp}(\cos(\phi), -1.0, 1.0)) \times \frac{180^\circ}{\pi}$$

A vehicle is flagged as a **suspected wrong-side vehicle** only if $\phi \ge \text{angle\_thresh}$ (default: `120.0^\circ`). This ensures normal lane shifts, slight curves, and tracking noise do not trigger false alerts.

### 5. Limitations
- **Camera Perspective / 2D Homography**: 2D camera perspectives without 3D camera calibration can distort angles near the horizon.
- **Occlusions**: Severe occlusions may cause ByteTrack to reassign track IDs, resetting trajectory history.
- **Complex Intersections / Turns**: Legitimate maneuvers such as turns onto cross-streets or U-turns may temporarily oppose the primary road direction. Events are marked as **suspected/possible** events for downstream verification.

---

## Project Structure

```text
AheadX/
├── .venv/                      # Python virtual environment
├── .gitignore                  # Git ignore rules for virtualenv, models, & outputs
├── requirements.txt            # Minimal dependencies (ultralytics, opencv-python, lap)
├── README.md                   # Setup and usage guide
├── data/
│   ├── videos/                 # 📍 Raw traffic.mp4 video file
│   │   └── traffic.mp4
│   ├── input/                  # Alternative video input directory
│   │   └── traffic.mp4
│   └── output/                 # 💾 Processed video and structured event outputs
│       ├── traffic_detected.mp4   # Phase 1: Detection output
│       ├── traffic_tracked.mp4    # Phase 2: Tracking output
│       ├── traffic_wrong_side.mp4 # Phase 3: Wrong-side detection output
│       └── wrong_side_events.json # Phase 3: Structured events JSON log
├── src/
│   ├── __init__.py
│   ├── detect.py               # Phase 1: Vehicle detection pipeline
│   ├── track.py                # Phase 2: ByteTrack vehicle tracking pipeline
│   └── wrong_side.py           # Phase 3: Wrong-side driving detection pipeline
└── tests/
    ├── test_pipeline.py        # Phase 1 verification tests
    ├── test_tracking.py        # Phase 2 verification tests
    └── test_wrong_side.py      # Phase 3 verification tests
```

---

## Setup

```bash
# 1. Activate the virtual environment
source .venv/bin/activate

# 2. Verify / Install dependencies
pip install -r requirements.txt
```

---

## Running the Pipelines

### Phase 3: Wrong-Side Driving Detection

```bash
# Run with default settings (allowed road flow: 'right')
python src/wrong_side.py --input data/videos/traffic.mp4 --allowed-direction right

# Configure a different road direction (e.g., 'left', 'down', 'up')
python src/wrong_side.py --allowed-direction left

# Customize movement threshold and angle tolerance
python src/wrong_side.py --min-movement 30.0 --angle-thresh 130.0

# Enable live preview window
python src/wrong_side.py --show
```

### Phase 2: Vehicle Tracking (ByteTrack)

```bash
python src/track.py --input data/videos/traffic.mp4 --output data/output/traffic_tracked.mp4
```

### Phase 1: Vehicle Detection (Detection Only)

```bash
python src/detect.py --input data/videos/traffic.mp4 --output data/output/traffic_detected.mp4
```

---

## Running Tests

```bash
# Phase 1 Detection Unit & Integration Tests
python tests/test_pipeline.py

# Phase 2 Tracking Unit & Integration Tests
python tests/test_tracking.py

# Phase 3 Wrong-Side Direction Unit Tests
python tests/test_wrong_side.py
```
