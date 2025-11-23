"""API routes for itinerary generation and management"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import logging

from app.models.schemas import (
    TripRequest, Itinerary, RefineRequest,
    ErrorResponse, RecommendationsResponse, CategoryEnum
)
from app.services.recommendation_engine import recommendation_engine

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["itinerary"])

# In-memory storage for generated itineraries (for refinement)
# In production, use Redis or database
itinerary_store = {}


@router.post("/itinerary/generate", response_model=Itinerary)
async def generate_itinerary(request: TripRequest):
    """
    Generate a personalized multi-day itinerary based on user preferences.
    
    This endpoint orchestrates the entire recommendation pipeline:
    - Validates destination and dates
    - Retrieves relevant recommendations
    - Scores based on user preferences
    - Schedules activities across days
    - Returns complete itinerary with warnings
    
    **Performance**: Typically completes in < 2 seconds
    """
    try:
        logger.info(
            f"Itinerary generation request: {request.destination}, "
            f"{request.start_date} to {request.end_date}"
        )
        
        # Generate itinerary
        itinerary = recommendation_engine.generate_itinerary(request)
        
        # Store for potential refinement
        itinerary_store[itinerary.trip_id] = itinerary
        
        logger.info(f"Successfully generated itinerary {itinerary.trip_id}")
        return itinerary
    
    except ValueError as e:
        # Validation errors
        logger.warning(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    
    except Exception as e:
        # Unexpected errors
        logger.error(f"Error generating itinerary: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Internal server error while generating itinerary. Please try again."
        )


@router.get("/recommendations", response_model=RecommendationsResponse)
async def get_recommendations(
    destination: str = Query(..., description="Destination city"),
    category: Optional[str] = Query(None, description="Filter by category: food, events, sightseeing, activities"),
    limit: int = Query(20, ge=1, le=100, description="Number of results per page"),
    offset: int = Query(0, ge=0, description="Pagination offset")
):
    """
    Get paginated recommendations for a destination, optionally filtered by category.
    
    Useful for:
    - Browsing available recommendations
    - UI pagination
    - Category-specific exploration
    """
    try:
        logger.info(
            f"Recommendations request: {destination}, category={category}, "
            f"limit={limit}, offset={offset}"
        )
        
        result = recommendation_engine.get_recommendations_by_category(
            destination=destination,
            category=category if category else None,
            limit=limit,
            offset=offset
        )
        
        return RecommendationsResponse(**result)
    
    except ValueError as e:
        logger.warning(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    
    except Exception as e:
        logger.error(f"Error fetching recommendations: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error fetching recommendations"
        )


@router.post("/itinerary/{trip_id}/refine", response_model=Itinerary)
async def refine_itinerary(trip_id: str, refine_request: RefineRequest):
    """
    Refine an existing itinerary based on user feedback.
    
    Supports:
    - Replacing specific recommendations
    - Swapping items between days
    - Adjusting based on chatbot feedback
    
    **Note**: This is a placeholder for chatbot integration.
    Full implementation would process natural language refinement requests.
    """
    try:
        # Check if itinerary exists
        if trip_id not in itinerary_store:
            raise HTTPException(
                status_code=404,
                detail=f"Itinerary {trip_id} not found. It may have expired."
            )
        
        logger.info(f"Refine request for {trip_id}: {len(refine_request.changes)} changes")
        
        # TODO: Implement refinement logic
        # For now, return the existing itinerary
        # In production, this would:
        # 1. Parse refinement actions
        # 2. Find replacement recommendations
        # 3. Re-score and re-schedule
        # 4. Return updated itinerary
        
        itinerary = itinerary_store[trip_id]
        logger.warning("Refinement not yet fully implemented, returning original itinerary")
        
        return itinerary
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error refining itinerary: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error refining itinerary"
        )


@router.get("/itinerary/{trip_id}", response_model=Itinerary)
async def get_itinerary(trip_id: str):
    """
    Retrieve a previously generated itinerary by ID.
    """
    if trip_id not in itinerary_store:
        raise HTTPException(
            status_code=404,
            detail=f"Itinerary {trip_id} not found"
        )
    
    return itinerary_store[trip_id]


@router.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring.
    """
    from app.services.data_source import data_source_manager
    
    return {
        "status": "healthy",
        "data_sources_available": len(data_source_manager.sources),
        "available_cities": data_source_manager.get_available_cities()
    }