import React, { useEffect, useState } from "react";
import api from "../api/axios"; // твой axios instance

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // 🔁 Загрузка логов
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/logs/");
      setLogs(res.data.logs || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Не удалось загрузить логи");
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Автообновление каждые 5 сек
  useEffect(() => {
    fetchLogs();
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchLogs, 5000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "40px auto",
        fontFamily: "monospace",
      }}
    >
      <h2 style={{ marginBottom: 20 }}>📜 Логи Django</h2>

      <div style={{ marginBottom: 15, display: "flex", alignItems: "center" }}>
        <button
          onClick={fetchLogs}
          disabled={loading}
          style={{
            background: "#007bff",
            color: "#fff",
            border: "none",
            padding: "8px 14px",
            borderRadius: 4,
            cursor: "pointer",
            marginRight: 10,
          }}
        >
          {loading ? "Обновление..." : "🔄 Обновить"}
        </button>

        <label style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={() => setAutoRefresh(!autoRefresh)}
          />
          Автообновление
        </label>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: 6,
          padding: 10,
          background: "#1e1e1e",
          color: "#e0e0e0",
          height: 500,
          overflowY: "auto",
          whiteSpace: "pre-wrap",
          fontSize: 13,
        }}
      >
        {logs.length === 0 ? (
          <p style={{ color: "#888" }}>Нет логов</p>
        ) : (
          logs.map((line, i) => (
            <div
              key={i}
              style={{
                color:
                  line.includes("ERROR") || line.includes("Traceback")
                    ? "#ff6b6b"
                    : line.includes("WARNING")
                    ? "#ffcc00"
                    : "#a8ff60",
              }}
            >
              {line}
            </div>
          ))
        )}
      </div>
    </div>
  );
}