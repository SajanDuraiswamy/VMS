const VisitorLog = require("../models/VisitorLog");

exports.getVisitors = async (req, res) => {
  try {
    const logs = await VisitorLog.find().populate("visitor", "name email phone");
<<<<<<< HEAD
    res.json(logs);
=======
      // Normalize visitor info so frontend always has visitor.name/email/phone
      const normalized = logs.map((log) => {
        if (!log.visitor || Object.keys(log.visitor).length === 0) {
          return {
            ...log.toObject(),
            visitor: {
              name: log.visitor_name || "",
              email: log.visitor_email || "",
              phone: log.visitor_mobile || "",
            },
          };
        }
        return log;
      });
      res.json(normalized);
>>>>>>> d205e47 (Remove node_modules and add to gitignore)
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