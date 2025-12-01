import { useState, useEffect } from "react";

const API_BASE_URL = `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/v1`;

export default function HotelSwipeScreen({ tripDetails, onBack, onComplete }) {
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState([]);
  const [disliked, setDisliked] = useState([]);
  const [finished, setFinished] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real accommodation recommendations from backend
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        // Fetch hotels as proxy for accommodations
        const response = await fetch(
          `${API_BASE_URL}/recommendations?destination=${tripDetails.destination}&category=stay&limit=10`
        );
        
        if (!response.ok) throw new Error("Failed to fetch accommodations");
        
        const data = await response.json();
        
        // Transform backend recommendations to match hotel UI format
        const transformedItems = data.recommendations.map((rec) => ({
          id: rec.id,
          name: rec.name,
          pricePerNight: (rec.price_range || 2) * 50, // Estimate price per night
          priceLevel: rec.price_range <= 1 ? "budget" : rec.price_range <= 2 ? "mid" : "luxury",
          rating: rec.rating,
          description: rec.description,
          price_range: rec.price_range,
          imageUrl: rec.photo_url || rec.image_url,
        }));
        
        setItems(transformedItems);
        setError(null);
      } catch (err) {
        console.error("Error fetching accommodations:", err);
        setError(err.message);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    if (tripDetails?.destination) {
      fetchHotels();
    }
  }, [tripDetails?.destination]);

  const current = items[index];

  const handleSwipe = (direction) => {
    if (!current) return;

    if (direction === "like") {
      const newLiked = [...liked, current];
      setLiked(newLiked);
    } else {
      const newDisliked = [...disliked, current];
      setDisliked(newDisliked);
    }

    const nextIndex = index + 1;
    if (nextIndex >= items.length) {
      setFinished(true);
      onComplete(direction === "like" ? [...liked, current] : liked);
    } else {
      setIndex(nextIndex);
    }
  };

  if (!loading && (!items || items.length === 0)) {
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
        <p>{error ? `Error: ${error}` : "No accommodations available."}</p>
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
        <h2 style={{ marginBottom: "8px" }}>Choose Your Stay</h2>
        <p
          style={{
            marginTop: 0,
            marginBottom: "20px",
            fontSize: "14px",
            color: "#d0d0d0",
          }}
        >
          Swipe right if you like a hotel, left if you don&apos;t. We&apos;ll use
          your favorites to shape your itinerary.
        </p>

        {loading && (
          <div
            style={{
              backgroundColor: "#0f1b2b",
              borderRadius: "12px",
              padding: "20px 24px",
              marginBottom: "20px",
              textAlign: "center",
              fontSize: "14px",
              color: "#d0d0d0",
            }}
          >
            Loading accommodations in {tripDetails?.destination}...
          </div>
        )}

        {!finished && !loading && current && (
          <div
            style={{
              backgroundColor: "#0f1b2b",
              borderRadius: "12px",
              padding: "20px 24px",
              marginBottom: "20px",
            }}
          >
            {current.imageUrl && (
              <div
                style={{
                  marginBottom: "12px",
                  overflow: "hidden",
                  borderRadius: "10px",
                }}
              >
                <img
                  src={current.imageUrl}
                  alt={current.name}
                  style={{
                    width: "100%",
                    maxHeight: "220px",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>
            )}
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
              Estimated price per night:{" "}
              <strong>${current.pricePerNight.toFixed(0)}</strong> ·{" "}
              <span style={{ textTransform: "capitalize" }}>
                {current.priceLevel}
              </span>{" "}
              · ⭐ {current.rating?.toFixed(1)}
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
              Thanks! We&apos;ve saved your preferred hotels.
            </p>
            <p style={{ margin: 0 }}>
              (Next: we&apos;ll use these to build your itinerary.)
            </p>
          </div>
        )}

        {/* Swipe buttons */}
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
            disabled={finished || loading || items.length === 0}
            style={{
              flex: 1,
              backgroundColor: finished || loading || items.length === 0 ? "#555" : "#c0392b",
              color: "white",
              border: "none",
              padding: "10px 0",
              borderRadius: "6px",
              cursor: finished || loading || items.length === 0 ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            👎 Not for me
          </button>
          <button
            onClick={() => handleSwipe("like")}
            disabled={finished || loading || items.length === 0}
            style={{
              flex: 1,
              backgroundColor: finished || loading || items.length === 0 ? "#555" : "#27ae60",
              color: "white",
              border: "none",
              padding: "10px 0",
              borderRadius: "6px",
              cursor: finished || loading || items.length === 0 ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            👍 I like this
          </button>
        </div>

        {/* Navigation buttons */}
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