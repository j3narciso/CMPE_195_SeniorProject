"""Scheduling logic for itinerary generation"""
from typing import List, Dict, Tuple
from datetime import datetime, timedelta
from app.models.schemas import Recommendation, UserPreferences, PaceEnum, ItineraryItem
import logging
import math

logger = logging.getLogger(__name__)


class ItineraryScheduler:
    """Handles intelligent scheduling of recommendations into daily itineraries"""
    
    # Time block definitions (hours from start)
    MORNING_BLOCK = (0, 4)  # First 4 hours
    MIDDAY_BLOCK = (4, 8)   # Middle 4 hours
    EVENING_BLOCK = (8, 13) # Last 5 hours
    
    # Category preferences by time block
    MORNING_CATEGORIES = ["sightseeing", "activities"]
    MIDDAY_CATEGORIES = ["food", "sightseeing", "activities"]
    EVENING_CATEGORIES = ["food", "events"]
    
    # Activities per day by pace
    PACE_ACTIVITIES = {
        PaceEnum.SLOW: (4, 6),
        PaceEnum.MODERATE: (6, 8),
        PaceEnum.FAST: (8, 10)
    }
    
    # Category distribution per day (ideal ratios)
    CATEGORY_RATIOS = {
        "sightseeing": (2, 3),
        "food": (2, 3),
        "events": (1, 2),
        "activities": (1, 2)
    }
    
    def __init__(self, preferences: UserPreferences, start_hour: int, end_hour: int):
        self.preferences = preferences
        self.start_hour = start_hour
        self.end_hour = end_hour
        self.daily_hours = end_hour - start_hour
        self.used_recommendations = set()  # Track to avoid repetition
    
    def schedule_day(
        self,
        date: str,
        scored_recommendations: List[Tuple[Recommendation, float]],
        day_number: int
    ) -> List[ItineraryItem]:
        """
        Schedule recommendations for a single day.
        Returns list of ItineraryItem objects.
        """
        items = []
        current_time = self.start_hour
        
        # Determine target number of activities based on pace
        min_activities, max_activities = self.PACE_ACTIVITIES[self.preferences.pace]
        target_activities = (min_activities + max_activities) // 2
        
        # Group recommendations by category
        by_category = self._group_by_category(scored_recommendations)
        
        # Track category counts
        category_counts = {cat: 0 for cat in ["food", "events", "sightseeing", "activities"]}
        
        # Schedule in time blocks
        items.extend(self._schedule_morning_block(by_category, category_counts, current_time, date))
        
        midday_start = self.start_hour + self.MORNING_BLOCK[1]
        items.extend(self._schedule_midday_block(by_category, category_counts, midday_start, date))
        
        evening_start = self.start_hour + self.MIDDAY_BLOCK[1]
        items.extend(self._schedule_evening_block(by_category, category_counts, evening_start, date))
        
        # Sort by time
        items.sort(key=lambda x: self._parse_time(x.time))
        
        # Add travel time notes
        items = self._add_travel_notes(items)
        
        logger.info(
            f"Scheduled {len(items)} items for day {day_number}: "
            f"food={category_counts['food']}, sightseeing={category_counts['sightseeing']}, "
            f"events={category_counts['events']}, activities={category_counts['activities']}"
        )
        
        return items
    
    def _group_by_category(self, scored: List[Tuple[Recommendation, float]]) -> Dict[str, List[Tuple[Recommendation, float]]]:
        """Group scored recommendations by category"""
        grouped = {
            "food": [],
            "events": [],
            "sightseeing": [],
            "activities": []
        }
        
        for rec, score in scored:
            if rec.id not in self.used_recommendations:
                grouped[rec.category.value].append((rec, score))
        
        return grouped
    
    def _schedule_morning_block(
        self,
        by_category: Dict[str, List[Tuple[Recommendation, float]]],
        category_counts: Dict[str, int],
        start_time: int,
        date: str
    ) -> List[ItineraryItem]:
        """Schedule morning activities (sightseeing/activities)"""
        items = []
        current_time = start_time
        block_end = start_time + (self.MORNING_BLOCK[1] - self.MORNING_BLOCK[0])
        
        # Try to fit 1-2 sightseeing/activities
        for category in self.MORNING_CATEGORIES:
            if current_time >= block_end:
                break
            
            available_time = (block_end - current_time) * 60  # Convert to minutes
            
            # Get best recommendation that fits
            rec = self._get_best_fitting_rec(by_category[category], available_time)
            if rec:
                item = self._create_itinerary_item(rec, current_time, date)
                items.append(item)
                category_counts[category] += 1
                self.used_recommendations.add(rec.id)
                current_time += (rec.estimated_duration / 60) + 0.5  # Add buffer
        
        return items
    
    def _schedule_midday_block(
        self,
        by_category: Dict[str, List[Tuple[Recommendation, float]]],
        category_counts: Dict[str, int],
        start_time: int,
        date: str
    ) -> List[ItineraryItem]:
        """Schedule midday activities (lunch + activity)"""
        items = []
        current_time = start_time
        
        # Schedule lunch
        lunch_recs = by_category["food"]
        if lunch_recs:
            lunch = self._get_best_fitting_rec(lunch_recs, 90)  # 90 min for lunch
            if lunch:
                item = self._create_itinerary_item(lunch, current_time, date)
                items.append(item)
                category_counts["food"] += 1
                self.used_recommendations.add(lunch.id)
                current_time += (lunch.estimated_duration / 60) + 0.5
        
        # Add afternoon activity
        block_end = start_time + (self.MIDDAY_BLOCK[1] - self.MIDDAY_BLOCK[0])
        available_time = (block_end - current_time) * 60
        
        for category in ["sightseeing", "activities"]:
            if current_time >= block_end:
                break
            
            rec = self._get_best_fitting_rec(by_category[category], available_time)
            if rec:
                item = self._create_itinerary_item(rec, current_time, date)
                items.append(item)
                category_counts[category] += 1
                self.used_recommendations.add(rec.id)
                current_time += (rec.estimated_duration / 60) + 0.5
                available_time = (block_end - current_time) * 60
        
        return items
    
    def _schedule_evening_block(
        self,
        by_category: Dict[str, List[Tuple[Recommendation, float]]],
        category_counts: Dict[str, int],
        start_time: int,
        date: str
    ) -> List[ItineraryItem]:
        """Schedule evening activities (dinner + events)"""
        items = []
        current_time = start_time
        
        # Schedule dinner (around 7-8pm typically)
        dinner_time = max(current_time, 19)  # 7 PM
        dinner_recs = by_category["food"]
        
        if dinner_recs:
            # Get dinner recommendation that hasn't been used
            dinner = self._get_best_fitting_rec(dinner_recs, 120)  # 2 hours for dinner
            if dinner:
                item = self._create_itinerary_item(dinner, dinner_time, date)
                items.append(item)
                category_counts["food"] += 1
                self.used_recommendations.add(dinner.id)
                current_time = dinner_time + (dinner.estimated_duration / 60) + 0.5
        
        # Add evening event if time permits
        block_end = self.end_hour
        available_time = (block_end - current_time) * 60
        
        if available_time > 60:  # At least 1 hour
            event_recs = by_category["events"]
            event = self._get_best_fitting_rec(event_recs, available_time)
            if event:
                item = self._create_itinerary_item(event, current_time, date)
                items.append(item)
                category_counts["events"] += 1
                self.used_recommendations.add(event.id)
        
        return items
    
    def _get_best_fitting_rec(
        self,
        recommendations: List[Tuple[Recommendation, float]],
        available_time: int
    ) -> Recommendation | None:
        """
        Get the best recommendation that fits in available time.
        Returns None if no suitable recommendation found.
        """
        for rec, score in recommendations:
            if rec.id not in self.used_recommendations:
                if rec.estimated_duration <= available_time:
                    return rec
        return None
    
    def _create_itinerary_item(
        self,
        rec: Recommendation,
        start_time: float,
        date: str
    ) -> ItineraryItem:
        """Create an ItineraryItem from a recommendation"""
        start_hour = int(start_time)
        start_min = int((start_time - start_hour) * 60)
        
        end_time = start_time + (rec.estimated_duration / 60)
        end_hour = int(end_time)
        end_min = int((end_time - end_hour) * 60)
        
        # Format time string
        time_str = self._format_time_range(start_hour, start_min, end_hour, end_min)
        
        return ItineraryItem(
            time=time_str,
            recommendation=rec,
            notes="",
            category=rec.category
        )
    
    def _format_time_range(self, start_h: int, start_m: int, end_h: int, end_m: int) -> str:
        """Format time range as string"""
        start_period = "AM" if start_h < 12 else "PM"
        end_period = "AM" if end_h < 12 else "PM"
        
        start_h_12 = start_h if start_h <= 12 else start_h - 12
        end_h_12 = end_h if end_h <= 12 else end_h - 12
        
        if start_h_12 == 0:
            start_h_12 = 12
        if end_h_12 == 0:
            end_h_12 = 12
        
        return f"{start_h_12}:{start_m:02d} {start_period} - {end_h_12}:{end_m:02d} {end_period}"
    
    def _parse_time(self, time_str: str) -> float:
        """Parse time string to hour float for sorting"""
        # Extract start time from "HH:MM AM/PM - HH:MM AM/PM"
        try:
            start_part = time_str.split("-")[0].strip()
            time_part, period = start_part.rsplit(" ", 1)
            hour, minute = map(int, time_part.split(":"))
            
            if period == "PM" and hour != 12:
                hour += 12
            elif period == "AM" and hour == 12:
                hour = 0
            
            return hour + (minute / 60)
        except:
            return 0
    
    def _add_travel_notes(self, items: List[ItineraryItem]) -> List[ItineraryItem]:
        """Add travel time notes between consecutive items"""
        for i in range(len(items) - 1):
            current = items[i]
            next_item = items[i + 1]
            
            # Calculate distance between locations
            travel_time = self._estimate_travel_time(
                current.recommendation.location,
                next_item.recommendation.location
            )
            
            if travel_time > 30:
                next_item.notes = f"⚠️ Travel time: ~{travel_time} min from previous location"
            elif travel_time > 15:
                next_item.notes = f"Travel time: ~{travel_time} min"
        
        return items
    
    def _estimate_travel_time(self, loc1: Dict[str, float], loc2: Dict[str, float]) -> int:
        """
        Estimate travel time between two locations.
        Uses haversine distance and assumes average city travel speed.
        """
        # Calculate haversine distance
        lat1, lon1 = loc1["lat"], loc1["lng"]
        lat2, lon2 = loc2["lat"], loc2["lng"]
        
        # Haversine formula
        R = 6371  # Earth radius in km
        
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        
        a = (math.sin(dlat / 2) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(dlon / 2) ** 2)
        
        c = 2 * math.asin(math.sqrt(a))
        distance_km = R * c
        
        # Assume average city speed of 20 km/h (accounting for traffic, walking, etc.)
        travel_time_hours = distance_km / 20
        travel_time_minutes = int(travel_time_hours * 60)
        
        return travel_time_minutes


def cluster_by_proximity(
    recommendations: List[Recommendation],
    max_clusters: int = 3
) -> List[List[Recommendation]]:
    """
    Cluster recommendations by geographic proximity.
    Simple clustering for geographic optimization.
    """
    if not recommendations:
        return []
    
    # Simple greedy clustering: start with first item, add nearby items
    clusters = []
    remaining = recommendations.copy()
    
    while remaining and len(clusters) < max_clusters:
        cluster = [remaining.pop(0)]
        center = cluster[0].location
        
        # Add nearby items to cluster
        to_remove = []
        for rec in remaining:
            if _distance(center, rec.location) < 5:  # Within 5km
                cluster.append(rec)
                to_remove.append(rec)
        
        for rec in to_remove:
            remaining.remove(rec)
        
        clusters.append(cluster)
    
    # Add any remaining to last cluster
    if remaining and clusters:
        clusters[-1].extend(remaining)
    
    return clusters


def _distance(loc1: Dict[str, float], loc2: Dict[str, float]) -> float:
    """Calculate distance in km between two locations"""
    lat1, lon1 = loc1["lat"], loc1["lng"]
    lat2, lon2 = loc2["lat"], loc2["lng"]
    
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    
    c = 2 * math.asin(math.sqrt(a))
    return R * c