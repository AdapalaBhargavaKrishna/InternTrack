const User = require('../models/users');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerStudent = asyncHandler(async (req, res) => {
    const { name, roll, password, role = "student" } = req.body;
    if (!name || !roll || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    const studentExists = await User.findOne({ roll });
    if (studentExists) {
        return res.status(400).json({ message: "Student already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const student = new User({ name, roll, password: hashedPassword, role })
    await student.save();
    res.status(201).json({ message: "Student registered successfully" });
})

const registerFaculty = asyncHandler(async (req, res) => {
    const { name, email, password, role = "faculty" } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    const facultyExists = await User.findOne({ email });
    if (facultyExists) {
        return res.status(400).json({ message: "Faculty already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const faculty = new User({ name, email, password: hashedPassword, role })
    await faculty.save();
    res.status(201).json({ message: "Faculty registered successfully" });
})

const loginStudent = asyncHandler(async (req, res) => {
    const { roll, password, role = "student" } = req.body;
    if (!roll || !password) {
        return res.status(400).json({ message: "All fields are required" })
    }
    const student = await User.findOne({ roll })
    if (!student) {
        return res.status(400).json({ message: "Student not found" })
    }
    const isPasswordValid = await bcrypt.compare(password, student.password)
    if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid password" })
    }
    const token = jwt.sign({ user: { roll: student.roll, role: student.role } }, process.env.JWT_SECRET, { expiresIn: "1h" })
    res.status(200).json({ message: "Student logged in successfully", rollNumber: student.roll, token })
})

const loginFaculty = asyncHandler(async (req, res) => {
    const { email, password, role = "faculty" } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" })
    }
    const faculty = await User.findOne({ email })
    if (!faculty) {
        return res.status(400).json({ message: "Faculty not found" })
    }
    const isPasswordValid = await bcrypt.compare(password, faculty.password)
    if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid password" })
    }
    const token = jwt.sign({ user: { email: faculty.email, role: faculty.role } }, process.env.JWT_SECRET, { expiresIn: "1h" })

    res.status(200).json({ message: "Faculty logged in successfully", token })
})

const validateToken = asyncHandler(async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ message: "Token is required" })
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    if (!decodedToken) {
        return res.status(400).json({ message: "Invalid token" })
    }
    res.status(200).json({ message: "Token is valid", valid: true, decodedToken })
})

module.exports = {
    registerStudent,
    registerFaculty,
    loginStudent,
    loginFaculty,
    validateToken
}