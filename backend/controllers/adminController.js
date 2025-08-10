const VisitorLog = require("../models/VisitorLog");

exports.getVisitors = async (req, res) => {
  try {
    const logs = await VisitorLog.find().populate("visitor", "name email phone");
    res.json(logs);
  } catch (err) {
    res.status(500).json({ msg: "Error", error: err.message });
  }
};

exports.forceCheckout = async (req, res) => {
  try {
    const log = await VisitorLog.findById(req.params.id);
    if (!log) return res.status(404).json({ msg: "Log not found" });

    log.checkOutTime = new Date();
    await log.save();

    res.json({ msg: "Force checkout done", log });
  } catch (err) {
    res.status(400).json({ msg: "Error", error: err.message });
  }
}