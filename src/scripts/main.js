// --- Pengaturan API Groq ---
// eslint-disable-next-line
const apiKey = process.env.REACT_APP_GROQ_API_KEY || "";
const apiUrl = "https://api.groq.com/openai/v1/chat/completions";

// --- System Prompts ---
const botSystemPrompt =
  "Anda adalah 'Bidan Nisa', asisten kesehatan virtual yang ramah dan informatif, khusus membantu ibu hamil trimester pertama. Jawab pertanyaan pengguna tentang mual dan muntah (morning sickness) dengan singkat (1-2 kalimat), empatik, dan akurat secara medis dalam Bahasa Indonesia. Selalu ingatkan bahwa Anda bukan pengganti dokter dan sarankan untuk berkonsultasi dengan dokter atau bidan jika gejala parah.";

const magicWriteSystemPrompt =
  "Anda adalah asisten penulis. Ambil kata kunci berikut dari pengguna dan ubah menjadi pertanyaan yang sopan dan jelas untuk asisten kesehatan kehamilan, dalam Bahasa Indonesia. Jawab HANYA dengan pertanyaan yang telah direvisi, tanpa sapaan atau penutup tambahan. Contoh: 'mual parah' menjadi 'Halo, saya mengalami mual yang cukup parah akhir-akhir ini. Apakah ada yang bisa saya lakukan untuk menguranginya?'";

// --- Fungsi Modal ---
function showModal(message) {
  if (typeof modalText !== "undefined" && modalText)
    modalText.textContent = message;
  if (typeof modal !== "undefined" && modal) modal.classList.remove("hidden");
}

function hideModal() {
  if (typeof modal !== "undefined" && modal) modal.classList.add("hidden");
}

// --- Fungsi Panggilan API ---
async function fetchWithBackoff(payload, maxRetries = 3) {
  let delay = 1000; // 1 detik
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errBody}`);
      }

      const result = await response.json();
      const text = result.choices?.[0]?.message?.content;

      if (text) {
        return text;
      } else {
        throw new Error("Respon API tidak valid atau kosong.");
      }
    } catch (error) {
      console.error(`Percobaan ${i + 1} gagal:`, error.message);
      if (i === maxRetries - 1) {
        throw error; // Gagal setelah semua percobaan
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
}

// --- Elemen DOM ---
let chatArea,
  chatInput,
  sendButton,
  magicWriteButton,
  modal,
  modalText,
  timeElement;

// Fungsi untuk memperbarui waktu
function updateTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  if (timeElement) {
    timeElement.textContent = `${hours}:${minutes}`;
  }
}

// Fungsi untuk menangani animasi welcome page
function handleWelcomePage() {
  const welcomePage = document.getElementById("welcome-page");
  const chatContainer = document.getElementById("chat-container");
  const progressBar = document.getElementById("welcome-progress-bar");

  // If elements are missing, bail out (this keeps module safe when used in React)
  if (!welcomePage || !chatContainer || !progressBar) return;

  // Mulai animasi progress bar
  setTimeout(() => {
    if (progressBar && progressBar.style) progressBar.style.width = "100%";
  }, 100);

  // Setelah 3 detik, mulai transisi
  setTimeout(() => {
    if (welcomePage && welcomePage.classList) welcomePage.classList.add("hide");
    if (chatContainer && chatContainer.style) chatContainer.style.opacity = "1";
  }, 3000);

  // Setelah animasi selesai, hapus welcome page
  setTimeout(() => {
    if (welcomePage && welcomePage.style) welcomePage.style.display = "none";
  }, 4000);
}

// Inisialisasi elemen DOM setelah halaman dimuat
// Initialize DOM elements only when this script is running on the static index.html
// (guard so importing this module in React won't run DOM initialization)
document.addEventListener("DOMContentLoaded", () => {
  chatArea = document.getElementById("chat-area-main");
  chatInput = document.getElementById("chat-input");
  sendButton = document.getElementById("send-btn");
  magicWriteButton = document.getElementById("magic-write-btn");
  modal = document.getElementById("loading-modal");
  modalText = document.getElementById("modal-text");

  // If required DOM elements are not present, don't continue (prevents errors when imported into React)
  if (!chatArea || !chatInput) return;

  // Inisialisasi waktu real-time
  timeElement = document.getElementById("current-time");
  updateTime();
  setInterval(updateTime, 1000);

  // Mulai animasi welcome page
  handleWelcomePage();

  // Event listener untuk input
  if (chatInput && chatInput.addEventListener) {
    chatInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendClick();
      }
    });
  }
});

// --- Fungsi Logika Chat ---
function handleSendClick() {
  const messageText = chatInput.value.trim();
  handleSendMessage(messageText);
}

function handleQuickReply(element) {
  const messageText = element.querySelector("span").textContent.trim();
  handleSendMessage(messageText);
}

function handleSendMessage(messageText) {
  if (!messageText) return;

  addMessageToChat("user", messageText);
  chatInput.value = "";
  toggleSendButton();
  toggleTypingIndicator(true);

  getBotReply(messageText);
}

async function getBotReply(userMessage) {
  const payload = {
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: botSystemPrompt },
      { role: "user", content: userMessage },
    ],
  };

  try {
    const botResponse = await fetchWithBackoff(payload);
    addMessageToChat("bot", botResponse);
  } catch (error) {
    console.error("Gagal mendapatkan balasan bot:", error);
    addMessageToChat(
      "bot",
      "Maaf, terjadi kesalahan. Staf kami akan segera membantu Anda.",
    );
  } finally {
    toggleTypingIndicator(false);
  }
}

async function handleMagicWrite() {
  const userKeywords = chatInput.value.trim();
  if (!userKeywords) {
    showModal("Silakan masukkan kata kunci di kolom pesan.");
    setTimeout(hideModal, 2000);
    return;
  }

  showModal("✨ Sedang menulis draf...");
  magicWriteButton.disabled = true;

  const payload = {
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: magicWriteSystemPrompt },
      { role: "user", content: userKeywords },
    ],
  };

  try {
    const magicResponse = await fetchWithBackoff(payload);
    chatInput.value = magicResponse;
    toggleSendButton(); // Aktifkan tombol kirim karena input sekarang terisi
  } catch (error) {
    console.error("Gagal mendapatkan draf Magic Write:", error);
    showModal("Maaf, terjadi kesalahan saat membuat draf.");
    setTimeout(hideModal, 2000);
  } finally {
    hideModal();
    magicWriteButton.disabled = false;
  }
}

// --- Fungsi Bantuan UI ---
function addMessageToChat(sender, text) {
  const bubble = document.createElement("div");
  bubble.className = "flex w-full";

  // Get current time
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const timeString = `${hours}:${minutes}`;

  let bubbleContent;
  if (sender === "user") {
    bubble.classList.add("justify-end");
    bubbleContent = `
      <div class="flex flex-col items-end">
        <div class="rounded-lg rounded-tr-none p-3 max-w-xs shadow-sm user-bubble relative">
          <p class="text-sm">${text}</p>
          <span class="text-[10px] text-gray-500 ml-2 absolute bottom-1 right-2">${timeString}</span>
        </div>
      </div>
    `;
  } else {
    // 'bot'
    bubble.classList.add("justify-start", "items-start", "space-x-2");
    bubbleContent = `
      <div class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 flex-shrink-0 welcome-icon">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="flex flex-col">
        <div class="bg-white rounded-lg rounded-tl-none p-3 max-w-xs shadow-sm bot-bubble relative">
          <p class="text-sm text-gray-800 mb-3">${text.replace(
            /\n/g,
            "<br>",
          )}</p>
          <span class="text-[10px] text-gray-500 absolute bottom-1 right-2">${timeString}</span>
        </div>
      </div>
    `;
  }

  bubble.innerHTML = bubbleContent;
  chatArea.appendChild(bubble);
  scrollToBottom();
}

function toggleTypingIndicator(show) {
  let typingBubble = document.getElementById("typing-indicator");
  if (show) {
    if (!typingBubble) {
      typingBubble = document.createElement("div");
      typingBubble.id = "typing-indicator";
      typingBubble.className = "flex items-start space-x-2";
      typingBubble.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="bg-white rounded-lg rounded-tl-none p-3 max-w-xs shadow-sm bot-bubble">
          <div class="flex space-x-1">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0s;"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s;"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s;"></div>
          </div>
        </div>
      `;
      chatArea.appendChild(typingBubble);
      scrollToBottom();
    }
  } else {
    if (typingBubble) {
      typingBubble.remove();
    }
  }
}

function scrollToBottom() {
  chatArea.scrollTop = chatArea.scrollHeight;
}

function toggleSendButton() {
  sendButton.disabled = chatInput.value.trim() === "";
}

// Exports for reuse in React components
// Only export pure logic pieces (prompts + fetchWithBackoff). The DOM helpers remain for the static index.html usage.
export { fetchWithBackoff, botSystemPrompt, magicWriteSystemPrompt };
