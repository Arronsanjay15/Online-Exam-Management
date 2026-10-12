const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exam",
        required: true
    },

    answers: {
        type: Object,
        default: {}
    },

    score: {
        type: Number,
        required: true
    },

    totalMarks: {
        type: Number,
        required: true
    },

    percentage: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        required: true
    },

    submittedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Result", resultSchema);