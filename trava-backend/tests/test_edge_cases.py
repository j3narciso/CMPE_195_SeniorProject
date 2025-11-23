"""Tests for edge cases and error handling"""
import pytest
from app.models.schemas import TripRequest, UserPreferences, PaceEnum


def test_single_day_trip(client):
    """Test handling of single-day trip"""
    request = {
        "destination": "Rome",
        "start_date": "2025-06-01",
        "end_date": "2025-06-01",
        "daily_start_hour": 9,
        "daily_end_hour": 22,
        "preferences": {
            "liked_tags": {"food": ["italian"]},
            "disliked_tags": {},
            "budget_level": 2,
            "pace": "moderate",
            "mobility_limited": False,
            "dietary_restrictions": []
        }
    }
    
    response = client.post("/api/v1/itinerary/generate", json=request)
    assert response.status_code == 200
    data = response.json()
    
    # Should have warning about single-day trip
    assert len(data["warnings"]) > 0
    assert any("single-day" in w.lower() or "1" in w for w in data["warnings"])


def test_conflicting_preferences(client):
    """Test handling of conflicting liked/disliked tags"""
    request = {
        "destination": "Rome",
        "start_date": "2025-06-01",
        "end_date": "2025-06-03",
        "daily_start_hour": 9,
        "daily_end_hour": 22,
        "preferences": {
            "liked_tags": {"food": ["italian", "pizza"]},
            "disliked_tags": {"food": ["pizza"]},  # Conflict!
            "budget_level": 2,
            "pace": "moderate",
            "mobility_limited": False,
            "dietary_restrictions": []
        }
    }
    
    # Should still work - disliked takes precedence
    response = client.post("/api/v1/itinerary/generate", json=request)
    assert response.status_code == 200


def test_mobility_limited(client):
    """Test accessibility filtering for mobility-limited users"""
    request = {
        "destination": "Rome",
        "start_date": "2025-06-01",
        "end_date": "2025-06-03",
        "daily_start_hour": 9,
        "daily_end_hour": 22,
        "preferences": {
            "liked_tags": {"activities": ["hiking"]},  # Should be filtered out
            "disliked_tags": {},
            "budget_level": 2,
            "pace": "slow",
            "mobility_limited": True,
            "dietary_restrictions": []
        }
    }
    
    response = client.post("/api/v1/itinerary/generate", json=request)
    assert response.status_code == 200
    data = response.json()
    
    # Verify no hiking activities in itinerary
    for day in data["days"]:
        for item in day["items"]:
            tags = [tag.lower() for tag in item["recommendation"]["tags"]]
            assert "hiking" not in tags


def test_dietary_restrictions(client):
    """Test dietary restriction filtering"""
    request = {
        "destination": "Rome",
        "start_date": "2025-06-01",
        "end_date": "2025-06-03",
        "daily_start_hour": 9,
        "daily_end_hour": 22,
        "preferences": {
            "liked_tags": {"food": ["italian"]},
            "disliked_tags": {},
            "budget_level": 2,
            "pace": "moderate",
            "mobility_limited": False,
            "dietary_restrictions": ["vegan"]
        }
    }
    
    response = client.post("/api/v1/itinerary/generate", json=request)
    assert response.status_code == 200
    data = response.json()
    
    # Verify no meat-based food recommendations
    for day in data["days"]:
        for item in day["items"]:
            if item["category"] == "food":
                tags = [tag.lower() for tag in item["recommendation"]["tags"]]
                meat_tags = ["meat", "steak", "seafood", "fish"]
                assert not any(meat in tags for meat in meat_tags)


def test_budget_filtering(client):
    """Test budget level filtering"""
    request = {
        "destination": "Rome",
        "start_date": "2025-06-01",
        "end_date": "2025-06-03",
        "daily_start_hour": 9,
        "daily_end_hour": 22,
        "preferences": {
            "liked_tags": {},
            "disliked_tags": {},
            "budget_level": 1,  # Very low budget
            "pace": "moderate",
            "mobility_limited": False,
            "dietary_restrictions": []
        }
    }
    
    response = client.post("/api/v1/itinerary/generate", json=request)
    assert response.status_code == 200
    data = response.json()
    
    # Should have some budget warnings if expensive items included
    # Most items should be budget-friendly
    expensive_count = 0
    for day in data["days"]:
        for item in day["items"]:
            if item["recommendation"]["price_range"] > 2:
                expensive_count += 1
    
    # Majority should be budget-friendly
    total_items = data["total_recommendations"]
    assert expensive_count < total_items * 0.5


def test_very_long_trip(client):
    """Test handling of maximum trip length"""
    request = {
        "destination": "Rome",
        "start_date": "2025-06-01",
        "end_date": "2025-07-15",  # 45 days - exceeds max
        "daily_start_hour": 9,
        "daily_end_hour": 22,
        "preferences": {
            "liked_tags": {},
            "disliked_tags": {},
            "budget_level": 2,
            "pace": "moderate",
            "mobility_limited": False,
            "dietary_restrictions": []
        }
    }
    
    # Should fail validation
    response = client.post("/api/v1/itinerary/generate", json=request)
    assert response.status_code == 422


def test_all_disliked_tags(client):
    """Test when user dislikes everything in a category"""
    request = {
        "destination": "Rome",
        "start_date": "2025-06-01",
        "end_date": "2025-06-03",
        "daily_start_hour": 9,
        "daily_end_hour": 22,
        "preferences": {
            "liked_tags": {},
            "disliked_tags": {
                "food": ["italian", "pizza", "pasta", "casual", "upscale"],
                "sightseeing": ["historic", "museum", "outdoor"],
                "events": ["cultural", "music"],
                "activities": ["walking", "cooking"]
            },
            "budget_level": 2,
            "pace": "moderate",
            "mobility_limited": False,
            "dietary_restrictions": []
        }
    }
    
    # Should still generate something or give helpful error
    response = client.post("/api/v1/itinerary/generate", json=request)
    # Either succeeds with warnings or fails gracefully
    assert response.status_code in [200, 400]


def test_fast_pace(client):
    """Test fast-paced itinerary generation"""
    request = {
        "destination": "Rome",
        "start_date": "2025-06-01",
        "end_date": "2025-06-03",
        "daily_start_hour": 9,
        "daily_end_hour": 22,
        "preferences": {
            "liked_tags": {},
            "disliked_tags": {},
            "budget_level": 2,
            "pace": "fast",
            "mobility_limited": False,
            "dietary_restrictions": []
        }
    }
    
    response = client.post("/api/v1/itinerary/generate", json=request)
    assert response.status_code == 200
    data = response.json()
    
    # Fast pace should have more activities per day
    avg_items_per_day = data["total_recommendations"] / len(data["days"])
    assert avg_items_per_day >= 6  # Fast pace should have 8-10 items


def test_slow_pace(client):
    """Test slow-paced itinerary generation"""
    request = {
        "destination": "Rome",
        "start_date": "2025-06-01",
        "end_date": "2025-06-03",
        "daily_start_hour": 9,
        "daily_end_hour": 22,
        "preferences": {
            "liked_tags": {},
            "disliked_tags": {},
            "budget_level": 2,
            "pace": "slow",
            "mobility_limited": False,
            "dietary_restrictions": []
        }
    }
    
    response = client.post("/api/v1/itinerary/generate", json=request)
    assert response.status_code == 200
    data = response.json()
    
    # Slow pace should have fewer activities per day
    avg_items_per_day = data["total_recommendations"] / len(data["days"])
    assert avg_items_per_day <= 7  # Slow pace should have 4-6 items