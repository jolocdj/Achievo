import { useMemo, useState } from "react";

export default function Dashboard() {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Finish monthly reporting", due: "Today", done: true },
    { id: 2, title: "Contract signing", due: "Today", done: false },
    { id: 3, title: "Market overview keynote", due: "Tomorrow", done: false },
    { id: 4, title: "Project research", due: "Tomorrow", done: false },
    { id: 5, title: "Prepare invoices", due: "This week", done: false },
  ]);

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task,
      ),
    );
  };
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

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
  const categories = [
    { name: "Work", people: ["A", "B"] },
    { name: "Family", people: ["A", "B", "C"] },
    { name: "Freelance work 01", people: ["A", "B"] },
    { name: "Conference planning", people: ["A"] },
  ];

  const tracking = [
    { title: "Create wireframe", time: "1h 25m 30s", active: true },
    { title: "Slack logo design", time: "30m 18s", active: false },
    { title: "Dashboard design", time: "1h 48m 22s", active: false },
    { title: "Create wireframe", time: "17m 1s", active: false },
    { title: "Mood tracker", time: "15h 5m 58s", active: false },
  ];

  const comments = [
    {
      title: "Market research",
      text: "Find my keynote attached...",
    },
    {
      title: "Market research",
      text: "I've added the data. Let's check it out toge...",
    },
  ];

  return (
    <div style={styles.page}>
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

      <aside style={styles.sidebar}>
        <div>
          <div style={styles.logoWrap}>
            <div style={styles.logoIcon}>AŽ</div>
            <div style={styles.logoText}>Organizo</div>
          </div>

          <div style={styles.menu}>
            <div style={{ ...styles.menuItem, ...styles.menuItemActive }}>
              <span style={styles.menuIcon}>⊞</span>
              <span>Dashboard</span>
            </div>

            <div style={styles.menuItem}>
              <span style={styles.menuIcon}>◉</span>
              <span>My tasks</span>
            </div>

            <div style={styles.menuItem}>
              <span style={styles.menuIcon}>◌</span>
              <span>Notifications</span>
            </div>
          </div>
        </div>

        <div>
          <div style={styles.bottomMenuItem}>
            <span style={styles.menuIcon}>☷</span>
            <span>Settings</span>
          </div>

          <div style={styles.bottomMenuItem}>
            <span style={styles.menuIcon}>↪</span>
            <span>Log out</span>
          </div>
        </div>
      </aside>

      <main style={styles.main}>
        <div style={styles.topbar}>
          <input type="text" placeholder="Search" style={styles.search} />

          <div style={styles.topActions}>
            <button style={styles.newTaskBtn}>＋ New task</button>
            <button style={styles.iconBtn}>✉</button>
            <div style={styles.profile}>🧑</div>
          </div>
        </div>

        <div style={styles.grid}>
          <section style={styles.calendarCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>{monthLabel}</h3>
              <div style={styles.headerIcons}>
                <button
                  type="button"
                  onClick={goToPreviousMonth}
                  style={styles.arrowButton}
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={goToNextMonth}
                  style={styles.arrowButton}
                >
                  ›
                </button>
              </div>
            </div>

            <div style={styles.weekRow}>
              {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
                <div key={day} style={styles.weekDay}>
                  {day}
                </div>
              ))}
            </div>

            <div style={styles.daysGrid}>
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
                  style={{
                    ...styles.dayCell,
                    color: item.muted ? "#c8c1b7" : "#3b342b",
                    background: item.active ? "#f2d541" : "transparent",
                    fontWeight: item.active ? 700 : 500,
                    cursor: "pointer",
                    border: "none",
                  }}
                >
                  {item.day}
                </button>
              ))}
            </div>
          </section>

          <section style={styles.tasksCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>My tasks (05)</h3>
              <div style={styles.dots}>⋮</div>
            </div>

            <div>
              {tasks.map((task, index) => (
                <div
                  key={task.id}
                  style={{
                    ...styles.taskRow,
                    borderBottom:
                      index !== tasks.length - 1 ? "1px solid #e7e1d7" : "none",
                  }}
                >
                  <div style={styles.taskLeft}>
                    <button
                      onClick={() => toggleTask(task.id)}
                      style={{
                        ...styles.checkCircle,
                        background: task.done ? "#f2d541" : "transparent",
                        borderColor: "#555",
                      }}
                    >
                      {task.done ? "✓" : ""}
                    </button>

                    <span
                      style={{
                        ...styles.taskTitle,
                        textDecoration: task.done ? "line-through" : "none",
                        color: task.done ? "#8f877b" : "#2f2b25",
                      }}
                    >
                      {task.title}
                    </span>
                  </div>

                  <span
                    style={{
                      ...styles.taskDue,
                      color: task.due === "Today" ? "#d7a53b" : "#49423b",
                    }}
                  >
                    {task.due}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section style={styles.commentsCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>New comments</h3>
            </div>

            {comments.map((comment, index) => (
              <div
                key={index}
                style={{
                  ...styles.commentRow,
                  borderBottom:
                    index !== comments.length - 1
                      ? "1px solid #e7e1d7"
                      : "none",
                }}
              >
                <div>
                  <div style={styles.commentTitle}>{comment.title}</div>
                  <div style={styles.commentText}>{comment.text}</div>
                </div>
                <div style={styles.commentArrow}>›</div>
              </div>
            ))}

            <div style={styles.addRow}>＋ Add</div>
          </section>

          <section style={styles.categoriesCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>My categories</h3>
              <div style={styles.dots}>⋮</div>
            </div>

            {categories.map((category, index) => (
              <div
                key={category.name}
                style={{
                  ...styles.categoryRow,
                  borderBottom:
                    index !== categories.length - 1
                      ? "1px solid #e7e1d7"
                      : "none",
                }}
              >
                <div style={styles.categoryLeft}>
                  <span style={styles.categoryIcon}>
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

                <div style={styles.avatarGroup}>
                  {category.people.map((person, i) => (
                    <div
                      key={i}
                      style={{
                        ...styles.avatar,
                        marginLeft: i === 0 ? 0 : -8,
                      }}
                    >
                      {person}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div style={styles.addMore}>＋ Add more</div>
          </section>

          <section style={styles.trackingCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>My tracking</h3>
            </div>

            {tracking.map((item, index) => (
              <div
                key={index}
                style={{
                  ...styles.trackRow,
                  background: item.active ? "#f6f1de" : "transparent",
                  borderLeft: item.active
                    ? "8px solid #f2d541"
                    : "8px solid transparent",
                  borderBottom:
                    index !== tracking.length - 1
                      ? "1px solid #e7e1d7"
                      : "none",
                }}
              >
                <div style={styles.trackLeft}>
                  <span style={styles.trackIcon}>◴</span>
                  <span style={styles.trackTitle}>{item.title}</span>
                </div>

                <div style={styles.trackRight}>
                  <span
                    style={{
                      ...styles.trackTime,
                      fontSize: item.active ? "18px" : "16px",
                      fontWeight: item.active ? 700 : 500,
                    }}
                  >
                    {item.time}
                  </span>

                  {item.active ? (
                    <div style={styles.pauseBtn}>❚❚</div>
                  ) : (
                    <div style={styles.playBtn}>▶</div>
                  )}

                  <span style={styles.dots}>⋮</span>
                </div>
              </div>
            ))}
          </section>

          <section style={styles.widgetCard}>
            <div style={styles.widgetInner}>
              <div style={styles.widgetPlus}>＋</div>
              <div style={styles.widgetText}>Add widget</div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

const cardBase = {
  background: "#fbf9f6",
  height: "100%",
  minHeight: 0,
  borderRadius: "26px",
  border: "1px solid #ede7dd",
  overflow: "hidden",
};

const styles = {
  page: {
    height: "100vh",
    width: "100vw",
    overflow: "hidden",
    display: "flex",
    background: "#f7f4ef",
    padding: "18px",
    gap: "14px",
    fontFamily: "'DM Sans', sans-serif",
    color: "#1f1a14",
  },

  sidebar: {
    width: "250px",
    height: "100%",
    background: "#fbf9f6",
    borderRadius: "28px",
    border: "1px solid #ece5db",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    overflow: "hidden",
  },

  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "20px 26px",
    borderBottom: "1px solid #ece5db",
  },

  logoIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "#f2d541",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "13px",
    color: "#2b241b",
  },

  logoText: {
    fontFamily: "'Corben', cursive",
    fontSize: "18px",
    fontWeight: 400,
    color: "#1d1812",
  },

  menu: {
    display: "flex",
    flexDirection: "column",
  },

  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "18px 28px",
    fontSize: "18px",
    color: "#2f2a23",
    borderBottom: "1px solid #ece5db",
  },

  menuItemActive: {
    background: "#f1ede3",
    borderLeft: "8px solid #f2d541",
    paddingLeft: "20px",
    fontWeight: 700,
  },

  menuIcon: {
    width: "22px",
    display: "inline-flex",
    justifyContent: "center",
    fontSize: "20px",
    color: "#43392d",
  },

  bottomMenuItem: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "22px 28px",
    fontSize: "18px",
    color: "#2f2a23",
    borderTop: "1px solid #ece5db",
  },

  main: {
    flex: 1,
    height: "100%",
    minWidth: 0,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "14px",
    padding: "4px 6px 8px",
  },

  search: {
    width: "310px",
    maxWidth: "100%",
    background: "#efebe7",
    border: "none",
    outline: "none",
    borderRadius: "16px",
    padding: "14px 22px",
    fontSize: "20px",
    color: "#5b544c",
  },

  topActions: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },

  newTaskBtn: {
    background: "#f2d541",
    border: "2px solid #2f281e",
    borderRadius: "999px",
    padding: "14px 22px",
    fontSize: "18px",
    fontWeight: 700,
    cursor: "pointer",
    color: "#1f1a14",
  },

  iconBtn: {
    background: "transparent",
    border: "none",
    fontSize: "30px",
    cursor: "pointer",
    color: "#2d261d",
    padding: 0,
  },

  profile: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background: "#d7b678",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    border: "2px solid #2d261d",
  },

  grid: {
    display: "grid",
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
    gridTemplateColumns: "370px 1fr 220px",
    gridTemplateRows: "1fr 1fr",
    gap: "14px",
    alignItems: "stretch",
  },

  calendarCard: {
    ...cardBase,
    padding: "22px 24px",
  },

  tasksCard: {
    ...cardBase,
  },

  commentsCard: {
    ...cardBase,
    width: "220px",
    minWidth: "220px",
    maxWidth: "220px",
  },
  categoriesCard: {
    ...cardBase,
  },

  trackingCard: {
    ...cardBase,
  },

  widgetCard: {
    ...cardBase,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f7f4ef",
    border: "none",
  },

  widgetInner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    color: "#1f1a14",
    fontWeight: 700,
    fontSize: "18px",
  },

  widgetPlus: {
    fontSize: "34px",
    lineHeight: 1,
  },

  widgetText: {
    fontSize: "18px",
    fontWeight: 700,
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
  },

  cardTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 700,
    color: "#1f1a14",
  },

  headerIcons: {
    display: "flex",
    gap: "18px",
    alignItems: "center",
  },

  arrow: {
    fontSize: "36px",
    lineHeight: 1,
    color: "#3c342b",
    cursor: "pointer",
  },

  dots: {
    fontSize: "26px",
    color: "#4a433c",
    lineHeight: 1,
  },

  weekRow: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    marginTop: "8px",
    marginBottom: "10px",
  },

  weekDay: {
    textAlign: "center",
    fontSize: "14px",
    fontWeight: 500,
    color: "#2d261f",
    padding: "8px 0",
  },

  daysGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "8px 0",
  },

  dayCell: {
    width: "30px",
    height: "30px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
  },

  taskRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
  },

  taskLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    minWidth: 0,
  },

  checkCircle: {
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    border: "1.8px solid #62584d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
    color: "#2f2a23",
    flexShrink: 0,
  },

  taskTitle: {
    fontSize: "15px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "220px",
  },

  taskDue: {
    fontSize: "15px",
    fontWeight: 500,
    flexShrink: 0,
  },

  commentRow: {
    padding: "12px 16px",
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "flex-start",
  },

  commentTitle: {
    fontSize: "15px",
    fontWeight: 700,
    marginBottom: "6px",
    color: "#2a241d",
  },

  commentText: {
    fontSize: "14px",
    color: "#645c52",
    lineHeight: 1.3,
    maxWidth: "180px",
  },

  commentArrow: {
    fontSize: "30px",
    lineHeight: 1,
    color: "#493f34",
  },

  addRow: {
    padding: "18px 22px",
    fontSize: "16px",
    fontWeight: 700,
    color: "#2a241d",
  },

  categoryRow: {
    padding: "12px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  categoryLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    fontSize: "16px",
    color: "#2c251d",
  },

  categoryIcon: {
    width: "24px",
    display: "inline-flex",
    justifyContent: "center",
    fontSize: "20px",
    color: "#5a5249",
  },

  avatarGroup: {
    display: "flex",
    alignItems: "center",
  },

  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "#d1b38a",
    border: "2px solid #fbf9f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: 700,
    color: "#2d241a",
  },

  addMore: {
    padding: "18px 22px",
    fontSize: "16px",
    fontWeight: 700,
    color: "#2a241d",
  },
  trackRow: {
    padding: "12px 14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: "48px",
  },

  trackLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  trackIcon: {
    fontSize: "22px",
    color: "#4f463d",
  },

  trackTitle: {
    fontSize: "16px",
    color: "#2b241d",
  },

  trackRight: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  trackTime: {
    color: "#2a241d",
    minWidth: "110px",
    textAlign: "right",
  },

  pauseBtn: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "#f2d541",
    border: "1.5px solid #6d5b1a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: 700,
    color: "#3d3210",
  },

  playBtn: {
    width: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    color: "#4c4339",
  },
};
