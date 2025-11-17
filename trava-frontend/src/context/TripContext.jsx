/**
 * TripContext.jsx - Global State Management
 * 
 * Provides shared state across the entire app using React Context API.
 * Stores user selections as they navigate through the trip planning flow.
 * 
 * State stored:
 * - tripDetails: { destination, startDate, endDate, guests }
 * - likedHotels: Array of hotel objects user swiped right on
 * - likedFood: Array of food/restaurant options user liked
 * - likedActivities: Array of activities user selected
 * 
 * Usage in any component:
 *   const { tripDetails, setTripDetails } = useTripContext();
 * 
 * Note: Components must be wrapped in <TripProvider> to use this context.
 */

import { createContext, useContext, useState, useEffect } from "react";

const TripContext = createContext();

export function TripProvider({ children }) {
  // Load initial state from localStorage if available
  const [tripDetails, setTripDetails] = useState(() => {
    const saved = localStorage.getItem('tripDetails');
    return saved ? JSON.parse(saved) : null;
  });
  const [likedHotels, setLikedHotels] = useState(() => {
    const saved = localStorage.getItem('likedHotels');
    return saved ? JSON.parse(saved) : [];
  });
  const [likedFood, setLikedFood] = useState(() => {
    const saved = localStorage.getItem('likedFood');
    return saved ? JSON.parse(saved) : [];
  });
  const [likedActivities, setLikedActivities] = useState(() => {
    const saved = localStorage.getItem('likedActivities');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (tripDetails) {
      localStorage.setItem('tripDetails', JSON.stringify(tripDetails));
    }
  }, [tripDetails]);

  useEffect(() => {
    localStorage.setItem('likedHotels', JSON.stringify(likedHotels));
  }, [likedHotels]);

  useEffect(() => {
    localStorage.setItem('likedFood', JSON.stringify(likedFood));
  }, [likedFood]);

  useEffect(() => {
    localStorage.setItem('likedActivities', JSON.stringify(likedActivities));
  }, [likedActivities]);

  // Function to clear all trip data
  const clearTripData = () => {
    setTripDetails(null);
    setLikedHotels([]);
    setLikedFood([]);
    setLikedActivities([]);
    localStorage.removeItem('tripDetails');
    localStorage.removeItem('likedHotels');
    localStorage.removeItem('likedFood');
    localStorage.removeItem('likedActivities');
  };

  const value = {
    tripDetails,
    setTripDetails,
    likedHotels,
    setLikedHotels,
    likedFood,
    setLikedFood,
    likedActivities,
    setLikedActivities,
    clearTripData,
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTripContext() {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error("useTripContext must be used within a TripProvider");
  }
  return context;
}