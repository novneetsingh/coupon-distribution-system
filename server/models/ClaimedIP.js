const mongoose = require("mongoose");

const claimedIPSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: 3600 },
});

module.exports = mongoose.model("ClaimedIP", claimedIPSchema);
