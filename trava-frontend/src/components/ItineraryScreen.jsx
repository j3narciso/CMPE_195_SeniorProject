/**
 * ItineraryScreen.jsx - Itinerary Display Component
 * 
 * Three-column layout for final trip planning:
 * 
 * LEFT PANEL (320px):
 * - Trip details (destination, dates, guests)
 * - User preferences (liked hotels, food, activities)
 * - Back button
 * 
 * CENTER PANEL (flexible):
 * - AI chatbot interface
 * - Message history with timestamps
 * - Input field for user questions
 * - Simulates bot responses (will connect to backend API)
 * 
 * RIGHT PANEL (320px):
 * - Live itinerary updates feed
 * - Shows changes as chatbot modifies trip
 * - Confirm and Export buttons
 * 
 * Props:
 * - tripDetails: { destination, startDate, endDate, guests }
 * - likedHotels: Array of hotel objects
 * - likedFood: Array of food/restaurant objects
 * - likedActivities: Array of activity objects
 * - onBack: Function to navigate back
 * 
 * State:
 * - messages: Chat history between user and bot
 * - inputMessage: Current message being typed
 * - itineraryUpdates: Feed of changes to the itinerary
 */

import { useState, useEffect } from "react";
import {
  MapPin,
  Hotel,
  UtensilsCrossed,
  Target,
  Bot,
  ClipboardList,
  ArrowLeft,
  Send,
  Check,
  Download,
  AlertCircle,
  Loader,
  Sparkles,
  Calendar,
  Users,
} from "lucide-react";
import { generateItinerary, mapSelectionsToPreferences, createTripRequest } from "../services/api";

const MODERN_STYLES = `
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;
export default function ItineraryScreen({
  tripDetails,
  likedHotels,
  likedFood,
  likedActivities,
  onBack,
}) {
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hello! I'm your AI travel assistant. I can help you modify your itinerary, answer questions, or provide recommendations. How can I assist you?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [itineraryUpdates, setItineraryUpdates] = useState([]);

  // Fetch itinerary on component mount (only once per trip)
  useEffect(() => {
    // If itinerary already loaded, don't fetch again
    if (itinerary) {
      setLoading(false);
      return;
    }

    const fetchItinerary = async () => {
      try {
        setLoading(true);
        setError(null);

        // Map frontend selections to backend preferences
        const preferences = mapSelectionsToPreferences({
          likedHotels,
          likedFood,
          likedActivities,
        });

        // Create trip request
        const tripRequest = createTripRequest(tripDetails, preferences);

        // Call backend API
        const result = await generateItinerary(tripRequest);

        if (result.error) {
          setError(result.error || "Failed to generate itinerary");
          setItineraryUpdates([
            {
              id: 1,
              type: "error",
              text: `Error: ${result.detail || result.error}`,
              timestamp: new Date(),
            },
          ]);
        } else {
          setItinerary(result);
          setItineraryUpdates([
            {
              id: 1,
              type: "info",
              text: `✓ Itinerary generated: ${result.total_recommendations} recommendations across ${result.days.length} days`,
              timestamp: new Date(),
            },
            ...result.warnings.map((warning, idx) => ({
              id: idx + 2,
              type: "warning",
              text: `⚠️ ${warning}`,
              timestamp: new Date(),
            })),
          ]);
        }
      } catch (err) {
        setError(err.message || "Failed to fetch itinerary");
        setItineraryUpdates([
          {
            id: 1,
            type: "error",
            text: `Error: ${err.message}`,
            timestamp: new Date(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (tripDetails && !itinerary) {
      fetchItinerary();
    }
  }, []);

  if (!tripDetails) {
    return <div>Missing trip details.</div>;
  }

  if (loading && !itinerary) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100vw",
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 25%, #1e40af 50%, #0c4a6e 75%, #082f49 100%)",
          color: "white",
          overflow: "hidden",
        }}
      >
        <style>{MODERN_STYLES}</style>
        <div style={{ textAlign: "center", position: "relative", zIndex: 10 }}>
          <div
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
              padding: "20px",
              borderRadius: "16px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "24px",
              boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)",
            }}
          >
            <Loader size={48} style={{ animation: "spin 1s linear infinite" }} />
          </div>
          <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "8px" }}>Generating Itinerary</h2>
          <p style={{ fontSize: "15px", color: "#cbd5e1" }}>Crafting your perfect journey...</p>
        </div>
      </div>
    );
  }

  const { destination, startDate, endDate, guests } = tripDetails;

  const formatDate = (d) =>
    d instanceof Date ? d.toLocaleDateString() : String(d);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !itinerary) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      sender: "user",
      text: inputMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Show processing update
    const processingUpdate = {
      id: itineraryUpdates.length + 1,
      type: "update",
      text: `Processing: "${inputMessage}"`,
      timestamp: new Date(),
    };
    setItineraryUpdates((prev) => [...prev, processingUpdate]);

    // Simulate bot response (refinement API not yet implemented in backend)
    setTimeout(() => {
      const botMessage = {
        id: messages.length + 2,
        sender: "bot",
        text: "I understand your request. The refinement feature will be available soon! For now, you can export this itinerary and modify it manually.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);

    setInputMessage("");
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 25%, #1e40af 50%, #0c4a6e 75%, #082f49 100%)",
        color: "white",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        padding: "24px",
        gap: "20px",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <style>{MODERN_STYLES}</style>
      {/* LEFT PANEL - Travel Summary */}
      <div
        style={{
          flex: "0 0 320px",
          backgroundColor: "rgba(30, 41, 59, 0.6)",
          backdropFilter: "blur(10px)",
          borderRadius: "20px",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "28px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          animation: "slideInLeft 0.6s ease-out",
        }}
      >
        <div style={{ marginBottom: "24px" }}>
          <button
            onClick={onBack}
            style={{
              backgroundColor: "transparent",
              color: "#3b82f6",
              border: "2px solid rgba(59, 130, 246, 0.3)",
              padding: "10px 16px",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "rgba(59, 130, 246, 0.15)";
              e.target.style.borderColor = "rgba(59, 130, 246, 0.6)";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.borderColor = "rgba(59, 130, 246, 0.3)";
            }}
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>

        <h2
          style={{
            margin: "0 0 4px 0",
            fontSize: "22px",
            fontWeight: "700",
            background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Your Journey
        </h2>
        <p
          style={{
            margin: "0 0 24px 0",
            fontSize: "13px",
            color: "#cbd5e1",
            lineHeight: "1.5",
          }}
        >
          Trip details & preferences
        </p>

        {/* Trip Details Card */}
        <div
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(8px)",
            borderRadius: "14px",
            padding: "18px",
            marginBottom: "14px",
            border: "1px solid rgba(59, 130, 246, 0.2)",
            transition: "all 0.3s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(15, 23, 42, 0.7)";
            e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.4)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(15, 23, 42, 0.5)";
            e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.2)";
          }}
        >
          <h3
            style={{
              margin: "0 0 12px 0",
              fontSize: "15px",
              fontWeight: "700",
              color: "#3b82f6",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <MapPin size={16} />
            Trip Details
          </h3>
          <div style={{ fontSize: "13px", lineHeight: "1.9", color: "#e2e8f0" }}>
            <div style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              <MapPin size={14} style={{ color: "#3b82f6", flexShrink: 0 }} />
              <span>{destination}</span>
            </div>
            <div style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Calendar size={14} style={{ color: "#3b82f6", flexShrink: 0 }} />
              <span>{formatDate(startDate)} → {formatDate(endDate)}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Users size={14} style={{ color: "#3b82f6", flexShrink: 0 }} />
              <span>{guests} {guests === 1 ? "guest" : "guests"}</span>
            </div>
          </div>
        </div>

        {/* Hotels Card */}
        <div
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(8px)",
            borderRadius: "14px",
            padding: "18px",
            marginBottom: "14px",
            border: "1px solid rgba(59, 130, 246, 0.2)",
            transition: "all 0.3s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(15, 23, 42, 0.7)";
            e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.4)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(15, 23, 42, 0.5)";
            e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.2)";
          }}
        >
          <h3
            style={{
              margin: "0 0 12px 0",
              fontSize: "15px",
              fontWeight: "700",
              color: "#3b82f6",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Hotel size={16} />
            Preferred Hotels
          </h3>
          {likedHotels.length === 0 ? (
            <p style={{ margin: 0, fontSize: "13px", color: "#888" }}>
              No hotels selected
            </p>
          ) : (
            <ul
              style={{
                margin: 0,
                paddingLeft: "18px",
                fontSize: "13px",
                lineHeight: "1.8",
              }}
            >
              {likedHotels.map((h) => (
                <li key={h.id} style={{ marginBottom: "4px" }}>
                  <strong>{h.name}</strong>
                  <div style={{ color: "#888", fontSize: "12px" }}>
                    ${h.pricePerNight.toFixed(0)}/night · {h.priceLevel} · ⭐{" "}
                    {h.rating}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Food Card */}
        <div
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(8px)",
            borderRadius: "14px",
            padding: "18px",
            marginBottom: "14px",
            border: "1px solid rgba(59, 130, 246, 0.2)",
            transition: "all 0.3s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(15, 23, 42, 0.7)";
            e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.4)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(15, 23, 42, 0.5)";
            e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.2)";
          }}
        >
          <h3
            style={{
              margin: "0 0 12px 0",
              fontSize: "15px",
              fontWeight: "700",
              color: "#3b82f6",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <UtensilsCrossed size={16} />
            Preferred Food
          </h3>
          {likedFood.length === 0 ? (
            <p style={{ margin: 0, fontSize: "13px", color: "#888" }}>
              No food options selected
            </p>
          ) : (
            <ul
              style={{
                margin: 0,
                paddingLeft: "18px",
                fontSize: "13px",
                lineHeight: "1.8",
              }}
            >
              {likedFood.map((f) => (
                <li key={f.id} style={{ marginBottom: "4px" }}>
                  <strong>{f.name}</strong>
                  <div style={{ color: "#888", fontSize: "12px" }}>
                    {f.type} · {f.priceLevel}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Activities Card */}
        <div
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(8px)",
            borderRadius: "14px",
            padding: "18px",
            marginBottom: "14px",
            border: "1px solid rgba(59, 130, 246, 0.2)",
            transition: "all 0.3s ease",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(15, 23, 42, 0.7)";
            e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.4)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(15, 23, 42, 0.5)";
            e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.2)";
          }}
        >
          <h3
            style={{
              margin: "0 0 12px 0",
              fontSize: "15px",
              fontWeight: "700",
              color: "#3b82f6",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Target size={16} />
            Preferred Activities
          </h3>
          {likedActivities.length === 0 ? (
            <p style={{ margin: 0, fontSize: "13px", color: "#888" }}>
              No activities selected
            </p>
          ) : (
            <ul
              style={{
                margin: 0,
                paddingLeft: "18px",
                fontSize: "13px",
                lineHeight: "1.8",
              }}
            >
              {likedActivities.map((a) => (
                <li key={a.id} style={{ marginBottom: "4px" }}>
                  <strong>{a.name}</strong>
                  <div style={{ color: "#888", fontSize: "12px" }}>
                    {a.type} · Energy: {a.energyLevel}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* CENTER PANEL - AI Chatbot */}
      <div
        style={{
          flex: "1",
          backgroundColor: "#16213e",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          <h2
            style={{
              margin: "0 0 8px 0",
              fontSize: "24px",
              fontWeight: "600",
            }}
          >
            <Bot size={24} style={{ marginRight: "8px", display: "inline" }} />
            AI Travel Assistant
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              color: "#b0b0b0",
            }}
          >
            Chat with AI to modify your itinerary or get recommendations
          </p>
        </div>

        {/* Messages Container */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#0f1b2b",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "16px",
            overflowY: "auto",
            border: "1px solid #1e3a5f",
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: "flex",
                justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  maxWidth: "70%",
                  backgroundColor:
                    msg.sender === "user" ? "#3282b8" : "#1e3a5f",
                  padding: "12px 16px",
                  borderRadius:
                    msg.sender === "user"
                      ? "16px 16px 4px 16px"
                      : "16px 16px 16px 4px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                }}
              >
                <div style={{ fontSize: "14px", lineHeight: "1.5" }}>
                  {msg.text}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#888",
                    marginTop: "6px",
                    textAlign: msg.sender === "user" ? "right" : "left",
                  }}
                >
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div
          style={{
            display: "flex",
            gap: "12px",
          }}
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Ask me anything about your trip..."
            style={{
              flex: 1,
              backgroundColor: "#0f1b2b",
              border: "1px solid #1e3a5f",
              borderRadius: "8px",
              padding: "12px 16px",
              color: "white",
              fontSize: "14px",
              outline: "none",
            }}
          />
          <button
            onClick={handleSendMessage}
            style={{
              backgroundColor: "#3282b8",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "12px 24px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#2a6a9a")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#3282b8")}
          >
            <Send size={16} style={{ marginRight: "6px" }} />
            Send
          </button>
        </div>
      </div>

      {/* RIGHT PANEL - Live Itinerary Updates & Daily Summary */}
      <div
        style={{
          flex: "0 0 320px",
          backgroundColor: "#16213e",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h2
          style={{
            margin: "0 0 8px 0",
            fontSize: "24px",
            fontWeight: "600",
          }}
        >
          <ClipboardList size={24} style={{ marginRight: "8px", display: "inline" }} />
          Itinerary
        </h2>
        <p
          style={{
            margin: "0 0 20px 0",
            fontSize: "13px",
            color: "#b0b0b0",
            lineHeight: "1.5",
          }}
        >
          {itinerary ? `${itinerary.days.length} days, ${itinerary.total_recommendations} activities` : "Loading..."}
        </p>

        {/* Updates Container */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#0f1b2b",
            borderRadius: "12px",
            padding: "16px",
            overflowY: "auto",
            border: "1px solid #1e3a5f",
            marginBottom: "16px",
          }}
        >
          {/* Status Updates */}
          <div style={{ marginBottom: "16px" }}>
            {itineraryUpdates.map((update) => (
              <div
                key={update.id}
                style={{
                  backgroundColor:
                    update.type === "info"
                      ? "#1e3a5f"
                      : update.type === "warning"
                      ? "#5a4a2d"
                      : "#3a2d2d",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "12px",
                  borderLeft:
                    update.type === "info"
                      ? "3px solid #3282b8"
                      : update.type === "warning"
                      ? "3px solid #f39c12"
                      : "3px solid #e74c3c",
                }}
              >
                <div style={{ fontSize: "13px", lineHeight: "1.5" }}>
                  {update.text}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#888",
                    marginTop: "6px",
                  }}
                >
                  {update.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Daily Summary */}
          {itinerary && itinerary.days.length > 0 && (
            <div>
              <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#3282b8" }}>
                📅 Daily Breakdown
              </h4>
              {itinerary.days.map((day, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: "#1e3a5f",
                    padding: "10px",
                    borderRadius: "6px",
                    marginBottom: "8px",
                    fontSize: "12px",
                  }}
                >
                  <div style={{ color: "#3282b8", fontWeight: "600", marginBottom: "4px" }}>
                    {day.date}
                  </div>
                  <div style={{ color: "#888" }}>
                    {day.items.length} activities
                  </div>
                  {day.items.slice(0, 2).map((item, itemIdx) => (
                    <div key={itemIdx} style={{ color: "#aaa", fontSize: "11px", marginTop: "4px" }}>
                      • {item.recommendation.name}
                    </div>
                  ))}
                  {day.items.length > 2 && (
                    <div style={{ color: "#888", fontSize: "11px", marginTop: "4px" }}>
                      +{day.items.length - 2} more...
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <button
            style={{
              backgroundColor: "#27ae60",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "12px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#229954")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#27ae60")}
          >
            <Check size={16} style={{ marginRight: "6px" }} />
            Confirm Itinerary
          </button>
          <button
            style={{
              backgroundColor: "transparent",
              color: "#3282b8",
              border: "1px solid #3282b8",
              borderRadius: "8px",
              padding: "12px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#3282b8";
              e.target.style.color = "white";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = "#3282b8";
            }}
          >
            <Download size={16} style={{ marginRight: "6px" }} />
            Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}