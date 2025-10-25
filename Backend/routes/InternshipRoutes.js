const express = require("express");

const router = express.Router();

const {
  addInternship,
  getInternships,
  getInternshipById,
  updateInternship,
  deleteInternship,
  exportInternships,
} = require("../Controllers/InternshipController");

router.post("/", addInternship);
router.get("/", getInternships);
router.put("/:id", updateInternship);
router.delete("/:id", deleteInternship);

module.exports = router;
