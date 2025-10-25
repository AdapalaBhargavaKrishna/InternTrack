const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const internshipRoutes = require("./routes/InternshipRoutes");
const AuthRoutes = require("./routes/AuthRoutes");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/internships", internshipRoutes);
app.use("/auth", AuthRoutes);

app.get("/", (req, res) => {
  res.send("Internship Management API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
