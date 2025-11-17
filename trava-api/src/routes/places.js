/**
 * places.js - Places API Routes
 *
 * Handles HTTP requests for hotels, restaurants, and activities.
 * Uses Google Places API service to fetch real data.
 */

const express = require('express');
const router = express.Router();
const googlePlaces = require('../services/googlePlaces');

/**
 * GET /api/places/hotels
 * Search for hotels near a destination
 *
 * Query params:
 * - destination (required): City or location name
 * - radius (optional): Search radius in meters (default: 10000)
 * - limit (optional): Max results (default: 10)
 */
router.get('/hotels', async (req, res, next) => {
  try {
    const { destination, radius, limit } = req.query;

    if (!destination) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'destination query parameter is required'
      });
    }

    const options = {};
    if (radius) options.radius = parseInt(radius);
    if (limit) options.limit = parseInt(limit);

    const hotels = await googlePlaces.searchHotels(destination, options);

    // Transform data to match frontend expectations
    const formattedHotels = hotels.map(hotel => ({
      id: hotel.id,
      name: hotel.name,
      pricePerNight: estimatePricePerNight(hotel.priceLevel),
      priceLevel: getPriceLevelLabel(hotel.priceLevel),
      rating: hotel.rating,
      description: hotel.address,
      address: hotel.address,
      location: hotel.location,
      userRatingsTotal: hotel.userRatingsTotal,
      photos: hotel.photos.map(photo => googlePlaces.getPhotoUrl(photo.reference)),
      openNow: hotel.openNow
    }));

    res.json({
      success: true,
      destination,
      count: formattedHotels.length,
      data: formattedHotels
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/places/restaurants
 * Search for restaurants near a destination
 *
 * Query params:
 * - destination (required): City or location name
 * - radius (optional): Search radius in meters (default: 5000)
 * - limit (optional): Max results (default: 10)
 */
router.get('/restaurants', async (req, res, next) => {
  try {
    const { destination, radius, limit } = req.query;

    if (!destination) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'destination query parameter is required'
      });
    }

    const options = {};
    if (radius) options.radius = parseInt(radius);
    if (limit) options.limit = parseInt(limit);

    const restaurants = await googlePlaces.searchRestaurants(destination, options);

    // Transform data to match frontend expectations
    const formattedRestaurants = restaurants.map(restaurant => ({
      id: restaurant.id,
      name: restaurant.name,
      type: extractFoodType(restaurant.types),
      priceLevel: getPriceLevelLabel(restaurant.priceLevel),
      description: restaurant.address,
      rating: restaurant.rating,
      address: restaurant.address,
      location: restaurant.location,
      userRatingsTotal: restaurant.userRatingsTotal,
      photos: restaurant.photos.map(photo => googlePlaces.getPhotoUrl(photo.reference)),
      openNow: restaurant.openNow
    }));

    res.json({
      success: true,
      destination,
      count: formattedRestaurants.length,
      data: formattedRestaurants
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/places/activities
 * Search for activities/attractions near a destination
 *
 * Query params:
 * - destination (required): City or location name
 * - radius (optional): Search radius in meters (default: 15000)
 * - limit (optional): Max results (default: 10)
 */
router.get('/activities', async (req, res, next) => {
  try {
    const { destination, radius, limit } = req.query;

    if (!destination) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'destination query parameter is required'
      });
    }

    const options = {};
    if (radius) options.radius = parseInt(radius);
    if (limit) options.limit = parseInt(limit);

    const activities = await googlePlaces.searchActivities(destination, options);

    // Transform data to match frontend expectations
    const formattedActivities = activities.map(activity => ({
      id: activity.id,
      name: activity.name,
      type: extractActivityType(activity.types),
      energyLevel: estimateEnergyLevel(activity.types),
      description: activity.address,
      rating: activity.rating,
      address: activity.address,
      location: activity.location,
      userRatingsTotal: activity.userRatingsTotal,
      photos: activity.photos.map(photo => googlePlaces.getPhotoUrl(photo.reference)),
      openNow: activity.openNow
    }));

    res.json({
      success: true,
      destination,
      count: formattedActivities.length,
      data: formattedActivities
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/places/:placeId
 * Get detailed information about a specific place
 */
router.get('/:placeId', async (req, res, next) => {
  try {
    const { placeId } = req.params;
    const details = await googlePlaces.getPlaceDetails(placeId);

    res.json({
      success: true,
      data: details
    });
  } catch (error) {
    next(error);
  }
});

// Helper functions

/**
 * Estimate price per night based on Google's price level (0-4)
 */
function estimatePricePerNight(priceLevel) {
  const priceMap = {
    0: 50,   // Free/Unknown - use low estimate
    1: 75,   // Budget
    2: 150,  // Mid-range
    3: 250,  // High-end
    4: 400   // Luxury
  };
  return priceMap[priceLevel] || 100;
}

/**
 * Convert Google's numeric price level to label
 */
function getPriceLevelLabel(priceLevel) {
  const labelMap = {
    0: 'budget',
    1: 'budget',
    2: 'mid',
    3: 'luxury',
    4: 'luxury'
  };
  return labelMap[priceLevel] || 'mid';
}

/**
 * Extract readable food type from Google place types
 */
function extractFoodType(types) {
  const typeMap = {
    'cafe': 'cafe',
    'bakery': 'bakery',
    'bar': 'bar',
    'restaurant': 'casual',
    'food': 'casual',
    'meal_takeaway': 'street-food',
    'meal_delivery': 'casual'
  };

  for (const type of types) {
    if (typeMap[type]) {
      return typeMap[type];
    }
  }
  return 'casual';
}

/**
 * Extract readable activity type from Google place types
 */
function extractActivityType(types) {
  const typeMap = {
    'museum': 'culture',
    'art_gallery': 'culture',
    'park': 'outdoor',
    'amusement_park': 'outdoor',
    'aquarium': 'culture',
    'zoo': 'outdoor',
    'natural_feature': 'outdoor',
    'tourist_attraction': 'sightseeing',
    'point_of_interest': 'sightseeing',
    'shopping_mall': 'shopping',
    'night_club': 'nightlife',
    'spa': 'relax'
  };

  for (const type of types) {
    if (typeMap[type]) {
      return typeMap[type];
    }
  }
  return 'sightseeing';
}

/**
 * Estimate energy level required for activity
 */
function estimateEnergyLevel(types) {
  const highEnergy = ['park', 'amusement_park', 'zoo', 'natural_feature', 'hiking_area'];
  const lowEnergy = ['museum', 'art_gallery', 'aquarium', 'spa', 'library'];

  for (const type of types) {
    if (highEnergy.includes(type)) return 'high';
    if (lowEnergy.includes(type)) return 'low';
  }
  return 'medium';
}

module.exports = router;
