const express = require("express");
const router = express.Router();
const { registerStudent, loginFaculty, registerFaculty, loginStudent, getMe } = require('../controllers/authControllers.js')
const { verifyToken } = require('../middlewares/authMiddleware.js')

router.post("/register/student", registerStudent);

router.post("/register/faculty", registerFaculty);

router.post("/login/student", loginStudent);

router.post("/login/faculty", loginFaculty);

router.get("/me", verifyToken, getMe);

module.exports = router;