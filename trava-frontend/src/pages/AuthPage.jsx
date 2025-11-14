/**
 * AuthPage.jsx - Authentication Page
 * 
 * Handles user login, signup, and guest access.
 * Currently UI-only (no backend authentication yet).
 * 
 * Navigation:
 * - Login/Signup/Guest → /destination
 * - Back button → /
 */

import { useNavigate } from "react-router-dom";
import AuthScreen from "../components/AuthScreen";

export default function AuthPage() {
  const navigate = useNavigate();
  return (
    <AuthScreen
      onContinue={() => navigate("/destination")}
      onBack={() => navigate("/")}
    />
  );
}