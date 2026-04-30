import React from "react";
import {
  UsersIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";

const stats = [
  {
    name: "Total Pengguna",
    stat: "745",
    icon: UsersIcon,
    change: "12%",
    changeType: "increase",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.1)",
  },
  {
    name: "Total Chat",
    stat: "3,423",
    icon: ChatBubbleLeftRightIcon,
    change: "2.5%",
    changeType: "increase",
    color: "#ec4899",
    bg: "rgba(236,72,153,0.1)",
  },
  {
    name: "Tingkat Kepuasan",
    stat: "98.5%",
    icon: CheckCircleIcon,
    change: "4.1%",
    changeType: "increase",
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
  },
  {
    name: "Laporan Masalah",
    stat: "23",
    icon: ExclamationTriangleIcon,
    change: "3%",
    changeType: "decrease",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
  },
];

const topTopics = [
  { topic: "Mual dan Muntah", count: 245, total: 245 },
  { topic: "Nutrisi Kehamilan", count: 189, total: 245 },
  { topic: "Jadwal Kontrol", count: 156, total: 245 },
  { topic: "Keluhan Trimester 1", count: 132, total: 245 },
  { topic: "Suplemen Vitamin", count: 98, total: 245 },
];

export default function Dashboard() {
  return (
    <div style={{ padding: "28px 32px", background: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#0f172a",
                margin: 0,
                letterSpacing: "-0.3px",
              }}
            >
              Dashboard
            </h1>
            <p style={{ fontSize: "14px", color: "#64748b", margin: "4px 0 0" }}>
              Selamat datang! Berikut ringkasan performa Bidan Nisa hari ini.
            </p>
          </div>
          <div
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              background: "white",
              border: "1px solid #e2e8f0",
              fontSize: "13px",
              color: "#64748b",
              fontWeight: "500",
            }}
          >
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {stats.map((item) => (
          <div
            key={item.name}
            className="stat-card"
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "20px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: item.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "14px",
              }}
            >
              <item.icon style={{ width: "22px", height: "22px", color: item.color }} />
            </div>

            <p
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#94a3b8",
                margin: "0 0 6px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {item.name}
            </p>
            <p
              style={{
                fontSize: "28px",
                fontWeight: "800",
                color: "#0f172a",
                margin: "0 0 10px",
                letterSpacing: "-0.5px",
              }}
            >
              {item.stat}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {item.changeType === "increase" ? (
                <ArrowTrendingUpIcon style={{ width: "14px", height: "14px", color: "#10b981" }} />
              ) : (
                <ArrowTrendingDownIcon style={{ width: "14px", height: "14px", color: "#ef4444" }} />
              )}
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: item.changeType === "increase" ? "#10b981" : "#ef4444",
                }}
              >
                {item.change}
              </span>
              <span style={{ fontSize: "12px", color: "#94a3b8" }}>vs bulan lalu</span>
            </div>

            {/* Background decoration */}
            <div
              style={{
                position: "absolute",
                right: "-16px",
                bottom: "-16px",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: item.bg,
                opacity: 0.5,
              }}
            />
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Activity Placeholder */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              padding: "20px 24px 16px",
              borderBottom: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
              Aktivitas Chat
            </h3>
            <span
              style={{
                fontSize: "11px",
                padding: "3px 10px",
                borderRadius: "20px",
                background: "rgba(236,72,153,0.1)",
                color: "#ec4899",
                fontWeight: "600",
              }}
            >
              30 hari terakhir
            </span>
          </div>
          <div
            style={{
              height: "220px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <div style={{ fontSize: "32px" }}>📊</div>
            <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>
              Grafik akan tersedia segera
            </p>
          </div>
        </div>

        {/* Top Topics */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              padding: "20px 24px 16px",
              borderBottom: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
              Topik Populer
            </h3>
            <span
              style={{
                fontSize: "11px",
                padding: "3px 10px",
                borderRadius: "20px",
                background: "rgba(59,130,246,0.1)",
                color: "#3b82f6",
                fontWeight: "600",
              }}
            >
              Top 5
            </span>
          </div>
          <div style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {topTopics.map((item, idx) => (
                <div key={item.topic}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "6px",
                          background:
                            idx === 0
                              ? "linear-gradient(135deg,#ec4899,#a855f7)"
                              : "#f1f5f9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "10px",
                          fontWeight: "700",
                          color: idx === 0 ? "white" : "#64748b",
                          flexShrink: 0,
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span style={{ fontSize: "13px", fontWeight: "500", color: "#334155" }}>
                        {item.topic}
                      </span>
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "#ec4899" }}>
                      {item.count}
                    </span>
                  </div>
                  <div
                    style={{
                      height: "5px",
                      background: "#f1f5f9",
                      borderRadius: "99px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        borderRadius: "99px",
                        width: `${(item.count / item.total) * 100}%`,
                        background:
                          idx === 0
                            ? "linear-gradient(90deg, #ec4899, #a855f7)"
                            : idx === 1
                            ? "#3b82f6"
                            : idx === 2
                            ? "#10b981"
                            : "#f59e0b",
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
