const express = require("express");
const router = express.Router();

const Question = require("../model/questionmodel");

// Add a new question
router.post("/", async (req, res) => {
    try {
        const question = new Question(req.body);
        const savedQuestion = await question.save();

        res.status(201).json({
            message: "Question added successfully",
            question: savedQuestion
        });
    } catch (error) {
        res.status(500).json({
            message: "Error adding question",
            error: error.message
        });
    }
});

// Get all questions
router.get("/", async (req, res) => {
    try {
        const questions = await Question.find().populate("examId");

        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching questions",
            error: error.message
        });
    }
});

// Get questions for a particular exam
router.get("/exam/:examId", async (req, res) => {
    try {
        const questions = await Question.find({
            examId: req.params.examId
        });

        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching exam questions",
            error: error.message
        });
    }
});

// Get one question by ID
router.get("/:id", async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({
                message: "Question not found"
            });
        }

        res.status(200).json(question);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching question",
            error: error.message
        });
    }
});

// Update question
router.put("/:id", async (req, res) => {
    try {
        const question = await Question.findByIdAndUpdate(
            req.params.id,
            req.body,
            { returnDocument: "after" }
        );

        if (!question) {
            return res.status(404).json({
                message: "Question not found"
            });
        }

        res.status(200).json({
            message: "Question updated successfully",
            question: question
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating question",
            error: error.message
        });
    }
});

// Delete question
router.delete("/:id", async (req, res) => {
    try {
        const question = await Question.findByIdAndDelete(req.params.id);

        if (!question) {
            return res.status(404).json({
                message: "Question not found"
            });
        }

        res.status(200).json({
            message: "Question deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting question",
            error: error.message
        });
    }
});

module.exports = router;