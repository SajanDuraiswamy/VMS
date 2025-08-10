const express = require("express");
const { checkIn, checkOut } = require("../controllers/visitorController");
const { authMiddleware } = require("../middleware/auth");
const router = express.Router();

router.post("/checkin", authMiddleware, checkIn);
router.put("/checkout/:id", authMiddleware, checkOut);

module.exports = router;
