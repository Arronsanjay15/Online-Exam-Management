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
    }
});

module.exports = mongoose.model("Exam", examSchema);