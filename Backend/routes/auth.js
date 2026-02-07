const express = require("express");
const router = express.Router();
const { registerStudent, loginFaculty, registerFaculty, loginStudent, validateToken } = require('../controllers/authControllers.js')

router.post("/register/student", registerStudent);

router.post("/register/faculty", registerFaculty);

router.post("/login/student", loginStudent);

router.post("/login/faculty", loginFaculty);

router.post("/validate", validateToken);

module.exports = router;