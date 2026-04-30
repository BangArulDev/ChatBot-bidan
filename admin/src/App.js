import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import ChatHistory from "./pages/ChatHistory";
import Users from "./pages/Users";
import Login from "./pages/Login";
import { AuthProvider } from "./context/AuthContext";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <div style={{ height: "100vh", background: "#f8fafc" }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <div style={{ display: "flex", height: "100vh", overflow: "hidden", position: "relative" }}>
                  {/* Mobile overlay */}
                  {sidebarOpen && (
                    <div
                      onClick={() => setSidebarOpen(false)}
                      style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        zIndex: 40,
                        display: "none",
                      }}
                      className="mobile-overlay"
                    />
                  )}

                  <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                  <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", minWidth: 0 }}>
                    {/* Mobile top bar */}
                    <div
                      className="mobile-topbar"
                      style={{
                        display: "none",
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px 16px",
                        background: "#0f172a",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        position: "sticky",
                        top: 0,
                        zIndex: 30,
                      }}
                    >
                      <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          background: "rgba(255,255,255,0.08)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2">
                          <line x1="2" y1="5" x2="16" y2="5" />
                          <line x1="2" y1="9" x2="16" y2="9" />
                          <line x1="2" y1="13" x2="16" y2="13" />
                        </svg>
                      </button>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "8px",
                            background: "linear-gradient(135deg, #ec4899, #a855f7)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                          }}
                        >
                          ❤️
                        </div>
                        <span style={{ fontWeight: "700", color: "white", fontSize: "15px" }}>
                          Bidan Nisa
                        </span>
                      </div>
                    </div>

                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/chat-history" element={<ChatHistory />} />
                      <Route path="/users" element={<Users />} />
                    </Routes>
                  </div>
                </div>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
