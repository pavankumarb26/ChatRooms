// ✅ Fixed
const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  password: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

roomSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model("Room", roomSchema);