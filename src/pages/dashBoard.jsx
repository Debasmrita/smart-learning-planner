import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";
import { toast } from "react-toastify";

export default function Dashboard() {
  const navigate = useNavigate();

  const [topic, setTopic] = useState("");
  const [priority, setPriority] = useState(3);

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  // ⭐ NEW FEATURE
  const [progressStats, setProgressStats] = useState(null);
  const [nextTopic, setNextTopic] = useState(null);

  const token = localStorage.getItem("token");

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("student");
    localStorage.removeItem("resetEmail");

    window.dispatchEvent(new Event("authChanged"));

    toast.info("Logged out successfully 👋");
    navigate("/login");
  };

  // LOAD TOPICS
  const fetchTopics = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/topics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.status === 401 || res.status === 403) {
        toast.error("Session expired. Please login again.");
        logout();
        return;
      }

      if (!res.ok) {
        toast.error(data.message || "Failed to load topics ❌");
        return;
      }

      setTopics(data);
    } catch (err) {
      toast.error("Backend not running on port 5000 ❌");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ⭐ NEW FEATURE — PROGRESS API
  const fetchProgress = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/topics/progress", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setProgressStats(data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ⭐ NEW FEATURE — NEXT TOPIC SUGGESTION
  const fetchNextTopic = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/topics/next", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setNextTopic(data.topic);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchTopics();

    // ⭐ NEW FEATURE
    fetchProgress();
    fetchNextTopic();

  }, [token, navigate]);

  // ADD TOPIC
  const addTopic = async () => {
    const name = topic.trim();
    if (!name) return toast.error("Topic name is required");

    try {
      const res = await fetch("http://localhost:5000/api/topics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, priority }),
      });

      const data = await res.json();

      if (res.status === 401 || res.status === 403) {
        toast.error("Session expired. Please login again.");
        logout();
        return;
      }

      if (!res.ok) {
        toast.error(data.message || "Failed to add topic ❌");
        return;
      }

      setTopics((prev) => [...prev, data.topic]);
      setTopic("");

      toast.success("Topic added ✅");

      // ⭐ NEW FEATURE
      fetchProgress();
      fetchNextTopic();

    } catch (err) {
      toast.error("Backend not running on port 5000 ❌");
      console.log(err);
    }
  };

  // MARK DONE
  const markDone = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/topics/${id}/done`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed ❌");
        return;
      }

      setTopics((prev) => prev.map((t) => (t._id === id ? data.topic : t)));
      toast.success("Marked as completed ✅");

      // ⭐ NEW FEATURE
      fetchProgress();
      fetchNextTopic();

    } catch (err) {
      toast.error("Something went wrong ❌");
    }
  };

  // UNDO
  const undoDone = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/topics/${id}/undo`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed ❌");
        return;
      }

      setTopics((prev) => prev.map((t) => (t._id === id ? data.topic : t)));
      toast.info("Undo successful ↩");

      // ⭐ NEW FEATURE
      fetchProgress();
      fetchNextTopic();

    } catch (err) {
      toast.error("Something went wrong ❌");
    }
  };

  // MISSED
  const missed = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/topics/${id}/missed`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed ❌");
        return;
      }

      setTopics((prev) => prev.map((t) => (t._id === id ? data.topic : t)));
      toast.warning("Missed! Priority increased ⚡");

      // ⭐ NEW FEATURE
      fetchNextTopic();

    } catch (err) {
      toast.error("Something went wrong ❌");
    }
  };

  // DELETE
  const deleteTopic = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/topics/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed ❌");
        return;
      }

      setTopics((prev) => prev.filter((t) => t._id !== id));
      toast.success("Deleted 🗑️");

      // ⭐ NEW FEATURE
      fetchProgress();
      fetchNextTopic();

    } catch (err) {
      toast.error("Something went wrong ❌");
    }
  };

  const sortedTopics = useMemo(() => {
    return [...topics].sort((a, b) => b.priority - a.priority);
  }, [topics]);

  const total = topics.length;
  const doneCount = topics.filter((t) => t.done).length;
  const progress = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  const completedToday = topics.filter((t) => {
    if (!t.completedAt) return false;
    return new Date(t.completedAt).toDateString() === new Date().toDateString();
  }).length;

  const completedThisWeek = topics.filter((t) => {
    if (!t.completedAt) return false;
    const completedDate = new Date(t.completedAt);
    const now = new Date();
    const diff = (now - completedDate) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;

  const overdue = topics.filter((t) => !t.done && t.priority >= 4).length;

  // ⭐ STUDY STREAK FEATURE
const getStudyStreak = () => {
  const completedDates = topics
    .filter((t) => t.completedAt)
    .map((t) => new Date(t.completedAt).toDateString());

  const uniqueDates = [...new Set(completedDates)];

  let streak = 0;
  let current = new Date();

  while (true) {
    const dateString = current.toDateString();

    if (uniqueDates.includes(dateString)) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

const studyStreak = getStudyStreak();
  return (
    <div className="container">
      {/* HEADER */}
      <div className="topHeader">
        <div>
          <h1>📚 StudyBuddy</h1>
          <p className="subtitle">
            Your personal academic success companion ✨
          </p>
        </div>

        <div className="topRight">
          <div className="topStats">
            <div className="statCard">
              <p>Total</p>
              <h2>{total}</h2>
            </div>

            <div className="statCard">
              <p>Done</p>
              <h2>{doneCount}</h2>
            </div>

            <div className="statCard">
              <p>Progress</p>
              <h2>{progress}%</h2>
            </div>
          </div>
        </div>
      </div>

      {/* DASH GRID */}
      <div className="dashGrid">
        {/* LEFT */}
        <div className="colLeft">
          <div className="card add-topic">
            <h2>✨ Quick Task Creator</h2>

            <label>What needs to be done?</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Topic name"
            />

            <label>Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value={3}>High</option>
              <option value={2}>Medium</option>
              <option value={1}>Low</option>
            </select>

            <button className="primary bigBtn" onClick={addTopic}>
              ＋ Add Topic
            </button>
          </div>

          <div className="card achievement-card">
            <h2>🎯 Achievement Dashboard</h2>

            <div className="achRow">
              <span>Today's Tasks</span>
              <b>{completedToday}</b>
            </div>

            <div className="achRow">
              <span>This Week</span>
              <b>{completedThisWeek}</b>
            </div>

            <div className="achRow">
              <span>Overdue</span>
              <b className="red">{overdue}</b>
            </div>

            <div className="achBar">
              <div className="achFill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>

        {/* MIDDLE */}
        <div className="colMiddle">
          <div className="card plan-card">
            <h2>⏱ Study Journey</h2>

            {loading ? (
              <p className="muted">Loading topics...</p>
            ) : sortedTopics.length === 0 ? (
              <p className="muted">No topics added yet.</p>
            ) : (
              <ul className="journeyList">
                {sortedTopics.map((t) => (
                  <li
                    key={t._id}
                    className={`journeyItem ${t.done ? "doneCard" : ""}`}
                  >
                    <div className="journeyLeft">
                      <div className="journeyTitle">{t.name}</div>

                      <div className="pillRow">
                        <span className="pill blue">
                          {t.priority >= 3
                            ? "High"
                            : t.priority === 2
                            ? "Medium"
                            : "Low"}
                        </span>

                        {t.done ? (
                          <span className="pill green">Completed</span>
                        ) : (
                          <span className="pill gray">Pending</span>
                        )}
                      </div>
                    </div>

                    <div className="journeyBtns">
                      {!t.done ? (
                        <>
                          <button
                            className="success"
                            onClick={() => markDone(t._id)}
                          >
                            ✓ Complete
                          </button>

                          <button
                            className="danger"
                            onClick={() => missed(t._id)}
                          >
                            ✕ Missed
                          </button>
                        </>
                      ) : (
                        <button
                          className="warning"
                          onClick={() => undoDone(t._id)}
                        >
                          ↩ Undo
                        </button>
                      )}

                      <button
                        className="deleteBtn"
                        onClick={() => deleteTopic(t._id)}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="colRight">
          <div className="card">
  <p className="muted">
    Study Streak: <b>{studyStreak}</b> day{studyStreak !== 1 ? "s" : ""} 🔥
  </p>

  {studyStreak >= 5 && (
    <p className="muted">🔥 Amazing consistency!</p>
  )}

  {studyStreak >= 3 && studyStreak < 5 && (
    <p className="muted">Keep the streak going 💪</p>
  )}
</div>

          {/* ⭐ NEW FEATURE */}
          <div className="card suggestion-card">
            <h2>📌 Suggested Topic</h2>

            {nextTopic ? (
              <>
                <p><b>{nextTopic.name}</b></p>
                <p className="muted">Priority: {nextTopic.priority}</p>
              </>
            ) : (
              <p className="muted">All topics completed 🎉</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}