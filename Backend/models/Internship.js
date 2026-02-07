const mongoose = require("mongoose");

const internshipSchema = new mongoose.Schema(
    {
        studentName: {
            type: String,
            required: true,
            trim: true,
        },
        rollNumber: {
            type: String,
            required: true,
            unique: true,
        },
        department: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
        },

        companyName: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        duration: {
            type: String,
        },
        stipend: {
            type: Number,
            default: 0,
        },

        mentorName: {
            type: String,
            required: true,
        },
        mentorContact: {
            type: String,
            required: true,
        },
        mentorRole: {
            type: String,
            required: true,
        },

        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Internship", internshipSchema);