import { useState } from "react";
import WelcomeScreen from "./components/WelcomeScreen";
import AuthScreen from "./components/AuthScreen";
import DestinationScreen from "./components/DestinationScreen";
import HotelSwipeScreen from "./components/HotelSwipeScreen";
import FoodSwipeScreen from "./components/FoodSwipeScreen";
import ActivitySwipeScreen from "./components/ActivitySwipeScreen";
import ItineraryScreen from "./components/ItineraryScreen";

export default function App() {
  const [step, setStep] = useState("welcome");
  const [tripDetails, setTripDetails] = useState(null);
  const [likedHotels, setLikedHotels] = useState([]);
  const [likedFood, setLikedFood] = useState([]);
  const [likedActivities, setLikedActivities] = useState([]);

  if (step === "welcome") {
    return <WelcomeScreen onContinue={() => setStep("auth")} />;
  }

  if (step === "auth") {
    return (
      <AuthScreen
        onContinue={() => setStep("destination")}
        onBack={() => setStep("welcome")}
      />
    );
  }

  if (step === "destination") {
    return (
      <DestinationScreen
        onBack={() => setStep("auth")}
        onContinue={(details) => {
          setTripDetails(details);
          setStep("hotel-swipe");
        }}
      />
    );
  }

  if (step === "hotel-swipe") {
    return (
      <HotelSwipeScreen
        tripDetails={tripDetails}
        onBack={() => setStep("destination")}
        onComplete={(liked) => {
          setLikedHotels(liked);
          setStep("food-swipe");
        }}
      />
    );
  }

  if (step === "food-swipe") {
    return (
      <FoodSwipeScreen
        tripDetails={tripDetails}
        onBack={() => setStep("hotel-swipe")}
        onComplete={(liked) => {
          setLikedFood(liked);
          setStep("activity-swipe");
        }}
      />
    );
  }

  if (step === "activity-swipe") {
    return (
      <ActivitySwipeScreen
        tripDetails={tripDetails}
        onBack={() => setStep("food-swipe")}
        onComplete={(liked) => {
          setLikedActivities(liked);
          setStep("itinerary");
        }}
      />
    );
  }

  if (step === "itinerary") {
    return (
      <ItineraryScreen
        tripDetails={tripDetails}
        likedHotels={likedHotels}
        likedFood={likedFood}
        likedActivities={likedActivities}
        onBack={() => setStep("activity-swipe")}
      />
    );
  }

  return <div>Something went wrong.</div>;
}