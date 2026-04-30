import React, { useEffect, useState, useCallback } from "react";
import {
  ArrowPathIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  UserCircleIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function ChatHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedUsers, setExpandedUsers] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

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

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("id-ID", { timeStyle: "short" }).format(date);
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
        setHistory(arr);
      } else {
        throw new Error("Failed to fetch from server");
      }
    } catch (e) {
      try {
        const raw = localStorage.getItem("chat_history");
        const arr = raw ? JSON.parse(raw) : [];
        setHistory(arr);
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

  // Group chats by userId
  const groupedByUser = history.reduce((acc, chat) => {
    const key = chat.userId || "anonymous";
    if (!acc[key]) {
      acc[key] = {
        userId: key,
        userName: chat.userName || "Pengguna",
        messages: [],
      };
    }
    acc[key].messages.push(chat);
    return acc;
  }, {});

  const userGroups = Object.values(groupedByUser)
    .map((group) => ({
      ...group,
      messages: group.messages.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      ),
      lastMessage: group.messages[group.messages.length - 1],
    }))
    .sort((a, b) => new Date(b.lastMessage?.createdAt) - new Date(a.lastMessage?.createdAt));

  const filteredGroups = userGroups.filter((g) =>
    g.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.userId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUser = (userId) => {
    setExpandedUsers((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  async function clearAll() {
    if (!window.confirm("Yakin ingin menghapus semua riwayat chat?")) return;
    try {
      await fetch(`${API_BASE}/api/chat-history`, { method: "DELETE" });
      setHistory([]);
    } catch {
      localStorage.removeItem("chat_history");
      setHistory([]);
    }
  }

  async function deleteItem(id) {
    try {
      await fetch(`${API_BASE}/api/chat-history/${id}`, { method: "DELETE" });
      setHistory((prev) => prev.filter((m) => (m._id || m.id) !== id));
    } catch (e) {
      const raw = localStorage.getItem("chat_history");
      const arr = raw ? JSON.parse(raw) : [];
      const next = arr.filter((r) => r.id !== id);
      localStorage.setItem("chat_history", JSON.stringify(next));
      setHistory(next);
    }
  }

  async function exportJson() {
    const blob = new Blob([JSON.stringify(history, null, 2)], {
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
  const totalUsers = Object.keys(groupedByUser).length;
  const botMessages = history.filter((h) => h.sender === "bot").length;

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#0f172a", margin: 0, letterSpacing: "-0.3px" }}>
          Riwayat Chat
        </h1>
        <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0" }}>
          Monitor percakapan pengguna dengan Bidan Nisa
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {[
          { label: "Total Pengguna", value: totalUsers, color: "#ec4899", icon: "👥" },
          { label: "Total Pesan", value: totalMessages, color: "#3b82f6", icon: "💬" },
          { label: "Respons Bot", value: botMessages, color: "#10b981", icon: "🤖" },
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
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div style={{ fontSize: "28px" }}>{stat.icon}</div>
            <div>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 4px", fontWeight: "500" }}>
                {stat.label}
              </p>
              <p style={{ fontSize: "26px", fontWeight: "800", color: stat.color, margin: 0 }}>
                {loading ? "—" : stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Actions */}
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          overflow: "hidden",
        }}
      >
        {/* Toolbar */}
        <div
          className="toolbar"
          style={{ gap: "10px" }}
        >
          {/* Search */}
          <div style={{ position: "relative", flex: 1, maxWidth: "320px" }}>
            <span
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "15px",
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="Cari nama pengguna..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                paddingLeft: "36px",
                paddingRight: "12px",
                paddingTop: "8px",
                paddingBottom: "8px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "13px",
                color: "#334155",
                background: "#f8fafc",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div className="toolbar-actions">
            <button
              onClick={fetchHistory}
              disabled={loading}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 14px", borderRadius: "8px",
                background: "#f8fafc", border: "1px solid #e2e8f0",
                fontSize: "13px", fontWeight: "500", color: "#475569", cursor: "pointer",
              }}
            >
              <ArrowPathIcon style={{ width: "14px", height: "14px" }} />
              Refresh
            </button>
            <button
              onClick={exportJson}
              disabled={loading || history.length === 0}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 14px", borderRadius: "8px",
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                border: "none", fontSize: "13px", fontWeight: "500",
                color: "white", cursor: "pointer",
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
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 14px", borderRadius: "8px",
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                border: "none", fontSize: "13px", fontWeight: "500",
                color: "white", cursor: "pointer",
                boxShadow: "0 2px 8px rgba(239,68,68,0.25)",
              }}
            >
              <TrashIcon style={{ width: "14px", height: "14px" }} />
              Hapus Semua
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <div
              style={{
                width: "40px", height: "40px", borderRadius: "50%",
                border: "3px solid #f1f5f9", borderTopColor: "#ec4899",
                animation: "spin 1s linear infinite", margin: "0 auto 16px",
              }}
            />
            <p style={{ color: "#94a3b8", fontSize: "14px" }}>Memuat riwayat chat...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : error ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#ef4444", fontSize: "14px" }}>
            ⚠️ {error}
          </div>
        ) : filteredGroups.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <p style={{ fontSize: "32px", margin: "0 0 12px" }}>💬</p>
            <p style={{ color: "#94a3b8", fontSize: "14px", fontWeight: "500" }}>
              {searchQuery ? "Tidak ada pengguna yang cocok" : "Belum ada riwayat chat"}
            </p>
          </div>
        ) : (
          <div>
            {filteredGroups.map((group, gIdx) => {
              const isExpanded = expandedUsers[group.userId];
              const lastMsg = group.lastMessage;
              const userMsgCount = group.messages.filter((m) => m.sender === "user").length;

              return (
                <div
                  key={group.userId}
                  style={{ borderBottom: gIdx < filteredGroups.length - 1 ? "1px solid #f1f5f9" : "none" }}
                >
                  {/* User Row (clickable header) */}
                  <div
                    onClick={() => toggleUser(group.userId)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "16px 20px",
                      cursor: "pointer",
                      background: isExpanded ? "#fdf2f8" : "white",
                      transition: "background 0.15s",
                      gap: "14px",
                    }}
                    onMouseEnter={(e) => { if (!isExpanded) e.currentTarget.style.background = "#fafafa"; }}
                    onMouseLeave={(e) => { if (!isExpanded) e.currentTarget.style.background = "white"; }}
                  >
                    {/* Avatar */}
                    <div
                      style={{
                        width: "42px", height: "42px", borderRadius: "12px",
                        background: "linear-gradient(135deg, #ec4899, #a855f7)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "16px", fontWeight: "700", color: "white",
                        flexShrink: 0, boxShadow: "0 2px 8px rgba(236,72,153,0.3)",
                      }}
                    >
                      {group.userName.charAt(0).toUpperCase()}
                    </div>

                    {/* User Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                        <span style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>
                          {group.userName}
                        </span>
                        <span
                          style={{
                            fontSize: "10px", padding: "2px 8px", borderRadius: "20px",
                            background: "rgba(236,72,153,0.1)", color: "#ec4899", fontWeight: "600",
                          }}
                        >
                          {group.messages.length} pesan
                        </span>
                        <span
                          style={{
                            fontSize: "10px", padding: "2px 8px", borderRadius: "20px",
                            background: "rgba(59,130,246,0.1)", color: "#3b82f6", fontWeight: "600",
                          }}
                        >
                          {userMsgCount} pertanyaan
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: "12px", color: "#64748b", margin: 0,
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                          maxWidth: "500px",
                        }}
                      >
                        💬 {lastMsg?.text || "—"}
                      </p>
                    </div>

                    {/* Time & Chevron */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                      <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                        {lastMsg ? formatDate(lastMsg.createdAt) : "—"}
                      </span>
                      {isExpanded ? (
                        <ChevronDownIcon style={{ width: "16px", height: "16px", color: "#ec4899" }} />
                      ) : (
                        <ChevronRightIcon style={{ width: "16px", height: "16px", color: "#94a3b8" }} />
                      )}
                    </div>
                  </div>

                  {/* Expanded Chat Detail */}
                  {isExpanded && (
                    <div
                      style={{
                        background: "#fdf2f8",
                        borderTop: "1px solid #fce7f3",
                        padding: "20px 24px",
                      }}
                    >
                      {/* Chat header */}
                      <div
                        style={{
                          display: "flex", alignItems: "center", gap: "8px",
                          marginBottom: "16px",
                        }}
                      >
                        <ChatBubbleLeftRightIcon style={{ width: "16px", height: "16px", color: "#ec4899" }} />
                        <span style={{ fontSize: "13px", fontWeight: "700", color: "#be185d" }}>
                          Percakapan {group.userName}
                        </span>
                      </div>

                      {/* Chat messages */}
                      <div
                        style={{
                          background: "white",
                          borderRadius: "12px",
                          border: "1px solid #fce7f3",
                          overflow: "hidden",
                          maxHeight: "400px",
                          overflowY: "auto",
                        }}
                      >
                        {group.messages.map((msg, mIdx) => (
                          <div
                            key={msg._id || msg.id || mIdx}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                              padding: "10px 16px",
                              gap: "8px",
                              borderBottom: mIdx < group.messages.length - 1 ? "1px solid #fdf2f8" : "none",
                            }}
                          >
                            {msg.sender === "bot" && (
                              <div
                                style={{
                                  width: "28px", height: "28px", borderRadius: "8px",
                                  background: "linear-gradient(135deg, #ec4899, #a855f7)",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: "12px", flexShrink: 0, marginTop: "2px",
                                }}
                              >
                                🤖
                              </div>
                            )}

                            <div style={{ maxWidth: "65%" }}>
                              <div
                                style={{
                                  padding: "10px 14px",
                                  borderRadius: msg.sender === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                                  background: msg.sender === "user"
                                    ? "linear-gradient(135deg, #ec4899, #db2777)"
                                    : "#f8fafc",
                                  border: msg.sender === "user" ? "none" : "1px solid #e2e8f0",
                                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                                }}
                              >
                                <p
                                  style={{
                                    fontSize: "13px",
                                    color: msg.sender === "user" ? "white" : "#334155",
                                    margin: 0,
                                    lineHeight: "1.5",
                                    whiteSpace: "pre-wrap",
                                  }}
                                >
                                  {msg.text}
                                </p>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                                  gap: "6px",
                                  marginTop: "4px",
                                }}
                              >
                                <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                                  {formatTime(msg.createdAt || msg.time)}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteItem(msg._id || msg.id);
                                  }}
                                  style={{
                                    background: "none", border: "none",
                                    cursor: "pointer", padding: "0 2px",
                                    color: "#cbd5e1", fontSize: "11px",
                                    transition: "color 0.15s",
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                                  onMouseLeave={(e) => (e.currentTarget.style.color = "#cbd5e1")}
                                  title="Hapus pesan"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>

                            {msg.sender === "user" && (
                              <div
                                style={{
                                  width: "28px", height: "28px", borderRadius: "8px",
                                  background: "#e0f2fe",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: "12px", flexShrink: 0, marginTop: "2px",
                                }}
                              >
                                👤
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
