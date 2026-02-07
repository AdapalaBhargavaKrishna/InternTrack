const mongoose = require('mongoose');
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        roll: {
            type: String,
            unique: true,
            sparse: true
        },

        email: {
            type: String,
            unique: true,
            sparse: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["student", "faculty"],
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);