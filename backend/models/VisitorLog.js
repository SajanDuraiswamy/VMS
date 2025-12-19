const mongoose = require("mongoose");

const VisitorLogSchema = new mongoose.Schema({
<<<<<<< HEAD
  visitor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  checkInTime: { type: Date, default: Date.now },
  checkOutTime: { type: Date },
  epassId: { type: String, required: true }
=======
  visitor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  visitor_name: { type: String },
  visitor_email: { type: String },
  visitor_mobile: { type: String },
  checkInTime: { type: Date, default: Date.now },
  checkOutTime: { type: Date },
  epassId: { type: String, required: true },
  epass_pdf: { type: String }
>>>>>>> d205e47 (Remove node_modules and add to gitignore)
});

module.exports = mongoose.model("VisitorLog", VisitorLogSchema);
