const User = require("../models/users");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerStudent = asyncHandler(async (req, res) => {
    const { name, roll, password } = req.body;

    if (!name || !roll || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const exists = await User.findOne({ roll });
    if (exists) {
        return res.status(400).json({ message: "Student already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
        name,
        roll,
        password: hashedPassword,
        role: "student",
    });

    res.status(201).json({ message: "Student registered successfully" });
});

const registerFaculty = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
        return res.status(400).json({ message: "Faculty already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
        name,
        email,
        password: hashedPassword,
        role: "faculty",
    });

    res.status(201).json({ message: "Faculty registered successfully" });
});

const loginStudent = asyncHandler(async (req, res) => {
    const { roll, password } = req.body;

    const student = await User.findOne({ roll, role: "student" });
    if (!student) {
        return res.status(400).json({ message: "Student not found" });
    }

    const isValid = await bcrypt.compare(password, student.password);
    if (!isValid) {
        return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
        { userId: student._id, role: student.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    res.json({ token, rollNumber: student.roll });
});

const loginFaculty = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const faculty = await User.findOne({ email, role: "faculty" });
    if (!faculty) {
        return res.status(400).json({ message: "Faculty not found" });
    }

    const isValid = await bcrypt.compare(password, faculty.password);
    if (!isValid) {
        return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
        { userId: faculty._id, role: faculty.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    res.json({ token });
});

const getMe = asyncHandler(async (req, res) => {
    res.status(200).json({
        userId: req.user.userId,
        role: req.user.role,
    });
});

module.exports = {
    registerStudent,
    registerFaculty,
    loginStudent,
    loginFaculty,
    getMe,
};
