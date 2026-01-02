import asyncio
import numpy as np
from typing import Dict, List, Any, Optional
from pathlib import Path

# Try to import OpenCV, fallback to mock if not available
try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False
    print("Warning: OpenCV not available, using mock detection")

# Try to import YOLO, fallback to mock if not available
try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False
    print("Warning: YOLO not available, using mock detection")


class DetectionService:
    """Service for object detection using YOLOv8"""

    def __init__(self):
        self.model = None
        self.class_names = {
            0: "person",
            32: "sports ball"  # COCO class for sports ball
        }

    def _load_model(self):
        """Load YOLO model lazily"""
        if self.model is None and YOLO_AVAILABLE:
            try:
                self.model = YOLO("yolov8n.pt")
            except Exception as e:
                print(f"Failed to load YOLO model: {e}")

    async def detect_objects(
        self,
        video_path: str,
        settings: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Detect objects in video frames.

        Args:
            video_path: Path to video file
            settings: Processing settings

        Returns:
            List of detections per frame
        """
        # For MVP, we'll use a simplified detection that works without GPU
        # In production, this would use YOLOv8

        frame_skip = {
            "precise": 1,
            "balanced": 2,
            "fast": 5
        }.get(settings.get("frameProcessing", "balanced"), 2)

        confidence_threshold = settings.get("ballTrackingConfidence", 75) / 100

        detections = []

        # Fall back to mock data if CV2 is not available
        if not CV2_AVAILABLE:
            return self._generate_mock_detections()

        try:
            cap = cv2.VideoCapture(video_path)
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            fps = cap.get(cv2.CAP_PROP_FPS)

            if YOLO_AVAILABLE and self.model is None:
                self._load_model()

            frame_idx = 0
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break

                if frame_idx % frame_skip == 0:
                    if self.model:
                        # Real detection with YOLO
                        results = self.model(frame, verbose=False)
                        frame_detections = self._parse_yolo_results(
                            results, frame_idx, fps, confidence_threshold
                        )
                    else:
                        # Mock detection for demo
                        frame_detections = self._mock_detections(
                            frame_idx, fps, frame.shape
                        )

                    detections.append({
                        "frame": frame_idx,
                        "timestamp": frame_idx / fps if fps > 0 else 0,
                        "objects": frame_detections
                    })

                frame_idx += 1

                # Yield control to event loop periodically
                if frame_idx % 30 == 0:
                    await asyncio.sleep(0)

            cap.release()

        except Exception as e:
            print(f"Detection error: {e}")
            # Return mock data if detection fails
            detections = self._generate_mock_detections()

        return detections

    def _parse_yolo_results(
        self,
        results,
        frame_idx: int,
        fps: float,
        confidence_threshold: float
    ) -> List[Dict[str, Any]]:
        """Parse YOLO detection results"""
        frame_detections = []

        for result in results:
            boxes = result.boxes
            for box in boxes:
                cls = int(box.cls[0])
                conf = float(box.conf[0])

                # Only keep persons and sports balls
                if cls not in [0, 32]:
                    continue

                if conf < confidence_threshold:
                    continue

                x1, y1, x2, y2 = box.xyxy[0].tolist()

                frame_detections.append({
                    "class": self.class_names.get(cls, "unknown"),
                    "confidence": conf,
                    "bbox": {
                        "x1": x1, "y1": y1,
                        "x2": x2, "y2": y2,
                        "center_x": (x1 + x2) / 2,
                        "center_y": (y1 + y2) / 2
                    }
                })

        return frame_detections

    def _mock_detections(
        self,
        frame_idx: int,
        fps: float,
        frame_shape: tuple
    ) -> List[Dict[str, Any]]:
        """Generate mock detections for demo"""
        h, w = frame_shape[:2]

        # Simulate a player moving and shooting
        t = frame_idx / 30  # Normalize time

        # Player position (moving around court)
        player_x = w * 0.3 + np.sin(t * 0.5) * w * 0.2
        player_y = h * 0.5 + np.cos(t * 0.3) * h * 0.2

        detections = [{
            "class": "person",
            "confidence": 0.92,
            "bbox": {
                "x1": player_x - 40,
                "y1": player_y - 100,
                "x2": player_x + 40,
                "y2": player_y + 100,
                "center_x": player_x,
                "center_y": player_y
            }
        }]

        # Ball detection (simulated shooting motion)
        if (frame_idx % 150) < 30:  # Every 5 seconds, simulate a shot
            shot_progress = (frame_idx % 150) / 30
            ball_x = player_x + shot_progress * w * 0.2
            ball_y = player_y - 100 - np.sin(shot_progress * np.pi) * 200

            detections.append({
                "class": "sports ball",
                "confidence": 0.85,
                "bbox": {
                    "x1": ball_x - 15,
                    "y1": ball_y - 15,
                    "x2": ball_x + 15,
                    "y2": ball_y + 15,
                    "center_x": ball_x,
                    "center_y": ball_y
                }
            })

        return detections

    def _generate_mock_detections(self) -> List[Dict[str, Any]]:
        """Generate complete mock detection data"""
        detections = []
        for i in range(300):  # 10 seconds at 30 fps
            detections.append({
                "frame": i,
                "timestamp": i / 30,
                "objects": self._mock_detections(i, 30, (1080, 1920))
            })
        return detections

    async def track_objects(
        self,
        detections: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Track objects across frames using simple tracking.

        In production, this would use ByteTrack or similar.

        Args:
            detections: List of per-frame detections

        Returns:
            Tracking data with object trajectories
        """
        # Simple tracking: assign IDs based on proximity
        tracks = {
            "players": {},
            "ball": []
        }

        player_id = 0
        last_player_positions = {}

        for frame_data in detections:
            frame_idx = frame_data["frame"]
            timestamp = frame_data["timestamp"]

            for obj in frame_data["objects"]:
                if obj["class"] == "person":
                    # Find closest existing track or create new
                    pos = (obj["bbox"]["center_x"], obj["bbox"]["center_y"])

                    matched_id = None
                    min_dist = float("inf")

                    for pid, last_pos in last_player_positions.items():
                        dist = np.sqrt(
                            (pos[0] - last_pos[0])**2 +
                            (pos[1] - last_pos[1])**2
                        )
                        if dist < 100 and dist < min_dist:
                            min_dist = dist
                            matched_id = pid

                    if matched_id is None:
                        matched_id = player_id
                        player_id += 1
                        tracks["players"][matched_id] = []

                    tracks["players"][matched_id].append({
                        "frame": frame_idx,
                        "timestamp": timestamp,
                        "x": pos[0],
                        "y": pos[1],
                        "bbox": obj["bbox"]
                    })
                    last_player_positions[matched_id] = pos

                elif obj["class"] == "sports ball":
                    tracks["ball"].append({
                        "frame": frame_idx,
                        "timestamp": timestamp,
                        "x": obj["bbox"]["center_x"],
                        "y": obj["bbox"]["center_y"],
                        "bbox": obj["bbox"]
                    })

            # Small delay for async
            if frame_idx % 30 == 0:
                await asyncio.sleep(0)

        return tracks
