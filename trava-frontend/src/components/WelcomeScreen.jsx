export default function WelcomeScreen({ onContinue }) {
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
        <h1 style={{ fontSize: "40px", marginBottom: "8px" }}>✈️ TravelGen</h1>
        <h3 style={{ fontWeight: "normal", marginBottom: "30px" }}>
          AI-Powered Itinerary Planner
        </h3>
        <button
          style={{
            backgroundColor: "#3282b8",
            color: "white",
            border: "none",
            padding: "12px 28px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
          onClick={onContinue}
        >
          Continue
        </button>
      </div>
    );
  }