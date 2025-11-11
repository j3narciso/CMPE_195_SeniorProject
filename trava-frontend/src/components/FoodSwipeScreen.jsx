import { useState } from "react";

const FOOD_OPTIONS = [
  {
    id: "food-1",
    name: "Street Tacos",
    type: "street-food",
    priceLevel: "budget",
    description: "Casual tacos from local street vendors, perfect for quick bites.",
  },
  {
    id: "food-2",
    name: "Fine Dining Tasting Menu",
    type: "fine-dining",
    priceLevel: "luxury",
    description: "Multi-course chef tasting menu with wine pairing.",
  },
  {
    id: "food-3",
    name: "Local Family Restaurant",
    type: "casual",
    priceLevel: "mid",
    description: "Home-style dishes in a relaxed setting, popular with locals.",
  },
  {
    id: "food-4",
    name: "Vegan Cafe",
    type: "vegan",
    priceLevel: "mid",
    description: "Plant-based menu with coffee and light meals.",
  },
  {
    id: "food-5",
    name: "Food Market Tour",
    type: "experience",
    priceLevel: "mid",
    description: "Guided visit to a local market with tastings.",
  },
];

export default function FoodSwipeScreen({ tripDetails, onBack, onComplete }) {
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState([]);
  const [disliked, setDisliked] = useState([]);
  const [finished, setFinished] = useState(false);

  const items = FOOD_OPTIONS;
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
        <h2 style={{ marginBottom: "8px" }}>Food & Dining Preferences</h2>
        <p
          style={{
            marginTop: 0,
            marginBottom: "20px",
            fontSize: "14px",
            color: "#d0d0d0",
          }}
        >
          Swipe right on food options you&apos;d like to try during your trip.
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
              · Price:{" "}
              <span style={{ textTransform: "capitalize" }}>
                {current.priceLevel}
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
              Thanks! We&apos;ve saved your favorite food styles.
            </p>
            <p style={{ margin: 0 }}>
              Next we&apos;ll ask about activities you&apos;re interested in.
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