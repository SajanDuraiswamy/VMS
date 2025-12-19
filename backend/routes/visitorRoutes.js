const express = require("express");
const { checkIn, checkOut } = require("../controllers/visitorController");
const { 
  createRegistration, 
  getRegistrationByCode,
  getRegistrationByEpassId,
  getAllRegistrations,
  updateRegistrationStatus 
} = require("../controllers/visitRegistrationController");
const { authMiddleware } = require("../middleware/auth");
const router = express.Router();

router.post("/checkin", authMiddleware, checkIn);
router.put("/checkout/:id", authMiddleware, checkOut);

// Walk-in registration (no auth required)
router.post("/register", createRegistration);
router.get("/registration/:code", getRegistrationByCode);
router.get("/epass/:id", getRegistrationByEpassId);
router.get("/registrations", authMiddleware, getAllRegistrations);
router.put("/registration/:id/status", authMiddleware, updateRegistrationStatus);

module.exports = router;
