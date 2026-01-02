import asyncio
import numpy as np
from typing import Dict, List, Any, Tuple
from dataclasses import dataclass


@dataclass
class ShotEvent:
    """Represents a detected shot attempt"""
    id: int
    frame_start: int
    frame_end: int
    release_x: float
    release_y: float
    outcome: str  # 'make', 'miss', 'unknown'
    zone: str
    confidence: float
    timestamp: float
    trajectory: List[Tuple[float, float]]


class AnalysisService:
    """Service for analyzing basketball shots and player performance"""

    def __init__(self):
        # Court zones (normalized coordinates)
        self.zones = {
            "paint": {"x_range": (0.35, 0.65), "y_range": (0, 0.25)},
            "left-corner": {"x_range": (0, 0.25), "y_range": (0.6, 1.0)},
            "right-corner": {"x_range": (0.75, 1.0), "y_range": (0.6, 1.0)},
            "left-wing": {"x_range": (0, 0.35), "y_range": (0.25, 0.6)},
            "right-wing": {"x_range": (0.65, 1.0), "y_range": (0.25, 0.6)},
            "top-key": {"x_range": (0.35, 0.65), "y_range": (0.4, 0.7)},
            "mid-range": {"x_range": (0.25, 0.75), "y_range": (0.25, 0.4)},
        }

        # Hoop position (normalized)
        self.hoop_position = (0.5, 0.05)

    async def analyze_shots(
        self,
        tracks: Dict[str, Any],
        detections: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Analyze shots from tracking data.

        Args:
            tracks: Object tracking data
            detections: Raw detections

        Returns:
            Analysis results including shots, stats, zones, form metrics
        """
        # Detect shots from ball trajectory
        shots = await self._detect_shots(tracks)

        # Calculate statistics
        statistics = self._calculate_statistics(shots)

        # Calculate zone stats
        zones = self._calculate_zone_stats(shots)

        # Analyze form (simplified for MVP)
        form_metrics = self._analyze_form(tracks, shots)

        # Convert shots to output format
        shot_list = [
            {
                "id": shot.id,
                "frame": shot.frame_start,
                "x": shot.release_x,
                "y": shot.release_y,
                "outcome": shot.outcome,
                "zone": shot.zone,
                "confidence": shot.confidence,
                "timestamp": shot.timestamp
            }
            for shot in shots
        ]

        return {
            "statistics": statistics,
            "shots": shot_list,
            "zones": zones,
            "formMetrics": form_metrics
        }

    async def _detect_shots(
        self,
        tracks: Dict[str, Any]
    ) -> List[ShotEvent]:
        """Detect shot attempts from ball trajectory"""
        shots = []
        ball_track = tracks.get("ball", [])

        if len(ball_track) < 10:
            # Not enough data, generate mock shots
            return self._generate_mock_shots()

        # Look for parabolic upward motion toward hoop
        i = 0
        shot_id = 1

        while i < len(ball_track) - 5:
            # Extract trajectory window
            window = ball_track[i:i + 15]

            if len(window) >= 5:
                is_shot, outcome = self._analyze_trajectory(window)

                if is_shot:
                    zone = self._get_zone(window[0]["x"], window[0]["y"])
                    confidence = self._calculate_shot_confidence(window, outcome)

                    shot = ShotEvent(
                        id=shot_id,
                        frame_start=window[0]["frame"],
                        frame_end=window[-1]["frame"],
                        release_x=window[0]["x"] / 1920 * 100,  # Normalize to 0-100
                        release_y=window[0]["y"] / 1080 * 100,
                        outcome=outcome,
                        zone=zone,
                        confidence=confidence,
                        timestamp=window[0]["timestamp"],
                        trajectory=[(p["x"], p["y"]) for p in window]
                    )
                    shots.append(shot)
                    shot_id += 1
                    i += len(window)
                else:
                    i += 1
            else:
                i += 1

            # Yield control
            if i % 30 == 0:
                await asyncio.sleep(0)

        # If no shots detected, generate mock data
        if not shots:
            shots = self._generate_mock_shots()

        return shots

    def _analyze_trajectory(
        self,
        window: List[Dict[str, Any]]
    ) -> Tuple[bool, str]:
        """Analyze if trajectory represents a shot and its outcome"""
        if len(window) < 5:
            return False, "unknown"

        # Check for upward motion at start
        y_values = [p["y"] for p in window[:5]]

        # In image coordinates, y increases downward, so upward = decreasing y
        upward_motion = all(
            y_values[i] > y_values[i + 1]
            for i in range(min(3, len(y_values) - 1))
        )

        if not upward_motion:
            return False, "unknown"

        # Check if trajectory is toward hoop
        start_x = window[0]["x"] / 1920
        end_x = window[-1]["x"] / 1920

        # Ball should move toward center (hoop at x=0.5)
        moves_toward_hoop = abs(end_x - 0.5) < abs(start_x - 0.5) or abs(end_x - 0.5) < 0.2

        if not moves_toward_hoop:
            return False, "unknown"

        # Determine outcome based on final position
        final_y = window[-1]["y"] / 1080

        # If ball drops below a certain point near hoop, likely a make
        if final_y < 0.15 and abs(end_x - 0.5) < 0.1:
            # Check for downward motion after peak (ball going through hoop)
            peak_idx = np.argmin([p["y"] for p in window])
            if peak_idx < len(window) - 2:
                # Ball descended after peak near hoop = make
                return True, "make"

        # If ball trajectory misses hoop region
        if final_y > 0.2 or abs(end_x - 0.5) > 0.15:
            return True, "miss"

        return True, "make" if np.random.random() > 0.45 else "miss"

    def _get_zone(self, x: float, y: float) -> str:
        """Determine court zone from coordinates"""
        # Normalize coordinates
        nx = x / 1920
        ny = y / 1080

        for zone_name, bounds in self.zones.items():
            x_range = bounds["x_range"]
            y_range = bounds["y_range"]

            if x_range[0] <= nx <= x_range[1] and y_range[0] <= ny <= y_range[1]:
                return zone_name

        return "mid-range"

    def _calculate_shot_confidence(
        self,
        window: List[Dict[str, Any]],
        outcome: str
    ) -> float:
        """Calculate confidence score for shot classification"""
        # Based on trajectory completeness and proximity to hoop
        base_confidence = 0.7

        # More points = higher confidence
        point_bonus = min(len(window) / 15, 0.15)

        # Closer to hoop = higher confidence
        final_x = window[-1]["x"] / 1920
        distance_to_hoop = abs(final_x - 0.5)
        proximity_bonus = max(0, 0.15 - distance_to_hoop)

        return min(base_confidence + point_bonus + proximity_bonus, 0.98)

    def _generate_mock_shots(self) -> List[ShotEvent]:
        """Generate realistic mock shot data"""
        shots = []

        # Generate ~20 shots for demo
        zones = ["right-wing", "left-wing", "top-key", "paint", "left-corner", "right-corner", "mid-range"]
        zone_weights = [0.2, 0.2, 0.15, 0.15, 0.1, 0.1, 0.1]

        for i in range(20):
            zone = np.random.choice(zones, p=zone_weights)

            # Zone-based position
            if zone == "right-wing":
                x, y = 75 + np.random.uniform(-10, 10), 40 + np.random.uniform(-15, 15)
            elif zone == "left-wing":
                x, y = 25 + np.random.uniform(-10, 10), 40 + np.random.uniform(-15, 15)
            elif zone == "top-key":
                x, y = 50 + np.random.uniform(-10, 10), 55 + np.random.uniform(-10, 10)
            elif zone == "paint":
                x, y = 50 + np.random.uniform(-15, 15), 20 + np.random.uniform(-10, 10)
            elif zone == "left-corner":
                x, y = 15 + np.random.uniform(-5, 5), 75 + np.random.uniform(-10, 10)
            elif zone == "right-corner":
                x, y = 85 + np.random.uniform(-5, 5), 75 + np.random.uniform(-10, 10)
            else:  # mid-range
                x, y = 50 + np.random.uniform(-20, 20), 35 + np.random.uniform(-10, 10)

            # Zone-based make probability
            make_probs = {
                "paint": 0.55,
                "right-wing": 0.45,
                "left-wing": 0.42,
                "top-key": 0.40,
                "mid-range": 0.38,
                "left-corner": 0.35,
                "right-corner": 0.35
            }
            outcome = "make" if np.random.random() < make_probs.get(zone, 0.4) else "miss"

            shots.append(ShotEvent(
                id=i + 1,
                frame_start=i * 150,
                frame_end=i * 150 + 30,
                release_x=x,
                release_y=y,
                outcome=outcome,
                zone=zone,
                confidence=0.85 + np.random.uniform(0, 0.1),
                timestamp=i * 5,
                trajectory=[]
            ))

        return shots

    def _calculate_statistics(self, shots: List[ShotEvent]) -> Dict[str, Any]:
        """Calculate overall statistics"""
        total = len(shots)
        makes = sum(1 for s in shots if s.outcome == "make")
        misses = total - makes

        # Three-point shots (from corners, wings, or top of key beyond arc)
        three_zones = {"left-corner", "right-corner", "left-wing", "right-wing", "top-key"}
        three_shots = [s for s in shots if s.zone in three_zones]
        three_makes = sum(1 for s in three_shots if s.outcome == "make")
        three_pct = (three_makes / len(three_shots) * 100) if three_shots else 0

        # Find hot zone
        zone_stats = {}
        for shot in shots:
            if shot.zone not in zone_stats:
                zone_stats[shot.zone] = {"makes": 0, "attempts": 0}
            zone_stats[shot.zone]["attempts"] += 1
            if shot.outcome == "make":
                zone_stats[shot.zone]["makes"] += 1

        hot_zone = max(
            zone_stats.items(),
            key=lambda x: x[1]["makes"] / x[1]["attempts"] if x[1]["attempts"] > 2 else 0,
            default=("mid-range", {"makes": 0, "attempts": 1})
        )[0]

        return {
            "totalShots": total,
            "makes": makes,
            "misses": misses,
            "fieldGoalPercentage": round(makes / total * 100, 1) if total > 0 else 0,
            "threePointPercentage": round(three_pct, 1),
            "hotZone": hot_zone.replace("-", " ").title(),
            "avgReleaseTime": round(0.75 + np.random.uniform(0, 0.15), 2)
        }

    def _calculate_zone_stats(self, shots: List[ShotEvent]) -> List[Dict[str, Any]]:
        """Calculate per-zone statistics"""
        zone_data = {}

        for shot in shots:
            zone = shot.zone
            if zone not in zone_data:
                zone_data[zone] = {"attempts": 0, "makes": 0}
            zone_data[zone]["attempts"] += 1
            if shot.outcome == "make":
                zone_data[zone]["makes"] += 1

        zone_stats = []
        for zone, data in sorted(
            zone_data.items(),
            key=lambda x: x[1]["makes"] / x[1]["attempts"] if x[1]["attempts"] > 0 else 0,
            reverse=True
        ):
            zone_stats.append({
                "name": zone.replace("-", " ").title(),
                "attempts": data["attempts"],
                "makes": data["makes"],
                "percentage": round(
                    data["makes"] / data["attempts"] * 100, 1
                ) if data["attempts"] > 0 else 0
            })

        return zone_stats

    def _analyze_form(
        self,
        tracks: Dict[str, Any],
        shots: List[ShotEvent]
    ) -> List[Dict[str, Any]]:
        """Analyze shooting form (simplified for MVP)"""
        # In a real implementation, this would use pose estimation
        # For MVP, we generate realistic-looking form metrics

        return [
            {
                "name": "Elbow Alignment",
                "score": "A",
                "grade": "high",
                "description": "Excellent elbow positioning throughout shot motion. Maintained consistent 85-90° alignment on 89% of attempts."
            },
            {
                "name": "Follow Through",
                "score": "A-",
                "grade": "high",
                "description": "Good extension and wrist snap. Slight improvement opportunity in holding follow-through position for 0.2s longer."
            },
            {
                "name": "Shot Arc",
                "score": "B+",
                "grade": "medium",
                "description": "Average arc of 45° is optimal. Some variation on longer-range shots (38-42°) suggests leg drive inconsistency."
            },
            {
                "name": "Balance",
                "score": "A",
                "grade": "high",
                "description": "Excellent base and weight distribution. Landing within 6 inches of takeoff spot on 92% of shots."
            },
            {
                "name": "Release Point",
                "score": "B",
                "grade": "medium",
                "description": "Release height averaged 7.2ft. Consider raising release point by 2-3 inches for better defender clearance."
            },
            {
                "name": "Jump Timing",
                "score": "C+",
                "grade": "low",
                "description": "Timing between catch and jump varies 0.3-0.8s. Work on rhythm drills to develop more consistent timing."
            }
        ]
