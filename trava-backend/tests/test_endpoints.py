"""Tests for API endpoints"""
import pytest
from fastapi.testclient import TestClient


def test_root_endpoint(client):
    """Test root endpoint returns API info"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "name" in data
    assert "version" in data
    assert data["status"] == "operational"


def test_health_check(client):
    """Test health check endpoint"""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "available_cities" in data
    assert len(data["available_cities"]) > 0


def test_generate_itinerary_success(client, sample_trip_request):
    """Test successful itinerary generation"""
    response = client.post(
        "/api/v1/itinerary/generate",
        json=sample_trip_request.model_dump()
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify response structure
    assert "trip_id" in data
    assert "destination" in data
    assert "days" in data
    assert "summary" in data
    assert "total_recommendations" in data
    
    # Verify content
    assert data["destination"] == "Rome"
    assert len(data["days"]) == 3  # 3-day trip
    assert data["total_recommendations"] > 0


def test_generate_itinerary_invalid_destination(client, sample_trip_request):
    """Test itinerary generation with invalid destination"""
    request_data = sample_trip_request.model_dump()
    request_data["destination"] = "InvalidCity"
    
    response = client.post(
        "/api/v1/itinerary/generate",
        json=request_data
    )
    
    assert response.status_code == 400
    assert "not" in response.json()["detail"].lower()


def test_generate_itinerary_invalid_dates(client, sample_trip_request):
    """Test itinerary generation with end date before start date"""
    request_data = sample_trip_request.model_dump()
    request_data["start_date"] = "2025-06-10"
    request_data["end_date"] = "2025-06-01"
    
    response = client.post(
        "/api/v1/itinerary/generate",
        json=request_data
    )
    
    assert response.status_code == 422  # Pydantic validation error


def test_get_recommendations(client):
    """Test getting recommendations for a destination"""
    response = client.get(
        "/api/v1/recommendations",
        params={"destination": "Rome", "limit": 10}
    )
    
    assert response.status_code == 200
    data = response.json()
    
    assert "recommendations" in data
    assert "total" in data
    assert "limit" in data
    assert "offset" in data
    assert len(data["recommendations"]) <= 10


def test_get_recommendations_by_category(client):
    """Test getting recommendations filtered by category"""
    response = client.get(
        "/api/v1/recommendations",
        params={"destination": "Rome", "category": "food", "limit": 5}
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # All recommendations should be food category
    for rec in data["recommendations"]:
        assert rec["category"] == "food"


def test_get_itinerary_by_id(client, sample_trip_request):
    """Test retrieving a generated itinerary by ID"""
    # First generate an itinerary
    gen_response = client.post(
        "/api/v1/itinerary/generate",
        json=sample_trip_request.model_dump()
    )
    trip_id = gen_response.json()["trip_id"]
    
    # Then retrieve it
    get_response = client.get(f"/api/v1/itinerary/{trip_id}")
    
    assert get_response.status_code == 200
    data = get_response.json()
    assert data["trip_id"] == trip_id


def test_get_itinerary_not_found(client):
    """Test retrieving non-existent itinerary"""
    response = client.get("/api/v1/itinerary/nonexistent_id")
    assert response.status_code == 404