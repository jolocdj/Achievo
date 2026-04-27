import React from "react";

export default function Settings({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-[rgba(0,0,0,0.28)]"
      onClick={onClose}
    >
      <div
        className="w-[420px] rounded-[24px] border border-[#ece5db] bg-[#ffffff] px-[24px] py-[22px] shadow-[0_20px_50px_rgba(0,0,0,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="mb-[20px] flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-[#1f1a14]">Settings</h2>
          <button onClick={onClose} className="text-[22px] text-[#4a433c]">
            ×
          </button>
        </div>

        {/* CONTENT */}
        {/* CONTENT */}
        <div className="flex flex-col gap-[18px]">
          {/* ACCOUNT ACTIONS */}
          <div className="flex flex-col gap-[10px]">
            <button
              onClick={() => {
                onClose();
                window.location.href = "/profile?section=email";
              }}
              className="w-full rounded-full border border-[#2f281e] bg-white px-[16px] py-[10px] text-[13px] font-bold"
            >
              Change Email
            </button>

            <button
              onClick={() => {
                onClose();
                window.location.href = "/profile?section=password";
              }}
              className="w-full rounded-full border border-[#2f281e] bg-white px-[16px] py-[10px] text-[13px] font-bold"
            >
              Change Password
            </button>
          </div>{" "}
          {/* ABOUT */}
          <div className="rounded-[14px] bg-[#f4f0ea] px-[16px] py-[14px]">
            <div className="text-[13px] font-bold mb-[6px]">About Achievo</div>

            <div className="text-[12px] text-[#2f2a23] leading-[1.5] mb-[8px]">
              Achievo is a productivity and task management application designed
              to help users stay organized, focused, and in control of their
              daily goals. It allows you to manage tasks, set reminders, track
              progress, and receive timely notifications so nothing gets missed.
            </div>

            <div className="text-[12px] text-[#2f2a23] leading-[1.5] mb-[8px]">
              With features like categorized tasks, priority levels, reminders,
              trackers, and attachments, Achievo provides a simple yet powerful
              system to improve productivity and build better habits over time.
            </div>

            <div className="text-[12px] text-[#6b6358]">Version 1.0.0</div>

            <div className="text-[12px] text-[#6b6358]">
              Developed by <b>Alfred Jolo C. De Jesus</b>
            </div>
          </div>
          {/* TERMS */}
          <div>
            <div className="text-[13px] font-bold">Terms & Privacy</div>
            <p className="text-[12px] text-[#6b6358]">
              Your data is stored securely and used only for app functionality.
            </p>
          </div>
          {/* CONTACT */}
          <div>
            <div className="text-[13px] font-bold">Contact</div>
            <p className="text-[12px]">support@achievo.app</p>
          </div>
        </div>

        <div className="text-center text-[11px] mt-4 text-[#b0a99e]">
          © 2026 Achievo
        </div>
      </div>
    </div>
  );
}
