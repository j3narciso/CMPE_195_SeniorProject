"""Pytest configuration and fixtures"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.schemas import TripRequest, UserPreferences, PaceEnum


@pytest.fixture
def client():
    """FastAPI test client"""
    return TestClient(app)


@pytest.fixture
def sample_preferences():
    """Sample user preferences for testing"""
    return UserPreferences(
        liked_tags={
            "food": ["italian", "casual"],
            "events": ["cultural"],
            "sightseeing": ["historic"],
            "activities": ["walking"]
        },
        disliked_tags={},
        budget_level=2,
        pace=PaceEnum.MODERATE,
        mobility_limited=False,
        dietary_restrictions=[]
    )


@pytest.fixture
def sample_trip_request(sample_preferences):
    """Sample trip request for testing"""
    return TripRequest(
        destination="Rome",
        start_date="2025-06-01",
        end_date="2025-06-03",
        daily_start_hour=9,
        daily_end_hour=22,
        preferences=sample_preferences
    )