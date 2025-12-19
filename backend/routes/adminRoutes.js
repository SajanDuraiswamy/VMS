const express = require("express");
const { getVisitors, forceCheckout } = require("../controllers/adminController");
const { 
  getSettings, 
  createSetting, 
  updateSetting, 
  getSettingByKey 
} = require("../controllers/settingsController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");
const router = express.Router();

router.get("/visitors", authMiddleware, adminMiddleware, getVisitors);
router.put("/force-checkout/:id", authMiddleware, adminMiddleware, forceCheckout);

// System Settings Routes
router.get("/settings", authMiddleware, adminMiddleware, getSettings);
router.post("/settings", authMiddleware, adminMiddleware, createSetting);
router.put("/settings/:id", authMiddleware, adminMiddleware, updateSetting);
router.get("/settings/key/:key", authMiddleware, adminMiddleware, getSettingByKey);

module.exports = router;
