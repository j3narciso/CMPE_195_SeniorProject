/**
 * googlePlaces.js - Google Places API Service
 *
 * Handles all interactions with Google Places API.
 * Provides methods to search for hotels, restaurants, and activities.
 */

const { Client } = require('@googlemaps/google-maps-services-js');

class GooglePlacesService {
  constructor() {
    this.client = new Client({});
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!this.apiKey) {
      console.warn('⚠️  WARNING: GOOGLE_PLACES_API_KEY not found in environment variables');
    }
  }

  /**
   * Get coordinates for a destination
   * @param {string} destination - City or location name
   * @returns {Promise<{lat: number, lng: number}>}
   */
  async getCoordinates(destination) {
    try {
      const response = await this.client.geocode({
        params: {
          address: destination,
          key: this.apiKey
        }
      });

      if (response.data.results.length === 0) {
        throw new Error(`Location not found: ${destination}`);
      }

      const location = response.data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    } catch (error) {
      console.error('Geocoding error:', error.message);
      throw new Error(`Failed to geocode destination: ${destination}`);
    }
  }

  /**
   * Search for places near a location
   * @param {Object} params
   * @param {string} params.destination - Location to search near
   * @param {string} params.type - Type of place (lodging, restaurant, tourist_attraction)
   * @param {number} params.radius - Search radius in meters (default: 5000)
   * @param {number} params.limit - Max results to return (default: 10)
   * @returns {Promise<Array>}
   */
  async searchPlaces({ destination, type, radius = 5000, limit = 10 }) {
    try {
      // Get coordinates for destination
      const location = await this.getCoordinates(destination);

      // Search for places
      const response = await this.client.placesNearby({
        params: {
          location: location,
          radius: radius,
          type: type,
          key: this.apiKey
        }
      });

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        throw new Error(`Places API error: ${response.data.status}`);
      }

      // Format results
      const places = response.data.results.slice(0, limit).map(place => ({
        id: place.place_id,
        name: place.name,
        address: place.vicinity,
        rating: place.rating || 0,
        userRatingsTotal: place.user_ratings_total || 0,
        priceLevel: place.price_level || 0,
        types: place.types,
        location: place.geometry.location,
        photos: place.photos ? place.photos.map(photo => ({
          reference: photo.photo_reference,
          width: photo.width,
          height: photo.height
        })) : [],
        openNow: place.opening_hours?.open_now
      }));

      return places;
    } catch (error) {
      console.error('Places search error:', error.message);
      throw error;
    }
  }

  /**
   * Get place details
   * @param {string} placeId - Google Place ID
   * @returns {Promise<Object>}
   */
  async getPlaceDetails(placeId) {
    try {
      const response = await this.client.placeDetails({
        params: {
          place_id: placeId,
          fields: [
            'name',
            'formatted_address',
            'formatted_phone_number',
            'website',
            'rating',
            'user_ratings_total',
            'price_level',
            'opening_hours',
            'photos',
            'reviews',
            'geometry',
            'types'
          ],
          key: this.apiKey
        }
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Place details error: ${response.data.status}`);
      }

      return response.data.result;
    } catch (error) {
      console.error('Place details error:', error.message);
      throw error;
    }
  }

  /**
   * Get photo URL for a place
   * @param {string} photoReference - Photo reference from place data
   * @param {number} maxWidth - Maximum photo width (default: 400)
   * @returns {string}
   */
  getPhotoUrl(photoReference, maxWidth = 400) {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${this.apiKey}`;
  }

  /**
   * Search for hotels
   */
  async searchHotels(destination, options = {}) {
    return this.searchPlaces({
      destination,
      type: 'lodging',
      radius: options.radius || 10000,
      limit: options.limit || 10
    });
  }

  /**
   * Search for restaurants
   */
  async searchRestaurants(destination, options = {}) {
    return this.searchPlaces({
      destination,
      type: 'restaurant',
      radius: options.radius || 5000,
      limit: options.limit || 10
    });
  }

  /**
   * Search for activities/attractions
   */
  async searchActivities(destination, options = {}) {
    return this.searchPlaces({
      destination,
      type: 'tourist_attraction',
      radius: options.radius || 15000,
      limit: options.limit || 10
    });
  }
}

module.exports = new GooglePlacesService();
