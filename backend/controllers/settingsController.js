const SystemSettings = require("../models/SystemSettings");

// Get all settings
exports.getSettings = async (req, res) => {
  try {
    const settings = await SystemSettings.find();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching settings", error: err.message });
  }
};

// Create a new setting
exports.createSetting = async (req, res) => {
  try {
    const { setting_key, setting_value, setting_type } = req.body;
    
    // Check if setting already exists
    const existing = await SystemSettings.findOne({ setting_key });
    if (existing) {
      return res.status(400).json({ msg: "Setting already exists" });
    }

    const setting = await SystemSettings.create({
      setting_key,
      setting_value: String(setting_value),
      setting_type: setting_type || "text"
    });

    res.status(201).json(setting);
  } catch (err) {
    res.status(400).json({ msg: "Error creating setting", error: err.message });
  }
};

// Update a setting
exports.updateSetting = async (req, res) => {
  try {
    const { id } = req.params;
    const { setting_value, setting_type } = req.body;

    const setting = await SystemSettings.findById(id);
    if (!setting) {
      return res.status(404).json({ msg: "Setting not found" });
    }

    if (setting_value !== undefined) {
      setting.setting_value = String(setting_value);
    }
    if (setting_type) {
      setting.setting_type = setting_type;
    }

    await setting.save();
    res.json(setting);
  } catch (err) {
    res.status(400).json({ msg: "Error updating setting", error: err.message });
  }
};

// Get a single setting by key
exports.getSettingByKey = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await SystemSettings.findOne({ setting_key: key });
    
    if (!setting) {
      return res.status(404).json({ msg: "Setting not found" });
    }

    res.json(setting);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching setting", error: err.message });
  }
};





