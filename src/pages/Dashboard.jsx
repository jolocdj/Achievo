import { useEffect, useMemo, useState } from "react";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:3000/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setTasks([]);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const toggleTask = async (task) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(`http://localhost:3000/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: task.title,
          completed: !task.completed,
        }),
      });

      fetchTasks(); // refresh
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  const monthLabel = currentDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDay = (firstDayOfMonth.getDay() + 6) % 7; // Monday-first
    const daysInMonth = lastDayOfMonth.getDate();

    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const days = [];

    for (let i = startDay - 1; i >= 0; i--) {
      const dayNumber = prevMonthLastDay - i;
      const date = new Date(year, month - 1, dayNumber);
      days.push({
        key: `prev-${dayNumber}`,
        day: dayNumber,
        muted: true,
        active: false,
        date,
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isActive =
        selectedDate.getFullYear() === date.getFullYear() &&
        selectedDate.getMonth() === date.getMonth() &&
        selectedDate.getDate() === date.getDate();

      days.push({
        key: `current-${day}`,
        day,
        muted: false,
        active: isActive,
        date,
      });
    }

    const remaining = 35 - days.length;
    const totalSlots = remaining > 0 ? 35 : 42;

    for (let day = 1; days.length < totalSlots; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        key: `next-${day}`,
        day,
        muted: true,
        active: false,
        date,
      });
    }

    return days;
  }, [currentDate, selectedDate]);

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };
  const categories = [];
  const tracking = [];
  const comments = [];

  return (
    <div className="h-screen w-screen flex bg-[#f7f4ef] p-[18px] gap-[14px] font-[DM_Sans] text-[#1f1a14] overflow-hidden">
      {" "}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Corben:wght@400;700&family=DM+Sans:wght@400;500;700&display=swap');

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #f7f4ef;
          font-family: 'DM Sans', sans-serif;
        }

        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-thumb {
          background: #ddd3c5;
          border-radius: 10px;
        }
      `}</style>
      <aside className="w-[250px] h-full bg-[#fbf9f6] rounded-[28px] border border-[#ece5db] flex flex-col justify-between overflow-hidden">
        {" "}
        <div>
          <div className="flex items-center gap-[12px] px-[26px] py-[20px] border-b border-[#ece5db]">
            {" "}
            <div className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#f2d541] text-[13px] font-bold text-[#2b241b]">
              AV
            </div>{" "}
            <div className="text-[18px] text-[#1d1812]">Achievo</div>
          </div>

          <div className="flex flex-col">
            {" "}
            <button
              type="button"
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-[16px] px-[28px] py-[18px] text-[18px] border-b border-[#ece5db] text-left ${
                activeTab === "dashboard"
                  ? "bg-[#f1ede3] border-l-[8px] border-l-[#f2d541] pl-[20px] font-bold"
                  : ""
              }`}
            >
              <span className="w-[22px] flex justify-center text-[#43392d]">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="4"
                    y="4"
                    width="7"
                    height="7"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <rect
                    x="13"
                    y="4"
                    width="7"
                    height="16"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <rect
                    x="4"
                    y="13"
                    width="7"
                    height="7"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                </svg>
              </span>
              <span>Dashboard</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("tasks")}
              className={`w-full flex items-center gap-[16px] px-[28px] py-[18px] text-[18px] border-b border-[#ece5db] text-left ${
                activeTab === "tasks"
                  ? "bg-[#f1ede3] border-l-[8px] border-l-[#f2d541] pl-[20px] font-bold"
                  : ""
              }`}
            >
              <span className="w-[22px] flex justify-center text-[#43392d]">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M8 12L10.8 14.8L16.5 9"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span>My tasks</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("notifications")}
              className={`w-full flex items-center gap-[16px] px-[28px] py-[18px] text-[18px] border-b border-[#ece5db] text-left ${
                activeTab === "notifications"
                  ? "bg-[#f1ede3] border-l-[8px] border-l-[#f2d541] pl-[20px] font-bold"
                  : ""
              }`}
            >
              <span className="w-[22px] flex justify-center text-[#43392d]">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 4C9.5 4 8 5.8 8 8.5V10.2C8 11.1 7.7 12 7.1 12.7L6 14V15H18V14L16.9 12.7C16.3 12 16 11.1 16 10.2V8.5C16 5.8 14.5 4 12 4Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 18C10.4 19.2 11 20 12 20C13 20 13.6 19.2 14 18"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span>Notifications</span>
            </button>
          </div>
        </div>
        <div>
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className="w-full flex items-center gap-[16px] px-[28px] py-[22px] text-[18px] border-t border-[#ece5db] text-left"
          >
            <span className="w-[22px] flex justify-center text-[#43392d]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 7H10"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M14 7H20"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M4 17H10"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M14 17H20"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <circle
                  cx="12"
                  cy="7"
                  r="2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <circle
                  cx="12"
                  cy="17"
                  r="2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>
            </span>
            <span>Settings</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("logout")}
            className="w-full flex items-center gap-[16px] px-[28px] py-[22px] text-[18px] border-t border-[#ece5db] text-left"
          >
            <span className="w-[22px] flex justify-center text-[#43392d]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 7V5C10 4.44772 10.4477 4 11 4H18C18.5523 4 19 4.44772 19 5V19C19 19.5523 18.5523 20 18 20H11C10.4477 20 10 19.5523 10 19V17"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M15 12H5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M8 9L5 12L8 15"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span>Log out</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 h-full flex flex-col gap-[14px] overflow-hidden min-w-0">
        {" "}
        <div className="flex justify-between items-center gap-[12px] px-[5px] py-[1px] bg-[#f1ede7] rounded-[20px]">
          {" "}
          <input
            type="text"
            placeholder="Search"
            className="w-[300px] bg-[#e7e2dc] rounded-[14px] px-[26px] py-[10px] text-[15px] text-[#5b544c] outline-none"
          />{" "}
          <div className="flex items-center gap-[16px]">
            {" "}
            <button
              className="cursor-pointer rounded-full border-2 border-[#2f281e] bg-[#f2d541] px-[16px] py-[8px] text-[14px] font-bold text-[#1f1a14]"
              onClick={() => setShowTaskModal(true)}
            >
              ＋ New task
            </button>{" "}
            <button className="cursor-pointer border-none bg-transparent p-0 text-[24px] text-[#2d261d]">
              ✉
            </button>
            <div className="flex h-[35px] w-[35px] items-center justify-center rounded-full border-2 border-[#2d261d] bg-[#d7b678] text-[16px]">
              🧑
            </div>
          </div>
        </div>
        <>
          {showTaskModal && (
            <div
              className="fixed inset-0 z-[999] flex items-center justify-center bg-[rgba(0,0,0,0.28)]"
              onClick={() => setShowTaskModal(false)}
            >
              <div
                className="w-[520px] max-w-[92vw] rounded-[22px] border border-[#ece5db] bg-[#fbf9f6] px-[20px] py-[18px] shadow-[0_20px_50px_rgba(0,0,0,0.12)]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-[18px] flex items-center justify-between gap-[12px]">
                  {" "}
                  <div className="flex flex-1 items-center gap-[10px]">
                    {" "}
                    <span className="inline-flex h-[16px] w-[16px] shrink-0 items-center justify-center text-[#3d372f]">
                      {" "}
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8 3H14L19 8V21H8C6.89543 21 6 20.1046 6 19V5C6 3.89543 6.89543 3 8 3Z"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M14 3V8H19"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>{" "}
                    <input
                      type="text"
                      placeholder="Name of task"
                      className="h-[38px] flex-1 rounded-[8px] border-none bg-[#f2efea] px-[14px] text-[14px] text-[#2d261d] outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTaskModal(false)}
                    className="cursor-pointer border-none bg-transparent p-0 text-[22px] leading-none text-[#4a433c]"
                  >
                    ×
                  </button>
                </div>

                <div className="flex flex-col gap-[16px]">
                  {" "}
                  <div className="grid grid-cols-[130px_1fr] items-center gap-x-[14px]">
                    {" "}
                    <div className="flex items-center gap-[8px] whitespace-nowrap text-[13px] text-[#2f2a23]">
                      {" "}
                      <span className="inline-flex h-[14px] w-[14px] shrink-0 items-center justify-center text-[#3d372f]">
                        {" "}
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            x="4"
                            y="5"
                            width="16"
                            height="15"
                            rx="2"
                            stroke="currentColor"
                            strokeWidth="1.7"
                          />
                          <path
                            d="M8 3V7"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                          />
                          <path
                            d="M16 3V7"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                          />
                          <path
                            d="M4 10H20"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                      <span>Day</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-[10px]">
                      {" "}
                      <button className="cursor-pointer rounded-full border border-[#8d8478] bg-[#fffdfa] px-[14px] py-[7px] text-[11px] text-[#2d261d]">
                        Today
                      </button>
                      <button className="cursor-pointer rounded-full border border-[#8d8478] bg-[#fffdfa] px-[14px] py-[7px] text-[11px] text-[#2d261d]">
                        Tomorrow
                      </button>
                      <button className="cursor-pointer rounded-full border border-[#8d8478] bg-[#fffdfa] px-[14px] py-[7px] text-[11px] text-[#2d261d]">
                        ＋
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-center gap-x-[14px]">
                    {" "}
                    <div className="flex items-center gap-[8px] whitespace-nowrap text-[13px] text-[#2f2a23]">
                      {" "}
                      <span className="inline-flex h-[14px] w-[14px] shrink-0 items-center justify-center text-[#3d372f]">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle
                            cx="12"
                            cy="13"
                            r="7"
                            stroke="currentColor"
                            strokeWidth="1.7"
                          />
                          <path
                            d="M12 9V13L14.5 15.5"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M9 3H15"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                      <span>Notification</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-[10px]">
                      {" "}
                      <button className="cursor-pointer rounded-full border border-[#8d8478] bg-[#fffdfa] px-[14px] py-[7px] text-[11px] text-[#2d261d]">
                        In 1 hour
                      </button>{" "}
                      <button className="cursor-pointer border-none bg-transparent p-0 text-[16px] leading-none text-[#2f2a23]">
                        ＋
                      </button>{" "}
                    </div>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-center gap-x-[14px]">
                    {" "}
                    <div className="flex items-center gap-[8px] whitespace-nowrap text-[13px] text-[#2f2a23]">
                      {" "}
                      <span className="inline-flex h-[14px] w-[14px] shrink-0 items-center justify-center text-[#3d372f]">
                        {" "}
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M7 4V20"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                          />
                          <path
                            d="M7 5H16L14 9H7"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <span>Priority</span>
                    </div>
                    <div className="text-[12px] text-[#2f2a23]">
                      ＋ Add priority
                    </div>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-center gap-x-[14px]">
                    {" "}
                    <div className="flex items-center gap-[8px] whitespace-nowrap text-[13px] text-[#2f2a23]">
                      <span className="inline-flex h-[14px] w-[14px] shrink-0 items-center justify-center text-[#3d372f]">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M20 12L12 20L4 12L12 4L20 12Z"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinejoin="round"
                          />
                          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                        </svg>
                      </span>
                      <span>Tags</span>
                    </div>
                    <div className="text-[12px] text-[#2f2a23]">
                      ＋ Add tags
                    </div>{" "}
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-center gap-x-[14px]">
                    {" "}
                    <div className="flex items-center gap-[8px] whitespace-nowrap text-[13px] text-[#2f2a23]">
                      <span className="inline-flex h-[14px] w-[14px] shrink-0 items-center justify-center text-[#3d372f]">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle
                            cx="12"
                            cy="8"
                            r="3"
                            stroke="currentColor"
                            strokeWidth="1.7"
                          />
                          <path
                            d="M6.5 19C7.4 16.8 9.4 15.5 12 15.5C14.6 15.5 16.6 16.8 17.5 19"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                      <span>Assign</span>
                    </div>
                    <div className="text-[12px] text-[#2f2a23]">
                      ＋ Add assignee
                    </div>{" "}
                  </div>
                  <div className="mt-[6px]">
                    {" "}
                    <div className="mb-[8px] text-[13px] font-bold text-[#2a241d]">
                      Description
                    </div>{" "}
                    <textarea
                      placeholder=""
                      className="min-h-[110px] w-full resize-none rounded-[10px] border-none bg-[#f2efea] p-[14px] text-[13px] text-[#2d261d] outline-none"
                    />{" "}
                  </div>
                </div>

                <div className="mt-[18px] flex justify-end pt-[8px]">
                  {" "}
                  <button className="cursor-pointer rounded-full border border-[#2f281e] bg-[#f2d541] px-[18px] py-[10px] text-[12px] font-bold text-[#1f1a14]">
                    Create task
                  </button>{" "}
                </div>
              </div>
            </div>
          )}

          <div className="grid flex-1 min-h-0 overflow-hidden gap-[14px] grid-cols-[370px_1fr_220px] grid-rows-[350px_1fr]">
            {" "}
            <section className="bg-[#fbf9f6] border border-[#ede7dd] rounded-[26px] p-[22px_25px_20px] overflow-hidden">
              {" "}
              <div className="flex items-center justify-between px-[16px] py-[14px]">
                {" "}
                <h3 className="m-0 text-[17px] font-bold text-[#1f1a14]">
                  {monthLabel}
                </h3>
                <div className="flex items-center gap-[20px]">
                  {" "}
                  <button
                    type="button"
                    onClick={goToPreviousMonth}
                    className="border-none bg-transparent p-0 text-[22px] leading-none text-[#4a433c] cursor-pointer"
                  >
                    {"<"}
                  </button>
                  <button
                    type="button"
                    onClick={goToNextMonth}
                    className="cursor-pointer border-none bg-transparent px-[4px] text-[20px] text-[#3b342b]"
                  >
                    {">"}
                  </button>
                </div>
              </div>
              <div className="mt-[8px] mb-[10px] grid grid-cols-7">
                {" "}
                {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
                  <div
                    key={day}
                    className="py-[8px] text-center text-[14px] font-medium text-[#2d261f]"
                  >
                    {" "}
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-[10px] pb-[8px]">
                {" "}
                {calendarDays.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setSelectedDate(item.date);
                      if (item.muted) {
                        setCurrentDate(
                          new Date(
                            item.date.getFullYear(),
                            item.date.getMonth(),
                            1,
                          ),
                        );
                      }
                    }}
                    className={`mx-auto flex h-[34px] w-[34px] items-center justify-center rounded-full border-none text-[14px] ${
                      item.active ? "bg-[#f2d541] font-bold" : ""
                    } ${item.muted ? "text-[#3b342b] opacity-50" : "text-[#3b342b]"}`}
                  >
                    {item.day}
                  </button>
                ))}
              </div>
            </section>
            <section className="bg-[#fbf9f6] border border-[#ede7dd] rounded-[26px] overflow-hidden">
              {" "}
              <div className="flex items-center justify-between px-[16px] py-[14px]">
                <h3 className="m-0 text-[17px] font-bold text-[#1f1a14]">
                  My tasks ({tasks.length})
                </h3>
                <div className="text-[26px] leading-none text-[#4a433c]">⋮</div>
              </div>
              <div>
                {tasks.length === 0 ? (
                  <div className="px-[16px] py-[20px] text-[14px] text-[#7a7268]">
                    No tasks yet.
                  </div>
                ) : (
                  tasks.map((task, index) => (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between px-[16px] py-[12px] ${
                        index !== tasks.length - 1
                          ? "border-b border-[#e7e1d7]"
                          : ""
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-[14px]">
                        {" "}
                        <button
                          onClick={() => toggleTask(task)}
                          className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border-[1.8px] border-[#555] text-[14px] font-bold text-[#2f2a23] ${
                            task.completed ? "bg-[#f2d541]" : "bg-transparent"
                          }`}
                        >
                          {task.completed ? "✓" : ""}
                        </button>
                        <span
                          className={`max-w-[220px] overflow-hidden text-ellipsis whitespace-nowrap text-[15px] ${
                            task.completed
                              ? "text-[#8f877b] line-through"
                              : "text-[#2f2b25]"
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>

                      <span className="shrink-0 text-[15px] font-medium text-[#49423b]">
                        {task.due}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>
            <section className="bg-[#fbf9f6] border border-[#ede7dd] rounded-[26px] w-[220px]">
              {" "}
              <div className="flex items-center justify-between px-[16px] py-[14px]">
                <h3 className="m-0 text-[17px] font-bold text-[#1f1a14]">
                  New comments
                </h3>
              </div>
              {comments.map((comment, index) => (
                <div
                  key={index}
                  className={`flex items-start justify-between gap-[10px] px-[16px] py-[12px] ${
                    index !== comments.length - 1
                      ? "border-b border-[#e7e1d7]"
                      : ""
                  }`}
                >
                  <div>
                    <div className="mb-[6px] text-[15px] font-bold text-[#2a241d]">
                      {comment.title}
                    </div>{" "}
                    <div className="max-w-[180px] text-[14px] leading-[1.3] text-[#645c52]">
                      {comment.text}
                    </div>{" "}
                  </div>
                  <div className="text-[30px] leading-none text-[#493f34]">
                    ›
                  </div>{" "}
                </div>
              ))}
              <div className="px-[22px] py-[18px] text-[16px] font-bold text-[#2a241d]">
                ＋ Add
              </div>{" "}
            </section>
            <section className="overflow-hidden rounded-[26px] border border-[#ede7dd] bg-[#fbf9f6]">
              {" "}
              <div className="flex items-center justify-between px-[16px] py-[14px]">
                <h3 className="m-0 text-[17px] font-bold text-[#1f1a14]">
                  My categories
                </h3>
                <div className="text-[26px] leading-none text-[#4a433c]">⋮</div>
              </div>
              {categories.map((category, index) => (
                <div
                  key={category.name}
                  className={`flex items-center justify-between px-[16px] py-[12px] ${
                    index !== categories.length - 1
                      ? "border-b border-[#e7e1d7]"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-[14px] text-[16px] text-[#2c251d]">
                    {" "}
                    <span className="inline-flex w-[24px] justify-center text-[20px] text-[#5a5249]">
                      {" "}
                      {index === 0
                        ? "⌘"
                        : index === 1
                          ? "◔"
                          : index === 2
                            ? "◌"
                            : "▣"}
                    </span>
                    <span>{category.name}</span>
                  </div>

                  <div className="flex items-center">
                    {" "}
                    {category.people.map((person, i) => (
                      <div
                        key={i}
                        className={`flex h-[32px] w-[32px] items-center justify-center rounded-full border-2 border-[#fbf9f6] bg-[#d1b38a] text-[12px] font-bold text-[#2d241a] ${
                          i === 0 ? "ml-0" : "-ml-[8px]"
                        }`}
                      >
                        {person}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="px-[22px] py-[18px] text-[15px] font-bold text-[#2a241d]">
                ＋ Add more
              </div>{" "}
            </section>
            <section className="overflow-hidden rounded-[26px] border border-[#ede7dd] bg-[#fbf9f6]">
              {" "}
              <div className="flex items-center justify-between px-[16px] py-[14px]">
                <h3 className="m-0 text-[17px] font-bold text-[#1f1a14]">
                  My tracking
                </h3>
              </div>
              {tracking.map((item, index) => (
                <div
                  key={index}
                  className={`flex min-h-[48px] items-center justify-between px-[14px] py-[12px] ${
                    item.active
                      ? "border-l-[8px] border-l-[#f2d541] bg-[#f6f1de]"
                      : "border-l-[8px] border-l-transparent"
                  } ${index !== tracking.length - 1 ? "border-b border-[#e7e1d7]" : ""}`}
                >
                  <div className="flex items-center gap-[14px]">
                    {" "}
                    <span className="text-[22px] text-[#4f463d]">◴</span>{" "}
                    <span className="text-[16px] text-[#2b241d]">
                      {item.title}
                    </span>{" "}
                  </div>

                  <div className="flex items-center gap-[14px]">
                    {" "}
                    <span
                      className={`min-w-[110px] text-right text-[#2a241d] ${
                        item.active
                          ? "text-[18px] font-bold"
                          : "text-[16px] font-medium"
                      }`}
                    >
                      {item.time}
                    </span>
                    {item.active ? (
                      <div className="flex h-[32px] w-[32px] items-center justify-center rounded-full border border-[#6d5b1a] bg-[#f2d541] text-[13px] font-bold text-[#3d3210]">
                        ❚❚
                      </div>
                    ) : (
                      <div className="flex w-[24px] items-center justify-center text-[18px] text-[#4c4339]">
                        ▶
                      </div>
                    )}
                    <span className="text-[26px] leading-none text-[#4a433c]">
                      ⋮
                    </span>{" "}
                  </div>
                </div>
              ))}
            </section>
            <section className="flex items-center justify-center rounded-[26px] border-none bg-[#f7f4ef]">
              {" "}
              <div className="flex flex-col items-center gap-[8px] text-[18px] font-bold text-[#1f1a14]">
                <div className="text-[34px] leading-none">＋</div>
                <div className="text-[15px] font-bold">Add widget</div>
              </div>
            </section>
          </div>
        </>
      </main>
    </div>
  );
}
