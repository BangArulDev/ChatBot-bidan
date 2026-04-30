import React, { useEffect, useState, useCallback } from "react";
import { ArrowPathIcon, TrashIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function ChatHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/chat-history`);
      if (res.ok) {
        const arr = await res.json();
        setHistory(arr.slice().reverse());
      } else {
        throw new Error("Failed to fetch from server");
      }
    } catch (e) {
      try {
        const raw = localStorage.getItem("chat_history");
        const arr = raw ? JSON.parse(raw) : [];
        setHistory(arr.reverse());
      } catch {
        setError("Gagal memuat riwayat chat");
        setHistory([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  async function clearAll() {
    if (!window.confirm("Yakin ingin menghapus semua riwayat chat?")) return;
    try {
      await fetch(`${API_BASE}/api/chat-history`, { method: "DELETE" });
      setHistory([]);
    } catch (e) {
      localStorage.removeItem("chat_history");
      setHistory([]);
    }
  }

  async function deleteItem(id) {
    if (!window.confirm("Hapus pesan ini?")) return;
    try {
      await fetch(`${API_BASE}/api/chat-history/${id}`, { method: "DELETE" });
      await fetchHistory();
    } catch (e) {
      const raw = localStorage.getItem("chat_history");
      const arr = raw ? JSON.parse(raw) : [];
      const next = arr.filter((r) => r.id !== id && r._id !== id);
      localStorage.setItem("chat_history", JSON.stringify(next));
      setHistory(next.reverse());
    }
  }

  async function exportJson() {
    const blob = new Blob([JSON.stringify(history.slice().reverse(), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `riwayat_chat_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalMessages = history.length;
  const userMessages = history.filter((h) => h.sender === "user").length;
  const botMessages = history.filter((h) => h.sender === "bot").length;

  return (
    <div style={{ padding: "28px 32px", background: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#0f172a",
            margin: 0,
            letterSpacing: "-0.3px",
          }}
        >
          Riwayat Chat
        </h1>
        <p style={{ fontSize: "14px", color: "#64748b", margin: "4px 0 0" }}>
          Monitor dan kelola percakapan pengguna dengan Bidan Nisa
        </p>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {[
          { label: "Total Pesan", value: totalMessages, color: "#ec4899", bg: "rgba(236,72,153,0.08)" },
          { label: "Pesan Pengguna", value: userMessages, color: "#3b82f6", bg: "rgba(59,130,246,0.08)" },
          { label: "Respons Bot", value: botMessages, color: "#10b981", bg: "rgba(16,185,129,0.08)" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="stat-card"
            style={{
              background: "white",
              borderRadius: "14px",
              padding: "20px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 8px", fontWeight: "500" }}>
              {stat.label}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "28px", fontWeight: "700", color: stat.color }}>
                {loading ? "—" : stat.value}
              </span>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: stat.color,
                  opacity: 0.5,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Table Container */}
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          overflow: "hidden",
        }}
      >
        {/* Table Toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: loading ? "#f59e0b" : "#10b981",
              }}
              className={loading ? "pulse-dot" : ""}
            />
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>
              {loading ? "Memuat data..." : `${totalMessages} pesan`}
            </span>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={fetchHistory}
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "8px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                fontSize: "13px",
                fontWeight: "500",
                color: "#475569",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <ArrowPathIcon style={{ width: "14px", height: "14px", color: "#64748b" }} />
              Refresh
            </button>
            <button
              onClick={exportJson}
              disabled={loading || history.length === 0}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                border: "none",
                fontSize: "13px",
                fontWeight: "500",
                color: "white",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(59,130,246,0.3)",
              }}
            >
              <ArrowDownTrayIcon style={{ width: "14px", height: "14px" }} />
              Ekspor
            </button>
            <button
              onClick={clearAll}
              disabled={loading || history.length === 0}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                border: "none",
                fontSize: "13px",
                fontWeight: "500",
                color: "white",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(239,68,68,0.25)",
              }}
            >
              <TrashIcon style={{ width: "14px", height: "14px" }} />
              Hapus Semua
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "3px solid #f1f5f9",
                borderTopColor: "#ec4899",
                animation: "spin 1s linear infinite",
                margin: "0 auto 16px",
              }}
            />
            <p style={{ color: "#94a3b8", fontSize: "14px" }}>Memuat riwayat chat...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : error ? (
          <div
            style={{
              padding: "48px",
              textAlign: "center",
              color: "#ef4444",
              fontSize: "14px",
            }}
          >
            ⚠️ {error}
          </div>
        ) : history.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <p style={{ fontSize: "32px", margin: "0 0 12px" }}>💬</p>
            <p style={{ color: "#94a3b8", fontSize: "14px", fontWeight: "500" }}>
              Belum ada riwayat chat
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Waktu", "Nama Pengguna", "Pengirim", "Pesan", "Aksi"].map((col) => (
                    <th
                      key={col}
                      style={{
                        padding: "12px 20px",
                        textAlign: "left",
                        fontSize: "11px",
                        fontWeight: "700",
                        color: "#94a3b8",
                        letterSpacing: "0.8px",
                        textTransform: "uppercase",
                        borderBottom: "1px solid #f1f5f9",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((h, idx) => (
                  <tr
                    key={h._id || h.id || idx}
                    className="table-row"
                    style={{ borderBottom: "1px solid #f8fafc" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fdf2f8")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td
                      style={{
                        padding: "14px 20px",
                        fontSize: "12px",
                        color: "#64748b",
                        whiteSpace: "nowrap",
                        verticalAlign: "top",
                      }}
                    >
                      {formatDate(h.createdAt || h.time)}
                    </td>
                    <td
                      style={{
                        padding: "14px 20px",
                        fontSize: "13px",
                        color: "#475569",
                        verticalAlign: "top",
                        fontWeight: "500",
                      }}
                    >
                      {h.userName || h.name || (h.sender === "user" ? "Pengguna" : "Bidan Nisa")}
                    </td>
                    <td style={{ padding: "14px 20px", verticalAlign: "top" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "3px 10px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: "600",
                          background:
                            h.sender === "user"
                              ? "rgba(59,130,246,0.1)"
                              : "rgba(236,72,153,0.1)",
                          color: h.sender === "user" ? "#3b82f6" : "#ec4899",
                        }}
                      >
                        {h.sender === "user" ? "👤 User" : "🤖 Bot"}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "14px 20px",
                        fontSize: "13px",
                        color: "#334155",
                        maxWidth: "400px",
                        verticalAlign: "top",
                        lineHeight: "1.5",
                      }}
                    >
                      <div
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {h.text}
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px", verticalAlign: "top" }}>
                      <button
                        onClick={() => deleteItem(h._id || h.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "6px 10px",
                          borderRadius: "7px",
                          background: "rgba(239,68,68,0.08)",
                          border: "1px solid rgba(239,68,68,0.15)",
                          fontSize: "12px",
                          fontWeight: "500",
                          color: "#ef4444",
                          cursor: "pointer",
                          transition: "all 0.15s",
                          whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(239,68,68,0.15)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(239,68,68,0.08)";
                        }}
                      >
                        <TrashIcon style={{ width: "12px", height: "12px" }} />
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
