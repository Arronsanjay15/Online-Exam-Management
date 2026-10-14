const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
    examName: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    duration: {
        type: Number,
        required: true
    },

    totalMarks: {
        type: Number,
        required: true
    },

    createdDate: {
        type: String,
        required: true
    },

    examDate: {
        type: String,
        required: true
    },

    // Exam start date (YYYY-MM-DD). Older records may still
    // hold a date and time (YYYY-MM-DDTHH:mm or ISO string).
    examStartDateTime: {
        type: String,
        required: false
    },

    // Exam end date and time (YYYY-MM-DDTHH:mm or ISO string)
    examEndDateTime: {
        type: String,
        required: false
    },

    // Optional scheduled publish time (HH:mm). Applied to the
    // exam start date. Older records may still hold a full
    // datetime, which is honoured as-is.
    publishAt: {
        type: String,
        required: false
    },

    // Legacy fields for backward compatibility
    examEndDate: {
        type: String,
        required: false
    }
}, { timestamps: true });

module.exports = mongoose.model("Exam", examSchema);