import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  ChatBubbleLeftRightIcon,
  UsersIcon,
  ArrowRightOnRectangleIcon,
  HeartIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Dashboard", href: "/", icon: HomeIcon },
  { name: "Riwayat Chat", href: "/chat-history", icon: ChatBubbleLeftRightIcon },
  { name: "Pengguna", href: "/users", icon: UsersIcon },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleNavClick = () => {
    if (setSidebarOpen) setSidebarOpen(false);
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            zIndex: 40,
          }}
          className="sidebar-overlay"
        />
      )}

      {/* Sidebar */}
      <div
        className="admin-sidebar"
        style={{
          width: "260px",
          minHeight: "100vh",
          background: "linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          zIndex: 50,
          transition: "transform 0.3s ease",
        }}
      >
        {/* Logo Area */}
        <div style={{ padding: "20px 20px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #ec4899, #a855f7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 15px rgba(236,72,153,0.4)",
                  flexShrink: 0,
                }}
              >
                <HeartIcon style={{ width: "18px", height: "18px", color: "white" }} />
              </div>
              <div>
                <p
                  style={{
                    fontSize: "15px",
                    fontWeight: "700",
                    background: "linear-gradient(135deg, #f9a8d4, #e879f9)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    lineHeight: 1.2,
                    margin: 0,
                  }}
                >
                  Bidan Nisa
                </p>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Admin Panel
                </p>
              </div>
            </div>

            {/* Close button (mobile only) */}
            <button
              onClick={() => setSidebarOpen && setSidebarOpen(false)}
              className="sidebar-close-btn"
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.08)",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              <XMarkIcon style={{ width: "16px", height: "16px" }} />
            </button>
          </div>

          {/* Online indicator */}
          <div
            style={{
              marginTop: "14px",
              padding: "7px 12px",
              background: "rgba(16,185,129,0.1)",
              borderRadius: "8px",
              border: "1px solid rgba(16,185,129,0.2)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              className="pulse-dot"
              style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10b981", flexShrink: 0 }}
            />
            <span style={{ fontSize: "12px", color: "#34d399", fontWeight: "500" }}>Sistem Aktif</span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "0 20px" }} />

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "14px 12px", overflowY: "auto" }}>
          <p style={{ fontSize: "10px", fontWeight: "600", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "1px", padding: "0 8px", marginBottom: "8px" }}>
            Menu Utama
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={handleNavClick}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "11px 12px",
                    borderRadius: "10px",
                    textDecoration: "none",
                    background: isActive
                      ? "linear-gradient(135deg, rgba(236,72,153,0.2), rgba(168,85,247,0.15))"
                      : "transparent",
                    border: isActive ? "1px solid rgba(236,72,153,0.25)" : "1px solid transparent",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                      e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.border = "1px solid transparent";
                    }
                  }}
                >
                  <item.icon style={{ width: "18px", height: "18px", color: isActive ? "#f472b6" : "rgba(255,255,255,0.45)", flexShrink: 0 }} />
                  <span style={{ fontSize: "14px", fontWeight: isActive ? "600" : "400", color: isActive ? "#f9a8d4" : "rgba(255,255,255,0.6)" }}>
                    {item.name}
                  </span>
                  {isActive && (
                    <div style={{ marginLeft: "auto", width: "6px", height: "6px", borderRadius: "50%", background: "#ec4899" }} />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Divider */}
        <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "0 20px" }} />

        {/* User Profile */}
        <div style={{ padding: "14px 12px 18px" }}>
          <div
            style={{
              padding: "11px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #ec4899, #a855f7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: "700",
                color: "white",
                flexShrink: 0,
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "13px", fontWeight: "600", color: "rgba(255,255,255,0.85)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.name || "Admin Bidan"}
              </p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", margin: 0 }}>Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              title="Keluar"
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "8px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.25)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
            >
              <ArrowRightOnRectangleIcon style={{ width: "15px", height: "15px", color: "#f87171" }} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
