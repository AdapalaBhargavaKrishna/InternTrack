const express = require("express");
const dotenv = require("dotenv")
const authRoutes = require("./routes/auth.js")
const internshipRoutes = require("./routes/internships.js")
const connectDB = require("./config/db.js")
const cors = require("cors")



dotenv.config();

const app = express();
app.use(express.json());
app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "https://interntrack-rust.vercel.app"
        ],
        credentials: true,
    })
);

connectDB();


app.use('/auth', authRoutes)
app.use('/internships', internshipRoutes)

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});