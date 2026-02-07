const express = require("express");
const router = express.Router();
const { getAllInternships, addInternship, getInternshipById, updateInternship, deleteInternship } = require("../controllers/internshipControllers.js");

router.get("/", getAllInternships);

router.post("/", addInternship);

router.get("/:rollNumber", getInternshipById);

router.put("/:id", updateInternship);

router.delete("/:id", deleteInternship);

module.exports = router;