/**
 * HotelSwipePage.jsx - Hotel Selection
 * 
 * Displays hotel options in swipeable cards.
 * User swipes right (like) or left (dislike).
 * 
 * Reads: TripContext.tripDetails (for destination)
 * Saves: TripContext.likedHotels (user's selections)
 * 
 * Navigation:
 * - Complete → /swipe/food
 * - Back → /destination
 */

import { useNavigate } from "react-router-dom";
import { useTripContext } from "../context/TripContext";
import HotelSwipeScreen from "../components/HotelSwipeScreen";

export default function HotelSwipePage() {
  const navigate = useNavigate();
  const { tripDetails, setLikedHotels } = useTripContext();

  const handleComplete = (liked) => {
    setLikedHotels(liked);
    navigate("/swipe/food");
  };

  return (
    <HotelSwipeScreen
      tripDetails={tripDetails}
      onBack={() => navigate("/destination")}
      onComplete={handleComplete}
    />
  );
}