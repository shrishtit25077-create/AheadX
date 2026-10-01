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

### Phase 4: Road Blockage Detection
- **Engine:** Spatial ROI Gated Prolonged Stationary Detection
- **Features:**
  - Identifies vehicles remaining stationary beyond configurable duration thresholds
  - Bounding box jitter tolerance radius
  - Road Region of Interest (ROI) polygon gating to distinguish active lanes from off-road areas
  - Structured event schema for possible blockage instances
  - High-visibility visual alert indicators on video (Warning Amber double-box & stationary timer)
- **Output:** Annotated video (`data/output/traffic_blockage.mp4`) and structured events JSON (`data/output/blockage_events.json`)

---

## Blockage Detection Logic & Configuration

### 1. Stationary Duration Analysis
A vehicle is evaluated for blockage based on its stationary persistence:
- **Stationary Anchor:** When a vehicle enters the scene or completes a movement, an anchor $(x_{\text{anchor}}, y_{\text{anchor}})$ is set.
- **Jitter Tolerance Radius:** If subsequent center points $(cx, cy)$ stay within `--movement-threshold` (default: `35.0` pixels), the vehicle is considered stationary, and `stationary_duration` accumulates:
  $$\text{stationary\_duration} = \text{timestamp}_{\text{curr}} - \text{timestamp}_{\text{anchor}}$$
- **Movement Reset:** If displacement exceeds the movement threshold, the anchor updates to the new position and the stationary timer resets to `0.0s`.

### 2. Road ROI (Region of Interest) Polygon Gating
To prevent vehicles parked in designated off-road parking bays, shoulders, or sidewalks from triggering blockage events, the system applies point-in-polygon verification:
```python
is_on_road = cv2.pointPolygonTest(roi_contour, (cx, cy), False) >= 0
```
Vehicles outside the polygon are classified as `OUTSIDE_ROI` / `OFF-ROAD` and suppressed from blockage alerts.

### 3. Configurable Thresholds
- `--min-stationary-duration`: Minimum stationary duration in seconds (default: `2.0` - `3.0`s).
- `--movement-threshold`: Pixel displacement jitter tolerance radius (default: `35.0` - `40.0`px).
- `--min-history`: Minimum number of historical trajectory points required before evaluation (default: `15` frames).

### 4. Limitations & False-Positive Scenarios
- **Traffic Congestion / Stop-and-Go:** Dense stop-and-go traffic or red-light queues will cause vehicles to remain stopped. Downstream risk scoring engines should combine multi-vehicle clustering to distinguish full-road congestion from isolated vehicle breakdowns.
- **Traffic Lights / Intersections:** Vehicles legitimately stopped at signals require integration with traffic signal timing or intersection exclusion zones.
- **Bus Stops & Designated Drop-offs:** Public transport stopping at designated bays can trigger alerts if the stop falls within the monitored road ROI polygon.
- **Severe Occlusion:** If an occluding truck blocks a stopped vehicle and causes ByteTrack ID reassignment, the stationary timer reinitializes.

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
│       ├── traffic_blockage.mp4   # Phase 4: Road blockage detection output
│       ├── wrong_side_events.json # Phase 3: Structured events JSON log
│       └── blockage_events.json   # Phase 4: Structured events JSON log
├── src/
│   ├── __init__.py
│   ├── detect.py               # Phase 1: Vehicle detection pipeline
│   ├── track.py                # Phase 2: ByteTrack vehicle tracking pipeline
│   ├── wrong_side.py           # Phase 3: Wrong-side driving detection pipeline
│   └── blockage.py             # Phase 4: Road blockage detection pipeline
└── tests/
    ├── test_pipeline.py        # Phase 1 verification tests
    ├── test_tracking.py        # Phase 2 verification tests
    ├── test_wrong_side.py      # Phase 3 verification tests
    └── test_blockage.py        # Phase 4 verification tests
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

### Phase 4: Road Blockage Detection

```bash
# Run with default settings (2.0s stationary threshold)
python src/blockage.py --input data/videos/traffic.mp4 --min-stationary-duration 2.0

# Customize stationary threshold and movement tolerance
python src/blockage.py --min-stationary-duration 3.0 --movement-threshold 40.0

# Enable live preview window
python src/blockage.py --show
```

### Phase 3: Wrong-Side Driving Detection

```bash
python src/wrong_side.py --input data/videos/traffic.mp4 --allowed-direction right
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

# Phase 4 Road Blockage Unit Tests
python tests/test_blockage.py
```
