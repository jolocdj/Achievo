import { useState } from "react";
import characterImg from "../assets/character.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
        <img src={characterImg} alt="character" style={styles.image} />
      </div>

      {/* RIGHT — form */}
      <div style={styles.right}>
        <div style={styles.logoIcon}>AZ</div>
        <h1 style={styles.brandName}>Achievo</h1>

        <div style={styles.formCard}>
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
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              style={styles.input}
            />
          </div>

          <button onClick={handleLogin} style={styles.btn}>
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100vw",
    height: "100vh",
    background: "white",
    gap: "5rem",
    overflow: "hidden",
  },
  left: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
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
    alignItems: "flex-start",
    justifyContent: "center",
    paddingRight: "4rem",
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
    marginBottom: "0.5rem",
  },
  brandName: {
    fontFamily: "'Corben', cursive",
    fontWeight: "400",
    fontSize: "2.6rem",
    color: "#1a1a1a",
    margin: "0.4rem 0 1.5rem",
    letterSpacing: "-0.5px",
  },
  formCard: {
    background: "white",
    border: "1px solid #e0dbd2",
    borderRadius: "16px",
    padding: "1.8rem",
    width: "100%",
    maxWidth: "420px",
    display: "flex",
    flexDirection: "column",
    gap: "1.1rem",
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
    textAlign: "center",
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
    color: "#5a3e00",
    border: "none",
    borderRadius: "10px",
    padding: "13px",
    fontSize: "15px",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: "700",
    cursor: "pointer",
    width: "100%",
    marginTop: "0.25rem",
  },
};
