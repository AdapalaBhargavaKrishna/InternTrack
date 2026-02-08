const express = require("express");
const router = express.Router();
const { getAllInternships, addInternship, getInternshipById, updateInternship, deleteInternship } = require("../controllers/internshipControllers.js");
const { verifyToken, authorizeRole } = require("../middlewares/authMiddleware.js");

router.get(
    "/",
    verifyToken,
    authorizeRole("faculty"),
    getAllInternships
);

router.post(
    "/",
    verifyToken,
    authorizeRole("student"),
    addInternship
);

router.get(
    "/:rollNumber",
    verifyToken,
    authorizeRole("student", "faculty"),
    getInternshipById
);

router.put(
    "/:id",
    verifyToken,
    authorizeRole("student", "faculty"),
    updateInternship
);

router.delete(
    "/:id",
    verifyToken,
    authorizeRole("student", "faculty"),
    deleteInternship
);


module.exports = router;