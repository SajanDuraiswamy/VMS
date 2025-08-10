const mongoose = require("mongoose");

const VisitorLogSchema = new mongoose.Schema({
  visitor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  checkInTime: { type: Date, default: Date.now },
  checkOutTime: { type: Date },
  epassId: { type: String, required: true }
});

module.exports = mongoose.model("VisitorLog", VisitorLogSchema);
