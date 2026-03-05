const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/bidan-sinta", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "chat_history.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, "[]", "utf8");

function readDb() {
  try {
    const raw = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(raw || "[]");
  } catch (e) {
    return [];
  }
}

function writeDb(arr) {
  fs.writeFileSync(DB_FILE, JSON.stringify(arr, null, 2), "utf8");
}

// GET all history
app.get("/api/chat-history", (req, res) => {
  const arr = readDb();
  res.json(arr);
});

// POST new message
app.post("/api/chat-history", (req, res) => {
  const { sender, text, time, id } = req.body;
  if (!sender || typeof text === "undefined") {
    return res.status(400).json({ error: "Invalid payload" });
  }
  const arr = readDb();
  const item = {
    id: id || Date.now(),
    sender,
    text,
    time:
      time ||
      new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
  };
  arr.push(item);
  // cap
  if (arr.length > 5000) arr.splice(0, arr.length - 5000);
  writeDb(arr);
  res.json(item);
});

// DELETE all
app.delete("/api/chat-history", (req, res) => {
  writeDb([]);
  res.json({ ok: true });
});

// DELETE by id
app.delete("/api/chat-history/:id", (req, res) => {
  const id = Number(req.params.id);
  const arr = readDb();
  const next = arr.filter((x) => x.id !== id);
  writeDb(next);
  res.json({ ok: true });
});

// User Management API Endpoints
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    const { password, ...userWithoutPassword } = user.toObject();
    res.status(201).json(userWithoutPassword);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/users/:id", async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Chat history server listening on port ${PORT}`);
});
