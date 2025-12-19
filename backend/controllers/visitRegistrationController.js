const VisitRegistration = require("../models/VisitRegistration");
const sendEmail = require("../utils/sendEmail");
const generateEpass = require("../utils/generateEpass");

// Create walk-in visitor registration
exports.createRegistration = async (req, res) => {
  try {
    const {
      full_name,
      mobile,
      email,
      organization,
      purpose,
      whom_to_meet,
      host_email,
      expected_duration_minutes,
      notes,
      photo_url,
      scheduled_date_time,
      visit_type = "walk_in"
    } = req.body;

    // Generate unique invite code based on visit type
    const prefix = visit_type === "pre_registered" ? "PRE" : "VIS";
    const inviteCode = `${prefix}${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Determine scheduled date time
    let scheduledDateTime = new Date();
    if (scheduled_date_time) {
      scheduledDateTime = new Date(scheduled_date_time);
    }

    // Create registration
    const registration = await VisitRegistration.create({
      visitor_name: full_name,
      visitor_email: email,
      visitor_mobile: mobile,
      visitor_photo: photo_url,
      organization: organization || "",
      purpose: purpose,
      whom_to_meet: whom_to_meet,
      host_email: host_email || "",
      scheduled_date_time: scheduledDateTime,
      status: "pending",
      invite_code: inviteCode,
      qr_code: inviteCode,
      visit_type: visit_type,
      expected_duration_minutes: expected_duration_minutes || 60,
      notes: notes || ""
    });

    // Send email notification to visitor
    try {
      const emailSubject = visit_type === "pre_registered" 
        ? "Pre-Registration Confirmation - Save Your QR Code"
        : "Visitor Registration Confirmation";
      
      const scheduledInfo = visit_type === "pre_registered" && scheduled_date_time
        ? `\nScheduled Date: ${new Date(scheduled_date_time).toLocaleDateString()} at ${new Date(scheduled_date_time).toLocaleTimeString()}`
        : "";
      
      const emailBody = visit_type === "pre_registered"
        ? `Dear ${full_name},\n\nYour visit has been pre-registered successfully.\n\nInvite Code: ${inviteCode}${scheduledInfo}\nPurpose: ${purpose}\nMeeting: ${whom_to_meet}\n\nYour visit is pending approval from the host. Once approved, you can use this invite code to check in quickly on your visit day.\n\nThank you!`
        : `Dear ${full_name},\n\nYour visitor registration has been submitted successfully.\n\nInvite Code: ${inviteCode}\nPurpose: ${purpose}\nMeeting: ${whom_to_meet}\n\nYour visit is pending approval from the host. You will receive another email once approved.\n\nThank you!`;
      
      const resultVisitorEmail = await sendEmail(email, emailSubject, emailBody);
      console.log(`createRegistration: visitor email sent to ${email}`, resultVisitorEmail?.messageId || "no-id");
    } catch (emailErr) {
      console.error("Email sending failed:", emailErr);
    }

    // Send notification to host if email provided
    if (host_email) {
      try {
        const scheduledInfo = visit_type === "pre_registered" && scheduled_date_time
          ? `\nScheduled: ${new Date(scheduled_date_time).toLocaleDateString()} at ${new Date(scheduled_date_time).toLocaleTimeString()}`
          : "";
        
        const hostEmailBody = visit_type === "pre_registered"
          ? `A visitor has pre-registered to meet you.\n\nVisitor: ${full_name}\nMobile: ${mobile}\nEmail: ${email}${scheduledInfo}\nPurpose: ${purpose}\nExpected Duration: ${expected_duration_minutes || 60} minutes\n\nPlease approve or reject this visit request.`
          : `A visitor has registered to meet you.\n\nVisitor: ${full_name}\nMobile: ${mobile}\nEmail: ${email}\nPurpose: ${purpose}\nExpected Duration: ${expected_duration_minutes || 60} minutes\n\nPlease approve or reject this visit request.`;
        
        const resultHostEmail = await sendEmail(
          host_email,
          visit_type === "pre_registered" 
            ? "New Pre-Registration - Approval Required"
            : "New Visitor Registration - Approval Required",
          hostEmailBody
        );
        console.log(`createRegistration: host email sent to ${host_email}`, resultHostEmail?.messageId || "no-id");
      } catch (emailErr) {
        console.error("Host email sending failed:", emailErr);
      }
    }

    res.status(201).json({
      msg: "Registration successful",
      registration: registration,
      invite_code: inviteCode,
      registration_id: registration._id
    });
  } catch (err) {
    res.status(400).json({ msg: "Registration failed", error: err.message });
  }
};

// Get registration by invite code
exports.getRegistrationByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const registration = await VisitRegistration.findOne({ invite_code: code });
    
    if (!registration) {
      return res.status(404).json({ msg: "Registration not found" });
    }

    // If not approved, do not return epass fields
    const safeRegistration = registration.toObject();
    if (safeRegistration.status !== "approved") {
      delete safeRegistration.epass_id;
      delete safeRegistration.epass_pdf;
    }
    res.json(safeRegistration);
  } catch (err) {
    res.status(500).json({ msg: "Error", error: err.message });
  }
};

// Get registration by epass id
exports.getRegistrationByEpassId = async (req, res) => {
  try {
    const { id } = req.params;
    // Try to find in VisitRegistration (pre-registered)
    let registration = await VisitRegistration.findOne({ epass_id: id });
    if (registration) return res.json(registration);

    // Fallback: try to find in VisitorLog (check-in generated epass)
    const VisitorLog = require("../models/VisitorLog");
    const log = await VisitorLog.findOne({ epassId: id }).populate("visitor", "name email phone");
    if (log) {
      const visitor = log.visitor || {};
      return res.json({
        visitor_name: visitor.name,
        visitor_email: visitor.email,
        visitor_mobile: visitor.phone,
        epass_id: log.epassId,
        epass_pdf: log.epass_pdf,
      });
    }

    return res.status(404).json({ msg: "E-pass not found" });
  } catch (err) {
    res.status(500).json({ msg: "Error", error: err.message });
  }
};

// Get all registrations (for admin)
exports.getAllRegistrations = async (req, res) => {
  try {
    const registrations = await VisitRegistration.find().sort({ createdAt: -1 });
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ msg: "Error", error: err.message });
  }
};

// Update registration status
exports.updateRegistrationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const registration = await VisitRegistration.findById(id);
    if (!registration) {
      return res.status(404).json({ msg: "Registration not found" });
    }

    registration.status = status;
    await registration.save();

    // Send notification emails on status change
    try {
      if (status === "approved") {
        // Generate E-Pass and attach to email
        try {
          const frontendUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get("host").replace(/:\d+$/, ":5173")}`;

          const { epassId, pdfPath } = await generateEpass({
            name: registration.visitor_name,
            email: registration.visitor_email,
            phone: registration.visitor_mobile,
          }, frontendUrl);

          const pdfFilename = `${epassId}.pdf`;
          registration.epass_id = epassId;
          registration.epass_pdf = pdfFilename;
          // Save epass info on registration
          await registration.save();

          // Create a visitor log entry for admin records
          const VisitorLog = require("../models/VisitorLog");
          await VisitorLog.create({
            visitor_name: registration.visitor_name,
            visitor_email: registration.visitor_email,
            visitor_mobile: registration.visitor_mobile,
            epassId,
            epass_pdf: pdfFilename,
            checkInTime: registration.scheduled_date_time || new Date(),
          });

          const link = `${req.protocol}://${req.get("host")}/tmp/${pdfFilename}`;
          const sendResult = await sendEmail(
            registration.visitor_email,
            "Pre-Registration Approved - Visitor E-Pass",
            `Dear ${registration.visitor_name},\n\nYour pre-registration request has been approved.\n\nInvite Code: ${registration.invite_code}\n\nYou can download your e-pass here: ${link}\n\nPlease present this e-pass at the gate.\n\nBest regards,\nVisitor Management Team`,
            [{ filename: pdfFilename, path: pdfPath }]
          );
          console.log(`updateRegistrationStatus: approval email sent to ${registration.visitor_email}`, sendResult?.messageId || "no-id");
        } catch (e) {
          console.error("Epass generation failed:", e);
          // fallback to sending a simple email without attachment
          const fallbackResult = await sendEmail(
            registration.visitor_email,
            "Pre-Registration Approved - Visitor Pass",
            `Dear ${registration.visitor_name},\n\nYour pre-registration request has been approved.\n\nInvite Code: ${registration.invite_code}\n\nPlease present this invite code at the gate.\n\nBest regards,\nVisitor Management Team`
          );
          console.log(`updateRegistrationStatus: fallback (no-attachment) email sent to ${registration.visitor_email}`, fallbackResult?.messageId || "no-id");
        }
      } else if (status === "rejected") {
        const rejectSendResult = await sendEmail(
          registration.visitor_email,
          "Pre-Registration Update",
          `Dear ${registration.visitor_name},\n\nWe regret to inform you that your pre-registration has been rejected.\n\nPlease contact the host for more information.\n\nBest regards,\nVisitor Management Team`
        );
        console.log(`updateRegistrationStatus: rejection email sent to ${registration.visitor_email}`, rejectSendResult?.messageId || "no-id");
      }
    } catch (emailErr) {
      console.error("Failed to send status notification:", emailErr);
    }

    res.json({ msg: "Status updated", registration });
  } catch (err) {
    res.status(400).json({ msg: "Error", error: err.message });
  }
};

