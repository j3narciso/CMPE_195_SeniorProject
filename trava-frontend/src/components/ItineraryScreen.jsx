export default function ItineraryScreen({
    tripDetails,
    likedHotels,
    likedFood,
    likedActivities,
    onBack,
  }) {
    if (!tripDetails) {
      return <div>Missing trip details.</div>;
    }
  
    const { destination, startDate, endDate, guests } = tripDetails;
  
    const formatDate = (d) =>
      d instanceof Date ? d.toLocaleDateString() : String(d);
  
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
            minWidth: "480px",
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <h2 style={{ marginBottom: "6px" }}>Trip Summary</h2>
          <p
            style={{
              marginTop: 0,
              marginBottom: "20px",
              fontSize: "14px",
              color: "#d0d0d0",
            }}
          >
            Here&apos;s what we know about your trip so far. Later, this screen can
            show the full generated itinerary.
          </p>
  
          <div
            style={{
              backgroundColor: "#0f1b2b",
              borderRadius: "12px",
              padding: "16px 20px",
              marginBottom: "16px",
            }}
          >
            <h3 style={{ margin: "0 0 8px 0" }}>Trip Details</h3>
            <p style={{ margin: "0 0 4px 0", fontSize: "14px" }}>
              Destination: <strong>{destination}</strong>
            </p>
            <p style={{ margin: "0 0 4px 0", fontSize: "14px" }}>
              Dates:{" "}
              <strong>
                {formatDate(startDate)} → {formatDate(endDate)}
              </strong>
            </p>
            <p style={{ margin: 0, fontSize: "14px" }}>
              Guests: <strong>{guests}</strong>
            </p>
          </div>
  
          <div
            style={{
              backgroundColor: "#0f1b2b",
              borderRadius: "12px",
              padding: "16px 20px",
              marginBottom: "16px",
            }}
          >
            <h3 style={{ margin: "0 0 8px 0" }}>Preferred Hotels</h3>
            {likedHotels.length === 0 ? (
              <p style={{ margin: 0, fontSize: "14px", color: "#d0d0d0" }}>
                You didn&apos;t like any hotels in this round.
              </p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "14px" }}>
                {likedHotels.map((h) => (
                  <li key={h.id}>
                    {h.name} — ${h.pricePerNight.toFixed(0)} ·{" "}
                    {h.priceLevel}, ⭐ {h.rating}
                  </li>
                ))}
              </ul>
            )}
          </div>
  
          <div
            style={{
              backgroundColor: "#0f1b2b",
              borderRadius: "12px",
              padding: "16px 20px",
              marginBottom: "16px",
            }}
          >
            <h3 style={{ margin: "0 0 8px 0" }}>Preferred Food</h3>
            {likedFood.length === 0 ? (
              <p style={{ margin: 0, fontSize: "14px", color: "#d0d0d0" }}>
                You didn&apos;t like any food options in this round.
              </p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "14px" }}>
                {likedFood.map((f) => (
                  <li key={f.id}>
                    {f.name} — {f.type}, {f.priceLevel}
                  </li>
                ))}
              </ul>
            )}
          </div>
  
          <div
            style={{
              backgroundColor: "#0f1b2b",
              borderRadius: "12px",
              padding: "16px 20px",
              marginBottom: "16px",
            }}
          >
            <h3 style={{ margin: "0 0 8px 0" }}>Preferred Activities</h3>
            {likedActivities.length === 0 ? (
              <p style={{ margin: 0, fontSize: "14px", color: "#d0d0d0" }}>
                You didn&apos;t like any activities in this round.
              </p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "14px" }}>
                {likedActivities.map((a) => (
                  <li key={a.id}>
                    {a.name} — {a.type}, energy: {a.energyLevel}
                  </li>
                ))}
              </ul>
            )}
          </div>
  
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              marginTop: "10px",
            }}
          >
            <button
              onClick={onBack}
              style={{
                backgroundColor: "#0f4c75",
                color: "white",
                border: "none",
                padding: "10px 18px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              ⬅ Back to Activities
            </button>
          </div>
        </div>
      </div>
    );
  }