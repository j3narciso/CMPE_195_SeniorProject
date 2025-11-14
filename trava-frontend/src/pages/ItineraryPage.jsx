/**
 * ItineraryPage.jsx - Final Itinerary View
 * 
 * Displays the complete trip itinerary with three panels:
 * - Left: Travel summary (trip details + user preferences)
 * - Center: AI chatbot for itinerary modifications
 * - Right: Live updates as chatbot makes changes
 * 
 * Reads: All data from TripContext (tripDetails, likedHotels, likedFood, likedActivities)
 * 
 * Navigation:
 * - Back → /swipe/activities
 */

import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useTripContext } from "../context/TripContext";
import ItineraryScreen from "../components/ItineraryScreen";

export default function ItineraryPage() {
  const navigate = useNavigate();
  const { tripDetails, likedHotels, likedFood, likedActivities } = useTripContext();

  // Redirect to destination page if no trip details
  useEffect(() => {
    if (!tripDetails) {
      navigate('/destination');
    }
  }, [tripDetails, navigate]);

  return (
    <ItineraryScreen
      tripDetails={tripDetails}
      likedHotels={likedHotels}
      likedFood={likedFood}
      likedActivities={likedActivities}
      onBack={() => navigate("/swipe/activities")}
    />
  );
}