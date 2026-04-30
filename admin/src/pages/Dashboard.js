import React, { useEffect, useState } from "react";
import {
  UsersIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/stats`);
        if (!res.ok) throw new Error("Gagal memuat statistik");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const maxActivity = stats
    ? Math.max(...stats.activityByDay.map((d) => d.count), 1)
    : 1;

  const statCards = stats
    ? [
        {
          name: "Total Pengguna Terdaftar",
          value: stats.totalUsers,
          icon: UsersIcon,
          color: "#ec4899",
          bg: "rgba(236,72,153,0.1)",
          desc: "Akun yang telah mendaftar",
        },
        {
          name: "Total Pesan Chat",
          value: stats.totalChats,
          icon: ChatBubbleLeftRightIcon,
          color: "#3b82f6",
          bg: "rgba(59,130,246,0.1)",
          desc: "Seluruh pesan user & bot",
        },
        {
          name: "Pengguna Aktif Chat",
          value: stats.uniqueChatUsers,
          icon: UserGroupIcon,
          color: "#10b981",
          bg: "rgba(16,185,129,0.1)",
          desc: "Pengguna yang pernah chat",
        },
      ]
    : [];

  return (
    <div style={{ padding: "28px 32px", background: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a", margin: 0, letterSpacing: "-0.3px" }}>
            Dashboard
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b", margin: "4px 0 0" }}>
            Data real-time aplikasi Bidan Nisa
          </p>
        </div>
        <div
          style={{
            padding: "8px 16px", borderRadius: "10px",
            background: "white", border: "1px solid #e2e8f0",
            fontSize: "13px", color: "#64748b", fontWeight: "500",
          }}
        >
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
          })}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: "14px 20px", borderRadius: "12px",
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
            color: "#dc2626", fontSize: "14px", marginBottom: "20px",
          }}
        >
          ⚠️ {error} — Pastikan server sudah berjalan dan database terhubung.
        </div>
      )}

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "28px" }}>
        {loading
          ? [1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  background: "white", borderRadius: "16px",
                  padding: "24px", border: "1px solid #e2e8f0",
                  height: "120px", animation: "pulse 1.5s infinite",
                }}
              >
                <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
                <div style={{ width: "80px", height: "12px", background: "#f1f5f9", borderRadius: "6px", marginBottom: "12px" }} />
                <div style={{ width: "50px", height: "28px", background: "#f1f5f9", borderRadius: "6px" }} />
              </div>
            ))
          : statCards.map((card) => (
              <div
                key={card.name}
                className="stat-card"
                style={{
                  background: "white", borderRadius: "16px", padding: "22px",
                  border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  position: "relative", overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "46px", height: "46px", borderRadius: "12px",
                    background: card.bg, display: "flex", alignItems: "center",
                    justifyContent: "center", marginBottom: "14px",
                  }}
                >
                  <card.icon style={{ width: "22px", height: "22px", color: card.color }} />
                </div>
                <p style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {card.name}
                </p>
                <p style={{ fontSize: "34px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px", letterSpacing: "-1px" }}>
                  {card.value.toLocaleString("id-ID")}
                </p>
                <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>
                  {card.desc}
                </p>
                {/* bg decoration */}
                <div
                  style={{
                    position: "absolute", right: "-20px", bottom: "-20px",
                    width: "90px", height: "90px", borderRadius: "50%",
                    background: card.bg, opacity: 0.6,
                  }}
                />
              </div>
            ))}
      </div>

      {/* Activity Chart */}
      <div
        style={{
          background: "white", borderRadius: "16px", border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}
        >
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
              Aktivitas Chat
            </h3>
            <p style={{ fontSize: "12px", color: "#94a3b8", margin: "4px 0 0" }}>
              Jumlah pesan dari pengguna per hari (7 hari terakhir)
            </p>
          </div>
          <span
            style={{
              fontSize: "11px", padding: "3px 10px", borderRadius: "20px",
              background: "rgba(236,72,153,0.1)", color: "#ec4899", fontWeight: "600",
            }}
          >
            7 Hari Terakhir
          </span>
        </div>

        <div style={{ padding: "24px" }}>
          {loading ? (
            <div style={{ height: "160px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div
                style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  border: "3px solid #f1f5f9", borderTopColor: "#ec4899",
                  animation: "spin 1s linear infinite",
                }}
              />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : !stats ? (
            <div style={{ height: "160px", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "14px" }}>
              Tidak ada data
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", height: "160px" }}>
              {stats.activityByDay.map((day) => {
                const heightPct = maxActivity > 0 ? (day.count / maxActivity) * 100 : 0;
                const barHeight = Math.max(heightPct * 1.4, day.count > 0 ? 8 : 3);
                return (
                  <div
                    key={day.date}
                    style={{
                      flex: 1, display: "flex", flexDirection: "column",
                      alignItems: "center", gap: "6px", height: "100%",
                      justifyContent: "flex-end",
                    }}
                  >
                    {/* Count label */}
                    <span style={{ fontSize: "11px", fontWeight: "700", color: day.count > 0 ? "#ec4899" : "#cbd5e1" }}>
                      {day.count > 0 ? day.count : ""}
                    </span>
                    {/* Bar */}
                    <div
                      style={{
                        width: "100%", height: `${barHeight}px`,
                        background: day.count > 0
                          ? "linear-gradient(180deg, #f472b6, #ec4899)"
                          : "#f1f5f9",
                        borderRadius: "6px 6px 0 0",
                        transition: "height 0.5s ease",
                        boxShadow: day.count > 0 ? "0 2px 8px rgba(236,72,153,0.25)" : "none",
                        minHeight: "3px",
                      }}
                    />
                    {/* Day label */}
                    <span style={{ fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap", fontWeight: "500" }}>
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
