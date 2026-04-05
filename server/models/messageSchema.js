// models/messageSchema.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  name: { type: String, required: true },
  message: { type: String, required: true },
  kind: { type: String, enum: ["text", "file"], default: "text" },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Document",
    required: false,
  },
  createdAt: { type: Date, default: Date.now }, // ✅ timestamp for TTL
});

// TTL index: delete messages 1 hour (3600 seconds) after creation
messageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

module.exports = mongoose.model("Message", messageSchema);