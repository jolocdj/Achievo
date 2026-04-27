import { useState, useEffect } from "react";
import characterImg from "../assets/character.png";
import bubble1 from "../assets/bubble1.png";
import bubble2 from "../assets/bubble2.png";
import bubble3 from "../assets/bubble3.png";
import bubble4 from "../assets/bubble4.png";
import bubble5 from "../assets/bubble5.png";
import axolotlBtn from "../assets/axolotlButton.png";
import bubbleBtn from "../assets/bubbleButton.png";
import fishBtn from "../assets/fishButton.png";
import octopusBtn from "../assets/octopusButton.png";
import resetBtn from "../assets/resetButton.png";
import seaweedBtn from "../assets/seaweedButton.png";

export default function Login() {
  const [view, setView] = useState("login");
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);

  const bubbleFrames = [bubble1, bubble2, bubble3, bubble4, bubble5];
  const [bubbleFrame, setBubbleFrame] = useState(0);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    const interval = setInterval(() => {
      setBubbleFrame((prev) => (prev + 1) % bubbleFrames.length);
    }, 500);
    return () => clearInterval(interval);
  }, []);
  const handleLogin = async () => {
    if (!email.trim() && !password) {
      setMessage({ text: "Please input all required fields.", type: "error" });
      return;
    }
    if (!email.trim()) {
      setMessage({ text: "Please enter your email.", type: "error" });
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setMessage({
        text: "Please enter a valid email address.",
        type: "error",
      });
      return;
    }
    if (!password) {
      setMessage({ text: "Please enter your password.", type: "error" });
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setMessage({
        text: "Please enter a valid email address.",
        type: "error",
      });
      return;
    }
    try {
      const res = await fetch("https://achievo-59su.onrender.com/login", {
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
    if (
      !name.trim() &&
      !birthdate &&
      !email.trim() &&
      !password &&
      !confirmPassword
    ) {
      setMessage({ text: "Please input all required fields.", type: "error" });
      return;
    }
    if (!name.trim()) {
      setMessage({ text: "Please enter your name.", type: "error" });
      return;
    }
    if (!birthdate) {
      setMessage({ text: "Please enter your birthdate.", type: "error" });
      return;
    }
    if (!email.trim()) {
      setMessage({ text: "Please enter your email.", type: "error" });
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setMessage({
        text: "Please enter a valid email address. (juan@gmail.com)",
        type: "error",
      });
      return;
    }
    if (!password) {
      setMessage({ text: "Please enter your password.", type: "error" });
      return;
    }
    if (password.length < 8) {
      setMessage({
        text: "Password must be at least 8 characters.",
        type: "error",
      });
      return;
    }
    if (!confirmPassword) {
      setMessage({ text: "Please confirm your password.", type: "error" });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ text: "Passwords do not match.", type: "error" });
      return;
    }
    const res = await fetch("https://achievo-59su.onrender.com/register", {
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
      <style>{`
   @keyframes floatBubble {
        0%   { transform: translateY(40px); opacity: 0; }
        1%  { opacity: 1; }
        80%  { opacity: 1; }
        100% { transform: translateY(-60px); opacity: 0; }
      }
      @keyframes bubbleFrame {
        0%   { content: url(${bubble1}); }
        20%  { content: url(${bubble2}); }
        40%  { content: url(${bubble3}); }
        60%  { content: url(${bubble4}); }
        80%  { content: url(${bubble5}); }
        100% { content: url(${bubble1}); }
      }
      .bubble-anim {
        animation: floatBubble 3s ease-in-out infinite;
      }
     .bubble-frame {
        animation: floatBubble 3s ease-in-out infinite;
      }
      @keyframes floatSticker {
        0%   { transform: translateY(0px) rotate(var(--rot)); }
        50%  { transform: translateY(-12px) rotate(var(--rot)); }
        100% { transform: translateY(0px) rotate(var(--rot)); }
      }
    `}</style>{" "}
      <div className="relative flex flex-1 items-center justify-center min-h-screen">
        {" "}
        <img
          src={characterImg}
          alt="character"
          className="relative z-[1] w-[60%] max-w-[320px] object-contain mix-blend-multiply"
        />
        <img
          src={bubbleFrames[bubbleFrame]}
          alt="bubble"
          className="absolute z-[2] w-[40px] h-[40px] object-contain"
          style={{
            bottom: "18%",
            right: "18%",
            animation: "floatBubble 5s ease-in-out infinite",
          }}
        />
        <img
          src={bubbleFrames[bubbleFrame]}
          alt="bubble"
          className="absolute z-[2] w-[28px] h-[28px] object-contain"
          style={{
            bottom: "22%",
            right: "32%",
            animation: "floatBubble 5s ease-in-out infinite 1.4s",
          }}
        />
        <img
          src={bubbleFrames[bubbleFrame]}
          alt="bubble"
          className="absolute z-[2] w-[22px] h-[22px] object-contain"
          style={{
            bottom: "15%",
            left: "22%",
            animation: "floatBubble 5s ease-in-out infinite 2.6s",
          }}
        />
        <img
          src={bubbleFrames[bubbleFrame]}
          alt="bubble"
          className="absolute z-[2] w-[32px] h-[32px] object-contain"
          style={{
            bottom: "30%",
            left: "14%",
            animation: "floatBubble 6s ease-in-out infinite 0.8s",
          }}
        />
        {/* stickers scattered around */}
        <img
          src={axolotlBtn}
          alt="axolotl"
          className="absolute z-[2] w-[70px] h-[70px] object-contain opacity-80"
          style={{
            top: "8%",
            left: "8%",
            "--rot": "-15deg",
            animation: "floatSticker 4s ease-in-out infinite",
          }}
        />
        <img
          src={fishBtn}
          alt="fish"
          className="absolute z-[2] w-[60px] h-[60px] object-contain opacity-80"
          style={{
            top: "12%",
            right: "10%",
            "--rot": "10deg",
            animation: "floatSticker 5s ease-in-out infinite 0.6s",
          }}
        />
        <img
          src={octopusBtn}
          alt="octopus"
          className="absolute z-[2] w-[65px] h-[65px] object-contain opacity-80"
          style={{
            top: "40%",
            left: "5%",
            "--rot": "-8deg",
            animation: "floatSticker 4.5s ease-in-out infinite 1.2s",
          }}
        />
        <img
          src={seaweedBtn}
          alt="seaweed"
          className="absolute z-[2] w-[55px] h-[55px] object-contain opacity-80"
          style={{
            bottom: "10%",
            left: "6%",
            "--rot": "12deg",
            animation: "floatSticker 5s ease-in-out infinite 2s",
          }}
        />
        <img
          src={bubbleBtn}
          alt="bubble sticker"
          className="absolute z-[2] w-[50px] h-[50px] object-contain opacity-80"
          style={{
            top: "25%",
            right: "6%",
            "--rot": "-5deg",
            animation: "floatSticker 3.8s ease-in-out infinite 0.4s",
          }}
        />
        <img
          src={resetBtn}
          alt="reset"
          className="absolute z-[2] w-[55px] h-[55px] object-contain opacity-80"
          style={{
            bottom: "12%",
            right: "8%",
            "--rot": "18deg",
            animation: "floatSticker 4.2s ease-in-out infinite 1.8s",
          }}
        />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center pr-[4rem] pt-[2rem] pb-[2rem]">
        {" "}
        <div className="flex w-full max-w-[400px] flex-col gap-[0.5rem] rounded-[10px] border border-[#e0dbd2] bg-white p-[1rem_1.2rem]">
          <img
            src="/logo.png"
            alt="Achievo logo"
            className="mb-[0.4rem] h-[80px] w-80px] object-contain"
          />{" "}
          <h2 className="mb-[0.2rem] text-center text-[1.1rem] text-[#1a1a1a] [font-family:'Corben',cursive]">
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
                  className="w-full rounded-[8px] border-none bg-[#F5F5FA] px-[14px] py-[10px] text-[14px] text-[#444] outline-none [font-family:'DM_Sans',sans-serif]"
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
                  className="w-full rounded-[8px] border-none bg-[#F5F5FA] px-[14px] py-[10px] text-[14px] text-[#444] outline-none [font-family:'DM_Sans',sans-serif]"
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
              className="w-full rounded-[8px] border-none bg-[#F5F5FA] px-[14px] py-[10px] text-[14px] text-[#444] outline-none [font-family:'DM_Sans',sans-serif]"
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
              className="w-full rounded-[8px] border-none bg-[#F5F5FA] px-[14px] py-[10px] text-[14px] text-[#444] outline-none [font-family:'DM_Sans',sans-serif]"
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
                className="w-full rounded-[8px] border-none bg-[#F5F5FA] px-[14px] py-[10px] text-[14px] text-[#444] outline-none [font-family:'DM_Sans',sans-serif]"
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
            className="mt-[0.25rem] w-full cursor-pointer rounded-full border-2 border-[#1a1a1a] bg-[#a8d6e6] py-[13px] text-[13px] font-bold text-[#1a1a1a] tracking-[0.2px]"
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
