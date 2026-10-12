const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exam",
        required: true
    },

    question: {
        type: String,
        required: true
    },

    options: {
        A: {
            type: String,
            required: true
        },

        B: {
            type: String,
            required: true
        },

        C: {
            type: String,
            required: true
        },

        D: {
            type: String,
            required: true
        }
    },

    correctAnswer: {
        type: String,
        required: true
    },

    marks: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model(
    "Question",
    questionSchema
);