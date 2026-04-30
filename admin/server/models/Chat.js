const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    default: "anonymous",
  },
  userName: {
    type: String,
    default: "Pengguna",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Chat", chatSchema);
