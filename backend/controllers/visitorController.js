const VisitorLog = require("../models/VisitorLog");
const User = require("../models/User");
const generateEpass = require("../utils/generateEpass");
const sendEmail = require("../utils/sendEmail");

exports.checkIn = async (req, res) => {
  try {
    const visitor = await User.findById(req.user.id);
    if (!visitor) return res.status(404).json({ msg: "Visitor not found" });

<<<<<<< HEAD
    const { epassId, pdfPath } = await generateEpass(visitor);
    const log = await VisitorLog.create({ visitor: visitor._id, epassId });

    await sendEmail(visitor.email, "Your Visitor E-Pass", "Attached is your E-Pass.", [
      { filename: "epass.pdf", path: pdfPath }
    ]);

    res.status(201).json({ msg: "Check-in successful", log });
=======
    const { epassId, pdfPath } = await generateEpass({
      name: visitor.name,
      email: visitor.email,
      phone: visitor.phone
    });
    const pdfFilename = `${epassId}.pdf`;
    const log = await VisitorLog.create({ visitor: visitor._id, epassId, epass_pdf: pdfFilename });

    let sendRes;
    try {
      sendRes = await sendEmail(visitor.email, "Your Visitor E-Pass", "Attached is your E-Pass.", [
        { filename: pdfFilename, path: pdfPath }
      ]);
      console.log(`visitorController: E-pass email sent to ${visitor.email}`, sendRes?.messageId || 'no-id');
    } catch (err) {
      console.error(`visitorController.checkIn: failed to send email to ${visitor.email}`, err.message || err);
    }

    res.status(201).json({ msg: "Check-in successful", log, emailSent: !!sendRes, emailMessageId: sendRes?.messageId || null });
>>>>>>> d205e47 (Remove node_modules and add to gitignore)
  } catch (err) {
    res.status(400).json({ msg: "Error", error: err.message });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const log = await VisitorLog.findById(req.params.id);
    if (!log) return res.status(404).json({ msg: "Log not found" });

    log.checkOutTime = new Date();
    await log.save();

    res.json({ msg: "Check-out successful", log });
  } catch (err) {
    res.status(400).json({ msg: "Error", error: err.message });
  }
};
