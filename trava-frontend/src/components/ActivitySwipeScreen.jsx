import { useState } from "react";

const ACTIVITY_OPTIONS = [
  {
    id: "act-1",
    name: "City Walking Tour",
    type: "sightseeing",
    energyLevel: "low",
    description: "Guided walking tour covering major landmarks and history.",
  },
  {
    id: "act-2",
    name: "Food & Night Market",
    type: "food",
    energyLevel: "medium",
    description: "Evening visit to a busy night market with street food.",
  },
  {
    id: "act-3",
    name: "Museum & Art Day",
    type: "culture",
    energyLevel: "low",
    description: "Visit museums, galleries, and cultural sites.",
  },
  {
    id: "act-4",
    name: "Hiking / Nature Trail",
    type: "outdoor",
    energyLevel: "high",
    description: "Half-day or full-day hike with scenic views.",
  },
  {
    id: "act-5",
    name: "Boat or Cruise Tour",
    type: "relax",
    energyLevel: "medium",
    description: "Relaxed boat ride or short cruise to see the city from the water.",
  },
];

export default function ActivitySwipeScreen({
  tripDetails,
  onBack,
  onComplete,
}) {
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState([]);
  const [disliked, setDisliked] = useState([]);
  const [finished, setFinished] = useState(false);

  const items = ACTIVITY_OPTIONS;
  const current = items[index];

  const handleSwipe = (direction) => {
    if (!current) return;

    if (direction === "like") {
      setLiked((prev) => [...prev, current]);
    } else {
      setDisliked((prev) => [...prev, current]);
    }

    const nextIndex = index + 1;
    if (nextIndex >= items.length) {
      setFinished(true);
      onComplete(direction === "like" ? [...liked, current] : liked);
    } else {
      setIndex(nextIndex);
    }
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
        <h2 style={{ marginBottom: "8px" }}>Activity Preferences</h2>
        <p
          style={{
            marginTop: 0,
            marginBottom: "20px",
            fontSize: "14px",
            color: "#d0d0d0",
          }}
        >
          Swipe right on activities you&apos;d enjoy doing on this trip.
        </p>

        {!finished && current && (
          <div
            style={{
              backgroundColor: "#0f1b2b",
              borderRadius: "12px",
              padding: "20px 24px",
              marginBottom: "20px",
            }}
          >
            <h3 style={{ margin: "0 0 8px 0" }}>{current.name}</h3>
            <p
              style={{
                margin: "0 0 8px 0",
                fontSize: "14px",
                color: "#d0d0d0",
              }}
            >
              {current.description}
            </p>
            <p style={{ margin: 0, fontSize: "14px" }}>
              Type:{" "}
              <span style={{ textTransform: "capitalize" }}>{current.type}</span>{" "}
              · Energy:{" "}
              <span style={{ textTransform: "capitalize" }}>
                {current.energyLevel}
              </span>
            </p>
            <p style={{ margin: "6px 0 0 0", fontSize: "12px", color: "#aaaaaa" }}>
              Option {index + 1} of {items.length}
            </p>
          </div>
        )}

        {finished && (
          <div
            style={{
              backgroundColor: "#0f1b2b",
              borderRadius: "12px",
              padding: "20px 24px",
              marginBottom: "20px",
              fontSize: "14px",
            }}
          >
            <p style={{ marginBottom: "10px" }}>
              Awesome! We&apos;ve captured your activity preferences.
            </p>
            <p style={{ margin: 0 }}>
              Next we&apos;ll show a summary and later build the itinerary.
            </p>
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "10px",
            marginBottom: "16px",
          }}
        >
          <button
            onClick={() => handleSwipe("dislike")}
            disabled={finished}
            style={{
              flex: 1,
              backgroundColor: finished ? "#555" : "#c0392b",
              color: "white",
              border: "none",
              padding: "10px 0",
              borderRadius: "6px",
              cursor: finished ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            👎 Not for me
          </button>
          <button
            onClick={() => handleSwipe("like")}
            disabled={finished}
            style={{
              flex: 1,
              backgroundColor: finished ? "#555" : "#27ae60",
              color: "white",
              border: "none",
              padding: "10px 0",
              borderRadius: "6px",
              cursor: finished ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            👍 I like this
          </button>
        </div>

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
            onClick={() => onComplete(liked)}
            disabled={!finished}
            style={{
              flex: 1,
              backgroundColor: finished ? "#3282b8" : "#555",
              color: "white",
              border: "none",
              padding: "10px 0",
              borderRadius: "6px",
              cursor: finished ? "pointer" : "not-allowed",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}