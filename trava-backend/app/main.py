"""Main FastAPI application for Trava AI Backend"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import sys
from pythonjsonlogger import jsonlogger

from app.config import settings, redis_client
from app.routers import itinerary, health

# Configure logging
logger = logging.getLogger()
logger.setLevel(getattr(logging, settings.log_level.upper()))

# JSON formatter for structured logging
logHandler = logging.StreamHandler(sys.stdout)
formatter = jsonlogger.JsonFormatter(
    '%(asctime)s %(name)s %(levelname)s %(message)s'
)
logHandler.setFormatter(formatter)
logger.addHandler(logHandler)

logger.info(f"Starting Trava AI Backend in {settings.environment} mode")

# Create FastAPI app
app = FastAPI(
    title="Trava AI - Travel Recommendation Engine",
    description="""
    Production-grade AI-powered travel itinerary generation API.
    
    ## Features
    
    * **Intelligent Recommendation Engine** - Multi-factor scoring algorithm
    * **Smart Scheduling** - Geographic clustering and time optimization
    * **Personalization** - Adapts to user preferences and constraints
    * **Edge Case Handling** - Graceful degradation for all scenarios
    * **High Performance** - Sub-2-second itinerary generation
    
    ## Workflow
    
    1. **Submit Trip Request** - POST to `/api/v1/itinerary/generate`
    2. **Receive Personalized Itinerary** - Complete multi-day schedule
    3. **Refine (Optional)** - POST to `/api/v1/itinerary/{trip_id}/refine`
    
    ## Data Sources
    
    Currently using seeded mock data for Rome, Paris, and Tokyo.
    Google Places API integration ready for production deployment.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(itinerary.router)
app.include_router(health.router)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch-all exception handler for unexpected errors"""
    logger.error(
        f"Unhandled exception: {str(exc)}",
        exc_info=True,
        extra={"path": request.url.path, "method": request.method}
    )
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": "An unexpected error occurred. Please try again later."
        }
    )


@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    # Redis healthcheck
    try:
        redis_client.set("healthcheck", "ok", ex=10)
        logger.info("Redis connection OK")
    except Exception as e:
        logger.error(f"Redis connection FAILED: {e}")
    logger.info("Application startup complete")
    logger.info(f"CORS origins: {settings.cors_origins_list}")
    logger.info(f"Log level: {settings.log_level}")
    
    # Log data source status
    from app.services.data_source import data_source_manager
    logger.info(
        f"Data sources initialized: {len(data_source_manager.sources)} source(s)"
    )
    logger.info(
        f"Available cities: {', '.join(data_source_manager.get_available_cities())}"
    )


@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown"""
    logger.info("Application shutting down")


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "Trava AI - Travel Recommendation Engine",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
        "health": "/api/v1/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.is_development,
        log_level=settings.log_level.lower()
    )