import React from "react";

export default function Logout({ onClose }) {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-[rgba(0,0,0,0.28)]"
      onClick={onClose}
    >
      <div
        className="w-[400px] h-[300px] rounded-[28px] border bg-white flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img src="/logo.png" alt="logo" className="w-[90px] mb-4" />

        <p className="mb-6 text-center">Are you sure you want to log out?</p>

        <div className="flex gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-full">
            No
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-[#a8d6e6] rounded-full font-bold"
          >
            Yes, log me out
          </button>
        </div>
      </div>
    </div>
  );
}
