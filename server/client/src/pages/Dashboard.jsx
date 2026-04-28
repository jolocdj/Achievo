import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import TasksView from "./TasksView";
import Notifications from "./Notifications";
import Settings from "./Settings";
import Logout from "./Logout";
import Tabs from "./Tabs";
import { useLocation } from "react-router-dom";
export default function Dashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [taskError, setTaskError] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("https://achievo-59su.onrender.com/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("FETCH TASKS RESPONSE:", data);
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const raw = Array.isArray(data)
        ? data
        : Array.isArray(data.tasks)
          ? data.tasks
          : Array.isArray(data.data)
            ? data.data
            : [];
      const sorted = raw
        .slice()
        .sort(
          (a, b) =>
            (priorityOrder[a.priority?.toLowerCase()] ?? 3) -
            (priorityOrder[b.priority?.toLowerCase()] ?? 3),
        );
      setTasks(sorted);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setTasks([]);
    }
  };
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("https://achievo-59su.onrender.com/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return;

      const data = await res.json();
      setProfileName(data.name || data.username || "User");
      setProfileImage(
        data.profile_image && data.profile_image !== "/default-profile.png"
          ? `https://achievo-59su.onrender.com${data.profile_image}`
          : "/default-profile.png",
      );
    } catch (err) {
      console.error("Fetch profile error:", err);
      setProfileImage("/default-profile.png");
    } finally {
      setProfileLoading(false);
    }
  };
  useEffect(() => {
    fetchTasks();
    fetchReminders();
    fetchCategories();
    fetchTrackers();
    fetchProfile();
  }, []);
  const handleDeleteTask = async () => {
    if (!selectedTask) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `https://achievo-59su.onrender.com/tasks/${selectedTask.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();
      console.log("DELETE TASK RESPONSE:", data);

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete task");
      }

      setShowDeleteTaskModal(false);
      setShowTaskDetailsModal(false);
      setSelectedTask(null);
      await fetchTasks();
    } catch (err) {
      console.error("Delete task error:", err);
    }
  };
  const handleEditTask = () => {
    if (!selectedTask) return;

    setTaskTitle(selectedTask.title || "");
    setTaskSelectedCategory(
      categories.find((category) => category.id === selectedTask.category_id) ||
        null,
    );
    setTaskDayOption(selectedTask.task_day_option || "today");
    setTaskCustomDay(selectedTask.task_custom_date || "+ Custom");
    setTaskNotificationDate(
      selectedTask.notification_date
        ? selectedTask.notification_date.split("T")[0]
        : "",
    );
    setTaskNotificationTime(
      selectedTask.notification_time
        ? selectedTask.notification_time.slice(0, 5)
        : "",
    );
    setTaskPriority(selectedTask.priority || "");
    setTaskDescription(selectedTask.description || "");
    setTaskError("");
    setIsEditingTask(true);
    setShowTaskDetailsModal(false);
    setShowTaskModal(true);
  };
  const toggleTask = async (task) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(`https://achievo-59su.onrender.com/tasks/${task.id}`, {
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
  const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);
  const [showDeleteTaskModal, setShowDeleteTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditingTaskDetails, setIsEditingTaskDetails] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(
    localStorage.getItem("activeTab") ||
      location.state?.activeTab ||
      "dashboard",
  );

  useEffect(() => {
    fetchProfile();
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchResults(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [taskTitle, setTaskTitle] = useState("");
  const [titleError, setTitleError] = useState("");
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
  const handleOpenTaskDetails = (task) => {
    setSelectedTask(task);
    setIsEditingTaskDetails(false);
    setShowTaskDetailsModal(true);
  };

  const handleOpenReminderDetails = (reminder) => {
    setSelectedReminder(reminder);

    const deadlineDate = reminder.deadline
      ? new Date(reminder.deadline.replace(" ", "T"))
      : null;
    setReminderDetailTitle(reminder.title || "");
    setReminderDetailDate(
      deadlineDate ? deadlineDate.toISOString().slice(0, 10) : "",
    );
    setReminderDetailTime(
      deadlineDate
        ? `${String(deadlineDate.getHours()).padStart(2, "0")}:${String(deadlineDate.getMinutes()).padStart(2, "0")}`
        : "",
    );
    setReminderDetailDescription(reminder.description || "");
    setReminderDetailError("");
    setIsEditingReminderDetails(false);
    setShowReminderDetailsModal(true);
  };

  const handleAccomplishReminder = () => {
    if (!selectedReminder) return;

    setReminders((prev) =>
      prev.map((reminder) =>
        reminder.id === selectedReminder.id
          ? { ...reminder, accomplished: !reminder.accomplished }
          : reminder,
      ),
    );

    setSelectedReminder((prev) =>
      prev ? { ...prev, accomplished: !prev.accomplished } : prev,
    );
  };

  const handleDeleteReminder = async () => {
    if (!selectedReminder) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `https://achievo-59su.onrender.com/reminders/${selectedReminder.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();
      console.log("DELETE REMINDER RESPONSE:", data);

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete reminder");
      }

      setReminders((prev) =>
        prev.filter((reminder) => reminder.id !== selectedReminder.id),
      );
      setShowDeleteReminderModal(false);
      setShowReminderDetailsModal(false);
      setSelectedReminder(null);

      await fetchReminders();
    } catch (err) {
      console.error("Delete reminder error:", err);
    }
  };
  const [categories, setCategories] = useState([]);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [customCategoryName, setCustomCategoryName] = useState("");
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        customCategoryRef.current &&
        !customCategoryRef.current.contains(e.target)
      ) {
        setCustomCategoryName("");
        setIsAddingCustomCategory(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const customCategoryRef = useRef(null);
  const [taskSelectedCategory, setTaskSelectedCategory] = useState(null);
  const [taskDayOption, setTaskDayOption] = useState("today");
  const [taskCustomDay, setTaskCustomDay] = useState("+ Custom");
  const [taskNotificationDate, setTaskNotificationDate] = useState("");
  const [taskNotificationTime, setTaskNotificationTime] = useState("");
  const [taskPriority, setTaskPriority] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [showTrackerModal, setShowTrackerModal] = useState(false);
  const [trackerTitle, setTrackerTitle] = useState("");
  const [trackerTimer, setTrackerTimer] = useState("");
  const [trackerError, setTrackerError] = useState("");
  const [trackerDetailError, setTrackerDetailError] = useState("");
  const [tracking, setTracking] = useState([]);
  const [activeTrackerId, setActiveTrackerId] = useState(null);
  const tickAudioRef = useRef(null);
  const [showTrackerDetailsModal, setShowTrackerDetailsModal] = useState(false);
  const [selectedTracker, setSelectedTracker] = useState(null);
  const [trackerDetailTitle, setTrackerDetailTitle] = useState("");
  const [trackerDetailRemainingSeconds, setTrackerDetailRemainingSeconds] =
    useState(0);
  const [trackerDetailDone, setTrackerDetailDone] = useState(false);
  const [isEditingTrackerDetails, setIsEditingTrackerDetails] = useState(false);
  const [showDeleteTrackerModal, setShowDeleteTrackerModal] = useState(false);
  const [trackerDetailTimerInput, setTrackerDetailTimerInput] = useState("");

  const isTrackerDetailsDirty =
    selectedTracker &&
    (trackerDetailTitle !== (selectedTracker.title || "") ||
      trackerDetailRemainingSeconds !==
        (Number(selectedTracker.remainingSeconds) || 0) ||
      trackerDetailDone !== !!selectedTracker.done);

  const fetchTrackers = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("https://achievo-59su.onrender.com/trackers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setTracking(
        Array.isArray(data)
          ? data.map((t) => ({
              ...t,
              totalSeconds: t.total_seconds,
              remainingSeconds: t.remaining_seconds,
            }))
          : [],
      );
    } catch (err) {
      console.error("Error fetching trackers:", err);
      setTracking([]);
    }
  };

  useEffect(() => {
    if (!activeTrackerId) return;

    const interval = setInterval(() => {
      setTracking((prev) =>
        prev.map((item) => {
          if (item.id !== activeTrackerId) return item;

          const currentValue = Number(item.remainingSeconds) || 0;
          const nextValue = Math.max(0, currentValue - 1);

          if (nextValue === 0) {
            setActiveTrackerId(null);

            if (tickAudioRef.current) {
              tickAudioRef.current.pause();
              tickAudioRef.current.currentTime = 0;
            }
          }

          const token = localStorage.getItem("token");

          fetch(`https://achievo-59su.onrender.com/trackers/${item.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              remaining_seconds: nextValue,
            }),
          }).catch((err) => console.error("Update tracker error:", err));

          return {
            ...item,
            remainingSeconds: nextValue,
          };
        }),
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTrackerId]);

  const getRandomCategoryColor = () => {
    const colors = [
      "bg-[#f6d7d7] text-[#7a3d3d]",
      "bg-[#f8e3c2] text-[#7a5a1f]",
      "bg-[#d8e8ff] text-[#325a8c]",
      "bg-[#d9f0e4] text-[#2f6a4f]",
      "bg-[#f7d9ea] text-[#8a3a68]",
      "bg-[#d7efe0] text-[#2f6c52]",
      "bg-[#efe2c8] text-[#6f5521]",
      "bg-[#e7dcff] text-[#5a4291]",
      "bg-[#ffe3d6] text-[#8c5332]",
      "bg-[#dff1ff] text-[#2d617d]",
      "bg-[#d8f4f1] text-[#256b67]",
      "bg-[#F5F5FA] text-[#5f574d]",
    ];

    return colors[Math.floor(Math.random() * colors.length)];
  };
  const categoryChoices = [
    { name: "Home", color: "bg-[#f6d7d7] text-[#7a3d3d]" },
    { name: "Errands", color: "bg-[#f8e3c2] text-[#7a5a1f]" },
    { name: "School", color: "bg-[#d8e8ff] text-[#325a8c]" },
    { name: "Work", color: "bg-[#d9f0e4] text-[#2f6a4f]" },
    { name: "Health", color: "bg-[#f7d9ea] text-[#8a3a68]" },
    { name: "Fitness", color: "bg-[#d7efe0] text-[#2f6c52]" },
    { name: "Finance", color: "bg-[#efe2c8] text-[#6f5521]" },
    { name: "Shopping", color: "bg-[#e7dcff] text-[#5a4291]" },
    { name: "Family", color: "bg-[#ffe3d6] text-[#8c5332]" },
    { name: "Friends", color: "bg-[#dff1ff] text-[#2d617d]" },
    { name: "Travel", color: "bg-[#d8f4f1] text-[#256b67]" },
    { name: "Personal", color: "bg-[#F5F5FA] text-[#5f574d]" },
  ];

  const parseTimerToSeconds = (value) => {
    const text = value.trim().toLowerCase();

    const hrMatch = text.match(/(\d+)\s*h(r)?/);
    const minMatch = text.match(/(\d+)\s*m(in)?/);
    const secMatch = text.match(/(\d+)\s*s(ec)?/);

    const hours = hrMatch ? parseInt(hrMatch[1], 10) : 0;
    const minutes = minMatch ? parseInt(minMatch[1], 10) : 0;
    const seconds = secMatch ? parseInt(secMatch[1], 10) : 0;

    if (!hours && !minutes && !seconds && /^\d+$/.test(text)) {
      return parseInt(text, 10) * 60;
    }

    return hours * 3600 + minutes * 60 + seconds;
  };

  const formatSeconds = (totalSeconds) => {
    const safe = Math.max(0, totalSeconds);
    const hours = Math.floor(safe / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    const seconds = safe % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }

    return `${minutes}m ${seconds}s`;
  };

  const handleToggleTracker = (trackerId) => {
    setActiveTrackerId((prev) => {
      const isStarting = prev !== trackerId;

      if (tickAudioRef.current) {
        if (isStarting) {
          tickAudioRef.current.currentTime = 0;
          tickAudioRef.current.play().catch(() => {});
        } else {
          tickAudioRef.current.pause();
          tickAudioRef.current.currentTime = 0;
        }
      }

      return isStarting ? trackerId : null;
    });
  };

  const handleOpenTrackerDetails = (tracker) => {
    setSelectedTracker(tracker);
    setTrackerDetailTitle(tracker.title || "");
    setTrackerDetailRemainingSeconds(Number(tracker.remainingSeconds) || 0);
    setTrackerDetailDone(!!tracker.done);
    setIsEditingTrackerDetails(false);
    setShowTrackerDetailsModal(true);
  };
  const handleSaveTracker = async () => {
    if (!trackerTitle.trim()) {
      setTrackerError("Please add a task title");
      return;
    }

    if (!trackerTimer.trim()) {
      setTrackerError("Please set a timer");
      return;
    }

    setTrackerError("");
    const totalSeconds = parseTimerToSeconds(trackerTimer);

    if (totalSeconds <= 0) {
      setTrackerError("Please set a valid timer");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("https://achievo-59su.onrender.com/trackers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: trackerTitle.trim(),
          total_seconds: totalSeconds,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save tracker");
      }

      setTrackerTitle("");
      setTrackerTimer("");
      setTrackerError("");
      setShowTrackerModal(false);
      await fetchTrackers();
    } catch (err) {
      console.error("Create tracker error:", err);
      setTrackerError(err.message || "Failed to save tracker");
    }
  };
  const handleDeleteTracker = async () => {
    if (!selectedTracker) return;

    try {
      const token = localStorage.getItem("token");

      await fetch(
        `https://achievo-59su.onrender.com/trackers/${selectedTracker.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setTracking((prev) =>
        prev.filter((item) => item.id !== selectedTracker.id),
      );
      setShowDeleteTrackerModal(false);
      setSelectedTracker(null);
    } catch (err) {
      console.error("Delete tracker error:", err);
    }
  };

  const handleDoneTracker = async () => {
    if (!selectedTracker) return;

    try {
      const token = localStorage.getItem("token");

      await fetch(
        `https://achievo-59su.onrender.com/trackers/${selectedTracker.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: trackerDetailTitle.trim(),
            remaining_seconds: 0,
            done: true,
          }),
        },
      );

      setTracking((prev) =>
        prev.map((item) =>
          item.id === selectedTracker.id
            ? {
                ...item,
                title: trackerDetailTitle.trim(),
                remainingSeconds: 0,
                done: true,
              }
            : item,
        ),
      );

      setSelectedTracker((prev) =>
        prev
          ? {
              ...prev,
              title: trackerDetailTitle.trim(),
              remainingSeconds: 0,
              done: true,
            }
          : prev,
      );
      setShowTrackerDetailsModal(false);
    } catch (err) {
      console.error("Done tracker error:", err);
    }
  };

  const handleSaveTrackerDetails = async () => {
    if (!selectedTracker) return;

    if (!trackerDetailTitle.trim()) {
      setTrackerDetailError("Task title is required");
      return;
    }

    setTrackerDetailError("");

    try {
      const token = localStorage.getItem("token");

      await fetch(
        `https://achievo-59su.onrender.com/trackers/${selectedTracker.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: trackerDetailTitle.trim(),
            remaining_seconds: trackerDetailRemainingSeconds,
            done: trackerDetailDone,
          }),
        },
      );

      setTracking((prev) =>
        prev.map((item) =>
          item.id === selectedTracker.id
            ? {
                ...item,
                title: trackerDetailTitle.trim(),
                remainingSeconds: trackerDetailRemainingSeconds,
                done: trackerDetailDone,
              }
            : item,
        ),
      );

      setSelectedTracker((prev) =>
        prev
          ? {
              ...prev,
              title: trackerDetailTitle.trim(),
              remainingSeconds: trackerDetailRemainingSeconds,
              done: trackerDetailDone,
            }
          : prev,
      );
      setIsEditingTrackerDetails(false);

      setShowTrackerDetailsModal(false);
    } catch (err) {
      console.error("Save tracker details error:", err);
      setTrackerDetailError("Failed to save tracker");
    }
  };
  const handleSelectCategory = (category) => {
    if (selectedCategories.some((item) => item.name === category.name)) return;
    setSelectedCategories((prev) => [...prev, category]);
  };
  const handleAddCustomCategory = () => {
    const name = customCategoryName.trim();

    if (!name) return;

    const alreadyExists =
      selectedCategories.some(
        (category) => category.name.toLowerCase() === name.toLowerCase(),
      ) ||
      categories.some(
        (category) => category.name.toLowerCase() === name.toLowerCase(),
      );

    if (alreadyExists) {
      setCustomCategoryName("");
      setIsAddingCustomCategory(false);
      return;
    }

    setSelectedCategories((prev) => [
      ...prev,
      {
        name,
        color: getRandomCategoryColor(),
      },
    ]);

    setCustomCategoryName("");
    setIsAddingCustomCategory(false);
  };
  const handleRemoveCategory = (categoryName) => {
    setSelectedCategories((prev) =>
      prev.filter((item) => item.name !== categoryName),
    );
  };

  const handleSaveCategories = async () => {
    try {
      const token = localStorage.getItem("token");

      for (const category of selectedCategories) {
        const exists = categories.some((item) => item.name === category.name);
        if (exists) continue;

        await fetch("https://achievo-59su.onrender.com/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: category.name,
            color: category.color,
          }),
        });
      }

      for (const category of categories) {
        const stillSelected = selectedCategories.some(
          (item) => item.name === category.name,
        );

        if (stillSelected) continue;

        const res = await fetch(
          `https://achievo-59su.onrender.com/categories/${category.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await res.json();
        console.log("DELETE CATEGORY RESPONSE:", data);

        if (!res.ok) {
          throw new Error(data.message || "Failed to delete category");
        }
      }

      setShowCategoryModal(false);
      await fetchCategories();
    } catch (err) {
      console.error("Save categories error:", err);
    }
  };
  const [reminders, setReminders] = useState([]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("https://achievo-59su.onrender.com/categories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("FETCH CATEGORIES RESPONSE:", data);
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchReminders = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("https://achievo-59su.onrender.com/reminders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setReminders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching reminders:", err);
    }
  };
  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderTitleError, setReminderTitleError] = useState("");
  const [reminderDeadline, setReminderDeadline] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [reminderDescription, setReminderDescription] = useState("");
  const [reminderError, setReminderError] = useState("");
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [isEditingReminderDetails, setIsEditingReminderDetails] =
    useState(false);
  const [reminderDetailTitle, setReminderDetailTitle] = useState("");
  const [reminderDetailDate, setReminderDetailDate] = useState("");
  const [reminderDetailTime, setReminderDetailTime] = useState("");
  const [reminderDetailDescription, setReminderDetailDescription] =
    useState("");
  const [reminderDetailError, setReminderDetailError] = useState("");

  const handleCreateReminder = async () => {
    if (
      !reminderTitle.trim() &&
      !reminderDeadline &&
      !reminderTime &&
      !reminderDescription.trim()
    ) {
      setReminderError("Please input all fields");
      return;
    }

    if (!reminderTitle.trim() && !reminderDescription.trim()) {
      setReminderError("Please add a title and description");
      return;
    }

    if (!reminderTitle.trim()) {
      setReminderError("Please add a title");
      return;
    }

    if (!reminderDeadline && !reminderTime) {
      setReminderError("Please select a date and time");
      return;
    }

    if (!reminderDeadline) {
      setReminderError("Please select a date");
      return;
    }

    if (!reminderTime) {
      setReminderError("Please select a time");
      return;
    }

    if (!reminderDescription.trim()) {
      setReminderError("Please add a description");
      return;
    }

    setReminderError("");
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("https://achievo-59su.onrender.com/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: reminderTitle,
          deadline:
            reminderDeadline && reminderTime
              ? `${reminderDeadline}T${reminderTime}`
              : reminderDeadline,
          description: reminderDescription,
        }),
      });

      if (!res.ok) throw new Error("Failed to create reminder");

      setReminderTitle("");
      setReminderDeadline("");
      setReminderTime("");
      setReminderDescription("");
      setReminderError("");
      setShowReminderModal(false);
      fetchReminders();
    } catch (err) {
      console.error("Create reminder error:", err);
    }
  };
  const [showReminderDetailsModal, setShowReminderDetailsModal] =
    useState(false);

  const handleSaveReminderDetails = async () => {
    if (!selectedReminder) return;

    if (!reminderDetailTitle.trim()) {
      setReminderDetailError("Reminder title is required");
      return;
    }

    if (!reminderDetailDate) {
      setReminderDetailError("Reminder date is required");
      return;
    }

    if (!reminderDetailTime) {
      setReminderDetailError("Reminder time is required");
      return;
    }

    if (!reminderDetailDescription.trim()) {
      setReminderDetailError("Description is required");
      return;
    }

    setReminderDetailError("");

    try {
      const token = localStorage.getItem("token");

      const deadline = `${reminderDetailDate}T${reminderDetailTime}`;

      const res = await fetch(
        `https://achievo-59su.onrender.com/reminders/${selectedReminder.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: reminderDetailTitle.trim(),
            deadline,
            description: reminderDetailDescription.trim(),
            accomplished: selectedReminder.accomplished,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update reminder");
      }

      setReminders((prev) =>
        prev.map((reminder) =>
          reminder.id === selectedReminder.id ? data : reminder,
        ),
      );

      setSelectedReminder(data);
      setIsEditingReminderDetails(false);
      setShowReminderDetailsModal(false);
    } catch (err) {
      console.error("Save reminder details error:", err);
      setReminderDetailError(err.message || "Failed to save reminder");
    }
  };
  const [showDeleteReminderModal, setShowDeleteReminderModal] = useState(false);
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const searchResults =
    searchQuery.trim().length === 0
      ? []
      : [
          ...tasks
            .filter((t) =>
              t.title.toLowerCase().includes(searchQuery.toLowerCase()),
            )
            .map((t) => ({ type: "task", item: t })),
          ...reminders
            .filter((r) =>
              r.title.toLowerCase().includes(searchQuery.toLowerCase()),
            )
            .map((r) => ({ type: "reminder", item: r })),
          ...tracking
            .filter((tr) =>
              tr.title.toLowerCase().includes(searchQuery.toLowerCase()),
            )
            .map((tr) => ({ type: "tracker", item: tr })),
        ];
  return (
    <div className="h-screen w-screen flex bg-[#f7f4ef] p-[18px] gap-[14px] font-[DM_Sans] text-[#1f1a14]">
      <audio ref={tickAudioRef} src="/tick.mp3" loop />{" "}
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
      <Tabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenLogout={() => setShowLogoutModal(true)}
        userName={profileName}
      />
      <main className="flex-1 h-full flex flex-col gap-[14px] overflow-hidden min-w-0">
        {" "}
        <div className="flex justify-between items-center gap-[12px] px-[16px] py-[10px] bg-white rounded-full border border-[#e8e3dc] shadow-sm">
          {" "}
          <div ref={searchRef} className="relative">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="w-[300px] bg-[#f0ede8] rounded-full px-[20px] py-[8px] text-[14px] text-[#5b544c] outline-none"
            />
            {showSearchResults && searchQuery.trim().length > 0 && (
              <div className="absolute top-[calc(100%+8px)] left-0 w-[380px] bg-white rounded-[18px] border border-[#ece5db] shadow-[0_8px_30px_rgba(0,0,0,0.12)] z-[9999] overflow-hidden">
                {searchResults.length === 0 ? (
                  <div className="px-[16px] py-[14px] text-[13px] text-[#8a8176]">
                    No results found.
                  </div>
                ) : (
                  <div className="max-h-[340px] overflow-y-auto">
                    {searchResults.map((result, index) => {
                      const { type, item } = result;
                      const typeColors = {
                        task: "bg-[#e8f8ef] text-[#2f6a4f]",
                        reminder: "bg-[#fff3d6] text-[#7a5a1f]",
                        tracker: "bg-[#e8f0ff] text-[#325a8c]",
                      };
                      const typeLabel = {
                        task: "Task",
                        reminder: "Reminder",
                        tracker: "Tracker",
                      };
                      return (
                        <button
                          key={`${type}-${item.id}`}
                          type="button"
                          onClick={() => {
                            setShowSearchResults(false);
                            setSearchQuery("");
                            if (type === "task") {
                              handleOpenTaskDetails(item);
                            } else if (type === "reminder") {
                              handleOpenReminderDetails(item);
                            } else if (type === "tracker") {
                              handleOpenTrackerDetails(item);
                            }
                          }}
                          className={`w-full flex items-center justify-between px-[16px] py-[12px] text-left hover:bg-[#f7f4ef] transition ${
                            index !== searchResults.length - 1
                              ? "border-b border-[#f0ebe3]"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-[10px] min-w-0">
                            <span
                              className={`shrink-0 rounded-full px-[8px] py-[3px] text-[11px] font-semibold ${typeColors[type]}`}
                            >
                              {typeLabel[type]}
                            </span>
                            <span className="text-[14px] text-[#2f2b25] truncate">
                              {item.title}
                            </span>
                          </div>
                          <span className="text-[20px] text-[#8a8176] shrink-0">
                            ›
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>{" "}
          <div className="flex items-center gap-[16px]">
            {" "}
            <button
              className="cursor-pointer rounded-full border-1 border-[#2f281e] bg-[#a8d6e6] px-[16px] py-[8px] text-[14px] font-bold text-[#1f1a14] transition duration-200 hover:scale-105 hover:bg-[#8dc4d4] hover:shadow-md"
              onClick={() => {
                setTaskTitle("");
                setTaskSelectedCategory(null);
                setTaskDayOption("today");
                setTaskCustomDay("+ Custom");
                setTaskNotificationDate("");
                setTaskNotificationTime("");
                setTaskPriority("");
                setTaskDescription("");
                setTaskError("");
                setSelectedTask(null);
                setIsEditingTask(false);
                setShowTaskModal(true);
              }}
            >
              ＋ New task
            </button>{" "}
            <button
              onClick={() => navigate("/profile")}
              className="flex h-[35px] w-[35px] items-center justify-center rounded-full border-2 border-[#2d261d] overflow-hidden hover:scale-105 transition"
            >
              {profileLoading ? (
                <div className="h-full w-full bg-[#F5F5FA]" />
              ) : (
                <img
                  src={profileImage}
                  alt="profile"
                  className="h-full w-full object-cover"
                />
              )}
            </button>
          </div>
        </div>
        <>
          {showSettingsModal && (
            <Settings onClose={() => setShowSettingsModal(false)} />
          )}

          {showLogoutModal && (
            <Logout onClose={() => setShowLogoutModal(false)} />
          )}
          {showCategoryModal && (
            <div
              className="fixed inset-0 z-[999] flex items-center justify-center bg-[rgba(0,0,0,0.28)]"
              onClick={() => {}}
            >
              <div
                className="w-[560px] max-w-[92vw] rounded-[24px] border border-[#ece5db] bg-[#ffffff] px-[22px] py-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.12)]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-[18px] flex items-center justify-between">
                  <h2 className="text-[18px] font-bold text-[#1f1a14]">
                    Choose categories
                  </h2>

                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(false)}
                    className="border-none bg-transparent text-[22px] leading-none text-[#4a433c]"
                  >
                    ×
                  </button>
                </div>

                <div className="mb-[12px] text-[13px] font-medium text-[#645c52]">
                  Selected
                </div>

                <div className="mb-[18px] flex min-h-[52px] flex-wrap gap-[10px] rounded-[14px] bg-[#f4f0ea] p-[12px]">
                  {selectedCategories.length === 0 ? (
                    <div className="text-[13px] text-[#8a8176]">
                      No categories selected yet.
                    </div>
                  ) : (
                    selectedCategories.map((category) => (
                      <div
                        key={category.name}
                        className={`inline-flex items-center gap-[8px] rounded-full px-[12px] py-[7px] text-[13px] font-medium ${category.color}`}
                      >
                        <span>{category.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(category.name)}
                          className="border-none bg-transparent p-0 text-[14px] leading-none"
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="mb-[12px] text-[13px] font-medium text-[#645c52]">
                  Available choices
                </div>

                <div className="flex flex-wrap gap-[10px]">
                  {!isAddingCustomCategory ? (
                    <button
                      type="button"
                      onClick={() => setIsAddingCustomCategory(true)}
                      className="rounded-full bg-[#F5F5FA] px-[12px] py-[7px] text-[13px] font-medium text-[#5f574d]"
                    >
                      + Custom
                    </button>
                  ) : (
                    <input
                      ref={customCategoryRef}
                      type="text"
                      value={customCategoryName}
                      onChange={(e) => setCustomCategoryName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddCustomCategory();
                        if (e.key === "Escape") {
                          setCustomCategoryName("");
                          setIsAddingCustomCategory(false);
                        }
                      }}
                      onBlur={handleAddCustomCategory}
                      autoFocus
                      placeholder="Custom"
                      className="h-[34px] w-[120px] rounded-full border-none bg-[#F5F5FA] px-[12px] text-[13px] font-medium text-[#5f574d] outline-none"
                    />
                  )}

                  {categoryChoices
                    .filter(
                      (choice) =>
                        !selectedCategories.some(
                          (item) => item.name === choice.name,
                        ),
                    )
                    .map((category) => (
                      <button
                        key={category.name}
                        type="button"
                        onClick={() => handleSelectCategory(category)}
                        className={`rounded-full px-[12px] py-[7px] text-[13px] font-medium ${category.color}`}
                      >
                        + {category.name}
                      </button>
                    ))}
                </div>

                <div className="mt-[24px] flex justify-end gap-[10px]">
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(false)}
                    className="rounded-full border border-[#8d8478] px-[16px] py-[8px] text-[13px]"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveCategories}
                    className="rounded-full border border-[#2f281e] bg-[#a8d6e6] px-[18px] py-[8px] text-[13px] font-bold text-[#1f1a14]"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
          {showDeleteReminderModal && (
            <div
              className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(0,0,0,0.28)]"
              onClick={() => {}}
            >
              <div
                className="w-[380px] rounded-[22px] border border-[#ece5db] bg-[#ffffff] px-[24px] py-[22px] shadow-[0_20px_50px_rgba(0,0,0,0.12)]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-[18px] text-center text-[16px] font-medium text-[#1f1a14]">
                  Are you sure you want to delete this reminder?
                </div>

                <div className="flex justify-center gap-[12px]">
                  <button
                    type="button"
                    onClick={() => setShowDeleteReminderModal(false)}
                    className="rounded-full border border-[#8d8478] px-[16px] py-[8px] text-[13px]"
                  >
                    No
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteReminder}
                    className="rounded-full border border-[#d86d6d] bg-[#f58f8f] px-[18px] py-[8px] text-[13px] font-bold text-[#1f1a14]"
                  >
                    Yes, delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {showReminderDetailsModal && selectedReminder && (
            <div
              className="fixed inset-0 z-[999] flex items-center justify-center bg-[rgba(0,0,0,0.28)]"
              onClick={() => {}}
            >
              <div
                className="w-[500px] max-w-[92vw] rounded-[22px] border border-[#ece5db] bg-[#ffffff] px-[20px] py-[18px] shadow-[0_20px_50px_rgba(0,0,0,0.12)]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-[18px] flex items-start justify-between gap-[12px]">
                  <div className="flex flex-col gap-[6px] w-full">
                    <div className="w-max rounded-full bg-[#e8f8ef] px-[12px] py-[4px] text-[13px] font-semibold text-[#2f6a4f]">
                      {isEditingReminderDetails
                        ? "Edit Reminder"
                        : "Reminder Details"}{" "}
                    </div>

                    {isEditingReminderDetails ? (
                      <input
                        type="text"
                        value={reminderDetailTitle}
                        onChange={(e) => setReminderDetailTitle(e.target.value)}
                        className="h-[40px] w-full rounded-[10px] border-none bg-[#F5F5FA] px-[14px] text-[18px] font-bold text-[#2d261d] outline-none"
                      />
                    ) : (
                      <div className="max-w-[420px] break-words text-[20px] font-bold text-[#1f1a14]">
                        {selectedReminder.title}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowReminderDetailsModal(false)}
                    className="cursor-pointer border-none bg-transparent p-0 text-[22px] leading-none text-[#4a433c]"
                  >
                    ×
                  </button>
                </div>

                {reminderDetailError && (
                  <div className="mb-[12px] rounded-[10px] border border-[#d86d6d] bg-[#fde7e7] px-[12px] py-[10px] text-[12px] font-medium text-[#9b3d3d]">
                    {reminderDetailError}
                  </div>
                )}

                <div className="mb-[16px] grid grid-cols-[110px_1fr] items-center gap-x-[14px]">
                  <div className="text-[13px] text-[#2f2a23]">Deadline</div>

                  {isEditingReminderDetails ? (
                    <div className="flex gap-[8px]">
                      <input
                        type="date"
                        value={reminderDetailDate}
                        onChange={(e) => setReminderDetailDate(e.target.value)}
                        className="h-[40px] flex-1 rounded-[10px] border-none bg-[#F5F5FA] px-[14px] text-[14px] text-[#2d261d] outline-none"
                      />
                      <input
                        type="time"
                        value={reminderDetailTime}
                        onChange={(e) => setReminderDetailTime(e.target.value)}
                        className="h-[40px] w-[140px] rounded-[10px] border-none bg-[#F5F5FA] px-[14px] text-[14px] text-[#2d261d] outline-none"
                      />
                    </div>
                  ) : (
                    <div className="rounded-[10px] bg-[#F5F5FA] px-[14px] py-[10px] text-[14px] text-[#2d261d]">
                      {selectedReminder.deadline
                        ? new Date(
                            selectedReminder.deadline.replace(" ", "T"),
                          ).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })
                        : "No deadline"}
                    </div>
                  )}
                </div>

                <div className="mt-[6px]">
                  <div className="mb-[8px] text-[13px] font-bold text-[#2a241d]">
                    Description
                  </div>

                  {isEditingReminderDetails ? (
                    <textarea
                      value={reminderDetailDescription}
                      onChange={(e) =>
                        setReminderDetailDescription(e.target.value)
                      }
                      className="min-h-[130px] w-full resize-none rounded-[10px] border-none bg-[#F5F5FA] p-[14px] text-[13px] text-[#2d261d] outline-none"
                    />
                  ) : (
                    <div className="min-h-[130px] w-full rounded-[10px] bg-[#F5F5FA] p-[14px] text-[13px] text-[#2d261d]">
                      {selectedReminder.description || "No description"}
                    </div>
                  )}
                </div>

                <div className="mt-[18px] flex justify-end gap-[10px] pt-[8px]">
                  {!isEditingReminderDetails ? (
                    <>
                      <button
                        type="button"
                        onClick={handleAccomplishReminder}
                        className="cursor-pointer rounded-full border border-[#2f281e] bg-[#a8d6e6] px-[18px] py-[10px] text-[12px] font-bold text-[#1f1a14]"
                      >
                        {selectedReminder.accomplished ? "Undo" : "Done"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowDeleteReminderModal(true)}
                        className="cursor-pointer rounded-full border border-[#d86d6d] bg-[#f58f8f] px-[18px] py-[10px] text-[12px] font-bold text-[#1f1a14]"
                      >
                        Delete reminder{" "}
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsEditingReminderDetails(true)}
                        className="cursor-pointer rounded-full border border-[#7fbf9f] bg-[#c8f2d8] px-[18px] py-[10px] text-[12px] font-bold text-[#2f6a4f]"
                      >
                        Edit
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          const deadlineDate = selectedReminder.deadline
                            ? new Date(selectedReminder.deadline)
                            : null;

                          setReminderDetailTitle(selectedReminder.title || "");
                          setReminderDetailDate(
                            deadlineDate
                              ? deadlineDate.toISOString().slice(0, 10)
                              : "",
                          );
                          setReminderDetailTime(
                            deadlineDate
                              ? `${String(deadlineDate.getHours()).padStart(2, "0")}:${String(deadlineDate.getMinutes()).padStart(2, "0")}`
                              : "",
                          );
                          setReminderDetailDescription(
                            selectedReminder.description || "",
                          );
                          setReminderDetailError("");
                          setIsEditingReminderDetails(false);
                        }}
                        className="cursor-pointer rounded-full border border-[#8d8478] bg-[#fffdfa] px-[18px] py-[10px] text-[12px] font-bold text-[#2d261d]"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveReminderDetails}
                        className="cursor-pointer rounded-full border border-[#6baed6] bg-[#a7d8f5] px-[18px] py-[10px] text-[12px] font-bold text-[#1f1a14]"
                      >
                        Save
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          {showDeleteTaskModal && (
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
                  Are you sure you want to delete?
                </div>

                <div className="flex justify-center gap-[12px]">
                  <button
                    type="button"
                    onClick={() => setShowDeleteTaskModal(false)}
                    className="rounded-full border border-[#8d8478] bg-white px-[18px] py-[9px] text-[14px] font-medium text-[#2d261d]"
                  >
                    No
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteTask}
                    className="rounded-full border border-[#d86d6d] bg-[#f58f8f] px-[20px] py-[9px] text-[14px] font-bold text-[#1f1a14]"
                  >
                    Yes, delete
                  </button>
                </div>
              </div>
            </div>
          )}
          {showTaskDetailsModal && selectedTask && (
            <div
              className="fixed inset-0 z-[999] flex items-center justify-center bg-[rgba(0,0,0,0.28)]"
              onClick={() => {}}
            >
              <div
                className="w-[500px] max-w-[92vw] rounded-[22px] border border-[#ece5db] bg-[#ffffff] px-[20px] py-[18px] shadow-[0_20px_50px_rgba(0,0,0,0.12)]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-[18px] flex items-start justify-between gap-[12px]">
                  <div className="flex flex-col gap-[6px] w-full">
                    <div className="w-max rounded-full bg-[#e8f8ef] px-[12px] py-[4px] text-[13px] font-semibold text-[#2f6a4f]">
                      Task Details{" "}
                    </div>

                    <div className="max-w-[420px] break-words text-[20px] font-bold text-[#1f1a14]">
                      {selectedTask.title}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowTaskDetailsModal(false)}
                    className="cursor-pointer border-none bg-transparent p-0 text-[22px] leading-none text-[#4a433c]"
                  >
                    ×
                  </button>
                </div>

                <div className="mb-[12px] grid grid-cols-[120px_1fr] items-center gap-x-[14px]">
                  <div className="text-[13px] text-[#2f2a23]">Category</div>
                  <div className="rounded-[10px] bg-[#F5F5FA] px-[14px] py-[10px] text-[14px] text-[#2d261d]">
                    {selectedTask.category_name || "No category"}
                  </div>
                </div>

                <div className="mb-[12px] grid grid-cols-[120px_1fr] items-center gap-x-[14px]">
                  <div className="text-[13px] text-[#2f2a23]">Priority</div>
                  <div className="rounded-[10px] bg-[#F5F5FA] px-[14px] py-[10px] text-[14px] text-[#2d261d]">
                    {selectedTask.priority
                      ? selectedTask.priority.charAt(0).toUpperCase() +
                        selectedTask.priority.slice(1)
                      : "No priority"}{" "}
                  </div>
                </div>

                <div className="mb-[12px] grid grid-cols-[120px_1fr] items-center gap-x-[14px]">
                  <div className="text-[13px] text-[#2f2a23]">Day</div>
                  <div className="rounded-[10px] bg-[#F5F5FA] px-[14px] py-[10px] text-[14px] text-[#2d261d]">
                    {selectedTask.task_day_option === "custom"
                      ? selectedTask.task_custom_date
                      : selectedTask.task_day_option === "today"
                        ? "Today"
                        : selectedTask.task_day_option === "tomorrow"
                          ? "Tomorrow"
                          : "No day"}
                  </div>
                </div>

                <div className="mb-[12px] grid grid-cols-[120px_1fr] items-center gap-x-[14px]">
                  <div className="text-[13px] text-[#2f2a23]">Notification</div>

                  <div className="rounded-[10px] bg-[#F5F5FA] px-[14px] py-[10px] text-[14px] text-[#2d261d]">
                    {selectedTask.notification_date &&
                    selectedTask.notification_time
                      ? (() => {
                          const dateOnly = (
                            selectedTask.notification_date || ""
                          )
                            .replace(/T.*$/, "")
                            .trim();
                          const [year, month, day] = dateOnly.split("-");
                          const [hour, minute] =
                            selectedTask.notification_time.split(":");

                          const dateStr = `${year}-${month}-${day}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
                          return new Date(dateStr).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          });
                        })()
                      : "No notification"}
                  </div>
                </div>
                <div className="mt-[6px]">
                  <div className="mb-[8px] text-[13px] font-bold text-[#2a241d]">
                    Description
                  </div>
                  <div className="mt-[6px] min-h-[120px] w-full rounded-[12px] bg-[#F5F5FA] px-[14px] py-[12px] text-[14px] text-[#2d261d] break-words whitespace-pre-wrap">
                    {selectedTask.description || "No description"}
                  </div>
                </div>
                <div className="mt-[18px] flex justify-end gap-[10px] pt-[8px]">
                  <button
                    type="button"
                    onClick={handleEditTask}
                    className="cursor-pointer rounded-full border border-[#2f281e] bg-[#a8d6e6] px-[18px] py-[10px] text-[12px] font-bold text-[#1f1a14]"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowDeleteTaskModal(true)}
                    className="cursor-pointer rounded-full border border-[#d86d6d] bg-[#f58f8f] px-[18px] py-[10px] text-[12px] font-bold text-[#1f1a14]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
          {showDeleteTrackerModal && (
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
                  Are you sure you want to delete this tracker?
                </div>

                <div className="flex justify-center gap-[12px]">
                  <button
                    type="button"
                    onClick={() => setShowDeleteTrackerModal(false)}
                    className="rounded-full border border-[#8d8478] bg-white px-[18px] py-[9px] text-[14px] font-medium text-[#2d261d]"
                  >
                    No
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteTracker}
                    className="rounded-full border border-[#d86d6d] bg-[#f58f8f] px-[20px] py-[9px] text-[14px] font-bold text-[#1f1a14]"
                  >
                    Yes, delete
                  </button>
                </div>
              </div>
            </div>
          )}
          {showTrackerDetailsModal && selectedTracker && (
            <div
              className="fixed inset-0 z-[999] flex items-center justify-center bg-[rgba(0,0,0,0.28)]"
              onClick={() => {}}
            >
              <div
                className="w-[500px] max-w-[92vw] rounded-[22px] border border-[#ece5db] bg-[#ffffff] px-[20px] py-[18px] shadow-[0_20px_50px_rgba(0,0,0,0.12)]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-[18px] flex items-start justify-between gap-[12px]">
                  <div className="flex flex-col gap-[6px] w-full">
                    <div className="w-max rounded-full bg-[#e8f8ef] px-[12px] py-[4px] text-[13px] font-semibold text-[#2f6a4f]">
                      {isEditingTrackerDetails
                        ? "Edit Tracker"
                        : "Tracker Details"}
                    </div>

                    <input
                      type="text"
                      value={trackerDetailTitle}
                      onChange={(e) => setTrackerDetailTitle(e.target.value)}
                      readOnly={!isEditingTrackerDetails}
                      className={`h-[40px] w-full rounded-[10px] px-[14px] text-[18px] font-bold text-[#2d261d] outline-none ${
                        isEditingTrackerDetails
                          ? "border-none bg-[#F5F5FA]"
                          : "border-none bg-[#F5F5FA] cursor-default"
                      }`}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowTrackerDetailsModal(false)}
                    className="cursor-pointer border-none bg-transparent p-0 text-[22px] leading-none text-[#4a433c]"
                  >
                    ×
                  </button>
                </div>

                {trackerDetailError && (
                  <div className="mb-[12px] rounded-[10px] border border-[#d86d6d] bg-[#fde7e7] px-[12px] py-[10px] text-[12px] font-medium text-[#9b3d3d]">
                    {trackerDetailError}
                  </div>
                )}

                <div className="mb-[16px] grid grid-cols-[110px_1fr] items-start gap-x-[14px]">
                  <div className="pt-[8px] text-[13px] text-[#2f2a23]">
                    Remaining
                  </div>

                  <div className="flex flex-col gap-[10px]">
                    <div className="rounded-[10px] bg-[#F5F5FA] px-[14px] py-[10px] text-[14px] text-[#2d261d]">
                      {formatSeconds(trackerDetailRemainingSeconds)}
                    </div>

                    {isEditingTrackerDetails && (
                      <>
                        <div className="flex flex-wrap gap-[8px]">
                          {[
                            { label: "15m", value: 15 * 60 },
                            { label: "30m", value: 30 * 60 },
                            { label: "45m", value: 45 * 60 },
                            { label: "1h", value: 60 * 60 },
                            { label: "2h", value: 2 * 60 * 60 },
                          ].map((time) => (
                            <button
                              key={time.label}
                              type="button"
                              onClick={() =>
                                setTrackerDetailRemainingSeconds(time.value)
                              }
                              className="rounded-full border border-[#8d8478] bg-[#fffdfa] px-[12px] py-[6px] text-[12px] text-[#2d261d] hover:bg-[#a8d6e6] hover:border-[#2f281e]"
                            >
                              {time.label}
                            </button>
                          ))}
                        </div>

                        <input
                          type="text"
                          placeholder="Custom (e.g 1h 25m)"
                          value={trackerDetailTimerInput}
                          onChange={(e) => {
                            const value = e.target.value;
                            setTrackerDetailTimerInput(value);
                            setTrackerDetailRemainingSeconds(
                              parseTimerToSeconds(value),
                            );
                          }}
                          className="h-[42px] w-full rounded-[10px] border-none bg-[#F5F5FA] px-[14px] text-[14px] text-[#2d261d] outline-none"
                        />
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-[18px] flex justify-end gap-[10px] pt-[8px]">
                  <button
                    type="button"
                    onClick={() => setShowDeleteTrackerModal(true)}
                    className="cursor-pointer rounded-full border border-[#d86d6d] bg-[#f58f8f] px-[18px] py-[10px] text-[12px] font-bold text-[#1f1a14]"
                  >
                    Delete
                  </button>

                  {!isEditingTrackerDetails ? (
                    <>
                      <button
                        type="button"
                        onClick={handleDoneTracker}
                        className="cursor-pointer rounded-full border border-[#2f281e] bg-[#a8d6e6] px-[18px] py-[10px] text-[12px] font-bold text-[#1f1a14]"
                      >
                        Done
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsEditingTrackerDetails(true)}
                        className="cursor-pointer rounded-full border border-[#7fbf9f] bg-[#c8f2d8] px-[18px] py-[10px] text-[12px] font-bold text-[#2f6a4f]"
                      >
                        Edit
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setTrackerDetailTitle(selectedTracker?.title || "");
                          setTrackerDetailRemainingSeconds(
                            Number(selectedTracker?.remainingSeconds) || 0,
                          );
                          setTrackerDetailDone(!!selectedTracker?.done);
                          setTrackerDetailTimerInput("");
                          setIsEditingTrackerDetails(false);
                        }}
                        className="cursor-pointer rounded-full border border-[#8d8478] bg-[#fffdfa] px-[18px] py-[10px] text-[12px] font-bold text-[#2d261d]"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveTrackerDetails}
                        disabled={!isTrackerDetailsDirty}
                        className={`cursor-pointer rounded-full px-[18px] py-[10px] text-[12px] font-bold ${
                          isTrackerDetailsDirty
                            ? "border border-[#6baed6] bg-[#a7d8f5] text-[#1f1a14]"
                            : "border border-[#cfc7ba] bg-[#F5F5FA] text-[#8a8176]"
                        }`}
                      >
                        Save
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {showTrackerModal && (
            <div
              className="fixed inset-0 z-[999] flex items-center justify-center bg-[rgba(0,0,0,0.28)]"
              onClick={() => {}}
            >
              <div
                className="w-[460px] max-w-[92vw] rounded-[22px] border border-[#ece5db] bg-[#ffffff] px-[20px] py-[18px] shadow-[0_20px_50px_rgba(0,0,0,0.12)]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-[18px] flex items-center justify-between gap-[12px]">
                  <div className="text-[18px] font-bold text-[#1f1a14]">
                    Add tracker
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowTrackerModal(false)}
                    className="cursor-pointer border-none bg-transparent p-0 text-[22px] leading-none text-[#4a433c]"
                  >
                    ×
                  </button>
                </div>

                <div className="mb-[14px]">
                  <div className="mb-[8px] text-[13px] font-bold text-[#2a241d]">
                    Task title
                  </div>
                  <input
                    type="text"
                    placeholder="Enter task title"
                    value={trackerTitle}
                    onChange={(e) => {
                      setTrackerTitle(e.target.value);
                      setTrackerError("");
                    }}
                    className="h-[42px] w-full rounded-[10px] border-none bg-[#F5F5FA] px-[14px] text-[14px] text-[#2d261d] outline-none"
                  />
                </div>

                <div>
                  <div className="mb-[8px] text-[13px] font-bold text-[#2a241d]">
                    Timer
                  </div>
                  <div className="flex flex-col gap-[10px]">
                    <div className="flex gap-[8px] flex-wrap">
                      {["15m", "30m", "45m", "1h", "2h"].map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setTrackerTimer(time)}
                          className="rounded-full border border-[#8d8478] bg-[#fffdfa] px-[12px] py-[6px] text-[12px] text-[#2d261d] hover:bg-[#a8d6e6] hover:border-[#2f281e]"
                        >
                          {time}
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      placeholder="Custom (e.g 1h 25m)"
                      value={trackerTimer}
                      onChange={(e) => {
                        setTrackerTimer(e.target.value);
                        setTrackerError("");
                      }}
                      className="h-[42px] w-full rounded-[10px] border-none bg-[#F5F5FA] px-[14px] text-[14px] text-[#2d261d] outline-none"
                    />
                  </div>
                </div>
                {trackerError && (
                  <div className="mt-[10px] text-[12px] text-[#d86d6d]">
                    {trackerError}
                  </div>
                )}
                <div className="mt-[18px] flex justify-end pt-[8px]">
                  <button
                    type="button"
                    onClick={handleSaveTracker}
                    className="cursor-pointer rounded-full border border-[#2f281e] bg-[#a8d6e6] px-[18px] py-[10px] text-[12px] font-bold text-[#1f1a14]"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
          {showReminderModal && (
            <div
              className="fixed inset-0 z-[999] flex items-center justify-center bg-[rgba(0,0,0,0.28)]"
              onClick={() => {}}
            >
              <div
                className="w-[500px] max-w-[92vw] rounded-[22px] border border-[#ece5db] bg-[#ffffff] px-[20px] py-[18px] shadow-[0_20px_50px_rgba(0,0,0,0.12)]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-[14px] flex items-center justify-between">
                  <h2 className="text-[18px] font-bold text-[#2a241d]">
                    Add Reminder
                  </h2>

                  <button
                    type="button"
                    onClick={() => setShowReminderModal(false)}
                    className="cursor-pointer border-none bg-transparent p-0 text-[22px] leading-none text-[#4a433c]"
                  >
                    ×
                  </button>
                </div>
                <div className="mb-[18px] flex items-center justify-between gap-[12px]">
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      placeholder="Title"
                      value={reminderTitle}
                      maxLength={50}
                      onChange={(e) => {
                        const value = e.target.value;

                        if (value.length >= 50) {
                          setReminderTitleError("Max 50 characters reached");
                        } else {
                          setReminderTitleError("");
                        }

                        setReminderTitle(value);
                        setReminderError("");
                      }}
                      className="h-[40px] w-full rounded-[10px] border-none bg-[#F5F5FA] px-[14px] text-[14px] text-[#2d261d] outline-none"
                    />

                    {reminderTitleError && (
                      <div className="mt-[6px] text-[12px] text-[#c0392b]">
                        {reminderTitleError}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mb-[16px] grid grid-cols-[110px_1fr] items-center gap-x-[14px]">
                  <div className="text-[13px] text-[#2f2a23]">Deadline</div>
                  <div className="flex gap-[8px]">
                    <input
                      type="date"
                      value={reminderDeadline}
                      onChange={(e) => {
                        setReminderDeadline(e.target.value);
                        setReminderError("");
                      }}
                      className="h-[40px] flex-1 rounded-[10px] border-none bg-[#F5F5FA] px-[14px] text-[14px] text-[#2d261d] outline-none"
                    />
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => {
                        setReminderTime(e.target.value);
                        setReminderError("");
                      }}
                      className="h-[40px] w-[140px] rounded-[10px] border-none bg-[#F5F5FA] px-[14px] text-[14px] text-[#2d261d] outline-none"
                    />
                  </div>
                </div>

                <div className="mt-[6px]">
                  <div className="mb-[8px] text-[13px] font-bold text-[#2a241d]">
                    Description
                  </div>
                  <textarea
                    value={reminderDescription}
                    onChange={(e) => setReminderDescription(e.target.value)}
                    className="min-h-[130px] w-full resize-none rounded-[10px] border-none bg-[#F5F5FA] p-[14px] text-[13px] text-[#2d261d] outline-none"
                  />{" "}
                </div>
                {reminderError && (
                  <div className="mt-[10px] rounded-[10px] border border-[#d86d6d] bg-[#fde7e7] px-[12px] py-[10px] text-[12px] font-medium text-[#9b3d3d]">
                    {reminderError}
                  </div>
                )}
                <div className="mt-[18px] flex justify-end pt-[8px]">
                  <button
                    type="button"
                    onClick={handleCreateReminder}
                    className="cursor-pointer rounded-full border border-[#2f281e] bg-[#a8d6e6] px-[18px] py-[10px] text-[12px] font-bold text-[#1f1a14]"
                  >
                    Create reminder
                  </button>
                </div>
              </div>
            </div>
          )}

          {showTaskModal && (
            <div
              className="fixed inset-0 z-[999] flex items-center justify-center bg-[rgba(0,0,0,0.28)]"
              onClick={() => {}}
            >
              <div
                className="w-[520px] max-w-[92vw] rounded-[22px] border border-[#ece5db] bg-[#ffffff] px-[20px] py-[18px] shadow-[0_20px_50px_rgba(0,0,0,0.12)]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-[18px] flex items-start justify-between gap-[12px]">
                  <div className="flex flex-col gap-[8px] w-full">
                    <div className="w-max rounded-full bg-[#e8f8ef] px-[12px] py-[4px] text-[13px] font-semibold text-[#2f6a4f]">
                      {isEditingTask ? "Edit Task" : "Add New Task"}
                    </div>

                    <div className="flex flex-1 items-start gap-[10px]">
                      {" "}
                      <span className="inline-flex h-[16px] w-[16px] shrink-0 items-center justify-center text-[#3d372f]">
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
                      </span>
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          placeholder="Name of task"
                          value={taskTitle}
                          maxLength={50}
                          onChange={(e) => {
                            const value = e.target.value;

                            if (value.length >= 50) {
                              setTitleError("Max 50 characters reached");
                            } else {
                              setTitleError("");
                            }

                            setTaskTitle(value);
                          }}
                          className="h-[38px] w-full rounded-[8px] border-none bg-[#F5F5FA] px-[14px] text-[14px] text-[#2d261d] outline-none"
                        />

                        {titleError && (
                          <div className="mt-[6px] text-[12px] text-[#c0392b]">
                            {titleError}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowTaskModal(false);
                      setTaskError("");
                      setIsEditingTask(false);
                    }}
                    className="cursor-pointer border-none bg-transparent p-0 text-[22px] leading-none text-[#4a433c]"
                  >
                    ×
                  </button>
                </div>

                <div className="flex flex-col gap-[14px]">
                  {" "}
                  {taskError && (
                    <div className="rounded-[10px] border border-[#d86d6d] bg-[#fde7e7] px-[12px] py-[10px] text-[12px] font-medium text-[#9b3d3d]">
                      {taskError}
                    </div>
                  )}
                  <div className="grid grid-cols-[95px_1fr] items-start gap-x-[12px]">
                    <div className="flex items-center gap-[8px] whitespace-nowrap pt-[8px] text-[13px] text-[#2f2a23]">
                      <span className="inline-flex h-[14px] w-[14px] shrink-0 items-center justify-center text-[#3d372f]">
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

                    <div className="flex flex-wrap items-center gap-[8px]">
                      {" "}
                      <div className="flex flex-wrap items-center gap-[8px]">
                        <button
                          type="button"
                          onClick={() => setTaskDayOption("today")}
                          className={`cursor-pointer rounded-full border px-[12px] py-[6px] text-[11px] transition ${
                            taskDayOption === "today"
                              ? "border-[#2f281e] bg-[#a8d6e6] font-bold text-[#1f1a14]"
                              : "border-[#8d8478] bg-[#fffdfa] text-[#2d261d]"
                          }`}
                        >
                          Today
                        </button>

                        <button
                          type="button"
                          onClick={() => setTaskDayOption("tomorrow")}
                          className={`cursor-pointer rounded-full border px-[12px] py-[6px] text-[11px] transition ${
                            taskDayOption === "tomorrow"
                              ? "border-[#2f281e] bg-[#a8d6e6] font-bold text-[#1f1a14]"
                              : "border-[#8d8478] bg-[#fffdfa] text-[#2d261d]"
                          }`}
                        >
                          Tomorrow
                        </button>

                        {taskDayOption === "custom" ? (
                          <input
                            type="text"
                            value={taskCustomDay}
                            onChange={(e) => setTaskCustomDay(e.target.value)}
                            onFocus={() => {
                              if (taskCustomDay === "+ Custom")
                                setTaskCustomDay("");
                            }}
                            onBlur={() => {
                              if (!taskCustomDay.trim())
                                setTaskCustomDay("+ Custom");
                            }}
                            className="h-[32px] w-[110px] rounded-full border border-[#2f281e] bg-[#a8d6e6] px-[12px] text-[11px] font-bold text-[#1f1a14] outline-none"
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setTaskDayOption("custom");
                              setTaskCustomDay("+ Custom");
                            }}
                            className="cursor-pointer rounded-full border border-[#8d8478] bg-[#fffdfa] px-[12px] py-[6px] text-[11px] text-[#2d261d] transition"
                          >
                            + Custom
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-[95px_1fr] items-start gap-x-[12px]">
                    <div className="flex items-center gap-[8px] whitespace-nowrap pt-[8px] text-[13px] text-[#2f2a23]">
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

                    <div className="flex flex-wrap items-center gap-[8px]">
                      <input
                        type="date"
                        value={taskNotificationDate}
                        onChange={(e) =>
                          setTaskNotificationDate(e.target.value)
                        }
                        className="h-[36px] w-[180px] rounded-[10px] border border-[#d8d1c7] bg-[#F5F5FA] px-[12px] text-[12px] text-[#2d261d] outline-none"
                      />
                      <input
                        type="time"
                        value={taskNotificationTime}
                        onChange={(e) =>
                          setTaskNotificationTime(e.target.value)
                        }
                        className="h-[36px] w-[140px] rounded-[10px] border border-[#d8d1c7] bg-[#F5F5FA] px-[12px] text-[12px] text-[#2d261d] outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-[95px_1fr] items-center gap-x-[12px]">
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
                    <div className="flex flex-wrap items-center gap-[10px]">
                      <button
                        type="button"
                        onClick={() => setTaskPriority("low")}
                        className={`cursor-pointer rounded-full border px-[14px] py-[7px] text-[11px] font-medium transition ${
                          taskPriority === "low"
                            ? "border-[#7d8b7a] bg-[#e7efe4] text-[#496146]"
                            : "border-[#8d8478] bg-[#fffdfa] text-[#2d261d]"
                        }`}
                      >
                        Low
                      </button>

                      <button
                        type="button"
                        onClick={() => setTaskPriority("medium")}
                        className={`cursor-pointer rounded-full border px-[14px] py-[7px] text-[11px] font-medium transition ${
                          taskPriority === "medium"
                            ? "border-[#c6a84a] bg-[#f5e7a8] text-[#6d5313]"
                            : "border-[#8d8478] bg-[#fffdfa] text-[#2d261d]"
                        }`}
                      >
                        Medium
                      </button>

                      <button
                        type="button"
                        onClick={() => setTaskPriority("high")}
                        className={`cursor-pointer rounded-full border px-[14px] py-[7px] text-[11px] font-medium transition ${
                          taskPriority === "high"
                            ? "border-[#c96a6a] bg-[#f6caca] text-[#8a2f2f]"
                            : "border-[#8d8478] bg-[#fffdfa] text-[#2d261d]"
                        }`}
                      >
                        High
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-[95px_1fr] items-center gap-x-[12px]">
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
                      <span>Category</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-[8px]">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => setTaskSelectedCategory(category)}
                          className={`rounded-full px-[12px] py-[7px] text-[11px] font-medium transition ${
                            taskSelectedCategory?.id === category.id
                              ? `${category.color} scale-105`
                              : "bg-[#F5F5FA] text-[#2d261d]"
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-[6px]">
                    {" "}
                    <div className="mb-[8px] text-[13px] font-bold text-[#2a241d]">
                      Description
                    </div>{" "}
                    <textarea
                      placeholder="Add more details about the task (Optional)"
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                      className="min-h-[96px] w-full resize-none rounded-[10px] border-none bg-[#F5F5FA] p-[14px] text-[13px] text-[#2d261d] outline-none"
                    />{" "}
                  </div>
                </div>

                <div className="mt-[18px] flex justify-end gap-[10px] pt-[8px]">
                  {isEditingTask && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowTaskModal(false);
                        setTaskError("");
                        setIsEditingTask(false);
                        setSelectedTask(null);
                        setTaskTitle("");
                        setTaskSelectedCategory(null);
                        setTaskDayOption("today");
                        setTaskCustomDay("+ Custom");
                        setTaskNotificationDate("");
                        setTaskNotificationTime("");
                        setTaskPriority("");
                        setTaskDescription("");
                      }}
                      className="cursor-pointer rounded-full border border-[#8d8478] bg-[#fffdfa] px-[18px] py-[10px] text-[12px] font-bold text-[#2d261d]"
                    >
                      Cancel
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={async () => {
                      const customDayValue =
                        taskDayOption === "custom"
                          ? taskCustomDay.trim() === "" ||
                            taskCustomDay === "+ Custom"
                            ? null
                            : taskCustomDay.trim()
                          : null;
                      console.log("VALIDATION CHECK:", {
                        taskTitle,
                        taskPriority,
                        taskSelectedCategory,
                        taskNotificationDate,
                        taskNotificationTime,
                        taskDayOption,
                        customDayValue,
                      });
                      if (
                        !taskTitle.trim() ||
                        !taskPriority ||
                        !taskSelectedCategory ||
                        !taskNotificationDate ||
                        !taskNotificationTime ||
                        (taskDayOption === "custom" && !customDayValue)
                      ) {
                        if (!taskTitle.trim()) {
                          setTaskError("Task name is required.");
                        } else if (!taskPriority) {
                          setTaskError("Priority is required.");
                        } else if (!taskSelectedCategory) {
                          setTaskError("Please select a category.");
                        } else if (!taskNotificationDate) {
                          setTaskError("Notification date is required.");
                        } else if (!taskNotificationTime) {
                          setTaskError("Notification time is required.");
                        } else if (
                          taskDayOption === "custom" &&
                          !customDayValue
                        ) {
                          setTaskError("Please enter a custom day.");
                        }
                        return;
                      }

                      setTaskError("");

                      try {
                        const token = localStorage.getItem("token");

                        const res = await fetch(
                          isEditingTask
                            ? `https://achievo-59su.onrender.com/tasks/${selectedTask.id}`
                            : "https://achievo-59su.onrender.com/tasks",
                          {
                            method: isEditingTask ? "PUT" : "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                              title: taskTitle.trim(),
                              category_id: taskSelectedCategory.id,
                              priority: taskPriority,
                              completed: selectedTask?.completed || false,
                              task_day_option: taskDayOption,
                              task_custom_date: customDayValue,
                              notification_date: taskNotificationDate,
                              notification_time: taskNotificationTime,
                              description: taskDescription.trim(),
                            }),
                          },
                        );

                        let data = null;
                        try {
                          data = await res.json();
                        } catch (parseError) {
                          console.error(
                            "CREATE TASK JSON PARSE ERROR:",
                            parseError,
                          );
                        }

                        console.log("CREATE TASK STATUS:", res.status);
                        console.log("CREATE TASK RESPONSE:", data);

                        if (!res.ok) {
                          throw new Error(
                            data?.error ||
                              data?.message ||
                              `Failed to create task. Status: ${res.status}`,
                          );
                        }

                        setTaskTitle("");
                        setTaskSelectedCategory(null);
                        setTaskDayOption("today");
                        setTaskCustomDay("+ Custom");
                        setTaskNotificationDate("");
                        setTaskNotificationTime("");
                        setTaskPriority("");
                        setTaskDescription("");
                        setTaskError("");
                        setSelectedTask(null);
                        setIsEditingTask(false);
                        setShowTaskModal(false);
                        setTasks((prev) => {
                          const updated = isEditingTask
                            ? prev.map((task) =>
                                task.id === data.id ? data : task,
                              )
                            : [data, ...prev];
                          return updated
                            .slice()
                            .sort(
                              (a, b) =>
                                (priorityOrder[a.priority?.toLowerCase()] ??
                                  3) -
                                (priorityOrder[b.priority?.toLowerCase()] ?? 3),
                            );
                        });

                        await fetchTasks();
                      } catch (err) {
                        console.error("Create task error:", err);
                        setTaskError(err.message || "Failed to create task.");
                      }
                    }}
                    className="cursor-pointer rounded-full border border-[#2f281e] bg-[#a8d6e6] px-[18px] py-[10px] text-[12px] font-bold text-[#1f1a14]"
                  >
                    {isEditingTask ? "Save changes" : "Create task"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" ? (
            <Notifications />
          ) : activeTab === "tasks" ? (
            <TasksView tasks={tasks} toggleTask={toggleTask} />
          ) : (
            <div className="grid flex-1 min-h-0 overflow-hidden gap-[14px] grid-cols-[370px_1fr_220px] grid-rows-[350px_1fr]">
              <section className="bg-[#ffffff] border border-[#ede7dd] rounded-[26px] p-[22px_25px_20px] overflow-hidden">
                <div className="flex items-center justify-between px-[16px] py-[14px]">
                  <h3 className="m-0 text-[17px] font-bold text-[#1f1a14]">
                    {monthLabel}
                  </h3>
                  <div className="flex items-center gap-[20px]">
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
                  {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
                    <div
                      key={day}
                      className="py-[8px] text-center text-[14px] font-medium text-[#2d261f]"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-y-[10px] pb-[8px]">
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
                        item.active ? "bg-[#a8d6e6] font-bold" : ""
                      } ${item.muted ? "text-[#3b342b] opacity-50" : "text-[#3b342b]"}`}
                    >
                      {item.day}
                    </button>
                  ))}
                </div>
              </section>

              <section className="bg-[#ffffff] border border-[#ede7dd] rounded-[26px] overflow-hidden">
                <div className="flex items-center justify-between px-[16px] py-[14px]">
                  <h3 className="m-0 text-[17px] font-bold text-[#1f1a14]">
                    My tasks ({tasks.length})
                  </h3>
                </div>

                <div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {tasks.length === 0 ? (
                      <div className="px-[16px] py-[20px] text-[14px] text-[#7a7268]">
                        No tasks yet.
                      </div>
                    ) : (
                      tasks.map((task, index) => (
                        <div
                          key={task.id}
                          onClick={() => handleOpenTaskDetails(task)}
                          className={`flex w-full cursor-pointer items-center gap-[12px] px-[16px] py-[14px] text-left ${
                            index !== tasks.length - 1
                              ? "border-b border-[#e7e1d7]"
                              : ""
                          }`}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTask(task);
                            }}
                            className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border-[1.8px] border-[#555] text-[14px] font-bold text-[#2f2a23] ${task.completed ? "bg-[#a8d6e6]" : "bg-transparent"}`}
                          >
                            {task.completed ? "✓" : ""}
                          </button>

                          <span
                            className={`w-[130px] shrink-0 overflow-hidden text-ellipsis whitespace-nowrap text-[15px] font-medium ${task.completed ? "text-[#8f877b] line-through" : "text-[#2f2b25]"}`}
                          >
                            {task.title}
                          </span>

                          <div className="w-[60px] flex justify-center">
                            {task.priority && (
                              <span
                                className={`rounded-full px-[12px] py-[5px] text-[13px] font-semibold ${task.priority === "high" ? "bg-[#ffd0d0] text-[#c0392b]" : task.priority === "medium" ? "bg-[#f5e7a8] text-[#6d5313]" : "bg-[#d5f5e3] text-[#1e8449]"}`}
                              >
                                {task.priority.charAt(0).toUpperCase() +
                                  task.priority.slice(1)}
                              </span>
                            )}
                          </div>
                          <div className="w-[240px] flex justify-center">
                            {task.category_name && (
                              <span
                                className={`rounded-full px-[12px] py-[5px] text-[13px] font-semibold ${categories.find((c) => c.name === task.category_name)?.color || "bg-[#F5F5FA] text-[#5f574d]"}`}
                              >
                                {task.category_name}
                              </span>
                            )}
                          </div>

                          <span className="w-[60px] shrink-0 text-right text-[13px] font-medium text-[#49423b]">
                            {" "}
                            {task.task_day_option === "custom"
                              ? task.task_custom_date
                              : task.task_day_option === "today"
                                ? "Today"
                                : task.task_day_option === "tomorrow"
                                  ? "Tomorrow"
                                  : task.notification_date || ""}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </section>

              <section className="row-span-2 flex flex-col h-full min-h-0 overflow-hidden bg-[#ffffff] border border-[#ede7dd] rounded-[26px] w-[220px]">
                {" "}
                <div className="flex items-center justify-between px-[16px] py-[14px]">
                  <h3 className="m-0 text-[17px] font-bold text-[#1f1a14]">
                    Reminders
                  </h3>
                </div>
                <div className="flex-1 flex flex-col min-h-0">
                  {" "}
                  <div className="flex-1 min-h-0 overflow-y-scroll">
                    {" "}
                    {reminders.map((reminder, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleOpenReminderDetails(reminder)}
                        className={`flex w-full items-start justify-between gap-[10px] px-[16px] py-[12px] text-left ${
                          index !== reminders.length - 1
                            ? "border-b border-[#e7e1d7]"
                            : ""
                        }`}
                      >
                        <div>
                          <div
                            className={`mb-[4px] text-[15px] font-bold ${
                              reminder.accomplished
                                ? "text-[#8f877b] line-through"
                                : "text-[#2a241d]"
                            }`}
                          >
                            {reminder.title}
                          </div>
                          <div className="mb-[6px] text-[12px] font-medium text-[#b58b3c]">
                            {reminder.deadline
                              ? (() => {
                                  const deadline = new Date(
                                    reminder.deadline.replace(" ", "T"),
                                  );
                                  const now = new Date();
                                  const isOverdue =
                                    deadline < now && !reminder.accomplished;

                                  return (
                                    <span
                                      className={
                                        isOverdue
                                          ? "text-[#c0392b] font-bold"
                                          : ""
                                      }
                                    >
                                      {deadline.toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      })}
                                      {isOverdue && " • Overdue"}
                                    </span>
                                  );
                                })()
                              : "No deadline"}{" "}
                          </div>
                          <div className="max-w-[180px] text-[14px] leading-[1.3] text-[#645c52]">
                            {reminder.description}{" "}
                          </div>
                        </div>

                        <div className="text-[30px] leading-none text-[#493f34]">
                          ›
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-end px-[16px] py-[14px]">
                    <button
                      type="button"
                      onClick={() => {
                        setReminderTitle("");
                        setReminderDeadline("");
                        setReminderTime("");
                        setReminderDescription("");
                        setReminderError("");
                        setShowReminderModal(true);
                      }}
                      className="flex h-[36px] w-[36px] items-center justify-center rounded-full border border-[#2f281e] bg-[#a8d6e6] text-[20px] font-bold leading-none text-[#1f1a14] transition duration-200 hover:scale-110 hover:shadow-md hover:bg-[#8dc4d4]"
                    >
                      +
                    </button>
                  </div>
                </div>
              </section>
              <section className="flex min-h-0 flex-col overflow-hidden rounded-[26px] border border-[#ede7dd] bg-[#ffffff]">
                <div className="flex items-center justify-between px-[16px] py-[14px]">
                  <h3 className="m-0 text-[17px] font-bold text-[#1f1a14]">
                    My categories
                  </h3>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-[16px] pb-[10px]">
                  <div className="flex flex-wrap gap-[14px]">
                    {categories.map((category) => (
                      <button
                        key={category.name}
                        type="button"
                        className={`inline-flex rounded-full px-[10px] py-[5px] text-[13px] font-medium transition duration-200 hover:scale-[1.05] hover:shadow-sm ${
                          category.color || "bg-[#F5F5FA] text-[#5f574d]"
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex shrink-0 justify-end px-[22px] py-[14px]">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategories(
                        categories.map((category) => ({
                          id: category.id,
                          name: category.name,
                          color:
                            category.color || "bg-[#F5F5FA] text-[#5f574d]",
                        })),
                      );
                      setShowCategoryModal(true);
                    }}
                    className="flex h-[36px] w-[36px] items-center justify-center rounded-full border border-[#2f281e] bg-[#a8d6e6] text-[20px] font-bold leading-none text-[#1f1a14] transition duration-200 hover:scale-110 hover:shadow-md hover:bg-[#8dc4d4]"
                  >
                    +
                  </button>
                </div>
              </section>

              <section className="flex flex-col h-full min-h-0 overflow-hidden bg-[#ffffff] border border-[#ede7dd] rounded-[26px]">
                {" "}
                <div className="flex items-center justify-between px-[16px] py-[14px]">
                  <h3 className="m-0 text-[17px] font-bold text-[#1f1a14]">
                    My tracking
                  </h3>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto">
                  {tracking.map((item, index) => {
                    const isActive = activeTrackerId === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`flex min-h-[64px] items-center justify-between px-[16px] py-[12px] ${
                          isActive
                            ? "border-l-[8px] border-l-[#a8d6e6] bg-[#e8f4f8]"
                            : "border-l-[8px] border-l-transparent"
                        } ${index !== tracking.length - 1 ? "border-b border-[#e7e1d7]" : ""}`}
                      >
                        <div className="flex items-center gap-[12px] flex-1 min-w-0">
                          {" "}
                          <div className="text-[20px] text-[#4a433c]">⏱</div>
                          <div className="min-w-0">
                            <div className="truncate text-[15px] font-bold text-[#2a241d]">
                              {item.title}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-[16px]">
                          <span
                            className={`min-w-[90px] text-right text-[#2a241d] ${
                              isActive
                                ? "text-[18px] font-bold"
                                : "text-[16px] font-medium"
                            }`}
                          >
                            {formatSeconds(item.remainingSeconds)}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleToggleTracker(item.id)}
                            className={`flex h-[32px] w-[32px] items-center justify-center rounded-full ${
                              isActive
                                ? "border border-[#6d5b1a] bg-[#a8d6e6] text-[13px] font-bold text-[#3d3210]"
                                : "text-[18px] text-[#4c4339]"
                            }`}
                          >
                            {isActive ? "❚❚" : "▶"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenTrackerDetails(item)}
                            className="text-[36px] leading-none text-[#4a433c]"
                          >
                            ›
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex shrink-0 justify-end px-[22px] py-[14px]">
                  <button
                    type="button"
                    onClick={() => {
                      setTrackerTitle("");
                      setTrackerTimer("");
                      setShowTrackerModal(true);
                    }}
                    className="flex h-[36px] w-[36px] items-center justify-center rounded-full border border-[#2f281e] bg-[#a8d6e6] text-[20px] font-bold leading-none text-[#1f1a14] transition duration-200 hover:scale-110 hover:shadow-md hover:bg-[#8dc4d4]"
                  >
                    +
                  </button>
                </div>
              </section>
            </div>
          )}
        </>
      </main>
    </div>
  );
}
