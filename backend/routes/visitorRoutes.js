const express = require("express");
const { checkIn, checkOut } = require("../controllers/visitorController");
<<<<<<< HEAD
=======
const { 
  createRegistration, 
  getRegistrationByCode,
  getRegistrationByEpassId,
  getAllRegistrations,
  updateRegistrationStatus 
} = require("../controllers/visitRegistrationController");
>>>>>>> d205e47 (Remove node_modules and add to gitignore)
const { authMiddleware } = require("../middleware/auth");
const router = express.Router();

router.post("/checkin", authMiddleware, checkIn);
router.put("/checkout/:id", authMiddleware, checkOut);

<<<<<<< HEAD
=======
// Walk-in registration (no auth required)
router.post("/register", createRegistration);
router.get("/registration/:code", getRegistrationByCode);
router.get("/epass/:id", getRegistrationByEpassId);
router.get("/registrations", authMiddleware, getAllRegistrations);
router.put("/registration/:id/status", authMiddleware, updateRegistrationStatus);

>>>>>>> d205e47 (Remove node_modules and add to gitignore)
module.exports = router;
