import { useState, useEffect } from "react";
import api from "../services/api";

export default function FoodSwipeScreen({ tripDetails, onBack, onComplete }) {
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState([]);
  const [disliked, setDisliked] = useState([]);
  const [finished, setFinished] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch restaurants from API when component mounts
  useEffect(() => {
    async function fetchRestaurants() {
      if (!tripDetails?.destination) {
        setError("No destination provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const restaurants = await api.getRestaurants(tripDetails.destination, { limit: 10 });
        setItems(restaurants);
      } catch (err) {
        console.error("Failed to fetch restaurants:", err);
        setError(err.message || "Failed to load restaurants");
      } finally {
        setLoading(false);
      }
    }

    fetchRestaurants();
  }, [tripDetails]);

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

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
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
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🍽️</div>
          <p style={{ fontSize: "18px", marginBottom: "8px" }}>Loading restaurants...</p>
          <p style={{ fontSize: "14px", color: "#d0d0d0" }}>Finding the best dining options in {tripDetails?.destination}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        style={{
          display: "flex",
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
        <div style={{ textAlign: "center", maxWidth: "400px", padding: "20px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
          <p style={{ fontSize: "18px", marginBottom: "8px", color: "#ffb3b3" }}>Failed to load restaurants</p>
          <p style={{ fontSize: "14px", color: "#d0d0d0", marginBottom: "20px" }}>{error}</p>
          <button
            onClick={onBack}
            style={{
              backgroundColor: "#3282b8",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            ⬅ Go Back
          </button>
        </div>
      </div>
    );
  }

  // No results
  if (!items || items.length === 0) {
    return (
      <div
        style={{
          display: "flex",
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
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "18px" }}>No restaurant options available.</p>
          <button
            onClick={onBack}
            style={{
              marginTop: "20px",
              backgroundColor: "#3282b8",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            ⬅ Go Back
          </button>
        </div>
      </div>
    );
  }

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