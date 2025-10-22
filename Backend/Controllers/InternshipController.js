const Internship = require("../models/Internship");

const addInternship = async (req, res) => {
  try {
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

    const newInternship = new Internship({
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

    const savedInternship = await newInternship.save();
    res.status(201).json(savedInternship);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to add record", error: error.message });
  }
};

const getInternships = async (req, res) => {
  try {
    const internships = await Internship.find({}).sort({ createdAt: -1 });

    res.status(200).json(internships);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch records", error: error.message });
  }
};

const updateInternship = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    delete updatedData._id;

    const updatedInternship = await Internship.findByIdAndUpdate(
      id,
      updatedData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedInternship) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.status(200).json(updatedInternship);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update record", error: error.message });
  }
};

const deleteInternship = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedInternship = await Internship.findByIdAndDelete(id);

    if (!deletedInternship) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.status(200).json({ message: "Record deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete record", error: error.message });
  }
};

const getInternshipsForExport = async (req, res) => {
  try {
    const internships = await Internship.find({}).sort({ createdAt: -1 });
    res.status(200).json(internships);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch data for export",
      error: error.message,
    });
  }
};

module.exports = {
  addInternship,
  getInternships,
  updateInternship,
  deleteInternship,
  getInternshipsForExport,
};
