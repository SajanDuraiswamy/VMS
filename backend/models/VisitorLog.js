const mongoose = require("mongoose");

const VisitorLogSchema = new mongoose.Schema({
  visitor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  visitor_name: { type: String },
  visitor_email: { type: String },
  visitor_mobile: { type: String },
  checkInTime: { type: Date, default: Date.now },
  checkOutTime: { type: Date },
  epassId: { type: String, required: true },
  epass_pdf: { type: String }
});

module.exports = mongoose.model("VisitorLog", VisitorLogSchema);
