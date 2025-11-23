"""Unit tests for recommendation engine components"""
import pytest
from app.services.recommendation_engine import RecommendationEngine
from app.utils.scoring import score_recommendations, RecommendationScorer
from app.utils.scheduling import ItineraryScheduler
from app.models.schemas import (
    Recommendation, UserPreferences, PaceEnum, CategoryEnum
)


@pytest.fixture
def sample_recommendation():
    """Sample recommendation for testing"""
    return Recommendation(
        id="test_001",
        name="Test Restaurant",
        category=CategoryEnum.FOOD,
        tags=["italian", "casual", "pasta"],
        location={"lat": 41.9, "lng": 12.5},
        rating=4.5,
        price_range=2,
        description="Test restaurant",
        opening_hours="12:00 PM - 10:00 PM",
        estimated_duration=90,
        website=None,
        phone=None,
        image_url=None,
        google_maps_url=None
    )


def test_scorer_tag_matching(sample_recommendation, sample_preferences):
    """Test that scorer correctly matches tags"""
    scorer = RecommendationScorer(sample_preferences)
    score = scorer.calculate_score(sample_recommendation)
    
    # Should get points for matching "italian" and "casual" tags
    assert score > 0


def test_scorer_filters_disliked(sample_recommendation):
    """Test that scorer filters out disliked tags"""
    prefs = UserPreferences(
        liked_tags={},
        disliked_tags={"food": ["italian"]},
        budget_level=2,
        pace=PaceEnum.MODERATE,
        mobility_limited=False,
        dietary_restrictions=[]
    )
    
    scorer = RecommendationScorer(prefs)
    should_filter, reason = scorer.should_filter_out(sample_recommendation)
    
    assert should_filter is True
    assert "italian" in reason.lower()


def test_scorer_budget_alignment(sample_recommendation):
    """Test budget scoring logic"""
    # Perfect budget match
    prefs_match = UserPreferences(
        liked_tags={},
        disliked_tags={},
        budget_level=2,  # Matches recommendation
        pace=PaceEnum.MODERATE,
        mobility_limited=False,
        dietary_restrictions=[]
    )
    
    scorer_match = RecommendationScorer(prefs_match)
    score_match = scorer_match.calculate_score(sample_recommendation)
    
    # Budget too low
    prefs_low = UserPreferences(
        liked_tags={},
        disliked_tags={},
        budget_level=1,  # Lower than recommendation
        pace=PaceEnum.MODERATE,
        mobility_limited=False,
        dietary_restrictions=[]
    )
    
    scorer_low = RecommendationScorer(prefs_low)
    score_low = scorer_low.calculate_score(sample_recommendation)
    
    # Perfect match should score higher
    assert score_match > score_low


def test_score_recommendations_sorting():
    """Test that recommendations are sorted by score"""
    recs = [
        Recommendation(
            id=f"rec_{i}",
            name=f"Place {i}",
            category=CategoryEnum.FOOD,
            tags=["italian"] if i % 2 == 0 else ["french"],
            location={"lat": 41.9, "lng": 12.5},
            rating=4.0 + (i * 0.1),
            price_range=2,
            description="Test",
            opening_hours="9am-5pm",
            estimated_duration=60,
            website=None,
            phone=None,
            image_url=None,
            google_maps_url=None
        )
        for i in range(5)
    ]
    
    prefs = UserPreferences(
        liked_tags={"food": ["italian"]},
        disliked_tags={},
        budget_level=2,
        pace=PaceEnum.MODERATE,
        mobility_limited=False,
        dietary_restrictions=[]
    )
    
    scored = score_recommendations(recs, prefs)
    
    # Should be sorted descending by score
    for i in range(len(scored) - 1):
        assert scored[i][1] >= scored[i + 1][1]


def test_scheduler_respects_pace(sample_preferences):
    """Test that scheduler respects pace settings"""
    # Create sample scored recommendations
    scored_recs = [
        (
            Recommendation(
                id=f"rec_{i}",
                name=f"Activity {i}",
                category=CategoryEnum.SIGHTSEEING if i % 2 == 0 else CategoryEnum.FOOD,
                tags=["test"],
                location={"lat": 41.9, "lng": 12.5},
                rating=4.5,
                price_range=2,
                description="Test",
                opening_hours="9am-10pm",
                estimated_duration=90,
                website=None,
                phone=None,
                image_url=None,
                google_maps_url=None
            ),
            80.0 - i  # Decreasing scores
        )
        for i in range(20)
    ]
    
    # Test slow pace
    prefs_slow = UserPreferences(
        liked_tags={},
        disliked_tags={},
        budget_level=2,
        pace=PaceEnum.SLOW,
        mobility_limited=False,
        dietary_restrictions=[]
    )
    
    scheduler_slow = ItineraryScheduler(prefs_slow, 9, 22)
    items_slow = scheduler_slow.schedule_day("2025-06-01", scored_recs, 1)
    
    # Test fast pace
    prefs_fast = UserPreferences(
        liked_tags={},
        disliked_tags={},
        budget_level=2,
        pace=PaceEnum.FAST,
        mobility_limited=False,
        dietary_restrictions=[]
    )
    
    scheduler_fast = ItineraryScheduler(prefs_fast, 9, 22)
    items_fast = scheduler_fast.schedule_day("2025-06-01", scored_recs, 1)
    
    # Fast pace should schedule more items
    assert len(items_fast) >= len(items_slow)


def test_scheduler_no_repetition():
    """Test that scheduler doesn't repeat recommendations"""
    scored_recs = [
        (
            Recommendation(
                id=f"rec_{i}",
                name=f"Place {i}",
                category=CategoryEnum.FOOD if i < 5 else CategoryEnum.SIGHTSEEING,
                tags=["test"],
                location={"lat": 41.9, "lng": 12.5},
                rating=4.5,
                price_range=2,
                description="Test",
                opening_hours="9am-10pm",
                estimated_duration=90,
                website=None,
                phone=None,
                image_url=None,
                google_maps_url=None
            ),
            80.0
        )
        for i in range(10)
    ]
    
    prefs = UserPreferences(
        liked_tags={},
        disliked_tags={},
        budget_level=2,
        pace=PaceEnum.MODERATE,
        mobility_limited=False,
        dietary_restrictions=[]
    )
    
    scheduler = ItineraryScheduler(prefs, 9, 22)
    
    # Schedule two days
    day1 = scheduler.schedule_day("2025-06-01", scored_recs, 1)
    day2 = scheduler.schedule_day("2025-06-02", scored_recs, 2)
    
    # Get all recommendation IDs
    day1_ids = {item.recommendation.id for item in day1}
    day2_ids = {item.recommendation.id for item in day2}
    
    # Should have no overlap
    assert len(day1_ids & day2_ids) == 0


def test_recommendation_engine_generates_itinerary(sample_trip_request):
    """Test that recommendation engine generates valid itinerary"""
    engine = RecommendationEngine()
    itinerary = engine.generate_itinerary(sample_trip_request)
    
    # Verify structure
    assert itinerary.trip_id is not None
    assert itinerary.destination == "Rome"
    assert len(itinerary.days) == 3  # 3-day trip
    assert itinerary.total_recommendations > 0
    assert itinerary.summary is not None
    
    # Verify each day has items
    for day in itinerary.days:
        assert len(day.items) > 0
        
        # Verify each item has required fields
        for item in day.items:
            assert item.time is not None
            assert item.recommendation is not None
            assert item.category is not None