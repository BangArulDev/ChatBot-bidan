import React, { useState, useEffect, useRef } from "react";
import {
  fetchWithBackoff,
  buildSystemPrompt,
  magicWriteSystemPrompt,
} from "../scripts/main";
import knowledgeBase from "../data/knowledgeBase";

export default function Chat() {
  // try to persist a simple username for the session so admin can see who chatted
  const [userName, setUserName] = useState(() => {
    try {
      return localStorage.getItem("chat_user_name") || "";
    } catch (e) {
      return "";
    }
  });
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]); // {sender:'user'|'bot', text, time}
  const [typing, setTyping] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalText, setModalText] = useState("Memproses...");
  const [showWelcome, setShowWelcome] = useState(true);
  const [progress, setProgress] = useState(0);

  const [listening, setListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  const chatAreaRef = useRef(null);
  const inputRef = useRef(null);
  const timeRef = useRef(null);
  const recognitionRef = useRef(null);

  // Top header clock removed: timestamps are rendered per-message below the bubble.

  // welcome animation: progress -> reveal chat
  useEffect(() => {
    // animate progress to 100% over ~3s
    let mounted = true;
    setTimeout(() => {
      if (!mounted) return;
      setProgress(100);
    }, 100);

    const t1 = setTimeout(() => {
      if (!mounted) return;
      setShowWelcome(false);
    }, 3000);

    return () => {
      mounted = false;
      clearTimeout(t1);
    };
  }, []);

  useEffect(() => {
    // scroll when messages change
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const quickReplyOptions = [
    "Bagaimana cara mengatasi mual?",
    "Makanan apa yang aman dikonsumsi?",
    "Kapan mual muntah ini akan berhenti?",
    "Apakah ini berbahaya untuk janin saya?",
    "Obat apa yang boleh diminum?",
  ];

  function addMessage(sender, text) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const timeString = `${hours}:${minutes}`;
    const newMsg = {
      sender,
      text,
      time: timeString,
      userName: sender === "user" ? userName || "Pengguna" : undefined,
    };
    setMessages((m) => {
      const next = [...m, newMsg];
      // persist to localStorage for admin history
      try {
        const raw = localStorage.getItem("chat_history");
        const arr = raw ? JSON.parse(raw) : [];
        arr.push({ ...newMsg, id: Date.now() });
        // keep a reasonable cap (e.g., last 1000 messages)
        if (arr.length > 1000) arr.splice(0, arr.length - 1000);
        localStorage.setItem("chat_history", JSON.stringify(arr));
      } catch (e) {
        // ignore storage errors
      }
      return next;
    });

    // try to send to server (admin API). If REACT_APP_API_URL is set, use it; else assume same origin and /api
    (async () => {
      try {
        const base = process.env.REACT_APP_API_URL || "http://localhost:5000";
        await fetch(`${base}/api/chat-history`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...newMsg, id: Date.now() }),
        });
      } catch (e) {
        // ignore network errors; admin can fallback to localStorage
      }
    })();
  }

  // Attempt to read a registered username from common storage locations (no prompt).
  // We check several localStorage keys and, if present, try to decode a JWT token
  // to extract a username claim. If none are found we leave userName empty.
  useEffect(() => {
    function tryParseJSON(value) {
      try {
        return JSON.parse(value);
      } catch (e) {
        return null;
      }
    }

    function decodeJwtPayload(token) {
      try {
        const parts = token.split(".");
        if (parts.length < 2) return null;
        const payload = parts[1];
        const padded = payload.padEnd(
          payload.length + ((4 - (payload.length % 4)) % 4),
          "=",
        );
        const decoded = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
        return JSON.parse(decoded);
      } catch (e) {
        return null;
      }
    }

    if (userName) return; // already set

    try {
      let found = "";
      // common keys where a registration flow might store the username
      const keys = [
        "username",
        "user",
        "userInfo",
        "user_info",
        "profile",
        "auth_user",
      ];
      for (const k of keys) {
        const v = localStorage.getItem(k);
        if (!v) continue;
        const parsed = tryParseJSON(v);
        if (parsed) {
          found =
            parsed.username ||
            parsed.name ||
            parsed.displayName ||
            parsed.fullName ||
            "";
        } else {
          found = v;
        }
        if (found) break;
      }

      // try a token (JWT) if present and nothing found yet
      if (!found) {
        const t =
          localStorage.getItem("token") ||
          localStorage.getItem("auth_token") ||
          localStorage.getItem("accessToken");
        if (t) {
          const payload = decodeJwtPayload(t);
          if (payload) {
            found =
              payload.username ||
              payload.name ||
              payload.sub ||
              payload.email ||
              "";
          }
        }
      }

      if (found) setUserName(String(found));
    } catch (e) {
      // ignore — do not prompt
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After welcome animation ends, inject quick-reply card as a bot message so it
  // becomes part of the normal chat flow and scrolls like other messages.
  useEffect(() => {
    if (!showWelcome) {
      // Append a single quickReplies message so options become part of the chat flow.
      setMessages((m) => [
        ...m,
        {
          sender: "bot",
          text: "Ada yang bisa kami bantu hari ini?",
          kind: "quickReplies",
          options: quickReplyOptions,
          time: new Date()
            .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
            .toString(),
        },
      ]);
    }
    // Only run when showWelcome turns false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showWelcome]);

  function handleQuickReplyClick(option) {
    setMessage(option);
    // immediately send as in index logic
    handleSendMessage(option);
  }

  function handleSendMessage(eOrText) {
    // can be event (from form) or direct text
    let text = "";
    if (typeof eOrText === "string") {
      text = eOrText.trim();
    } else {
      eOrText.preventDefault();
      text = message.trim();
    }
    if (!text) return;

    addMessage("user", text);
    setMessage("");
    setTyping(true);

    // get bot reply
    getBotReply(text);
  }

  async function getBotReply(userMessage) {
    const systemPrompt = buildSystemPrompt(knowledgeBase);
    const payload = {
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    };

    try {
      const botResponse = await fetchWithBackoff(payload);
      addMessage("bot", botResponse);
      speak(botResponse); // TTS: bot berbicara
    } catch (err) {
      console.error("Gagal mendapatkan balasan bot:", err);
      addMessage(
        "bot",
        "Maaf, terjadi kesalahan. Staf kami akan segera membantu Anda.",
      );
    } finally {
      setTyping(false);
    }
  }

  // eslint-disable-next-line no-unused-vars
  async function handleMagicWrite() {
    const userKeywords = message.trim();
    if (!userKeywords) {
      setModalText("Silakan masukkan kata kunci di kolom pesan.");
      setModalVisible(true);
      setTimeout(() => setModalVisible(false), 2000);
      return;
    }

    setModalText("✨ Sedang menulis draf...");
    setModalVisible(true);

    const payload = {
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: magicWriteSystemPrompt },
        { role: "user", content: userKeywords },
      ],
    };

    try {
      const magicResponse = await fetchWithBackoff(payload);
      setMessage(magicResponse);
    } catch (err) {
      console.error("Gagal mendapatkan draf Magic Write:", err);
      setModalText("Maaf, terjadi kesalahan saat membuat draf.");
      setTimeout(() => setModalVisible(false), 2000);
      return;
    } finally {
      setModalVisible(false);
    }
  }

  // --- Voice Chat: Speech-to-Text ---
  function handleVoiceInput() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(
        "Browser Anda tidak mendukung Speech Recognition. Gunakan Chrome atau Edge.",
      );
      return;
    }

    if (listening) {
      // Stop listening
      if (recognitionRef.current) recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "id-ID"; // Bahasa Indonesia
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
      // Auto-send setelah suara dikenali
      setTimeout(() => handleSendMessage(transcript), 300);
    };

    recognition.start();
  }

  // --- Voice Chat: Text-to-Speech ---
  function speak(text) {
    if (!ttsEnabled) return;
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    function doSpeak(voices) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "id-ID";
      utterance.rate = 0.95;
      utterance.pitch = 1.4;

      // Suara perempuan yang dikenal di Windows 11 / Chrome / Edge
      const femaleNames = [
        "aria",
        "zira",
        "linda",
        "hazel",
        "susan",
        "jane",
        "emma",
        "female",
        "woman",
        "girl",
        "nisa",
        "siti",
        "dewi",
        "sri",
        "putri",
        "google uk english female",
        "google us english female",
      ];

      // 1. Suara Indonesia perempuan
      let voice = voices.find(
        (v) =>
          v.lang.startsWith("id") &&
          femaleNames.some((kw) => v.name.toLowerCase().includes(kw)),
      );
      // 2. Suara Indonesia apa saja
      if (!voice) voice = voices.find((v) => v.lang.startsWith("id"));
      // 3. Suara Inggris perempuan (Aria/Zira di Windows 11)
      if (!voice)
        voice = voices.find((v) =>
          femaleNames.some((kw) => v.name.toLowerCase().includes(kw)),
        );

      if (voice) utterance.voice = voice;
      window.speechSynthesis.speak(utterance);
    }

    // Voices bisa belum siap – tunggu voiceschanged jika perlu
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      doSpeak(voices);
    } else {
      window.speechSynthesis.addEventListener(
        "voiceschanged",
        function onVoicesChanged() {
          window.speechSynthesis.removeEventListener(
            "voiceschanged",
            onVoicesChanged,
          );
          doSpeak(window.speechSynthesis.getVoices());
        },
      );
    }
  }

  // logout: clear client storage and redirect to the app root (or login page)
  function logout() {
    try {
      // clear common client storage places
      localStorage.clear();
      sessionStorage.clear();
      // optionally clear cookies (best-effort)
      document.cookie.split(";").forEach(function (c) {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    } catch (e) {
      // ignore
    }
    // navigate to application root (adjust if your login page is at '/login')
    window.location.href = "/";
  }

  return (
    <div
      ref={timeRef}
      className="h-screen w-screen bg-gray-200 flex items-center justify-center"
    >
      {/* Welcome page overlay (mimic index.html welcome) */}
      {showWelcome && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 z-40">
          <div className="text-center">
            <div className="mx-auto mb-4 w-24 h-24 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-3xl">
              B
            </div>
            <h1 className="text-2xl font-bold">Selamat Datang di Bidan Nisa</h1>
            <p className="text-sm text-gray-600 mb-4">
              Asisten Kesehatan Ibu Hamil
            </p>
            <div className="w-64 h-2 bg-gray-300 rounded overflow-hidden mx-auto">
              <div
                style={{ width: `${progress}%` }}
                className="h-full bg-pink-500 transition-all duration-1000"
              />
            </div>
          </div>
        </div>
      )}

      <div className="w-full h-full bg-white shadow-lg overflow-hidden flex flex-col relative z-10">
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <button onClick={logout} className="text-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>

              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 font-bold text-xl">
                B
              </div>

              <div>
                <h1 className="font-bold text-gray-900 text-base">
                  Bidan Nisa - Info Bumil
                </h1>
                <p className="text-xs text-gray-500">
                  Biasanya merespons dalam beberapa detik...
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-gray-700">
              <button>
                {/* heart icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
              <button>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>
              <button onClick={logout} title="Logout" className="text-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
                  />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <main
          ref={chatAreaRef}
          className="flex-1 overflow-y-auto bg-gray-100 p-4 space-y-4"
        >
          {/* Render messages */}
          {messages.length === 0 && (
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="bg-white rounded-lg rounded-tl-none p-3 max-w-xs shadow-sm">
                <p className="text-sm text-gray-800">
                  Halo, selamat datang di layanan konsultasi kehamilan. Ada yang
                  bisa saya bantu terkait mual dan muntah di trimester pertama?
                </p>
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex w-full ${
                m.sender === "user"
                  ? "justify-end"
                  : "justify-start items-start space-x-2"
              }`}
            >
              {m.sender === "bot" ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    {m.kind === "quickReplies" ? (
                      <div className="bg-white rounded-lg rounded-tl-none p-3 max-w-xs shadow-sm relative">
                        {m.text && (
                          <h3 className="font-semibold text-sm text-gray-900 mb-2">
                            {m.text}
                          </h3>
                        )}
                        <ul className="divide-y divide-gray-100">
                          {Array.isArray(m.options) &&
                            m.options.map((opt, k) => (
                              <li
                                key={k}
                                onClick={() => handleQuickReplyClick(opt)}
                                className="flex justify-between items-center py-2 text-sm text-gray-800 cursor-pointer hover:bg-gray-50"
                              >
                                <span>{opt}</span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 text-gray-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </li>
                            ))}
                        </ul>
                        <div className="text-[9px] text-gray-500 mt-1 text-right">
                          {m.time}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg rounded-tl-none p-3 max-w-xs shadow-sm relative">
                        <p
                          className="text-sm text-gray-800 mb-3"
                          dangerouslySetInnerHTML={{
                            __html: m.text.replace(/\n/g, "<br>"),
                          }}
                        />
                        <div className="text-[9px] text-gray-500 mt-1 text-right">
                          {m.time}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-end">
                  <div className="rounded-lg rounded-tr-none p-3 max-w-xs shadow-sm user-bubble bg-pink-50">
                    <p className="text-sm">{m.text}</p>
                    <div className="text-[9px] text-gray-500 mt-1 text-right">
                      {m.time}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div className="flex items-start space-x-2" id="typing-indicator">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="bg-white rounded-lg rounded-tl-none p-3 max-w-xs shadow-sm">
                <div className="flex space-x-1">
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0s" }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* quick replies are now inserted as a bot message (kind: 'quickReplies')
              and rendered inside the messages map below. */}
        </main>

        <footer className="bg-white border-t border-gray-100 p-3">
          <div className="flex items-center space-x-2 mb-3">
            <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-full text-sm font-medium flex items-center justify-center space-x-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>Buat Janji Temu</span>
            </button>
            <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-full text-sm font-medium flex items-center justify-center space-x-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6m-3-4h3"
                />
              </svg>
              <span>Artikel Kesehatan</span>
            </button>
          </div>

          <form
            onSubmit={handleSendMessage}
            className="flex items-center space-x-2"
          >
            {/* Tombol mic (voice input) */}
            <button
              type="button"
              onClick={handleVoiceInput}
              title={listening ? "Berhenti merekam" : "Kirim pesan suara"}
              className={`p-2 rounded-full transition-colors ${
                listening
                  ? "bg-red-500 text-white animate-pulse"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-7a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </button>

            <div className="flex-1 relative">
              <input
                id="chat-input"
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Kirim pesan..."
                className="w-full bg-gray-100 rounded-full py-2.5 px-4 pr-20 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />

              {/* Tombol TTS toggle */}
              <button
                type="button"
                onClick={() => {
                  setTtsEnabled((v) => !v);
                  window.speechSynthesis && window.speechSynthesis.cancel();
                }}
                title={ttsEnabled ? "Matikan suara bot" : "Aktifkan suara bot"}
                className={`absolute right-10 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors ${
                  ttsEnabled
                    ? "text-pink-500 hover:bg-pink-50"
                    : "text-gray-400 hover:bg-gray-200"
                }`}
              >
                {ttsEnabled ? (
                  /* Speaker wave icon – suara aktif */
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
                    />
                  </svg>
                ) : (
                  /* Speaker X icon – suara nonaktif */
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
                    />
                  </svg>
                )}
              </button>

              <button
                id="send-btn"
                type="submit"
                disabled={message.trim() === ""}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-500 p-1.5 rounded-full hover:bg-orange-100 disabled:text-gray-300 disabled:hover:bg-transparent"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M3.105 3.106a.75.75 0 01.884-.04l14 7a.75.75 0 010 1.372l-14 7A.75.75 0 013 17.75V3.75a.75.75 0 01.105-.344z" />
                </svg>
              </button>
            </div>
          </form>
        </footer>

        {/* Modal */}
        {modalVisible && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 shadow-xl flex items-center space-x-4">
              <svg
                className="animate-spin h-6 w-6 text-orange-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-gray-700">{modalText}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
