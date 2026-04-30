require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User");
const Chat = require("./models/Chat");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("Connected to MongoDB Atlas");
    await migrateJsonToMongo();
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Migration logic (One-time)
async function migrateJsonToMongo() {
  try {
    const DATA_DIR = path.join(__dirname, "data");
    const DB_FILE = path.join(DATA_DIR, "chat_history.json");

    if (fs.existsSync(DB_FILE)) {
      const count = await Chat.countDocuments();
      if (count === 0) {
        console.log("Migrating chat history from JSON to MongoDB...");
        const raw = fs.readFileSync(DB_FILE, "utf8");
        const data = JSON.parse(raw || "[]");
        if (data.length > 0) {
          await Chat.insertMany(data.map(item => ({
            sender: item.sender,
            text: item.text,
            time: item.time
          })));
          console.log(`Successfully migrated ${data.length} messages.`);
        }
      }
    }
  } catch (err) {
    console.error("Migration error:", err);
  }
}

// GET all history from MongoDB
app.get("/api/chat-history", async (req, res) => {
  try {
    const chats = await Chat.find().sort({ createdAt: 1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new message to MongoDB
app.post("/api/chat-history", async (req, res) => {
  const { sender, text, time } = req.body;
  if (!sender || typeof text === "undefined") {
    return res.status(400).json({ error: "Invalid payload" });
  }
  
  try {
    const chat = new Chat({
      sender,
      text,
      time: time || new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
    await chat.save();
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE all from MongoDB
app.delete("/api/chat-history", async (req, res) => {
  try {
    await Chat.deleteMany({});
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE by id from MongoDB
app.delete("/api/chat-history/:id", async (req, res) => {
  try {
    const result = await Chat.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: "Chat not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
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
