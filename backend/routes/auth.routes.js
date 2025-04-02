const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/verify-email", authController.verifyEmail);
router.post("/forgot-password-code", authController.sendForgotPasswordCode);
router.post("/verify-password-code", authController.verifyForgotPasswordCode);
router.post("/update-password", authController.updatePassword);

module.exports = router;