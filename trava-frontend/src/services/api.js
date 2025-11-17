/**
 * api.js - API Service
 *
 * Handles all HTTP requests to the TravelGen backend API.
 * Provides methods to fetch hotels, restaurants, and activities from Google Places.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  /**
   * Make a GET request to the API
   */
  async get(endpoint, params = {}) {
    const url = new URL(`${API_BASE_URL}${endpoint}`);

    // Add query parameters
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    try {
      const response = await fetch(url.toString());

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * Fetch hotels for a destination
   * @param {string} destination - City or location name
   * @param {Object} options - Optional parameters (radius, limit)
   * @returns {Promise<Array>}
   */
  async getHotels(destination, options = {}) {
    const params = {
      destination,
      limit: options.limit || 10,
      ...(options.radius && { radius: options.radius })
    };

    const response = await this.get('/places/hotels', params);
    return response.data || [];
  }

  /**
   * Fetch restaurants for a destination
   * @param {string} destination - City or location name
   * @param {Object} options - Optional parameters (radius, limit)
   * @returns {Promise<Array>}
   */
  async getRestaurants(destination, options = {}) {
    const params = {
      destination,
      limit: options.limit || 10,
      ...(options.radius && { radius: options.radius })
    };

    const response = await this.get('/places/restaurants', params);
    return response.data || [];
  }

  /**
   * Fetch activities for a destination
   * @param {string} destination - City or location name
   * @param {Object} options - Optional parameters (radius, limit)
   * @returns {Promise<Array>}
   */
  async getActivities(destination, options = {}) {
    const params = {
      destination,
      limit: options.limit || 10,
      ...(options.radius && { radius: options.radius })
    };

    const response = await this.get('/places/activities', params);
    return response.data || [];
  }

  /**
   * Get details for a specific place
   * @param {string} placeId - Google Place ID
   * @returns {Promise<Object>}
   */
  async getPlaceDetails(placeId) {
    const response = await this.get(`/places/${placeId}`);
    return response.data || {};
  }

  /**
   * Health check
   * @returns {Promise<Object>}
   */
  async healthCheck() {
    return await this.get('/health');
  }
}

export default new ApiService();
