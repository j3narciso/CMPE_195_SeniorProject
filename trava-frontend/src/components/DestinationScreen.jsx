import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../App.css";
import { MapPin, Calendar, Users, ArrowRight, Sparkles } from "lucide-react";

const MODERN_STYLES = `
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(20px); }
  }
`;

// Supported cities from backend
const CITY_LIST = [
    "Rome",
    "Paris",
    "Tokyo",
    "New York",
    "London",
    "Barcelona",
    "Amsterdam",
    "Berlin",
    "Prague",
    "Vienna",
    "Budapest",
    "Lisbon",
  ];

  export default function DestinationScreen({ onBack, onContinue }) {
  const MODERN_STYLES = `
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(20px); }
    }
  `;
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [guests, setGuests] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const isValidDestination = CITY_LIST.some(
    (c) => c.toLowerCase() === destination.trim().toLowerCase()
  );

  const filteredCities =
    destination.trim().length === 0
      ? []
      : CITY_LIST.filter((c) =>
          c.toLowerCase().startsWith(destination.trim().toLowerCase())
        ).slice(0, 5);

  const hasDates = startDate && endDate && startDate <= endDate;
  const canStart = isValidDestination && hasDates && guests > 0;

  const handleStart = () => {
    if (!canStart) return;
  
    onContinue({
      destination,
      startDate,
      endDate,
      guests,
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 25%, #1e40af 50%, #0c4a6e 75%, #082f49 100%)",
        color: "white",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Animated background elements */}
      <div
        style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)",
          borderRadius: "50%",
          top: "-100px",
          left: "-100px",
          animation: "float 6s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "300px",
          height: "300px",
          background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
          borderRadius: "50%",
          bottom: "-50px",
          right: "-50px",
          animation: "float 8s ease-in-out infinite reverse",
        }}
      />
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(20px); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        style={{
          backgroundColor: "rgba(30, 41, 59, 0.7)",
          backdropFilter: "blur(10px)",
          padding: "48px 56px",
          borderRadius: "24px",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          minWidth: "480px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          animation: "slideIn 0.6s ease-out",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Header with icon */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "32px", gap: "12px" }}>
          <div
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
              padding: "12px",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={24} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "700" }}>Plan Your Journey</h1>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#cbd5e1" }}>Discover your perfect trip</p>
          </div>
        </div>

        {/* Destination with suggestions */}
        <div
          style={{
            marginBottom: "24px",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "10px",
            }}
          >
            <MapPin size={18} style={{ color: "#3b82f6" }} />
            <label style={{ fontSize: "14px", fontWeight: "600", color: "#e2e8f0" }}>Destination</label>
            {destination && !isValidDestination && (
              <span style={{ color: "#fca5a5", fontSize: "12px", marginLeft: "auto" }}>
                ⚠️ Invalid city
              </span>
            )}
          </div>

          <input
            type="text"
            placeholder="Search cities..."
            value={destination}
            onChange={(e) => {
              setDestination(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              setTimeout(() => setShowSuggestions(false), 150);
            }}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "12px",
              border: "2px solid rgba(59, 130, 246, 0.2)",
              backgroundColor: "rgba(15, 23, 42, 0.5)",
              color: "white",
              fontSize: "15px",
              transition: "all 0.3s ease",
              outline: "none",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(59, 130, 246, 0.6)";
              e.target.style.backgroundColor = "rgba(15, 23, 42, 0.8)";
              e.target.style.boxShadow = "0 0 20px rgba(59, 130, 246, 0.2)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(59, 130, 246, 0.2)";
              e.target.style.backgroundColor = "rgba(15, 23, 42, 0.5)";
              e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
            }}
          />

          {showSuggestions && filteredCities.length > 0 && (
            <ul
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                marginTop: "8px",
                listStyle: "none",
                padding: "8px 0",
                backgroundColor: "rgba(30, 41, 59, 0.95)",
                backdropFilter: "blur(10px)",
                color: "#e2e8f0",
                borderRadius: "12px",
                border: "1px solid rgba(59, 130, 246, 0.2)",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
                maxHeight: "240px",
                overflowY: "auto",
                zIndex: 10,
                animation: "slideIn 0.2s ease-out",
              }}
            >
              {filteredCities.map((city, idx) => (
                <li
                  key={city}
                  onMouseDown={() => {
                    setDestination(city);
                    setShowSuggestions(false);
                  }}
                  style={{
                    padding: "12px 16px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    borderLeft: "3px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.2)";
                    e.currentTarget.style.borderLeftColor = "#3b82f6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.borderLeftColor = "transparent";
                  }}
                >
                  <MapPin size={14} style={{ display: "inline", marginRight: "8px", color: "#3b82f6" }} />
                  {city}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Date range */}
        <div style={{ marginTop: "18px", marginBottom: "18px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "14px",
              marginBottom: "6px",
            }}
          >
            <span>Travel Dates</span>
            {startDate &&
              endDate &&
              startDate > endDate && (
                <span style={{ color: "#ffb3b3", fontSize: "12px" }}>
                  End date must be after start date
                </span>
              )}
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "12px" }}>Start</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText="Start date"
                className="date-input"
                popperPlacement="bottom"
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "12px" }}>End</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                dateFormat="MMM dd, yyyy"
                minDate={startDate || new Date()}
                placeholderText="Select end date"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "2px solid rgba(59, 130, 246, 0.2)",
                  backgroundColor: "rgba(15, 23, 42, 0.5)",
                  color: "white",
                  fontSize: "15px",
                  transition: "all 0.3s ease",
                  outline: "none",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Guests */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <Users size={18} style={{ color: "#3b82f6" }} />
            <label style={{ fontSize: "14px", fontWeight: "600", color: "#e2e8f0" }}>
              Number of Guests
            </label>
          </div>
          <input
            type="number"
            min="1"
            max="20"
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "12px",
              border: "2px solid rgba(59, 130, 246, 0.2)",
              backgroundColor: "rgba(15, 23, 42, 0.5)",
              color: "white",
              fontSize: "15px",
              transition: "all 0.3s ease",
              outline: "none",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(59, 130, 246, 0.6)";
              e.target.style.backgroundColor = "rgba(15, 23, 42, 0.8)";
              e.target.style.boxShadow = "0 0 20px rgba(59, 130, 246, 0.2)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(59, 130, 246, 0.2)";
              e.target.style.backgroundColor = "rgba(15, 23, 42, 0.5)";
              e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
            }}
          />
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          disabled={!canStart}
          style={{
            width: "100%",
            padding: "14px 24px",
            marginTop: "8px",
            background: canStart
              ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
              : "linear-gradient(135deg, #64748b 0%, #475569 100%)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: canStart ? "pointer" : "not-allowed",
            fontSize: "16px",
            fontWeight: "700",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            boxShadow: canStart ? "0 10px 25px rgba(59, 130, 246, 0.3)" : "none",
          }}
          onMouseOver={(e) => {
            if (canStart) {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 15px 35px rgba(59, 130, 246, 0.4)";
            }
          }}
          onMouseOut={(e) => {
            if (canStart) {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 10px 25px rgba(59, 130, 246, 0.3)";
            }
          }}
        >
          Start Planning
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}