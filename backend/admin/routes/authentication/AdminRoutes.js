const express = require("express");
const {adminLogin, userList, blockUser, unblockUser, logoutAdmin, verifyAdminSession } = require('../../../admin/controllers/authentication/adminController');
const adminAuthMiddleware = require("../../middleware/adminAuthMiddleware");

const router = express.Router();

// Authentication routes
router.post("/adminlogin", adminLogin);
router.post("/adminlogout", logoutAdmin);
router.get("/check-auth", adminAuthMiddleware, (req, res) => {
  res.json({ success: true, message: "Authenticated" });
});

// User management routes
router.get("/userlist", adminAuthMiddleware, userList);
router.put("/block/:userId", adminAuthMiddleware, blockUser);
router.put("/unblock/:userId", adminAuthMiddleware, unblockUser);

module.exports = router;
