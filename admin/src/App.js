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

                  <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                  {/* Main content area */}
                  <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", minWidth: 0, display: "flex", flexDirection: "column" }}>

                    {/* Mobile top bar — always rendered, hidden on desktop via CSS */}
                    <div
                      className="mobile-topbar"
                      style={{
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px 16px",
                        background: "#0f172a",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        flexShrink: 0,
                        zIndex: 30,
                      }}
                    >
                      <button
                        onClick={() => setSidebarOpen(true)}
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          background: "rgba(255,255,255,0.1)",
                          border: "1px solid rgba(255,255,255,0.15)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                          <path d="M1 1H17M1 7H17M1 13H17" stroke="white" strokeWidth="2" strokeLinecap="round" />
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
                            fontSize: "14px",
                          }}
                        >
                          ❤️
                        </div>
                        <span style={{ fontWeight: "700", color: "white", fontSize: "15px" }}>
                          Bidan Nisa
                        </span>
                      </div>
                    </div>

                    <div style={{ flex: 1, overflowY: "auto" }}>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/chat-history" element={<ChatHistory />} />
                        <Route path="/users" element={<Users />} />
                      </Routes>
                    </div>
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
