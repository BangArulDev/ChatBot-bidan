import React, { useEffect, useState, useCallback } from "react";
import {
  ArrowPathIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon,
  ChevronRightIcon,
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
      return new Intl.DateTimeFormat("id-ID", { dateStyle: "short", timeStyle: "short" }).format(date);
    } catch (e) { return dateString; }
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("id-ID", { timeStyle: "short" }).format(date);
    } catch (e) { return dateString; }
  };

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/chat-history`);
      if (res.ok) {
        setHistory(await res.json());
      } else {
        throw new Error("Gagal mengambil data dari server");
      }
    } catch {
      try {
        const raw = localStorage.getItem("chat_history");
        setHistory(raw ? JSON.parse(raw) : []);
      } catch {
        setError("Gagal memuat riwayat chat");
        setHistory([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  // Group by userId
  const groupedByUser = history.reduce((acc, chat) => {
    const key = chat.userId || "anonymous";
    if (!acc[key]) acc[key] = { userId: key, userName: chat.userName || "Pengguna", messages: [] };
    acc[key].messages.push(chat);
    return acc;
  }, {});

  const userGroups = Object.values(groupedByUser)
    .map((g) => ({
      ...g,
      messages: g.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
      lastMessage: g.messages[g.messages.length - 1],
    }))
    .sort((a, b) => new Date(b.lastMessage?.createdAt) - new Date(a.lastMessage?.createdAt));

  const filteredGroups = userGroups.filter((g) =>
    g.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.userId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUser = (userId) =>
    setExpandedUsers((prev) => ({ ...prev, [userId]: !prev[userId] }));

  async function clearAll() {
    if (!window.confirm("Yakin ingin menghapus semua riwayat chat?")) return;
    try {
      await fetch(`${API_BASE}/api/chat-history`, { method: "DELETE" });
    } catch {
      localStorage.removeItem("chat_history");
    }
    setHistory([]);
  }

  async function deleteItem(id) {
    try {
      await fetch(`${API_BASE}/api/chat-history/${id}`, { method: "DELETE" });
      setHistory((prev) => prev.filter((m) => (m._id || m.id) !== id));
    } catch {
      const raw = localStorage.getItem("chat_history");
      const arr = raw ? JSON.parse(raw) : [];
      const next = arr.filter((r) => r.id !== id);
      localStorage.setItem("chat_history", JSON.stringify(next));
      setHistory(next);
    }
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: "application/json" });
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

  // ─── Inline CSS for mobile responsiveness ────────────────────────────────
  const inlineCSS = `
    .ch-stats { display: grid; grid-template-columns: 1fr; gap: 10px; margin-bottom: 16px; }
    @media(min-width: 480px) { .ch-stats { grid-template-columns: repeat(3, 1fr); } }

    .ch-toolbar { display: flex; flex-direction: column; gap: 10px; padding: 12px 14px; border-bottom: 1px solid #f1f5f9; }
    @media(min-width: 600px) { .ch-toolbar { flex-direction: row; align-items: center; justify-content: space-between; } }

    .ch-actions { display: flex; flex-wrap: wrap; gap: 7px; }

    .ch-user-row { display: flex; align-items: center; padding: 14px; gap: 12px; cursor: pointer; }
    @media(min-width: 480px) { .ch-user-row { padding: 14px 20px; } }

    .ch-user-info { flex: 1; min-width: 0; }
    .ch-badges { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 3px; }

    .ch-user-meta { display: none; align-items: center; gap: 8px; flex-shrink: 0; }
    @media(min-width: 480px) { .ch-user-meta { display: flex; } }

    .ch-bubble-area { padding: 12px 14px; }
    @media(min-width: 480px) { .ch-bubble-area { padding: 16px 20px; } }
  `;

  return (
    <div className="page-container">
      <style>{inlineCSS}</style>

      {/* Header */}
      <div style={{ marginBottom: "16px" }}>
        <h1 style={{ fontSize: "21px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
          Riwayat Chat
        </h1>
        <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0" }}>
          Monitor percakapan pengguna dengan Bidan Nisa
        </p>
      </div>

      {/* Stats */}
      <div className="ch-stats">
        {[
          { label: "Pengguna", value: totalUsers, color: "#ec4899", icon: "👥" },
          { label: "Total Pesan", value: totalMessages, color: "#3b82f6", icon: "💬" },
          { label: "Respons Bot", value: botMessages, color: "#10b981", icon: "🤖" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "white", borderRadius: "12px", padding: "14px 16px",
              border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "12px",
            }}
          >
            <span style={{ fontSize: "22px" }}>{stat.icon}</span>
            <div>
              <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 2px", fontWeight: "500" }}>{stat.label}</p>
              <p style={{ fontSize: "22px", fontWeight: "800", color: stat.color, margin: 0 }}>
                {loading ? "—" : stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Card */}
      <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", overflow: "hidden" }}>

        {/* Toolbar */}
        <div className="ch-toolbar">
          {/* Search */}
          <div style={{ position: "relative", width: "100%" }}>
            <span style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", fontSize: "14px" }}>🔍</span>
            <input
              type="text"
              placeholder="Cari nama pengguna..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%", paddingLeft: "34px", paddingRight: "12px",
                paddingTop: "8px", paddingBottom: "8px",
                borderRadius: "8px", border: "1px solid #e2e8f0",
                fontSize: "13px", color: "#334155", background: "#f8fafc",
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          {/* Action buttons */}
          <div className="ch-actions">
            <button
              onClick={fetchHistory} disabled={loading}
              style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", borderRadius: "8px", background: "#f8fafc", border: "1px solid #e2e8f0", fontSize: "12px", fontWeight: "500", color: "#475569", cursor: "pointer" }}
            >
              <ArrowPathIcon style={{ width: "13px", height: "13px" }} /> Refresh
            </button>
            <button
              onClick={exportJson} disabled={loading || history.length === 0}
              style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", borderRadius: "8px", background: "linear-gradient(135deg,#3b82f6,#2563eb)", border: "none", fontSize: "12px", fontWeight: "500", color: "white", cursor: "pointer" }}
            >
              <ArrowDownTrayIcon style={{ width: "13px", height: "13px" }} /> Ekspor
            </button>
            <button
              onClick={clearAll} disabled={loading || history.length === 0}
              style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", borderRadius: "8px", background: "linear-gradient(135deg,#ef4444,#dc2626)", border: "none", fontSize: "12px", fontWeight: "500", color: "white", cursor: "pointer" }}
            >
              <TrashIcon style={{ width: "13px", height: "13px" }} /> Hapus
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ padding: "50px", textAlign: "center" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", border: "3px solid #f1f5f9", borderTopColor: "#ec4899", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
            <p style={{ color: "#94a3b8", fontSize: "13px" }}>Memuat riwayat chat...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : error ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#ef4444", fontSize: "13px" }}>⚠️ {error}</div>
        ) : filteredGroups.length === 0 ? (
          <div style={{ padding: "50px", textAlign: "center" }}>
            <p style={{ fontSize: "28px", margin: "0 0 10px" }}>💬</p>
            <p style={{ color: "#94a3b8", fontSize: "13px" }}>
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
                <div key={group.userId} style={{ borderBottom: gIdx < filteredGroups.length - 1 ? "1px solid #f1f5f9" : "none" }}>

                  {/* User row */}
                  <div
                    className="ch-user-row"
                    onClick={() => toggleUser(group.userId)}
                    style={{ background: isExpanded ? "#fdf2f8" : "white", transition: "background 0.15s" }}
                  >
                    {/* Avatar */}
                    <div style={{ width: "40px", height: "40px", borderRadius: "11px", background: "linear-gradient(135deg,#ec4899,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "700", color: "white", flexShrink: 0 }}>
                      {group.userName.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="ch-user-info">
                      <div className="ch-badges">
                        <span style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>{group.userName}</span>
                        <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "20px", background: "rgba(236,72,153,0.1)", color: "#ec4899", fontWeight: "600" }}>
                          {group.messages.length} pesan
                        </span>
                        <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "20px", background: "rgba(59,130,246,0.1)", color: "#3b82f6", fontWeight: "600" }}>
                          {userMsgCount} tanya
                        </span>
                      </div>
                      <p style={{ fontSize: "11px", color: "#64748b", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        💬 {lastMsg?.text || "—"}
                      </p>
                    </div>

                    {/* Time + chevron (hidden on very small screens) */}
                    <div className="ch-user-meta">
                      <span style={{ fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap" }}>
                        {lastMsg ? formatDate(lastMsg.createdAt) : "—"}
                      </span>
                      {isExpanded
                        ? <ChevronDownIcon style={{ width: "15px", height: "15px", color: "#ec4899" }} />
                        : <ChevronRightIcon style={{ width: "15px", height: "15px", color: "#94a3b8" }} />}
                    </div>
                    {/* Chevron always visible on small screens */}
                    <div style={{ display: "flex", flexShrink: 0 }} className="ch-chevron-sm">
                      {isExpanded
                        ? <ChevronDownIcon style={{ width: "15px", height: "15px", color: "#ec4899" }} />
                        : <ChevronRightIcon style={{ width: "15px", height: "15px", color: "#94a3b8" }} />}
                    </div>
                  </div>

                  {/* Expanded chat */}
                  {isExpanded && (
                    <div style={{ background: "#fdf2f8", borderTop: "1px solid #fce7f3" }}>
                      <div className="ch-bubble-area">
                        <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "12px" }}>
                          <ChatBubbleLeftRightIcon style={{ width: "14px", height: "14px", color: "#ec4899" }} />
                          <span style={{ fontSize: "12px", fontWeight: "700", color: "#be185d" }}>
                            Percakapan {group.userName}
                          </span>
                        </div>

                        <div style={{ background: "white", borderRadius: "10px", border: "1px solid #fce7f3", overflow: "hidden", maxHeight: "350px", overflowY: "auto" }}>
                          {group.messages.map((msg, mIdx) => (
                            <div
                              key={msg._id || msg.id || mIdx}
                              style={{
                                display: "flex", alignItems: "flex-start",
                                justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                                padding: "8px 12px", gap: "7px",
                                borderBottom: mIdx < group.messages.length - 1 ? "1px solid #fdf2f8" : "none",
                              }}
                            >
                              {msg.sender === "bot" && (
                                <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: "linear-gradient(135deg,#ec4899,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", flexShrink: 0, marginTop: "2px" }}>
                                  🤖
                                </div>
                              )}

                              <div style={{ maxWidth: "75%" }}>
                                <div style={{
                                  padding: "8px 12px", borderRadius: msg.sender === "user" ? "10px 10px 3px 10px" : "10px 10px 10px 3px",
                                  background: msg.sender === "user" ? "linear-gradient(135deg,#ec4899,#db2777)" : "#f8fafc",
                                  border: msg.sender === "user" ? "none" : "1px solid #e2e8f0",
                                }}>
                                  <p style={{ fontSize: "12px", color: msg.sender === "user" ? "white" : "#334155", margin: 0, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                                    {msg.text}
                                  </p>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: msg.sender === "user" ? "flex-end" : "flex-start", gap: "5px", marginTop: "3px" }}>
                                  <span style={{ fontSize: "10px", color: "#94a3b8" }}>
                                    {formatTime(msg.createdAt || msg.time)}
                                  </span>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); deleteItem(msg._id || msg.id); }}
                                    style={{ background: "none", border: "none", cursor: "pointer", padding: "0 2px", color: "#cbd5e1", fontSize: "11px" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = "#cbd5e1")}
                                  >✕</button>
                                </div>
                              </div>

                              {msg.sender === "user" && (
                                <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", flexShrink: 0, marginTop: "2px" }}>
                                  👤
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
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
