/**
 * App.jsx - Main Routing Configuration
 * 
 * Defines all routes (URLs) and which page component renders for each.
 * Uses React Router for client-side navigation (no page reloads).
 * 
 * Route Structure:
 * / → WelcomePage (landing page)
 * /auth → AuthPage (login/signup)
 * /destination → DestinationPage (enter trip details)
 * /swipe/hotels → HotelSwipePage (swipe through hotels)
 * /swipe/food → FoodSwipePage (swipe through restaurants)
 * /swipe/activities → ActivitySwipePage (swipe through activities)
 * /itinerary → ItineraryPage (final itinerary with AI chatbot)
 * 
 * Any unknown route redirects to home (/).
 */

import { Routes, Route, Navigate } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import AuthPage from "./pages/AuthPage";
import DestinationPage from "./pages/DestinationPage";
import HotelSwipePage from "./pages/HotelSwipePage";
import FoodSwipePage from "./pages/FoodSwipePage";
import ActivitySwipePage from "./pages/ActivitySwipePage";
import ItineraryPage from "./pages/ItineraryPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/destination" element={<DestinationPage />} />
      <Route path="/swipe/hotels" element={<HotelSwipePage />} />
      <Route path="/swipe/food" element={<FoodSwipePage />} />
      <Route path="/swipe/activities" element={<ActivitySwipePage />} />
      <Route path="/itinerary" element={<ItineraryPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}