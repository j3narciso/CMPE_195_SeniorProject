"""Health and diagnostics endpoints for Trava backend"""
from fastapi import APIRouter, HTTPException
import logging
import googlemaps

from app.config import settings

router = APIRouter(
    prefix="/api/v1/health",
    tags=["health"],
)

logger = logging.getLogger(__name__)


@router.get("/places")
async def places_healthcheck(destination: str = "Paris"):
    """
    Simple Google Places test endpoint.

    - Calls Google Places Text Search with the given destination
    - Returns top 3 place names + addresses + rating
    """
    # Make sure API key exists
    if not settings.google_maps_api_key:
        raise HTTPException(
            status_code=500,
            detail="GOOGLE_MAPS_API_KEY is not configured on the server.",
        )

    try:
        # Create Google Maps client
        gmaps = googlemaps.Client(key=settings.google_maps_api_key)

        query = f"top attractions in {destination}"
        response = gmaps.places(query=query)

        results = response.get("results", [])[:3]

        simplified = [
            {
                "name": place.get("name"),
                "address": place.get("formatted_address") or place.get("vicinity"),
                "rating": place.get("rating"),
            }
            for place in results
        ]

        logger.info(
            f"Google Places healthcheck for {destination}: {len(simplified)} result(s)"
        )

        return {
            "destination": destination,
            "query": query,
            "count": len(simplified),
            "places": simplified,
        }

    except Exception as e:
        logger.exception("Google Places healthcheck failed")
        raise HTTPException(
            status_code=500,
            detail=f"Google Places API error: {e}",
        )