import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../App.css";

const COUNTRY_LIST = [
    "Argentina",
    "Australia",
    "Brazil",
    "Canada",
    "France",
    "Germany",
    "Greece",
    "Italy",
    "Japan",
    "Mexico",
    "Portugal",
    "Spain",
    "Thailand",
    "United Arab Emirates",
    "United Kingdom",
    "United States",
    "Uruguay",
  ];

  export default function DestinationScreen({ onBack, onContinue }) {
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [guests, setGuests] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const isValidDestination = COUNTRY_LIST.some(
    (c) => c.toLowerCase() === destination.trim().toLowerCase()
  );

  const filteredCountries =
    destination.trim().length === 0
      ? []
      : COUNTRY_LIST.filter((c) =>
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
        background:
          "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f4c75 100%)",
        color: "white",
        fontFamily: "Helvetica, Arial, sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "#16213e",
          padding: "32px 40px",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          minWidth: "420px",
        }}
      >
        {/* 🏷 Title */}
        <h2 style={{ marginBottom: "20px" }}>Trip Details</h2>

        {/* 📍 Destination with suggestions */}
        <div
          style={{
            marginBottom: "10px",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "14px",
              marginBottom: "4px",
            }}
          >
            <span>Destination</span>
            {destination && !isValidDestination && (
              <span style={{ color: "#ffb3b3", fontSize: "12px" }}>
                Please select a valid country
              </span>
            )}
          </div>

          <input
            type="text"
            placeholder="e.g., Tokyo, Japan"
            value={destination}
            onChange={(e) => {
              setDestination(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              // small delay so clicks on suggestions still register
              setTimeout(() => setShowSuggestions(false), 150);
            }}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: "6px",
              border: "1px solid #0f4c75",
              backgroundColor: "white",
              color: "#333",
            }}
          />

          {showSuggestions && filteredCountries.length > 0 && (
            <ul
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                marginTop: "4px",
                listStyle: "none",
                padding: 0,
                backgroundColor: "white",
                color: "#333",
                borderRadius: "6px",
                boxShadow: "0 6px 16px rgba(0,0,0,0.35)",
                maxHeight: "180px",
                overflowY: "auto",
                zIndex: 10,
              }}
            >
              {filteredCountries.map((country) => (
                <li
                  key={country}
                  onMouseDown={() => {
                    // onMouseDown fires before onBlur → lets us select safely
                    setDestination(country);
                    setShowSuggestions(false);
                  }}
                  style={{
                    padding: "8px 10px",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  {country}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 📅 Date range */}
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
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                placeholderText="End date"
                className="date-input"
                popperPlacement="bottom"
              />
            </div>
          </div>
        </div>

        {/* 👥 Guests */}
        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              fontSize: "14px",
              display: "block",
              marginBottom: "6px",
            }}
          >
            Number of Guests
            <input
              type="number"
              min="1"
              max="20"
              value={guests}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (Number.isNaN(val)) return;
                setGuests(val);
              }}
              style={{
                width: "100%",
                marginTop: "4px",
                padding: "8px 10px",
                borderRadius: "6px",
                border: "1px solid #0f4c75",
                backgroundColor: "white",
                color: "#333",
              }}
            />
          </label>
        </div>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "10px",
          }}
        >
          <button
            onClick={onBack}
            style={{
              flex: 1,
              backgroundColor: "#0f4c75",
              color: "white",
              border: "none",
              padding: "10px 0",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            ⬅ Back
          </button>
          <button
            disabled={!canStart}
            onClick={handleStart}
            style={{
              flex: 1,
              backgroundColor: canStart ? "#3282b8" : "#555",
              color: "white",
              border: "none",
              padding: "10px 0",
              borderRadius: "6px",
              cursor: canStart ? "pointer" : "not-allowed",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Start Planning
          </button>
        </div>
      </div>
    </div>
  );
}