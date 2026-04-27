import { useEffect, useMemo, useState } from "react";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  const [profile, setProfile] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [links, setLinks] = useState([]);
  const [newLink, setNewLink] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [linkToDelete, setLinkToDelete] = useState(null);
  useEffect(() => {
    const fetchNotificationsData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [notificationsRes, profileRes] = await Promise.all([
          fetch("https://achievo-59su.onrender.com/notifications", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("https://achievo-59su.onrender.com/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const notificationsData = await notificationsRes.json();
        const profileData = await profileRes.json();

        setNotifications(
          Array.isArray(notificationsData) ? notificationsData : [],
        );
        setProfile(profileData);
      } catch (err) {
        console.error("Fetch notifications error:", err);
      }
    };

    fetchNotificationsData();

    const interval = setInterval(fetchNotificationsData, 30000);

    return () => clearInterval(interval);
  }, []);

  const notificationItems = useMemo(() => {
    return notifications.map((task) => ({
      id: `task-${task.id}`,
      type: "Task",
      title: task.title,
      message: task.completed
        ? "Task completed."
        : "Task notification time has arrived.",
      completed: task.completed,
      deadline:
        task.task_day_option === "custom"
          ? task.task_custom_date
          : task.task_day_option === "today"
            ? "Today"
            : task.task_day_option === "tomorrow"
              ? "Tomorrow"
              : "No deadline",
      project: task.category_name || "No category",
      priority: task.priority || "No priority",
      assignee: profile?.name || "Me",
      avatar: profile?.profile_image
        ? `https://achievo-59su.onrender.com${profile.profile_image}`
        : "/default-profile.png",
      raw: task,
    }));
  }, [notifications, profile]);
  const currentNotification = selectedNotification || notificationItems[0];

  useEffect(() => {
    const fetchAttachments = async () => {
      if (!currentNotification?.raw?.id) {
        setAttachments([]);
        return;
      }

      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `https://achievo-59su.onrender.com/tasks/${currentNotification.raw.id}/attachments`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const data = await res.json();
        setAttachments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch notification attachments error:", err);
        setAttachments([]);
      }
    };

    fetchAttachments();
  }, [currentNotification?.raw?.id]);

  useEffect(() => {
    const fetchLinks = async () => {
      if (!currentNotification?.raw?.id) {
        setLinks([]);
        return;
      }

      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `https://achievo-59su.onrender.com/tasks/${currentNotification.raw.id}/links`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const data = await res.json();
        setLinks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch notification links error:", err);
        setLinks([]);
      }
    };

    fetchLinks();
  }, [currentNotification?.raw?.id]);

  const handleAddLink = async () => {
    if (!newLink.trim() || !currentNotification?.raw?.id) return;

    let formattedLink = newLink.trim();

    // auto add https
    if (
      !formattedLink.startsWith("http://") &&
      !formattedLink.startsWith("https://")
    ) {
      formattedLink = "https://" + formattedLink;
    }

    let isValid = false;

    try {
      new URL(formattedLink);
      isValid = true;
    } catch {
      isValid = false;
    }

    if (!isValid) {
      setLinkError("Please input a valid link");
      return;
    }

    setLinkError("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `https://achievo-59su.onrender.com/tasks/${currentNotification.raw.id}/links`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ url: formattedLink }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save link");
      }

      setLinks((prev) => [data, ...prev]);
      setNewLink("");
      setShowLinkInput(false);
    } catch (err) {
      console.error("Add link error:", err);
    }
  };
  const handleDeleteLink = async () => {
    if (!linkToDelete) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `https://achievo-59su.onrender.com/tasks/${currentNotification.raw.id}/links/${linkToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error("Failed to delete link");
      }

      setLinks((prev) => prev.filter((link) => link.id !== linkToDelete.id));
      setLinkToDelete(null);
    } catch (err) {
      console.error("Delete link error:", err);
    }
  };
  return (
    <div className="grid h-full min-h-0 grid-cols-[420px_1fr] gap-[18px]">
      <section className="min-h-0 overflow-hidden rounded-[28px] border border-[#ece5db] bg-[#fbf9f6]">
        <div className="flex items-center justify-between border-b border-[#ece5db] px-[24px] py-[20px]">
          <h2 className="text-[18px] font-bold text-[#1f1a14]">
            Latest notifications
          </h2>
          <button
            type="button"
            className="border-none bg-transparent text-[26px] leading-none text-[#4a433c]"
          >
            ⋮
          </button>
        </div>

        <div className="h-[calc(100%-72px)] overflow-y-auto">
          {notificationItems.length === 0 ? (
            <div className="px-[22px] py-[24px] text-[14px] text-[#8a8176]">
              No notifications yet.
            </div>
          ) : (
            notificationItems.map((item, index) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setSelectedNotification(item)}
                className={`grid grid-cols-[36px_minmax(0,1fr)_38px] items-start gap-[10px] border-b border-[#ece5db] px-[22px] py-[18px] text-left ${
                  item.active
                    ? "border-l-[8px] border-l-[#f2d541] bg-[#f3efe2]"
                    : ""
                }`}
              >
                <>
                  {" "}
                  <div
                    className={`flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full border self-start mt-[4px] ${
                      item.completed
                        ? "border-[#b8942f] bg-[#f2d541] text-[14px] font-bold text-[#2d261d]"
                        : "border-[#8e867d] bg-transparent"
                    }`}
                  >
                    {item.completed ? "✓" : ""}
                  </div>
                  <div className="min-w-0 flex flex-col items-start">
                    {" "}
                    <div
                      className={`max-w-[240px] truncate text-[16px] font-bold text-[#2a241d] ${
                        item.completed ? "line-through text-[#6e6961]" : ""
                      }`}
                    >
                      {item.title}
                    </div>
                    <div className="mt-[8px] text-[14px] text-[#7d7680]">
                      {item.message}
                    </div>
                  </div>
                </>
                <img
                  src={item.avatar}
                  alt="avatar"
                  className="h-[38px] w-[38px] rounded-full border object-cover"
                />
              </button>
            ))
          )}
        </div>
      </section>

      <section className="flex min-h-0 flex-col rounded-[28px] border border-[#ece5db] bg-[#fbf9f6] px-[30px] py-[28px]">
        <div className="flex items-start justify-between gap-[16px]">
          <h1 className="text-[26px] font-medium leading-tight text-[#1f1a14]">
            {currentNotification?.title ?? "No notification selected"}{" "}
          </h1>
        </div>

        <div className="mt-[28px] flex flex-col gap-[18px]">
          <div className="grid grid-cols-[160px_1fr] items-center gap-y-[8px]">
            <div className="flex items-center gap-[12px] text-[14px] text-[#2f2a23]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c1.8-4 4.8-6 8-6s6.2 2 8 6" />
              </svg>{" "}
              <span>Assignee</span>
            </div>
            <div>
              <span className="inline-flex rounded-full bg-[#e6e4e1] px-[14px] py-[5px] text-[13px] text-[#1f1a14]">
                {currentNotification?.assignee ?? "Me"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-[160px_1fr] items-center gap-y-[8px]">
            <div className="flex items-center gap-[12px] text-[14px] text-[#2f2a23]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="4" y="5" width="16" height="15" rx="2" />
                <path d="M8 3v4M16 3v4M4 10h16" />
              </svg>{" "}
              <span>Deadline</span>
            </div>
            <div>
              <span
                className={`inline-flex rounded-full px-[14px] py-[5px] text-[13px] font-semibold ${
                  currentNotification?.deadline === "Today"
                    ? "bg-[#ffe3b3] text-[#b36b00]"
                    : currentNotification?.deadline === "Tomorrow"
                      ? "bg-[#dbeafe] text-[#1e40af]"
                      : currentNotification?.raw?.task_day_option === "custom"
                        ? "bg-[#e7d3b3] text-[#6b4f2c]"
                        : "bg-[#f0f0f0] text-[#666]"
                }`}
              >
                {" "}
                {currentNotification?.deadline ?? "No deadline"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-[160px_1fr] items-center gap-y-[8px]">
            <div className="flex items-center gap-[12px] text-[14px] text-[#2f2a23]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M4 6h6l2 2h8v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" />
              </svg>{" "}
              <span>Category</span>{" "}
            </div>
            <div>
              <span
                className="inline-flex rounded-full px-[14px] py-[5px] text-[13px] font-medium"
                className={`inline-flex rounded-full px-[14px] py-[5px] text-[13px] font-medium ${
                  currentNotification?.raw?.category_color ||
                  "bg-[#F5F5FA] text-[#5f574d]"
                }`}
              >
                {currentNotification?.project ?? "No category"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-[160px_1fr] items-center gap-y-[8px]">
            <div className="flex items-center gap-[12px] text-[14px] text-[#2f2a23]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M6 4v16" />
                <path d="M6 5h10l-2 4 2 4H6" />
              </svg>{" "}
              <span>Priority</span>
            </div>
            <div>
              <span
                className="inline-flex rounded-full px-[14px] py-[5px] text-[13px] font-medium"
                className={`inline-flex rounded-full px-[14px] py-[5px] text-[13px] font-medium ${
                  currentNotification?.priority === "high"
                    ? "bg-[#ffd0d0] text-[#c0392b]"
                    : currentNotification?.priority === "medium"
                      ? "bg-[#f5e7a8] text-[#6d5313]"
                      : "bg-[#d5f5e3] text-[#1e8449]"
                }`}
              >
                {" "}
                {currentNotification?.priority
                  ? currentNotification.priority.charAt(0).toUpperCase() +
                    currentNotification.priority.slice(1)
                  : "No priority"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-[34px]">
          <h3 className="text-[16px] font-bold text-[#1f1a14]">Attachments</h3>

          <div className="mt-[14px] flex items-center justify-between rounded-[20px] bg-[#f1eeea] px-[18px] py-[18px]">
            <div className="flex items-center gap-[14px] text-[14px] text-[#2f2a23]">
              <div className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#dfdbd6]">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M21.44 11.05l-8.49 8.49a5.5 5.5 0 01-7.78-7.78l8.49-8.49a3.5 3.5 0 114.95 4.95L9.83 17.01a1.5 1.5 0 01-2.12-2.12l7.78-7.78" />
                </svg>
              </div>
              <div className="flex min-w-0 flex-col gap-[6px]">
                {attachments.length === 0 ? (
                  <span>No files attached yet.</span>
                ) : (
                  attachments.map((file) => (
                    <a
                      key={file.id}
                      href={`https://achievo-59su.onrender.com${file.file_path}`}
                      target="_blank"
                      rel="noreferrer"
                      className="max-w-[520px] truncate text-[#2f2b25] underline"
                    >
                      {file.original_name}
                    </a>
                  ))
                )}
              </div>{" "}
            </div>
          </div>
        </div>

        <div className="mt-[26px]">
          <h3 className="text-[16px] font-bold text-[#1f1a14]">Links</h3>

          <div className="mt-[14px] rounded-[20px] bg-[#f1eeea] px-[18px] py-[18px]">
            <div className="flex items-start gap-[14px] text-[14px] text-[#2f2a23]">
              <div className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full bg-[#f2d541]">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M10 13a5 5 0 007.07 0l2.12-2.12a5 5 0 00-7.07-7.07L10 5" />
                  <path d="M14 11a5 5 0 00-7.07 0L4.81 13.12a5 5 0 007.07 7.07L14 19" />
                </svg>
              </div>

              <div className="flex max-h-[120px] flex-1 flex-col gap-[8px] overflow-y-auto pr-[6px]">
                {" "}
                {links.length === 0 && !showLinkInput && <span>No links</span>}
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between gap-[10px] w-full"
                  >
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="min-w-0 flex-1 truncate text-[#2f2b25] underline"
                    >
                      {link.url}
                    </a>

                    <button
                      type="button"
                      onClick={() => setLinkToDelete(link)}
                      className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full bg-[#fde7e7] text-[#c0392b]"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M4 7h16" />
                        <path d="M9 7V4h6v3" />
                        <path d="M6 7l1 14h10l1-14" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                      </svg>
                    </button>
                  </div>
                ))}
                {showLinkInput && (
                  <div className="flex flex-col gap-[4px]">
                    <div className="flex gap-[8px]">
                      <input
                        type="url"
                        value={newLink}
                        onChange={(e) => {
                          setNewLink(e.target.value);
                          setLinkError(""); // clear error while typing
                        }}
                        placeholder="Paste link here"
                        className={`h-[36px] flex-1 rounded-[10px] px-[12px] text-[13px] outline-none ${
                          linkError
                            ? "border border-red-400 bg-[#fff5f5]"
                            : "border-none bg-white"
                        }`}
                      />

                      <button
                        type="button"
                        onClick={handleAddLink}
                        className="rounded-full border border-[#2f281e] bg-[#a8d6e6] px-[14px] text-[12px] font-bold"
                      >
                        Save
                      </button>
                    </div>

                    {/* 👇 THIS IS THE ERROR TEXT */}
                    {linkError && (
                      <span className="text-[12px] text-red-500">
                        {linkError}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {!showLinkInput && (
                <button
                  type="button"
                  onClick={() => setShowLinkInput(true)}
                  className="shrink-0 border-none bg-transparent text-[14px] font-bold text-[#1f1a14]"
                >
                  ＋ Add
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-[20px] flex items-center justify-end gap-[10px]"></div>
        {linkToDelete && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(0,0,0,0.28)]">
            <div className="w-[360px] rounded-[24px] border border-[#2f281e] bg-white px-[24px] py-[24px] text-center shadow-[0_20px_50px_rgba(0,0,0,0.16)]">
              <div className="mx-auto mb-[14px] flex h-[48px] w-[48px] items-center justify-center rounded-full bg-[#fde7e7] text-[#c0392b]">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 7h16" />
                  <path d="M9 7V4h6v3" />
                  <path d="M6 7l1 14h10l1-14" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                </svg>
              </div>

              <div className="mb-[22px] text-[18px] font-bold text-[#1f1a14]">
                Delete this link?
              </div>

              <div className="flex justify-center gap-[12px]">
                <button
                  type="button"
                  onClick={() => setLinkToDelete(null)}
                  className="rounded-full border border-[#8d8478] bg-white px-[18px] py-[9px] text-[14px] font-medium text-[#2d261d]"
                >
                  No
                </button>

                <button
                  type="button"
                  onClick={handleDeleteLink}
                  className="rounded-full border border-[#d86d6d] bg-[#f58f8f] px-[20px] py-[9px] text-[14px] font-bold text-[#1f1a14]"
                >
                  Yes, delete
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
