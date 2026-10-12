const express = require("express");
const router = express.Router();

const Exam = require("../model/exammodel");
const Question = require("../model/questionmodel");
const Result = require("../model/resultmodel");

// Add a new exam
router.post("/", async (req, res) => {
    try {
        const exam = new Exam(req.body);
        const savedExam = await exam.save();

        res.status(201).json({
            message: "Exam added successfully",
            exam: savedExam
        });
    } catch (error) {
        res.status(500).json({
            message: "Error adding exam",
            error: error.message
        });
    }
});

// Get all exams
router.get("/", async (req, res) => {
    try {
        const exams = await Exam.find();

        res.status(200).json(exams);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching exams",
            error: error.message
        });
    }
});

// Get one exam by ID
router.get("/:id", async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({
                message: "Exam not found"
            });
        }

        res.status(200).json(exam);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching exam",
            error: error.message
        });
    }
});

// Update exam
router.put("/:id", async (req, res) => {
    try {
        const exam = await Exam.findByIdAndUpdate(
            req.params.id,
            req.body,
            { returnDocument: "after" }
        );

        if (!exam) {
            return res.status(404).json({
                message: "Exam not found"
            });
        }

        res.status(200).json({
            message: "Exam updated successfully",
            exam: exam
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating exam",
            error: error.message
        });
    }
});

// Delete exam
router.delete("/:id", async (req, res) => {
    try {
        const exam = await Exam.findByIdAndDelete(req.params.id);

        if (!exam) {
            return res.status(404).json({
                message: "Exam not found"
            });
        }

        // Remove questions and results that belong to this exam
        // so no orphaned records are left behind.
        await Promise.all([
            Question.deleteMany({ examId: exam._id }),
            Result.deleteMany({ examId: exam._id })
        ]);

        res.status(200).json({
            message: "Exam deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting exam",
            error: error.message
        });
    }
});

module.exports = router;