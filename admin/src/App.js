import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import ChatHistory from "./pages/ChatHistory";
import Users from "./pages/Users";
import Login from "./pages/Login";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ height: "100vh", background: "#f8fafc" }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
                  <Sidebar />
                  <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
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
