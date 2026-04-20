import { useState } from "react";
import characterImg from "../assets/character.png";

export default function Login() {
  const [view, setView] = useState("login");
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const handleLogin = async () => {
    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    localStorage.setItem("token", data.token);
    console.log("Logged in");
  };

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    const res = await fetch("http://localhost:3000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, birthdate, email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage({
        text: "Account created successfully! Please log in.",
        type: "success",
      });
      setTimeout(() => {
        setView("login");
        setMessage(null);
      }, 2000);
    } else {
      setMessage({
        text: data.message || "Registration failed.",
        type: "error",
      });
    }
  };

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Corben:wght@400;700&family=DM+Sans:wght@400;500;700&display=swap');
        input::placeholder {
          font-family: 'DM Sans', sans-serif;
          color: #bbb;
          font-size: 14px;
        }
      `}</style>
      <div style={styles.left}>
        <div
          style={{
            position: "absolute",
            width: "370px",
            height: "420px",
            borderRadius: "40px",
            background: "#C8A882",
            opacity: 0.1,
            zIndex: 0,
          }}
        />
        <img
          src={characterImg}
          alt="character"
          style={{ ...styles.image, position: "relative", zIndex: 1 }}
        />
      </div>

      <div style={styles.right}>
        <div style={styles.logoIcon}>AV</div>
        <h1 style={styles.brandName}>Achievo</h1>

        <div style={styles.formCard}>
          <h2
            style={{
              fontFamily: "'Corben', cursive",
              fontWeight: "700",
              fontSize: "1.1rem",
              color: "#1a1a1a",
              margin: "0 0 0.2rem",
              textAlign: "center",
            }}
          >
            {view === "login" ? "Login" : "Create Account"}
          </h2>
          {view === "register" && (
            <div style={{ display: "flex", gap: "0.8rem" }}>
              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>Birthdate</label>
                <input
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>
          )}
          {/* SHARED FIELDS */}
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
          </div>

          {/* CONFIRM PASSWORD — register only */}
          {view === "register" && (
            <div style={styles.field}>
              <label style={styles.label}>Re-enter Password</label>
              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={styles.input}
              />
            </div>
          )}

          {message && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                fontSize: "13px",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: "500",
                textAlign: "center",
                background: message.type === "success" ? "#e9f7ef" : "#fdecea",
                color: message.type === "success" ? "#1e7e44" : "#c0392b",
                border: `1px solid ${message.type === "success" ? "#a8d5b5" : "#f1b0aa"}`,
              }}
            >
              {message.text}
            </div>
          )}

          <button
            onClick={view === "login" ? handleLogin : handleRegister}
            style={styles.btn}
          >
            {view === "login" ? "Continue →" : "Create Account →"}
          </button>

          <p
            style={{
              textAlign: "center",
              fontSize: "13px",
              fontFamily: "'DM Sans', sans-serif",
              color: "#888",
              margin: "0",
            }}
          >
            {view === "login" ? "New here?" : "Already have an account?"}{" "}
            <span
              onClick={() => setView(view === "login" ? "register" : "login")}
              style={{
                color: "#1a1a1a",
                fontWeight: "600",
                cursor: "pointer",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              {view === "login" ? "Create an account" : "Login"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    width: "100vw",
    minHeight: "100vh",
    background: "white",
    gap: "4rem",
    overflowY: "auto",
  },
  left: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    overflow: "visible",
    position: "relative",
  },
  image: {
    width: "90%",
    maxWidth: "480px",
    height: "auto",
    objectFit: "contain",
    mixBlendMode: "multiply",
  },
  right: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingRight: "4rem",
    paddingTop: "0.8rem",
    paddingBottom: "2rem",
  },
  logoIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background: "#F5C518",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "sans-serif",
    fontWeight: "700",
    fontSize: "13px",
    color: "#5a3e00",
    marginBottom: "0.2rem",
  },
  brandName: {
    fontFamily: "'Corben', cursive",
    fontWeight: "400",
    fontSize: "2.6rem",
    color: "#1a1a1a",
    margin: "0 0 0.6rem",
    letterSpacing: "-0.5px",
  },
  formCard: {
    background: "white",
    border: "1px solid #e0dbd2",
    borderRadius: "10px",
    padding: "1rem 1.2rem",
    width: "100%",
    maxWidth: "400px",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: "500",
    color: "#1a1a1a",
    textAlign: "left",
    letterSpacing: "0.1px",
  },
  input: {
    background: "#F5F2EE",
    border: "none",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    color: "#444",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  btn: {
    background: "#F5C518",
    color: "#1a1a1a",
    border: "2px solid #1a1a1a",
    borderRadius: "999px",
    padding: "13px",
    fontSize: "13px",
    fontFamily: "'Satoshi', sans-serif",
    fontWeight: "700",
    cursor: "pointer",
    width: "100%",
    marginTop: "0.25rem",
    letterSpacing: "0.2px",
  },
};
