const Internship = require("../models/internship");
const asyncHandler = require("express-async-handler");

const addInternship = asyncHandler(async (req, res) => {
    const {
        studentName,
        rollNumber,
        department,
        email,
        companyName,
        location,
        startDate,
        endDate,
        duration,
        stipend,
        mentorName,
        mentorContact,
        mentorRole,
    } = req.body;

    if (
        !studentName ||
        !rollNumber ||
        !department ||
        !email ||
        !companyName ||
        !location ||
        !startDate ||
        !endDate ||
        !mentorName ||
        !mentorContact ||
        !mentorRole
    ) {
        return res.status(400).json({ message: "All required fields are mandatory" });
    }

    const internshipExists = await Internship.findOne({ rollNumber });
    if (internshipExists) {
        return res
            .status(400)
            .json({ message: "Internship already exists for this roll number" });
    }

    const internship = await Internship.create({
        studentName,
        rollNumber,
        department,
        email,
        companyName,
        location,
        startDate,
        endDate,
        duration,
        stipend,
        mentorName,
        mentorContact,
        mentorRole,
    });

    res.status(201).json({
        message: "Internship added successfully",
        internship,
    });
});

const getAllInternships = asyncHandler(async (req, res) => {
    const internships = await Internship.find();
    res.status(200).json(internships);
});

const getInternshipById = asyncHandler(async (req, res) => {
    const { rollNumber } = req.params;
    const internship = await Internship.findOne({ rollNumber });
    if (!internship) {
        return res.status(404).json({ message: "Internship not found" });
    }
    res.status(200).json(internship);
})

const deleteInternship = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const internship = await Internship.findByIdAndDelete(id);
    if (!internship) {
        return res.status(404).json({ message: "Internship not found" });
    }
    res.status(200).json({ message: "Internship deleted successfully" });
})

const updateInternship = asyncHandler(async (req, res) => {
    const { id } = req.params;

    console.log("ID:", id);
    console.log("BODY:", req.body);

    const internship = await Internship.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
    );

    console.log("UPDATED:", internship);

    if (!internship) {
        return res.status(404).json({ message: "Internship not found" });
    }

    res.status(200).json({ internship });
});


module.exports = { addInternship, getAllInternships, getInternshipById, deleteInternship, updateInternship };
