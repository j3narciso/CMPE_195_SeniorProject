/**
 * FoodSwipePage.jsx - Restaurant/Food Selection
 * 
 * Displays food/restaurant options in swipeable cards.
 * User swipes right (like) or left (dislike).
 * 
 * Reads: TripContext.tripDetails
 * Saves: TripContext.likedFood
 * 
 * Navigation:
 * - Complete → /swipe/activities
 * - Back → /swipe/hotels
 */

import { useNavigate } from "react-router-dom";
import { useTripContext } from "../context/TripContext";
import FoodSwipeScreen from "../components/FoodSwipeScreen";

export default function FoodSwipePage() {
  const navigate = useNavigate();
  const { tripDetails, setLikedFood } = useTripContext();

  const handleComplete = (liked) => {
    setLikedFood(liked);
    navigate("/swipe/activities");
  };

  return (
    <FoodSwipeScreen
      tripDetails={tripDetails}
      onBack={() => navigate("/swipe/hotels")}
      onComplete={handleComplete}
    />
  );
}