const mongoose = require("mongoose");

const VisitRegistrationSchema = new mongoose.Schema({
  visitor_name: { type: String, required: true },
  visitor_email: { type: String, required: true },
  visitor_mobile: { type: String, required: true },
  visitor_photo: { type: String },
  organization: { type: String },
  purpose: { type: String, required: true },
  whom_to_meet: { type: String, required: true },
  host_email: { type: String },
  scheduled_date_time: { type: Date, default: Date.now },
  status: { type: String, enum: ["pending", "approved", "rejected", "completed"], default: "pending" },
  invite_code: { type: String, unique: true },
  qr_code: { type: String },
  epass_id: { type: String },
  epass_pdf: { type: String },
  visit_type: { type: String, enum: ["walk_in", "pre_registered"], default: "walk_in" },
  expected_duration_minutes: { type: Number, default: 60 },
  notes: { type: String },
  check_in_time: { type: Date },
  check_out_time: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model("VisitRegistration", VisitRegistrationSchema);





