const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  isClaimed: { type: Boolean, default: false },
});

module.exports = mongoose.model("Coupon", couponSchema);
