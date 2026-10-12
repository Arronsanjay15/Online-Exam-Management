const mongoose = require("mongoose");

// =============================================
// GLOBAL SETTINGS
// A single document stores the system-wide
// preferences that admins manage from the
// Admin Settings page.
// =============================================

const settingSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            default: "global",
            unique: true
        },

        // Minimum percentage a student needs to pass
        passingPercentage: {
            type: Number,
            default: 40
        },

        // Defaults used when creating a new exam
        defaultExamDuration: {
            type: Number,
            default: 60
        },

        defaultTotalMarks: {
            type: Number,
            default: 100
        },

        // Allow students to create new accounts
        allowRegistration: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Setting", settingSchema);
