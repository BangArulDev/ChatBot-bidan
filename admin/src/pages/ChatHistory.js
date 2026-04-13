import React, { useEffect, useState } from "react";

export default function ChatHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "medium",
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  useEffect(() => {
    // try fetch from server API first, fall back to localStorage
    (async () => {
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
        console.error("Error fetching history:", e);
        try {
          const raw = localStorage.getItem("chat_history");
          const arr = raw ? JSON.parse(raw) : [];
          setHistory(arr.reverse());
        } catch (e) {
          setError("Gagal memuat riwayat chat");
          setHistory([]);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [API_BASE]);

  async function refresh() {
    try {
      const res = await fetch(`${API_BASE}/api/chat-history`);
      if (res.ok) {
        const arr = await res.json();
        setHistory(arr.slice().reverse());
        return;
      }
    } catch (e) {}

    try {
      const raw = localStorage.getItem("chat_history");
      const arr = raw ? JSON.parse(raw) : [];
      setHistory(arr.reverse());
    } catch (e) {
      setHistory([]);
    }
  }

  async function clearAll() {
    if (!window.confirm("Yakin ingin menghapus semua riwayat chat?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/chat-history`, {
        method: "DELETE",
      });
      if (res.ok) {
        setHistory([]);
        localStorage.removeItem("chat_history");
        return;
      }
    } catch (e) {
      console.error("Error clearing history:", e);
      alert(
        "Gagal menghapus riwayat chat dari server. Mencoba hapus dari local storage."
      );
    }
    localStorage.removeItem("chat_history");
    setHistory([]);
  }

  async function deleteItem(id) {
    if (!window.confirm("Hapus pesan ini?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/chat-history/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await refresh();
        return;
      }
    } catch (e) {
      console.error("Error deleting item:", e);
      alert(
        "Gagal menghapus pesan dari server. Mencoba hapus dari local storage."
      );
    }

    try {
      const raw = localStorage.getItem("chat_history");
      const arr = raw ? JSON.parse(raw) : [];
      const next = arr.filter((r) => r.id !== id);
      localStorage.setItem("chat_history", JSON.stringify(next));
      setHistory(next.reverse());
    } catch (e) {
      await refresh();
    }
  }

  async function exportJson() {
    try {
      const res = await fetch(`${API_BASE}/api/chat-history`);
      let arr = history.slice().reverse();
      if (res.ok) arr = await res.json();
      const blob = new Blob([JSON.stringify(arr, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chat_history_${new Date().toISOString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    } catch (e) {
      // fallback to local
    }

    const blob = new Blob([JSON.stringify(history.reverse(), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat_history_${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Riwayat Chat</h1>
        <div className="space-x-2">
          <button
            onClick={refresh}
            disabled={loading}
            className={`px-3 py-1 rounded text-sm ${
              loading ? "bg-gray-200" : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {loading ? "Memuat..." : "Refresh"}
          </button>
          <button
            onClick={exportJson}
            disabled={loading}
            className={`px-3 py-1 rounded text-sm ${
              loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
          >
            Ekspor JSON
          </button>
          <button
            onClick={clearAll}
            disabled={loading}
            className={`px-3 py-1 rounded text-sm ${
              loading ? "bg-red-400" : "bg-red-600 hover:bg-red-700"
            } text-white`}
          >
            Hapus Semua
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Memuat riwayat chat...</div>
      ) : error ? (
        <div className="text-sm text-red-500">{error}</div>
      ) : history.length === 0 ? (
        <div className="text-sm text-gray-500">Belum ada riwayat chat.</div>
      ) : (
        <div className="overflow-auto max-h-[60vh] border rounded">
          <table className="w-full table-auto text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-xs text-gray-600">Waktu</th>
                <th className="px-3 py-2 text-xs text-gray-600">
                  Nama Pengguna
                </th>
                <th className="px-3 py-2 text-xs text-gray-600">Pengirim</th>
                <th className="px-3 py-2 text-xs text-gray-600">Pesan</th>
                <th className="px-3 py-2 text-xs text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} className="border-t">
                  <td className="px-3 py-2 align-top text-sm text-gray-700">
                    {formatDate(h.time)}
                  </td>
                  <td className="px-3 py-2 align-top text-sm text-gray-700">
                    {h.userName ||
                      h.name ||
                      (h.sender === "user" ? "Pengguna" : "Bidan Sinta")}
                  </td>
                  <td className="px-3 py-2 align-top text-sm text-gray-700">
                    {h.sender}
                  </td>
                  <td className="px-3 py-2 align-top text-sm text-gray-800 whitespace-pre-wrap">
                    {h.text}
                  </td>
                  <td className="px-3 py-2 align-top text-sm">
                    <button
                      onClick={() => deleteItem(h.id)}
                      className="px-2 py-1 text-sm bg-red-500 text-white rounded"
                    >
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
  );
}
