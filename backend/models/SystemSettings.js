const mongoose = require("mongoose");

const SystemSettingsSchema = new mongoose.Schema({
  setting_key: { type: String, required: true, unique: true },
  setting_value: { type: String, required: true },
  setting_type: { type: String, enum: ["text", "boolean", "number"], default: "text" }
}, {
  timestamps: true
});

module.exports = mongoose.model("SystemSettings", SystemSettingsSchema);





