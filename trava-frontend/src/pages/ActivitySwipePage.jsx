/**
 * ActivitySwipePage.jsx - Activity Selection
 * 
 * Displays activity options in swipeable cards.
 * User swipes right (like) or left (dislike).
 * 
 * Reads: TripContext.tripDetails
 * Saves: TripContext.likedActivities
 * 
 * Navigation:
 * - Complete → /itinerary
 * - Back → /swipe/food
 */

import { useNavigate } from "react-router-dom";
import { useTripContext } from "../context/TripContext";
import ActivitySwipeScreen from "../components/ActivitySwipeScreen";

export default function ActivitySwipePage() {
  const navigate = useNavigate();
  const { tripDetails, setLikedActivities } = useTripContext();

  const handleComplete = (liked) => {
    setLikedActivities(liked);
    navigate("/itinerary");
  };

  return (
    <ActivitySwipeScreen
      tripDetails={tripDetails}
      onBack={() => navigate("/swipe/food")}
      onComplete={handleComplete}
    />
  );
}