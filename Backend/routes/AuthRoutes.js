const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  validateUser,
} = require("../Controllers/AuthController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/validate", validateUser);

module.exports = router;
