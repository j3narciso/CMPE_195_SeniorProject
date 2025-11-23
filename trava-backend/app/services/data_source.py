"""Data source abstraction layer for recommendations"""
from abc import ABC, abstractmethod
from typing import List, Optional
import json
import os
import logging

try:
    import googlemaps
    GOOGLEMAPS_AVAILABLE = True
    print(f"✓ googlemaps imported successfully from {googlemaps.__file__}")
except ImportError as e:
    GOOGLEMAPS_AVAILABLE = False
    print(f"✗ Failed to import googlemaps: {e}")
except Exception as e:
    GOOGLEMAPS_AVAILABLE = False
    print(f"✗ Unexpected error importing googlemaps: {e}", flush=True)

from app.models.schemas import Recommendation, CategoryEnum
from app.config import settings

logger = logging.getLogger(__name__)


class DataSource(ABC):
    """Abstract base class for data sources"""
    
    @abstractmethod
    def get_recommendations(
        self,
        destination: str,
        category: Optional[CategoryEnum] = None,
        limit: Optional[int] = None
    ) -> List[Recommendation]:
        """Get recommendations for a destination"""
        pass
    
    @abstractmethod
    def is_available(self) -> bool:
        """Check if data source is available"""
        pass


class MockDataSource(DataSource):
    """Mock data source using seeded JSON data"""
    
    def __init__(self):
        self.data = self._load_data()
        logger.info(f"Loaded mock data for {len(self.data)} cities")
    
    def _load_data(self) -> dict:
        """Load seeded recommendations from JSON file"""
        data_path = os.path.join(
            os.path.dirname(__file__),
            "..",
            "data",
            "seeded_recommendations.json"
        )
        
        try:
            with open(data_path, "r") as f:
                return json.load(f)
        except FileNotFoundError:
            logger.error(f"Mock data file not found at {data_path}")
            return {}
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing mock data: {e}")
            return {}
    
    def get_recommendations(
        self,
        destination: str,
        category: Optional[CategoryEnum] = None,
        limit: Optional[int] = None
    ) -> List[Recommendation]:
        """Get recommendations from mock data"""
        # Normalize destination name
        dest_normalized = destination.strip().title()
        
        if dest_normalized not in self.data:
            logger.warning(f"No mock data available for {destination}")
            return []
        
        # Get all recommendations for destination
        recs_data = self.data[dest_normalized]
        
        # Parse into Recommendation objects
        recommendations = []
        for rec_data in recs_data:
            try:
                rec = Recommendation(**rec_data)
                recommendations.append(rec)
            except Exception as e:
                logger.error(f"Error parsing recommendation {rec_data.get('id')}: {e}")
                continue
        
        # Filter by category if specified
        if category:
            recommendations = [
                rec for rec in recommendations
                if rec.category == category
            ]
        
        # Apply limit if specified
        if limit:
            recommendations = recommendations[:limit]
        
        logger.info(
            f"Retrieved {len(recommendations)} recommendations for {destination}"
            + (f" (category: {category})" if category else "")
        )
        
        return recommendations
    
    def is_available(self) -> bool:
        """Check if mock data is available"""
        return len(self.data) > 0


class GooglePlacesDataSource(DataSource):
    """
    Google Places API data source.
    Ready for integration when API key is available.
    """
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.client = None
        
        if api_key and GOOGLEMAPS_AVAILABLE:
            try:
                self.client = googlemaps.Client(key=api_key)
                logger.info("Google Places API client initialized")
            except Exception as e:
                logger.error(f"Error initializing Google Places client: {e}", exc_info=True)
        elif api_key and not GOOGLEMAPS_AVAILABLE:
            logger.error("googlemaps package not installed")
    
    def get_recommendations(
        self,
        destination: str,
        category: Optional[CategoryEnum] = None,
        limit: Optional[int] = None
    ) -> List[Recommendation]:
        """Get recommendations from Google Places API"""
        if not self.client:
            logger.warning("Google Places API not available")
            return []
        
        try:
            # Map categories to Google Places types
            place_types = self._get_place_types(category)
            
            # Get geocode for destination
            geocode_result = self.client.geocode(address=destination)
            if not geocode_result:
                logger.warning(f"Could not geocode destination: {destination}")
                return []
            
            location = geocode_result[0]['geometry']['location']
            lat, lng = location['lat'], location['lng']
            
            recommendations = []
            
            # Search for each place type
            for place_type in place_types:
                try:
                    # Nearby search
                    places_result = self.client.places_nearby(
                        location=(lat, lng),
                        radius=5000,  # 5km radius
                        type=place_type,
                        rank_by='prominence'
                    )
                    
                    # Convert results to Recommendation objects
                    for place in places_result.get('results', [])[:5]:  # Limit 5 per type
                        rec = self._convert_place_to_recommendation(
                            place, place_type
                        )
                        if rec:
                            recommendations.append(rec)
                
                except Exception as e:
                    logger.error(f"Error searching for {place_type}: {e}")
                    continue
            
            # Apply limit if specified
            if limit:
                recommendations = recommendations[:limit]
            
            logger.info(
                f"Retrieved {len(recommendations)} recommendations from Google Places for {destination}"
            )
            return recommendations
        
        except Exception as e:
            logger.error(f"Error fetching from Google Places API: {e}")
            return []
    
    def _get_place_types(self, category: Optional[CategoryEnum]) -> List[str]:
        """Map recommendation categories to Google Places types"""
        type_mapping = {
            CategoryEnum.FOOD: ['restaurant', 'cafe', 'bar'],
            CategoryEnum.SIGHTSEEING: ['tourist_attraction', 'museum', 'park', 'point_of_interest'],
            CategoryEnum.ACTIVITIES: ['amusement_park', 'aquarium', 'art_gallery', 'bowling_alley'],
            CategoryEnum.EVENTS: ['event_venue', 'night_club']
        }
        
        if category and category in type_mapping:
            return type_mapping[category]
        
        # Return all types if no category specified
        all_types = []
        for types in type_mapping.values():
            all_types.extend(types)
        return all_types
    
    def _convert_place_to_recommendation(self, place: dict, place_type: str) -> Optional[Recommendation]:
        """Convert Google Places result to Recommendation object"""
        try:
            # Determine category from place type
            category = self._get_category_from_type(place_type)
            
            # Extract location
            location = place.get('geometry', {}).get('location', {})
            
            # Get place details for more info
            place_details = self.client.place(
                place_id=place['place_id'],
                fields=['name', 'formatted_address', 'opening_hours', 'website', 'formatted_phone_number', 'rating', 'price_level', 'photo']
            )
            details = place_details.get('result', {})
            
            # Create recommendation
            recommendation = Recommendation(
                id=place['place_id'],
                name=place.get('name', 'Unknown'),
                category=category,
                tags=self._extract_tags(place, place_type),
                location={
                    'lat': location.get('lat', 0),
                    'lng': location.get('lng', 0)
                },
                rating=place.get('rating', 3.5),
                price_range=place.get('price_level', 2),
                description=details.get('formatted_address', ''),
                opening_hours=self._format_opening_hours(details.get('opening_hours')),
                estimated_duration=self._estimate_duration(category),
                website=details.get('website'),
                phone=details.get('formatted_phone_number'),
                image_url=self._get_photo_url(place.get('photos', [])),
                google_maps_url=f"https://maps.google.com/?q={place['place_id']}"
            )
            
            return recommendation
        
        except Exception as e:
            logger.error(f"Error converting place to recommendation: {e}")
            return None
    
    def _get_category_from_type(self, place_type: str) -> CategoryEnum:
        """Map Google Places type to recommendation category"""
        type_to_category = {
            'restaurant': CategoryEnum.FOOD,
            'cafe': CategoryEnum.FOOD,
            'bar': CategoryEnum.FOOD,
            'tourist_attraction': CategoryEnum.SIGHTSEEING,
            'museum': CategoryEnum.SIGHTSEEING,
            'park': CategoryEnum.SIGHTSEEING,
            'point_of_interest': CategoryEnum.SIGHTSEEING,
            'amusement_park': CategoryEnum.ACTIVITIES,
            'aquarium': CategoryEnum.ACTIVITIES,
            'art_gallery': CategoryEnum.ACTIVITIES,
            'bowling_alley': CategoryEnum.ACTIVITIES,
            'event_venue': CategoryEnum.EVENTS,
            'night_club': CategoryEnum.EVENTS
        }
        return type_to_category.get(place_type, CategoryEnum.SIGHTSEEING)
    
    def _extract_tags(self, place: dict, place_type: str) -> List[str]:
        """Extract tags from place data"""
        tags = [place_type]
        
        # Add rating-based tags
        rating = place.get('rating', 0)
        if rating >= 4.5:
            tags.append('highly_rated')
        
        # Add price-based tags
        price_level = place.get('price_level', 0)
        if price_level == 1:
            tags.append('budget_friendly')
        elif price_level >= 3:
            tags.append('upscale')
        
        # Add open now tag
        if place.get('opening_hours', {}).get('open_now'):
            tags.append('open_now')
        
        return tags
    
    def _format_opening_hours(self, opening_hours: Optional[dict]) -> Optional[str]:
        """Format opening hours for display"""
        if not opening_hours:
            return None
        
        weekday_text = opening_hours.get('weekday_text', [])
        if weekday_text:
            return '; '.join(weekday_text[:3])  # Show first 3 days
        
        return None
    
    def _estimate_duration(self, category: CategoryEnum) -> int:
        """Estimate duration in minutes based on category"""
        duration_map = {
            CategoryEnum.FOOD: 90,
            CategoryEnum.SIGHTSEEING: 120,
            CategoryEnum.ACTIVITIES: 180,
            CategoryEnum.EVENTS: 240
        }
        return duration_map.get(category, 120)
    
    def _get_photo_url(self, photos: List[dict]) -> Optional[str]:
        """Get photo URL from place photos"""
        if not photos:
            return None
        
        photo = photos[0]
        photo_reference = photo.get('photo_reference')
        
        if photo_reference:
            return f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference={photo_reference}&key={self.api_key}"
        
        return None
    
    def is_available(self) -> bool:
        """Check if Google Places API is available"""
        return self.client is not None


class DataSourceManager:
    """
    Manages multiple data sources with fallback logic.
    Tries primary source first, falls back to secondary if unavailable.
    """
    
    def __init__(self):
        self.sources: List[DataSource] = []
        self.using_fallback = False
        
        # Initialize Google Places if API key available
        if settings.google_maps_api_key:
            google_source = GooglePlacesDataSource(settings.google_maps_api_key)
            if google_source.is_available():
                self.sources.append(google_source)
                logger.info("Google Places API added as primary data source")
        
        # Always add mock data as fallback
        mock_source = MockDataSource()
        if mock_source.is_available():
            self.sources.append(mock_source)
            logger.info("Mock data added as fallback data source")
        
        if not self.sources:
            logger.error("No data sources available!")
    
    def get_recommendations(
        self,
        destination: str,
        category: Optional[CategoryEnum] = None,
        limit: Optional[int] = None
    ) -> tuple[List[Recommendation], bool]:
        """
        Get recommendations from available data sources.
        Returns (recommendations, using_cached_data)
        """
        for i, source in enumerate(self.sources):
            try:
                recommendations = source.get_recommendations(
                    destination, category, limit
                )
                
                if recommendations:
                    using_cached = i > 0  # True if not using primary source
                    if using_cached:
                        logger.warning(
                            f"Using fallback data source (source {i+1}/{len(self.sources)})"
                        )
                    return recommendations, using_cached
            
            except Exception as e:
                logger.error(f"Error from data source {i+1}: {e}")
                continue
        
        # No sources returned data
        logger.error(f"No recommendations found for {destination}")
        return [], True
    
    def get_available_cities(self) -> List[str]:
        """Get list of available cities from all data sources"""
        cities = set()
        
        for source in self.sources:
            if isinstance(source, MockDataSource):
                cities.update(source.data.keys())
        
        return sorted(list(cities))


# Global data source manager instance
data_source_manager = DataSourceManager()