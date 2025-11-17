/**
 * DestinationPage.jsx - Trip Details Input
 * 
 * Collects trip information from user:
 * - Destination (city/country)
 * - Start and end dates
 * - Number of guests
 * 
 * Saves data to TripContext.tripDetails and navigates to hotel selection.
 * 
 * Navigation:
 * - Continue → /swipe/hotels
 * - Back → /auth
 */

import { useNavigate } from "react-router-dom";
import { useTripContext } from "../context/TripContext";
import DestinationScreen from "../components/DestinationScreen";

export default function DestinationPage() {
  const navigate = useNavigate();
  const { setTripDetails } = useTripContext();

  const handleContinue = (details) => {
    setTripDetails(details);
    navigate("/swipe/hotels");
  };

  return (
    <DestinationScreen
      onBack={() => navigate("/auth")}
      onContinue={handleContinue}
    />
  );
}