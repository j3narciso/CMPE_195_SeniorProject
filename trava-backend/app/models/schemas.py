"""Pydantic models for request/response validation"""
from pydantic import BaseModel, Field, validator
from typing import List, Dict, Optional
from datetime import datetime, date
from enum import Enum


class CategoryEnum(str, Enum):
    """Valid recommendation categories"""
    FOOD = "food"
    EVENTS = "events"
    SIGHTSEEING = "sightseeing"
    ACTIVITIES = "activities"
    STAY = "stay"


class PaceEnum(str, Enum):
    """Trip pace preferences"""
    SLOW = "slow"
    MODERATE = "moderate"
    FAST = "fast"


class Recommendation(BaseModel):
    """Individual recommendation object"""
    id: str
    name: str
    category: CategoryEnum
    tags: List[str] = Field(default_factory=list)
    location: Dict[str, float] = Field(description="{lat: float, lng: float}")
    rating: float = Field(ge=0, le=5)
    price_range: int = Field(ge=1, le=4, description="1-4 scale ($ to $$$$)")
    description: str
    opening_hours: Optional[str] = None
    estimated_duration: int = Field(description="Duration in minutes")
    website: Optional[str] = None
    phone: Optional[str] = None
    image_url: Optional[str] = None
    photo_url: Optional[str] = None
    google_maps_url: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "rec_123",
                "name": "Trevi Fountain",
                "category": "sightseeing",
                "tags": ["historic", "outdoor", "iconic"],
                "location": {"lat": 41.9009, "lng": 12.4833},
                "rating": 4.7,
                "price_range": 1,
                "description": "Famous baroque fountain in Rome",
                "opening_hours": "24 hours",
                "estimated_duration": 30,
                "website": "https://example.com",
                "phone": "+39 06 0608",
                "image_url": "https://example.com/image.jpg",
                "google_maps_url": "https://maps.google.com/?q=Trevi+Fountain"
            }
        }


class UserPreferences(BaseModel):
    """User preference data structure"""
    liked_tags: Dict[str, List[str]] = Field(default_factory=dict)
    disliked_tags: Dict[str, List[str]] = Field(default_factory=dict)
    budget_level: Optional[int] = Field(None, ge=1, le=4)
    pace: PaceEnum = PaceEnum.MODERATE
    mobility_limited: bool = False
    dietary_restrictions: List[str] = Field(default_factory=list)
    
    class Config:
        json_schema_extra = {
            "example": {
                "liked_tags": {
                    "food": ["italian", "casual", "street_food"],
                    "events": ["live_music", "cultural"],
                    "sightseeing": ["historic", "outdoor"],
                    "activities": ["adventure", "water_sports"]
                },
                "disliked_tags": {
                    "food": ["fast_food"],
                    "events": [],
                    "sightseeing": [],
                    "activities": []
                },
                "budget_level": 2,
                "pace": "moderate",
                "mobility_limited": False,
                "dietary_restrictions": []
            }
        }


class TripRequest(BaseModel):
    """Trip itinerary generation request"""
    destination: str = Field(min_length=1)
    start_date: str = Field(description="ISO format: YYYY-MM-DD")
    end_date: str = Field(description="ISO format: YYYY-MM-DD")
    daily_start_hour: int = Field(default=9, ge=0, le=23)
    daily_end_hour: int = Field(default=22, ge=0, le=23)
    preferences: UserPreferences
    
    @validator('end_date')
    def validate_dates(cls, v, values):
        """Ensure end_date is after start_date"""
        if 'start_date' in values:
            start = datetime.fromisoformat(values['start_date'])
            end = datetime.fromisoformat(v)
            if end < start:
                raise ValueError('end_date must be after start_date')
            if (end - start).days > 30:
                raise ValueError('Trip duration cannot exceed 30 days')
        return v
    
    @validator('daily_end_hour')
    def validate_hours(cls, v, values):
        """Ensure end_hour is after start_hour"""
        if 'daily_start_hour' in values:
            if v <= values['daily_start_hour']:
                raise ValueError('daily_end_hour must be after daily_start_hour')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "destination": "Rome",
                "start_date": "2025-03-15",
                "end_date": "2025-03-18",
                "daily_start_hour": 9,
                "daily_end_hour": 22,
                "preferences": {
                    "liked_tags": {
                        "food": ["italian", "casual"],
                        "events": ["cultural"],
                        "sightseeing": ["historic"],
                        "activities": ["walking_tours"]
                    },
                    "disliked_tags": {},
                    "budget_level": 2,
                    "pace": "moderate",
                    "mobility_limited": False,
                    "dietary_restrictions": []
                }
            }
        }


class ItineraryItem(BaseModel):
    """Single item in the itinerary"""
    time: str = Field(description="Time or time range (e.g., '9:00 AM' or '12:00 PM - 1:30 PM')")
    recommendation: Recommendation
    notes: str = Field(default="", description="Travel time alerts, special instructions")
    category: CategoryEnum


class DayItinerary(BaseModel):
    """Itinerary for a single day"""
    date: str = Field(description="ISO format date")
    items: List[ItineraryItem]


class Itinerary(BaseModel):
    """Complete trip itinerary"""
    trip_id: str
    destination: str
    days: List[DayItinerary]
    summary: str
    total_recommendations: int
    using_cached_data: bool = False
    warnings: List[str] = Field(default_factory=list)
    
    class Config:
        json_schema_extra = {
            "example": {
                "trip_id": "trip_abc123",
                "destination": "Rome",
                "days": [
                    {
                        "date": "2025-03-15",
                        "items": [
                            {
                                "time": "9:00 AM - 11:30 AM",
                                "recommendation": {
                                    "id": "rec_1",
                                    "name": "Colosseum",
                                    "category": "sightseeing",
                                    "tags": ["historic", "iconic"],
                                    "location": {"lat": 41.8902, "lng": 12.4924},
                                    "rating": 4.8,
                                    "price_range": 2,
                                    "description": "Ancient Roman amphitheater",
                                    "opening_hours": "9am-6pm",
                                    "estimated_duration": 150,
                                    "website": "https://example.com",
                                    "phone": "+39 06 3996 7700",
                                    "image_url": "https://example.com/colosseum.jpg",
                                    "google_maps_url": "https://maps.google.com/?q=Colosseum"
                                },
                                "notes": "Travel time: 15 min from hotel",
                                "category": "sightseeing"
                            }
                        ]
                    }
                ],
                "summary": "3-day Roman adventure focusing on historic sites and authentic cuisine",
                "total_recommendations": 24,
                "using_cached_data": False,
                "warnings": []
            }
        }


class RefineAction(BaseModel):
    """Action for itinerary refinement"""
    action: str = Field(description="'replace' or 'swap'")
    day: Optional[str] = None
    time_slot: Optional[str] = None
    day1: Optional[str] = None
    item1_time: Optional[str] = None
    day2: Optional[str] = None
    item2_time: Optional[str] = None
    reason: str


class RefineRequest(BaseModel):
    """Request to refine an existing itinerary"""
    changes: List[RefineAction]


class ErrorResponse(BaseModel):
    """Standard error response"""
    error: str
    detail: str
    suggestions: List[str] = Field(default_factory=list)


class RecommendationsResponse(BaseModel):
    """Paginated recommendations response"""
    recommendations: List[Recommendation]
    total: int
    limit: int
    offset: int