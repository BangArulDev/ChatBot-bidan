require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
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

// GET dashboard stats
app.get("/api/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalChats = await Chat.countDocuments();

    // Unique users who chatted (by userId)
    const uniqueChatUsers = await Chat.distinct("userId");

    // Activity per day (last 7 days) - use UTC consistently
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);
    sevenDaysAgo.setUTCHours(0, 0, 0, 0);

    const activityRaw = await Chat.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, sender: "user" } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Build last 7 days with 0 as default using UTC dates
    const activityByDay = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - i);
      const key = d.toISOString().slice(0, 10); // UTC date key e.g. "2026-04-30"
      const label = new Intl.DateTimeFormat("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
        timeZone: "Asia/Jakarta",
      }).format(d);
      const found = activityRaw.find((a) => a._id === key);
      activityByDay.push({ date: key, label, count: found ? found.count : 0 });
    }

    res.json({
      totalUsers,
      totalChats,
      uniqueChatUsers: uniqueChatUsers.filter((u) => u !== "anonymous").length,
      activityByDay,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new message to MongoDB
app.post("/api/chat-history", async (req, res) => {
  const { sender, text, time, userId, userName } = req.body;
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
      userId: userId || "anonymous",
      userName: userName || "Pengguna",
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

// Auth API Endpoints
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "bidan-sinta-secret-key-123";

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, phone, birthDate } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email sudah terdaftar" });
    }

    const user = new User({
      username: email, // use email as username for simplicity
      name,
      email,
      password,
      phone,
      birthDate
    });

    await user.save();
    res.status(201).json({ message: "Registrasi berhasil" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ error: "Email atau password salah" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Email atau password salah" });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
