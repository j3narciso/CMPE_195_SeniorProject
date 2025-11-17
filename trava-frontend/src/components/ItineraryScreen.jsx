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

import { useState } from "react";
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
} from "lucide-react";

export default function ItineraryScreen({
  tripDetails,
  likedHotels,
  likedFood,
  likedActivities,
  onBack,
}) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hello! I'm your AI travel assistant. I can help you modify your itinerary, answer questions, or provide recommendations. How can I assist you?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [itineraryUpdates, setItineraryUpdates] = useState([
    {
      id: 1,
      type: "info",
      text: "Itinerary initialized with your preferences",
      timestamp: new Date(),
    },
  ]);

  if (!tripDetails) {
    return <div>Missing trip details.</div>;
  }

  const { destination, startDate, endDate, guests } = tripDetails;

  const formatDate = (d) =>
    d instanceof Date ? d.toLocaleDateString() : String(d);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      sender: "user",
      text: inputMessage,
      timestamp: new Date(),
    };
    setMessages([...messages, userMessage]);

    // Simulate bot response (will be replaced with actual API call)
    setTimeout(() => {
      const botMessage = {
        id: messages.length + 2,
        sender: "bot",
        text: "I understand you want to modify your itinerary. This feature will be connected to the backend AI soon!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);

      // Add update to itinerary panel
      const update = {
        id: itineraryUpdates.length + 1,
        type: "update",
        text: `Processing request: "${inputMessage}"`,
        timestamp: new Date(),
      };
      setItineraryUpdates((prev) => [...prev, update]);
    }, 1000);

    setInputMessage("");
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        background:
          "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f4c75 100%)",
        color: "white",
        fontFamily: "Helvetica, Arial, sans-serif",
        padding: "24px",
        gap: "20px",
        boxSizing: "border-box",
      }}
    >
      {/* LEFT PANEL - Travel Summary */}
      <div
        style={{
          flex: "0 0 320px",
          backgroundColor: "#16213e",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          padding: "24px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ marginBottom: "16px" }}>
          <button
            onClick={onBack}
            style={{
              backgroundColor: "transparent",
              color: "#3282b8",
              border: "1px solid #3282b8",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "500",
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
            <ArrowLeft size={16} style={{ marginRight: "6px" }} />
            Back
          </button>
        </div>

        <h2
          style={{
            margin: "0 0 8px 0",
            fontSize: "24px",
            fontWeight: "600",
          }}
        >
          Travel Summary
        </h2>
        <p
          style={{
            margin: "0 0 20px 0",
            fontSize: "13px",
            color: "#b0b0b0",
            lineHeight: "1.5",
          }}
        >
          Your trip preferences and selections
        </p>

        {/* Trip Details Card */}
        <div
          style={{
            backgroundColor: "#0f1b2b",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "12px",
            border: "1px solid #1e3a5f",
          }}
        >
          <h3
            style={{
              margin: "0 0 12px 0",
              fontSize: "16px",
              fontWeight: "600",
              color: "#3282b8",
            }}
          >
            <MapPin size={16} style={{ marginRight: "8px", display: "inline" }} />
            Trip Details
          </h3>
          <div style={{ fontSize: "13px", lineHeight: "1.8" }}>
            <div style={{ marginBottom: "6px" }}>
              <span style={{ color: "#888" }}>Destination:</span>{" "}
              <strong style={{ color: "#fff" }}>{destination}</strong>
            </div>
            <div style={{ marginBottom: "6px" }}>
              <span style={{ color: "#888" }}>Dates:</span>{" "}
              <strong style={{ color: "#fff" }}>
                {formatDate(startDate)} → {formatDate(endDate)}
              </strong>
            </div>
            <div>
              <span style={{ color: "#888" }}>Guests:</span>{" "}
              <strong style={{ color: "#fff" }}>{guests}</strong>
            </div>
          </div>
        </div>

        {/* Hotels Card */}
        <div
          style={{
            backgroundColor: "#0f1b2b",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "12px",
            border: "1px solid #1e3a5f",
          }}
        >
          <h3
            style={{
              margin: "0 0 12px 0",
              fontSize: "16px",
              fontWeight: "600",
              color: "#3282b8",
            }}
          >
            <Hotel size={16} style={{ marginRight: "8px", display: "inline" }} />
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
            backgroundColor: "#0f1b2b",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "12px",
            border: "1px solid #1e3a5f",
          }}
        >
          <h3
            style={{
              margin: "0 0 12px 0",
              fontSize: "16px",
              fontWeight: "600",
              color: "#3282b8",
            }}
          >
            <UtensilsCrossed size={16} style={{ marginRight: "8px", display: "inline" }} />
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
            backgroundColor: "#0f1b2b",
            borderRadius: "12px",
            padding: "16px",
            border: "1px solid #1e3a5f",
          }}
        >
          <h3
            style={{
              margin: "0 0 12px 0",
              fontSize: "16px",
              fontWeight: "600",
              color: "#3282b8",
            }}
          >
            <Target size={16} style={{ marginRight: "8px", display: "inline" }} />
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

      {/* RIGHT PANEL - Live Itinerary Updates */}
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
          Live Updates
        </h2>
        <p
          style={{
            margin: "0 0 20px 0",
            fontSize: "13px",
            color: "#b0b0b0",
            lineHeight: "1.5",
          }}
        >
          Real-time changes to your itinerary
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
          }}
        >
          {itineraryUpdates.map((update) => (
            <div
              key={update.id}
              style={{
                backgroundColor:
                  update.type === "info" ? "#1e3a5f" : "#2d5a3f",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "12px",
                borderLeft:
                  update.type === "info"
                    ? "3px solid #3282b8"
                    : "3px solid #27ae60",
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

        {/* Action Buttons */}
        <div
          style={{
            marginTop: "16px",
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