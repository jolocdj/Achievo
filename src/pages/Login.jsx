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
    try {
      const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({
          text: data.message || "Login failed.",
          type: "error",
        });
        return;
      }

      localStorage.setItem("token", data.token);

      setMessage({
        text: "Login successful!",
        type: "success",
      });

      console.log("Logged in", data);

      // temporary redirect
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Login error:", err);
      setMessage({
        text: "Cannot connect to server.",
        type: "error",
      });
    }
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
    <div className="flex min-h-screen w-full justify-center gap-[4rem] overflow-y-auto bg-white">
      {" "}
      <div className="relative flex flex-1 items-center justify-center min-h-screen">
        {" "}
        <div className="absolute w-[370px] h-[420px] rounded-[40px] bg-[#C8A882]/10" />
        <img
          src={characterImg}
          alt="character"
          className="relative z-[1] w-[90%] max-w-[480px] object-contain mix-blend-multiply"
        />
      </div>
      <div className="flex flex-1 flex-col items-center justify-start pr-[4rem] pt-[0.8rem] pb-[2rem]">
        {" "}
        <div className="mb-[0.2rem] flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#F5C518] text-[13px] font-bold text-[#5a3e00]">
          AV
        </div>{" "}
        <h1 className="mb-[0.6rem] text-[2.6rem] font-normal text-[#1a1a1a] tracking-[-0.5px] [font-family:'Corben',cursive]">
          {" "}
          Achievo
        </h1>{" "}
        <div className="flex w-full max-w-[400px] flex-col gap-[0.5rem] rounded-[10px] border border-[#e0dbd2] bg-white p-[1rem_1.2rem]">
          {" "}
          <h2 className="mb-[0.2rem] text-center text-[1.1rem] font-bold text-[#1a1a1a] [font-family:'Corben',cursive]">
            {" "}
            {view === "login" ? "Login" : "Create Account"}
          </h2>
          {view === "register" && (
            <div className="flex gap-[0.8rem]">
              {" "}
              <div className="flex flex-1 flex-col gap-[6px]">
                <label className="text-left text-[14px] font-medium text-[#1a1a1a] [font-family:'DM_Sans',sans-serif]">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-[8px] border-none bg-[#F5F2EE] px-[14px] py-[10px] text-[14px] text-[#444] outline-none [font-family:'DM_Sans',sans-serif]"
                />
              </div>
              <div className="flex flex-1 flex-col gap-[6px]">
                <label className="text-left text-[14px] font-medium text-[#1a1a1a] [font-family:'DM_Sans',sans-serif]">
                  Birthdate
                </label>
                <input
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  className="w-full rounded-[8px] border-none bg-[#F5F2EE] px-[14px] py-[10px] text-[14px] text-[#444] outline-none [font-family:'DM_Sans',sans-serif]"
                />
              </div>
            </div>
          )}
          {/* SHARED FIELDS */}
          <div className="flex flex-col gap-[6px]">
            {" "}
            <label className="text-left text-[14px] font-medium text-[#1a1a1a] [font-family:'DM_Sans',sans-serif]">
              Email
            </label>
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-[8px] border-none bg-[#F5F2EE] px-[14px] py-[10px] text-[14px] text-[#444] outline-none [font-family:'DM_Sans',sans-serif]"
            />
          </div>
          <div className="flex flex-col gap-[6px]">
            <label className="text-left text-[14px] font-medium text-[#1a1a1a] [font-family:'DM_Sans',sans-serif]">
              Password
            </label>
            <input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-[8px] border-none bg-[#F5F2EE] px-[14px] py-[10px] text-[14px] text-[#444] outline-none [font-family:'DM_Sans',sans-serif]"
            />
          </div>
          {/* CONFIRM PASSWORD — register only */}
          {view === "register" && (
            <div className="flex flex-col gap-[6px]">
              <label className="text-left text-[14px] font-medium text-[#1a1a1a] [font-family:'DM_Sans',sans-serif]">
                Re-enter Password
              </label>
              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-[8px] border-none bg-[#F5F2EE] px-[14px] py-[10px] text-[14px] text-[#444] outline-none [font-family:'DM_Sans',sans-serif]"
              />
            </div>
          )}
          {message && (
            <div
              className={`rounded-[8px] px-[14px] py-[10px] text-center text-[13px] font-medium [font-family:'DM_Sans',sans-serif] ${
                message.type === "success"
                  ? "bg-[#e9f7ef] text-[#1e7e44] border border-[#a8d5b5]"
                  : "bg-[#fdecea] text-[#c0392b] border border-[#f1b0aa]"
              }`}
            >
              {message.text}
            </div>
          )}
          <button
            onClick={view === "login" ? handleLogin : handleRegister}
            className="mt-[0.25rem] w-full cursor-pointer rounded-full border-2 border-[#1a1a1a] bg-[#F5C518] py-[13px] text-[13px] font-bold text-[#1a1a1a] tracking-[0.2px]"
          >
            {view === "login" ? "Continue →" : "Create Account →"}
          </button>
          <p className="m-0 text-center text-[13px] text-[#888] [font-family:'DM_Sans',sans-serif]">
            {" "}
            {view === "login" ? "New here?" : "Already have an account?"}{" "}
            <span
              onClick={() => setView(view === "login" ? "register" : "login")}
              className="cursor-pointer font-semibold text-[#1a1a1a] underline underline-offset-[3px]"
            >
              {view === "login" ? "Create an account" : "Login"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
