import { useEffect, useState } from "react";

export default function TasksView({ tasks = [], toggleTask }) {
  const [profileImage, setProfileImage] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [attachmentToDelete, setAttachmentToDelete] = useState(null);
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:3000/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.profile_image) {
          setProfileImage(`http://localhost:3000${data.profile_image}`);
        } else {
          setProfileImage("/default-profile.png");
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        setProfileImage("/default-profile.png");
      }
    };

    fetchProfile();
  }, []);

  const fetchTaskDetails = async (taskId) => {
    const token = localStorage.getItem("token");

    const commentsRes = await fetch(
      `http://localhost:3000/tasks/${taskId}/comments`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const attachmentsRes = await fetch(
      `http://localhost:3000/tasks/${taskId}/attachments`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    setComments(await commentsRes.json());
    setAttachments(await attachmentsRes.json());
  };

  const handleOpenTaskModal = async (task) => {
    setSelectedTask(task);
    setCommentText("");
    await fetchTaskDetails(task.id);
  };
  const handleDeleteComment = async (commentId) => {
    if (!selectedTask) return;

    const token = localStorage.getItem("token");

    await fetch(
      `http://localhost:3000/tasks/${selectedTask.id}/comments/${commentId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    await fetchTaskDetails(selectedTask.id);
  };
  const handleSaveComment = async () => {
    if (!commentText.trim() || !selectedTask) return;

    const token = localStorage.getItem("token");

    await fetch(`http://localhost:3000/tasks/${selectedTask.id}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ comment: commentText }),
    });

    setCommentText("");
    await fetchTaskDetails(selectedTask.id);
  };
  const handleDeleteAttachment = async (attachmentId) => {
    if (!selectedTask) return;

    const token = localStorage.getItem("token");

    await fetch(
      `http://localhost:3000/tasks/${selectedTask.id}/attachments/${attachmentId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    await fetchTaskDetails(selectedTask.id);
  };
  const handleUploadAttachment = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTask) return;

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);

    await fetch(`http://localhost:3000/tasks/${selectedTask.id}/attachments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    await fetchTaskDetails(selectedTask.id);
  };
  const sections = [
    {
      title: "Today",
      items: tasks.filter((t) => t.task_day_option === "today"),
    },
    {
      title: "Tomorrow",
      items: tasks.filter((t) => t.task_day_option === "tomorrow"),
    },
    {
      title: "Custom Date",
      items: tasks.filter((t) => t.task_day_option === "custom"),
    },
  ];
  return (
    <div className="flex h-full min-h-0 flex-col gap-[14px] overflow-hidden pr-[6px]">
      {" "}
      {sections.map((section, i) => (
        <div
          key={i}
          className="bg-[#fbf9f6] border border-[#ece5db] rounded-[26px] flex flex-col h-[190px] shrink-0 overflow-hidden"
        >
          {/* Header */}
          <div className="px-[20px] pt-[16px] pb-[10px] font-bold text-[18px] text-[#1f1a14] shrink-0">
            {" "}
            {section.title}
          </div>

          <div className="grid grid-cols-[60px_minmax(0,1.7fr)_120px_140px_120px_140px_90px] pl-[40px] pr-[20px] py-[8px] text-[12px] text-[#7a7268] shrink-0 border-b border-[#ece5db]">
            {" "}
            <div></div>
            <div className="text-left">TASK</div>
            <div className="text-center">DUE DATE</div>
            <div className="text-center">STAGE</div>
            <div className="text-center">PRIORITY</div>
            <div className="text-center">CATEGORY</div>
            <div className="text-center">ASSIGNEE</div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            {" "}
            {section.items.length === 0 ? (
              <div className="border-t border-[#ece5db] px-[20px] py-[30px] text-[14px] text-[#8a8176] flex justify-center items-center">
                No tasks assigned.
              </div>
            ) : (
              section.items.map((task, idx) => (
                <div
                  key={idx}
                  onClick={() => handleOpenTaskModal(task)}
                  className="grid grid-cols-[40px_minmax(0,1.7fr)_120px_140px_120px_140px_90px] items-center pl-[40px] pr-[20px] py-[14px] border-t border-[#ece5db] min-w-0 cursor-pointer hover:bg-[#f7f4ef]"
                >
                  {/* checkbox */}
                  <div className="w-[18px] h-[18px] border border-[#aaa] rounded-full"></div>

                  {/* task name */}
                  <div className="min-w-0">
                    <div
                      className={`text-[14px] ${
                        task.completed
                          ? "line-through text-[#8f877b]"
                          : "text-[#2f2b25]"
                      } truncate overflow-hidden whitespace-nowrap`}
                    >
                      {task.title}
                    </div>
                  </div>
                  {/* due */}
                  <div className="flex justify-center text-[13px] text-[#b58b3c]">
                    {" "}
                    {task.task_day_option === "custom"
                      ? task.task_custom_date
                      : task.task_day_option === "today"
                        ? "Today"
                        : "Tomorrow"}
                  </div>

                  {/* stage */}
                  <div className="flex justify-center">
                    <span
                      className={`px-[10px] py-[4px] rounded-full text-[11px] font-medium ${
                        task.completed
                          ? "bg-[#c8f2d8] text-[#2f6a4f]"
                          : "bg-[#f2d541] text-[#1f1a14]"
                      }`}
                    >
                      {task.completed ? "Done" : "In Progress"}
                    </span>
                  </div>
                  <div className="flex justify-center">
                    <span
                      className={`px-[10px] py-[4px] rounded-full text-[11px] font-medium ${
                        task.priority === "high"
                          ? "bg-[#ffd0d0] text-[#c0392b]"
                          : task.priority === "medium"
                            ? "bg-[#f5e7a8] text-[#6d5313]"
                            : "bg-[#d5f5e3] text-[#1e8449]"
                      }`}
                    >
                      {task.priority.charAt(0).toUpperCase() +
                        task.priority.slice(1)}
                    </span>
                  </div>
                  {/* category */}
                  <div className="flex justify-center">
                    {task.category_name && (
                      <span
                        className={`px-[10px] py-[4px] rounded-full text-[11px] font-medium ${
                          task.category_color || "bg-[#F5F5FA] text-[#5f574d]"
                        }`}
                      >
                        {task.category_name}
                      </span>
                    )}
                  </div>

                  {/* assignee */}
                  <div className="flex items-center justify-center">
                    {" "}
                    <img
                      src={profileImage}
                      alt="me"
                      className="w-[30px] h-[25px] rounded-full object-cover border"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
      {attachmentToDelete && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[rgba(0,0,0,0.28)]">
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
              Are you sure you want to delete?
            </div>

            <div className="flex justify-center gap-[12px]">
              <button
                type="button"
                onClick={() => setAttachmentToDelete(null)}
                className="rounded-full border border-[#8d8478] bg-white px-[18px] py-[9px] text-[14px] font-medium text-[#2d261d]"
              >
                No
              </button>

              <button
                type="button"
                onClick={async () => {
                  await handleDeleteAttachment(attachmentToDelete);
                  setAttachmentToDelete(null);
                }}
                className="rounded-full border border-[#d86d6d] bg-[#f58f8f] px-[20px] py-[9px] text-[14px] font-bold text-[#1f1a14]"
              >
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}
      {commentToDelete && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[rgba(0,0,0,0.28)]">
          <div className="w-[360px] rounded-[24px] border border-[#2f281e] bg-white px-[24px] py-[24px] text-center shadow-[0_20px_50px_rgba(0,0,0,0.16)]">
            <div className="mx-auto mb-[14px] flex h-[48px] w-[48px] items-center justify-center rounded-full bg-[#fde7e7] text-[#c0392b]">
              <svg
                width="24"
                height="24"
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
              Are you sure you want to delete?
            </div>

            <div className="flex justify-center gap-[12px]">
              <button
                type="button"
                onClick={() => setCommentToDelete(null)}
                className="rounded-full border border-[#8d8478] bg-white px-[18px] py-[9px] text-[14px] font-medium text-[#2d261d]"
              >
                No
              </button>

              <button
                type="button"
                onClick={async () => {
                  await handleDeleteComment(commentToDelete);
                  setCommentToDelete(null);
                }}
                className="rounded-full border border-[#d86d6d] bg-[#f58f8f] px-[20px] py-[9px] text-[14px] font-bold text-[#1f1a14]"
              >
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}
      {selectedTask && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(0,0,0,0.28)]">
          <div className="flex h-[640px] w-[900px] max-w-[94vw] overflow-hidden rounded-[24px] bg-[#fbf9f6] shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <div className="w-[320px] border-r border-[#e4ded5] bg-[#fbf9f6]">
              <div className="flex items-center gap-[26px] border-b border-[#e4ded5] px-[32px] py-[20px] text-[#3b342b]">
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="14" height="14" rx="3" />
                </svg>

                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 6v6l4 2" />
                  <circle cx="12" cy="12" r="9" />
                </svg>

                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 3v18" />
                  <path d="M5 3h10l-2 4 2 4H5" />
                </svg>
              </div>

              <div className="px-[32px] py-[34px]">
                <h2 className="mb-[16px] text-[34px] font-bold leading-[1.15] text-[#111]">
                  {selectedTask.title}
                </h2>

                <p className="text-[15px] leading-[1.45] text-[#2f2b25]">
                  {selectedTask.description || "No description provided."}
                </p>
              </div>

              <div className="border-t border-[#e4ded5] px-[32px] py-[26px]">
                <h3 className="mb-[22px] text-[18px] font-bold">Info</h3>

                <div className="flex flex-col gap-[18px] text-[14px]">
                  <div className="grid grid-cols-[120px_1fr] items-center">
                    <div className="flex items-center gap-[10px] text-[#3b342b]">
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="3" y="4" width="12" height="10" rx="2" />
                      </svg>{" "}
                      <span>Category</span>
                    </div>
                    <span
                      className={`w-max rounded-full px-[12px] py-[5px] text-[12px] font-medium ${
                        selectedTask.category_color ||
                        "bg-[#F5F5FA] text-[#5f574d]"
                      }`}
                    >
                      {selectedTask.category_name || "No category"}
                    </span>
                  </div>

                  <div className="grid grid-cols-[120px_1fr] items-center">
                    <div className="flex items-center gap-[10px] text-[#3b342b]">
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M4 6h10M4 12h10" />
                      </svg>{" "}
                      <span>Priority</span>
                    </div>
                    <span
                      className={`w-max rounded-full px-[12px] py-[5px] text-[12px] font-medium ${
                        selectedTask.priority === "high"
                          ? "bg-[#ffd0d0] text-[#c0392b]"
                          : selectedTask.priority === "medium"
                            ? "bg-[#f5e7a8] text-[#6d5313]"
                            : "bg-[#d5f5e3] text-[#1e8449]"
                      }`}
                    >
                      {selectedTask.priority
                        ? selectedTask.priority.charAt(0).toUpperCase() +
                          selectedTask.priority.slice(1)
                        : "No priority"}
                    </span>
                  </div>

                  <div className="grid grid-cols-[120px_1fr] items-center">
                    <div className="flex items-center gap-[10px] text-[#3b342b]">
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="9" cy="10" r="6" />
                        <path d="M9 10l3-2" />
                        <path d="M7 2h4" />
                      </svg>{" "}
                      <span>Deadline</span>
                    </div>
                    <span
                      className={`w-max rounded-full px-[12px] py-[5px] text-[12px] font-medium ${
                        selectedTask.task_day_option === "today"
                          ? "bg-[#ffe3b3] text-[#b36b00]" // orange
                          : selectedTask.task_day_option === "tomorrow"
                            ? "bg-[#dbeafe] text-[#1e40af]" // blue
                            : selectedTask.task_day_option === "custom"
                              ? "bg-[#e7d3b3] text-[#6b4f2c]" // brown
                              : "bg-[#f0f0f0] text-[#666]"
                      }`}
                    >
                      {selectedTask.task_day_option === "custom"
                        ? selectedTask.task_custom_date
                        : selectedTask.task_day_option === "today"
                          ? "Today"
                          : selectedTask.task_day_option === "tomorrow"
                            ? "Tomorrow"
                            : "Empty"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-1 flex-col bg-[#f3f0ec] px-[30px] py-[24px]">
              <div className="mb-[34px] flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="text-[34px] leading-none text-[#2f2b25]"
                >
                  <svg
                    width="26"
                    height="26"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  >
                    <path d="M6 6l14 14M20 6L6 20" />
                  </svg>
                </button>
              </div>

              <div className="rounded-[24px] bg-white px-[28px] py-[24px]">
                <div className="flex items-start gap-[14px]">
                  <img
                    src={profileImage}
                    alt="me"
                    className="h-[32px] w-[32px] rounded-full border object-cover"
                  />

                  <div className="flex-1">
                    <div className="mb-[8px] flex items-center justify-between">
                      <div className="font-bold text-[#111]">Me</div>
                      <div className="text-[13px] text-[#7a7268]">
                        Task created by you
                      </div>
                    </div>
                    <div className="text-[14px] text-[#2f2b25]">
                      {comments.length === 0 ? (
                        <span className="text-[#8a8176]">No comments yet.</span>
                      ) : (
                        comments.map((item) => (
                          <div
                            key={item.id}
                            className="mb-[10px] flex items-center justify-between gap-[12px]"
                          >
                            <span className="break-words">{item.comment}</span>

                            <button
                              type="button"
                              onClick={() => setCommentToDelete(item.id)}
                              className="shrink-0 text-[12px] font-bold text-[#c0392b] hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-[24px]">
                <h3 className="mb-[14px] text-[18px] font-bold">Attachments</h3>

                <div className="rounded-[16px] bg-white px-[22px] py-[18px] text-[14px] text-[#8a8176]">
                  {attachments.length === 0
                    ? "No files attached yet."
                    : attachments.map((file) => (
                        <div
                          key={file.id}
                          className="mb-[8px] flex items-center justify-between gap-[12px]"
                        >
                          <a
                            href={`http://localhost:3000${file.file_path}`}
                            target="_blank"
                            rel="noreferrer"
                            className="min-w-0 truncate text-[#2f2b25] underline"
                          >
                            {file.original_name}
                          </a>

                          <button
                            type="button"
                            onClick={() => setAttachmentToDelete(file.id)}
                            className="shrink-0 flex items-center justify-center w-[25px] h-[25px] rounded-full bg-[#fde7e7] text-[#c0392b] hover:bg-[#f8d7d7]"
                          >
                            <svg
                              width="16"
                              height="16"
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
                      ))}{" "}
                </div>
              </div>

              <div className="mt-auto rounded-[18px] bg-white px-[20px] py-[14px]">
                <div className="flex items-center gap-[12px]">
                  {/* 📎 Attach button */}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleUploadAttachment}
                    />
                    <svg
                      width="20"
                      height="20"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    >
                      <path d="M8 12l5-5a3 3 0 014 4l-7 7a5 5 0 01-7-7l8-8" />
                    </svg>
                  </label>

                  {/* 💬 Input */}
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Comment, or type / for comment"
                    className="h-[42px] flex-1 rounded-[12px] border-none bg-[#f3f0ec] px-[14px] text-[14px] outline-none"
                  />

                  <button
                    type="button"
                    onClick={handleSaveComment}
                    className="flex h-[42px] w-[42px] items-center justify-center rounded-full border border-[#2f281e] bg-[#f2d541]"
                  >
                    <span className="text-[14px] font-semibold">➤</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
