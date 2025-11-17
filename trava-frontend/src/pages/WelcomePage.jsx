/**
 * WelcomePage.jsx - Landing Page
 * 
 * First page users see when visiting the app.
 * Displays welcome message and "Continue" button.
 * 
 * Navigation: Clicking "Continue" routes to /auth
 */

import { useNavigate } from "react-router-dom";
import WelcomeScreen from "../components/WelcomeScreen";

export default function WelcomePage() {
  const navigate = useNavigate();
  return <WelcomeScreen onContinue={() => navigate("/auth")} />;
}