const mongoose = require("mongoose");

const internshipSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: [true, "Student name is required"],
    },
    rollNumber: {
      type: String,
      required: [true, "Roll number is required"],
    },
    department: {
      type: String,
      required: [true, "Department is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      match: [/.+\@.+\..+/, "Please enter a valid email address"],
    },

    companyName: {
      type: String,
      required: [true, "Company name is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
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
      required: [true, "Mentor name is required"],
    },
    mentorContact: {
      type: String,
      required: [true, "Mentor contact is required"],
    },
    mentorRole: {
      type: String,
      required: [true, "Mentor role is required"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Internship", internshipSchema);
