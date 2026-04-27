import { useEffect, useState } from "react";

export default function Tabs({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenLogout,
  userName,
}) {
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:3000/notifications/unread-count",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const data = await res.json();
        setNotificationCount(data.count || 0);
      } catch (err) {
        console.error("Fetch notification count error:", err);
        setNotificationCount(0);
      }
    };

    fetchNotificationCount();

    const interval = setInterval(fetchNotificationCount, 30000);

    return () => clearInterval(interval);
  }, []);
  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 3h8v8H3V3zm10 0h8v5h-8V3zM3 13h8v8H3v-8zm10 5h8v3h-8v-3z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "tasks",
      label: "My tasks",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 11l2 2 4-4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </svg>
      ),
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13.73 21a2 2 0 01-3.46 0"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
  ];

  return (
    <aside className="w-[250px] h-full bg-[#ffffff] rounded-[28px] border border-[#ece5db] flex flex-col justify-between overflow-hidden">
      <div>
        <div className="flex items-center gap-[12px] px-[26px] py-[20px] border-b border-[#ece5db]">
          <img
            src="/logo.png"
            alt="Achievo logo"
            className="h-[40px] w-[40px] object-contain"
          />
          <div className="text-[18px] text-[#1d1812]">
            Hi, {userName || "User"}
          </div>{" "}
        </div>

        <div className="flex flex-col">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={async () => {
                setActiveTab(tab.id);

                if (tab.id === "notifications") {
                  setNotificationCount(0);

                  try {
                    const token = localStorage.getItem("token");

                    await fetch(
                      "http://localhost:3000/notifications/mark-read",
                      {
                        method: "PUT",
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      },
                    );
                  } catch (err) {
                    console.error("Mark notifications read error:", err);
                  }
                }
              }}
              className={`w-full flex items-center gap-[16px] px-[28px] py-[18px] text-[18px] border-b border-[#ece5db] text-left ${
                activeTab === tab.id
                  ? "bg-[#e8f4f8] border-l-[8px] border-l-[#a8d6e6] pl-[20px] font-bold"
                  : ""
              }`}
            >
              <span className="w-[22px] flex justify-center text-[#43392d]">
                {tab.icon}
              </span>
              <span className="flex items-center gap-[8px]">
                {tab.label}

                {tab.id === "notifications" && notificationCount > 0 && (
                  <span className="flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-[#f58f8f] px-[6px] text-[11px] font-bold text-white">
                    {notificationCount}
                  </span>
                )}
              </span>{" "}
            </button>
          ))}
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={onOpenSettings}
          className="w-full flex items-center gap-[16px] px-[28px] py-[22px] text-[18px] border-t border-[#ece5db] text-left"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="3"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M19.4 15a7.97 7.97 0 000-6l2.1-1.2-2-3.4-2.4 1a8.2 8.2 0 00-5.2-2l-.4-2.6h-4l-.4 2.6a8.2 8.2 0 00-5.2 2l-2.4-1-2 3.4L4.6 9a7.97 7.97 0 000 6l-2.1 1.2 2 3.4 2.4-1a8.2 8.2 0 005.2 2l.4 2.6h4l.4-2.6a8.2 8.2 0 005.2-2l2.4 1 2-3.4L19.4 15z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
          <span>Settings</span>
        </button>

        <button
          type="button"
          onClick={onOpenLogout}
          className="w-full flex items-center gap-[16px] px-[28px] py-[22px] text-[18px] border-t border-[#ece5db] text-left"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M16 17l5-5-5-5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 12H9"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>{" "}
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
