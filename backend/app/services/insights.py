import os
from typing import Dict, List, Any

# Try to import Anthropic, fallback to mock if not available
try:
    from anthropic import Anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False
    print("Warning: Anthropic SDK not available, using mock insights")


class InsightsService:
    """Service for generating AI-powered insights using Claude API"""

    def __init__(self):
        self.client = None
        if ANTHROPIC_AVAILABLE:
            api_key = os.getenv("ANTHROPIC_API_KEY")
            if api_key:
                self.client = Anthropic(api_key=api_key)

    async def generate_insights(
        self,
        analysis: Dict[str, Any]
    ) -> List[Dict[str, str]]:
        """
        Generate AI insights from analysis data.

        Args:
            analysis: Analysis results including stats, shots, zones

        Returns:
            List of insight objects
        """
        if self.client:
            return await self._generate_claude_insights(analysis)
        else:
            return self._generate_mock_insights(analysis)

    async def _generate_claude_insights(
        self,
        analysis: Dict[str, Any]
    ) -> List[Dict[str, str]]:
        """Generate insights using Claude API"""
        try:
            stats = analysis.get("statistics", {})
            zones = analysis.get("zones", [])
            shots = analysis.get("shots", [])

            # Build zone breakdown text
            zone_text = "\n".join([
                f"- {z['name']}: {z['attempts']} attempts, {z['percentage']}% accuracy"
                for z in zones[:5]
            ])

            prompt = f"""You are a basketball analyst reviewing game footage data. Based on the following statistics, provide exactly 4 insights - 2 positive observations, 1 area for improvement, and 1 neutral observation about volume/consistency.

Game Statistics:
- Total Shots: {stats.get('totalShots', 0)}
- Makes: {stats.get('makes', 0)}
- Misses: {stats.get('misses', 0)}
- Shooting Percentage: {stats.get('fieldGoalPercentage', 0)}%
- 3-Point Percentage: {stats.get('threePointPercentage', 0)}%
- Hot Zone: {stats.get('hotZone', 'Unknown')}

Shot Distribution by Zone:
{zone_text}

For each insight, provide:
1. A short title (3-5 words)
2. A detailed explanation (1-2 sentences)

Format your response as JSON array with objects containing: type ("positive", "negative", or "neutral"), icon (use ▲ for positive, ▼ for negative, ■ or ● for neutral), title, text.

Keep analysis professional, constructive, and focused on actionable insights."""

            response = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1024,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )

            # Parse response
            import json
            content = response.content[0].text

            # Try to extract JSON from response
            try:
                # Find JSON array in response
                start = content.find("[")
                end = content.rfind("]") + 1
                if start != -1 and end > start:
                    insights = json.loads(content[start:end])
                    return insights
            except json.JSONDecodeError:
                pass

            # Fallback to mock if parsing fails
            return self._generate_mock_insights(analysis)

        except Exception as e:
            print(f"Claude API error: {e}")
            return self._generate_mock_insights(analysis)

    def _generate_mock_insights(
        self,
        analysis: Dict[str, Any]
    ) -> List[Dict[str, str]]:
        """Generate mock insights based on analysis data"""
        stats = analysis.get("statistics", {})
        zones = analysis.get("zones", [])

        insights = []

        # Find best and worst zones
        if zones:
            best_zone = max(zones, key=lambda z: z.get("percentage", 0))
            worst_zone = min(zones, key=lambda z: z.get("percentage", 100))

            # Positive insight about hot zone
            insights.append({
                "type": "positive",
                "icon": "▲",
                "title": "Hot Streak Detected",
                "text": f"Your {best_zone['name']} shooting is exceptional at {best_zone['percentage']}%. This zone shows consistent form and high confidence. Keep focusing on getting open looks here."
            })

            # Negative insight about weak zone
            if worst_zone["percentage"] < 50:
                insights.append({
                    "type": "negative",
                    "icon": "▼",
                    "title": f"{worst_zone['name']} Struggles",
                    "text": f"Your {worst_zone['name']} percentage of {worst_zone['percentage']}% needs work. Consider practicing catch-and-shoot drills from this angle and focusing on footwork."
                })
            else:
                insights.append({
                    "type": "neutral",
                    "icon": "■",
                    "title": "Balanced Attack",
                    "text": "Your shooting is relatively consistent across all zones. Focus on maintaining this balance while working to improve overall percentage."
                })

        # Volume insight
        total_shots = stats.get("totalShots", 0)
        fg_pct = stats.get("fieldGoalPercentage", 0)

        insights.append({
            "type": "neutral",
            "icon": "■",
            "title": "Volume Analysis",
            "text": f"You attempted {total_shots} total shots with {fg_pct}% accuracy. This volume indicates good offensive involvement while maintaining efficiency."
        })

        # Form/consistency insight
        insights.append({
            "type": "positive",
            "icon": "●",
            "title": "Consistent Release",
            "text": "Your release mechanics show good consistency across attempts. Maintaining this rhythm will help improve accuracy over time, especially under defensive pressure."
        })

        return insights
