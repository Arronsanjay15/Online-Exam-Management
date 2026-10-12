const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },

    phoneNumber: {
        type: String,
        required: true
    },

    gender: {
        type: String,
        required: true
    },

    usertype: {
        type: String,
        default: "Student"
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);