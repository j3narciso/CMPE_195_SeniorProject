export default function AuthScreen({ onContinue, onBack }) {
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
            minWidth: "320px",
          }}
        >
          <h2 style={{ marginBottom: "6px" }}>Welcome to TravelGen</h2>
          <p
            style={{
              marginTop: 0,
              marginBottom: "24px",
              fontSize: "14px",
              color: "#d0d0d0",
            }}
          >
            Log in or create an account to save your trips.
          </p>
  
          <label style={{ fontSize: "14px" }}>
            Email
            <input
              type="email"
              placeholder="you@example.com"
              style={{
                width: "100%",
                marginTop: "4px",
                marginBottom: "16px",
                padding: "8px 10px",
                borderRadius: "6px",
                border: "1px solid #0f4c75",
              }}
            />
          </label>
  
          <label style={{ fontSize: "14px" }}>
            Password
            <input
              type="password"
              placeholder="••••••••"
              style={{
                width: "100%",
                marginTop: "4px",
                marginBottom: "20px",
                padding: "8px 10px",
                borderRadius: "6px",
                border: "1px solid #0f4c75",
              }}
            />
          </label>
  
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "14px",
            }}
          >
            <button
              style={{
                flex: 1,
                backgroundColor: "#3282b8",
                color: "white",
                border: "none",
                padding: "10px 0",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
              }}
              onClick={onContinue} // later: hook to backend login
            >
              Log In
            </button>
            <button
              style={{
                flex: 1,
                backgroundColor: "#27ae60",
                color: "white",
                border: "none",
                padding: "10px 0",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
              }}
              onClick={onContinue} // later: signup logic
            >
              Create Account
            </button>
          </div>
  
          <button
            style={{
              width: "100%",
              backgroundColor: "#0f4c75",
              color: "white",
              border: "none",
              padding: "8px 0",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
            }}
            onClick={onContinue} // guest mode
          >
            Continue as Guest
          </button>
  
          <button
            onClick={onBack}
            style={{
              marginTop: "14px",
              width: "100%",
              background: "transparent",
              color: "#bbbbbb",
              border: "none",
              fontSize: "12px",
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            ⬅ Back to Welcome
          </button>
        </div>
      </div>
    );
  }