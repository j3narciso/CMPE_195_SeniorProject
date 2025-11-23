"""Core recommendation engine for itinerary generation"""
from typing import List, Dict
from datetime import datetime, timedelta
import logging
import uuid
import time

from app.models.schemas import (
    TripRequest, Itinerary, DayItinerary, ItineraryItem,
    Recommendation, UserPreferences
)
from app.services.data_source import data_source_manager
from app.utils.scoring import score_recommendations
from app.utils.scheduling import ItineraryScheduler
from app.utils.validation import validate_destination, validate_date_range

logger = logging.getLogger(__name__)


class RecommendationEngine:
    """Main recommendation engine for generating personalized itineraries"""
    
    def __init__(self):
        self.data_source = data_source_manager
    
    def generate_itinerary(self, request: TripRequest) -> Itinerary:
        """
        Generate a complete itinerary based on trip request.
        This is the main entry point for itinerary generation.
        """
        start_time = time.time()
        
        # Validate inputs
        self._validate_request(request)
        
        # Generate trip ID
        trip_id = f"trip_{uuid.uuid4().hex[:12]}"
        
        # Get all recommendations for destination
        logger.info(f"Generating itinerary for {request.destination}")
        recommendations, using_cached = self.data_source.get_recommendations(
            request.destination
        )
        
        if not recommendations:
            raise ValueError(
                f"No recommendations available for {request.destination}. "
                f"Available cities: {', '.join(self.data_source.get_available_cities())}"
            )
        
        # Score recommendations based on preferences
        scored_recs = score_recommendations(
            recommendations,
            request.preferences
        )
        
        if not scored_recs:
            raise ValueError(
                "No recommendations match your preferences. "
                "Try broadening your criteria or adjusting disliked tags."
            )
        
        # Generate daily itineraries
        days = self._generate_daily_itineraries(
            request,
            scored_recs
        )
        
        # Calculate total recommendations
        total_recs = sum(len(day.items) for day in days)
        
        # Generate summary
        summary = self._generate_summary(request, days)
        
        # Collect warnings
        warnings = self._collect_warnings(request, scored_recs, days)
        
        # Create itinerary object
        itinerary = Itinerary(
            trip_id=trip_id,
            destination=request.destination,
            days=days,
            summary=summary,
            total_recommendations=total_recs,
            using_cached_data=using_cached,
            warnings=warnings
        )
        
        elapsed = time.time() - start_time
        logger.info(
            f"Generated itinerary {trip_id} with {total_recs} items "
            f"across {len(days)} days in {elapsed:.2f}s"
        )
        
        return itinerary
    
    def _validate_request(self, request: TripRequest):
        """Validate trip request"""
        # Validate destination
        is_valid, error = validate_destination(request.destination)
        if not is_valid:
            raise ValueError(error)
        
        # Validate dates
        is_valid, error = validate_date_range(request.start_date, request.end_date)
        if not is_valid:
            raise ValueError(error)
    
    def _generate_daily_itineraries(
        self,
        request: TripRequest,
        scored_recommendations: List[tuple[Recommendation, float]]
    ) -> List[DayItinerary]:
        """Generate itinerary for each day of the trip"""
        start_date = datetime.fromisoformat(request.start_date)
        end_date = datetime.fromisoformat(request.end_date)
        
        days = []
        current_date = start_date
        day_number = 1
        
        # Initialize scheduler
        scheduler = ItineraryScheduler(
            request.preferences,
            request.daily_start_hour,
            request.daily_end_hour
        )
        
        while current_date <= end_date:
            date_str = current_date.strftime("%Y-%m-%d")
            
            # Schedule items for this day
            items = scheduler.schedule_day(
                date_str,
                scored_recommendations,
                day_number
            )
            
            if items:
                day_itinerary = DayItinerary(
                    date=date_str,
                    items=items
                )
                days.append(day_itinerary)
            else:
                logger.warning(f"No items scheduled for day {day_number} ({date_str})")
                # Add warning but continue
            
            current_date += timedelta(days=1)
            day_number += 1
        
        return days
    
    def _generate_summary(self, request: TripRequest, days: List[DayItinerary]) -> str:
        """Generate a human-readable summary of the itinerary"""
        num_days = len(days)
        destination = request.destination
        
        # Analyze what's in the itinerary
        categories = {"food": 0, "sightseeing": 0, "events": 0, "activities": 0}
        for day in days:
            for item in day.items:
                categories[item.category.value] += 1
        
        # Build summary
        summary_parts = []
        summary_parts.append(f"{num_days}-day {destination} adventure")
        
        # Add focus areas based on preferences
        focus_areas = []
        if request.preferences.liked_tags:
            for category, tags in request.preferences.liked_tags.items():
                if tags and categories.get(category, 0) > 0:
                    focus_areas.append(category)
        
        if focus_areas:
            focus_str = ", ".join(focus_areas[:3])
            summary_parts.append(f"focusing on {focus_str}")
        
        # Add pace info
        pace_desc = {
            "slow": "relaxed pace",
            "moderate": "balanced pace",
            "fast": "action-packed schedule"
        }
        summary_parts.append(f"with a {pace_desc.get(request.preferences.pace.value, 'moderate')}")
        
        return " ".join(summary_parts)
    
    def _collect_warnings(
        self,
        request: TripRequest,
        scored_recommendations: List[tuple[Recommendation, float]],
        days: List[DayItinerary]
    ) -> List[str]:
        """Collect warnings about the itinerary"""
        warnings = []
        
        # Check if trip is very short
        num_days = len(days)
        if num_days == 1:
            warnings.append(
                "Single-day trip: Consider extending to 3+ days for a fuller experience"
            )
        
        # Check if we have limited recommendations
        total_items = sum(len(day.items) for day in days)
        if total_items < num_days * 4:
            warnings.append(
                f"Limited recommendations available for {request.destination}. "
                "Some activities may be repeated or days may be lighter than usual."
            )
        
        # Check for insufficient category coverage
        categories_used = set()
        for day in days:
            for item in day.items:
                categories_used.add(item.category.value)
        
        missing_categories = set(["food", "sightseeing", "events", "activities"]) - categories_used
        if missing_categories:
            warnings.append(
                f"No {', '.join(missing_categories)} recommendations matched your preferences"
            )
        
        # Check for budget concerns
        if request.preferences.budget_level:
            high_price_items = 0
            for day in days:
                for item in day.items:
                    if item.recommendation.price_range > request.preferences.budget_level:
                        high_price_items += 1
            
            if high_price_items > 0:
                warnings.append(
                    f"{high_price_items} recommendations exceed your budget level. "
                    "Consider adjusting budget or preferences."
                )
        
        return warnings
    
    def get_recommendations_by_category(
        self,
        destination: str,
        category: str,
        limit: int = 20,
        offset: int = 0
    ) -> Dict:
        """
        Get paginated recommendations for a specific category.
        Used for UI pagination/browsing.
        """
        from app.models.schemas import CategoryEnum
        
        try:
            category_enum = CategoryEnum(category)
        except ValueError:
            raise ValueError(
                f"Invalid category '{category}'. "
                f"Valid categories: food, events, sightseeing, activities"
            )
        
        # Get all recommendations for category
        all_recs, _ = self.data_source.get_recommendations(
            destination,
            category=category_enum
        )
        
        total = len(all_recs)
        
        # Apply pagination
        paginated = all_recs[offset:offset + limit]
        
        return {
            "recommendations": paginated,
            "total": total,
            "limit": limit,
            "offset": offset
        }


# Global recommendation engine instance
recommendation_engine = RecommendationEngine()