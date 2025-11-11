import { useState, useMemo } from "react";

const HOTEL_OPTIONS_BY_CITY = {
  "Tokyo, Japan": [
    {
      id: "tokyo-1",
      name: "Hotel Sakura Shinjuku",
      pricePerNight: 180,
      priceLevel: "mid",
      rating: 4.6,
      description: "Modern hotel near Shinjuku Station, great for first-time visitors.",
    },
    {
      id: "tokyo-2",
      name: "Shibuya Budget Inn",
      pricePerNight: 75,
      priceLevel: "budget",
      rating: 4.1,
      description: "Simple, clean rooms a short walk from Shibuya Crossing.",
    },
    {
      id: "tokyo-3",
      name: "Tokyo Bay Onsen Resort",
      pricePerNight: 260,
      priceLevel: "luxury",
      rating: 4.8,
      description: "Relaxing onsen resort with ocean views and breakfast included.",
    },
    {
      id: "tokyo-4",
      name: "Capsule Stay Akihabara",
      pricePerNight: 40,
      priceLevel: "budget",
      rating: 4.0,
      description: "Futuristic capsule hotel in the heart of Akihabara.",
    },
    {
      id: "tokyo-5",
      name: "Ginza Boutique Hotel",
      pricePerNight: 210,
      priceLevel: "mid",
      rating: 4.7,
      description: "Stylish boutique stay surrounded by upscale shopping.",
    },
  ],
  // Fallback options for any other city
  default: [
    {
      id: "hotel-1",
      name: "Central City Hotel",
      pricePerNight: 150,
      priceLevel: "mid",
      rating: 4.5,
      description: "Comfortable stay close to major attractions.",
    },
    {
      id: "hotel-2",
      name: "Budget Backpacker Hostel",
      pricePerNight: 45,
      priceLevel: "budget",
      rating: 4.0,
      description: "Great for solo travelers and students.",
    },
    {
      id: "hotel-3",
      name: "Riverside Resort & Spa",
      pricePerNight: 230,
      priceLevel: "luxury",
      rating: 4.7,
      description: "Resort-style property with pool and spa.",
    },
    {
      id: "hotel-4",
      name: "Old Town Guesthouse",
      pricePerNight: 90,
      priceLevel: "mid",
      rating: 4.3,
      description: "Cozy guesthouse with local charm.",
    },
    {
      id: "hotel-5",
      name: "Airport Express Hotel",
      pricePerNight: 110,
      priceLevel: "mid",
      rating: 4.1,
      description: "Convenient for late arrivals and early flights.",
    },
  ],
};

export default function HotelSwipeScreen({ tripDetails, onBack, onComplete }) {
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState([]);
  const [disliked, setDisliked] = useState([]);
  const [finished, setFinished] = useState(false);

  const items = useMemo(() => {
    if (!tripDetails) return HOTEL_OPTIONS_BY_CITY.default;
    return (
      HOTEL_OPTIONS_BY_CITY[tripDetails.destination] ||
      HOTEL_OPTIONS_BY_CITY.default
    );
  }, [tripDetails]);

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
        <p>No hotel options available.</p>
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
              Price per night:{" "}
              <strong>${current.pricePerNight.toFixed(0)}</strong> ·{" "}
              <span style={{ textTransform: "capitalize" }}>
                {current.priceLevel}
              </span>{" "}
              · ⭐ {current.rating}
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