const express = require("express");
const { getVisitors, forceCheckout } = require("../controllers/adminController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");
const router = express.Router();

router.get("/visitors", authMiddleware, adminMiddleware, getVisitors);
router.put("/force-checkout/:id", authMiddleware, adminMiddleware, forceCheckout);

module.exports = router;
