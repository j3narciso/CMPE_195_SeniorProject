"""Input validation utilities"""
from typing import List
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

# Supported cities (expandable)
SUPPORTED_CITIES = [
    "Rome", "Paris", "Tokyo", "New York", "London", "Barcelona",
    "Amsterdam", "Berlin", "Prague", "Vienna", "Budapest", "Lisbon"
]


def validate_destination(destination: str) -> tuple[bool, str]:
    """
    Validate destination city.
    Returns (is_valid, error_message)
    """
    if not destination:
        return False, "Destination cannot be empty"
    
    # Normalize for comparison
    dest_normalized = destination.strip().title()
    
    if dest_normalized not in SUPPORTED_CITIES:
        # Find similar cities
        similar = [city for city in SUPPORTED_CITIES if city.lower().startswith(dest_normalized.lower()[:3])]
        
        if similar:
            return False, f"City '{destination}' not found. Did you mean: {', '.join(similar)}?"
        else:
            return False, f"City '{destination}' not supported. Available cities: {', '.join(SUPPORTED_CITIES)}"
    
    return True, ""


def validate_date_range(start_date: str, end_date: str) -> tuple[bool, str]:
    """
    Validate date range.
    Returns (is_valid, error_message)
    """
    try:
        start = datetime.fromisoformat(start_date)
        end = datetime.fromisoformat(end_date)
    except ValueError as e:
        return False, f"Invalid date format. Use YYYY-MM-DD: {str(e)}"
    
    if end < start:
        return False, "End date must be after start date"
    
    duration = (end - start).days
    
    if duration == 0:
        return False, "Trip must be at least 1 day"
    
    if duration > 30:
        return False, "Trip duration cannot exceed 30 days"
    
    # Check if dates are in the past
    # Handle both offset-naive and offset-aware datetimes
    now = datetime.now(timezone.utc) if start.tzinfo else datetime.now()
    now_start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    if start < now_start_of_day:
        logger.warning(f"Trip start date {start_date} is in the past")
    
    return True, ""


def validate_preferences(preferences: dict) -> tuple[bool, str]:
    """
    Validate user preferences structure.
    Returns (is_valid, error_message)
    """
    # Check for conflicting preferences
    liked_tags = preferences.get("liked_tags", {})
    disliked_tags = preferences.get("disliked_tags", {})
    
    conflicts = []
    for category in ["food", "events", "sightseeing", "activities"]:
        liked = set(tag.lower() for tag in liked_tags.get(category, []))
        disliked = set(tag.lower() for tag in disliked_tags.get(category, []))
        
        overlap = liked & disliked
        if overlap:
            conflicts.append(f"{category}: {', '.join(overlap)}")
    
    if conflicts:
        logger.warning(f"Preference conflicts detected: {conflicts}")
        return True, f"Warning: Conflicting preferences detected in {', '.join(conflicts)}. Dislikes will take precedence."
    
    return True, ""


def sanitize_city_name(city: str) -> str:
    """Sanitize and normalize city name"""
    return city.strip().title()