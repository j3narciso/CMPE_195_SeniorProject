"""Configuration management for Trava AI Backend"""
from pydantic import BaseModel
from typing import List
import os
import redis
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class Settings(BaseModel):
    """Application settings with environment variable support"""
    
    # Environment
    environment: str = os.getenv("ENVIRONMENT", "development")
    
    # API Keys
    google_maps_api_key: str = os.getenv("GOOGLE_MAPS_API_KEY", "")
    
    # Redis
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    redis_enabled: bool = os.getenv("REDIS_ENABLED", "false").lower() == "true"
    
    # Logging
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    
    # CORS
    cors_origins: str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000")
    
    # Performance
    max_workers: int = int(os.getenv("MAX_WORKERS", "4"))
    request_timeout: int = int(os.getenv("REQUEST_TIMEOUT", "30"))
    
    # Cache TTL (seconds)
    cache_ttl_recommendations: int = 3600  # 1 hour
    cache_ttl_itinerary: int = 1800  # 30 minutes
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    @property
    def is_production(self) -> bool:
        """Check if running in production"""
        return self.environment.lower() == "production"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development"""
        return self.environment.lower() == "development"


# Global settings instance
settings = Settings()

# Redis client (shared across the app)
redis_client = redis.Redis.from_url(
    settings.redis_url,  # assumes you have redis_url in Settings
    decode_responses=True
)