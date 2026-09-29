# AHEADX - Real-Time Road Safety & Traffic Intelligence Platform

AHEADX is an intelligent road safety and traffic intelligence platform.

---

## Architecture & Phases

### Phase 1: Computer Vision Foundation (Detection)
- **Engine:** YOLOv8 Object Detection
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

---

## Pipeline Flow

```
Traffic Video (traffic.mp4)
         │
         ▼
OpenCV (cv2.VideoCapture)
         │
         ▼
YOLOv8 Detection + ByteTrack Tracker
         │
         ▼
Vehicle Filtering (Car, Motorcycle, Bus, Truck, Bicycle)
         │
         ▼
ID Assignment + Center Point Calculation + Trajectory History
         │
         ▼
Bounding Box, Trajectory Trail & HUD Rendering
         │
         ▼
Processed Video Output (cv2.VideoWriter)
```

---

## Project Structure

```text
AheadX/
├── .venv/                      # Python virtual environment
├── .gitignore                  # Git ignore rules for virtualenv, models, & outputs
├── requirements.txt            # Minimal dependencies (ultralytics, opencv-python, lap)
├── README.md                   # Setup and usage guide
├── data/
│   ├── videos/                 # 📍 Place your traffic.mp4 video file here
│   │   └── traffic.mp4
│   ├── input/                  # Alternative video input directory
│   │   └── traffic.mp4
│   └── output/                 # 💾 Processed videos
│       ├── traffic_detected.mp4  # Phase 1: Detection output
│       └── traffic_tracked.mp4   # Phase 2: Tracking output
├── src/
│   ├── __init__.py
│   ├── detect.py               # Phase 1: Vehicle detection pipeline
│   └── track.py                # Phase 2: ByteTrack vehicle tracking pipeline
└── tests/
    ├── test_pipeline.py        # Phase 1 verification tests
    └── test_tracking.py        # Phase 2 verification tests
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

### Phase 2: Vehicle Tracking with ByteTrack (Recommended)

```bash
# Run with default settings (inputs from data/videos/traffic.mp4 -> saves to data/output/traffic_tracked.mp4)
python src/track.py

# Custom input and output paths
python src/track.py --input data/videos/traffic.mp4 --output data/output/traffic_tracked.mp4

# Customize trajectory trail length and confidence
python src/track.py --trail-len 45 --conf 0.40

# Live preview window while processing
python src/track.py --show
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
```
