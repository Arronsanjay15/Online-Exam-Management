const express = require("express");
const router = express.Router();

const Result = require("../model/resultmodel");

// Add a new result
router.post("/", async (req, res) => {
    try {
        const result = new Result(req.body);
        const savedResult = await result.save();

        res.status(201).json({
            message: "Result added successfully",
            result: savedResult
        });
    } catch (error) {
        res.status(500).json({
            message: "Error adding result",
            error: error.message
        });
    }
});

// Get all results
router.get("/", async (req, res) => {
    try {
        const results = await Result.find()
            .populate("userId")
            .populate("examId");

        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching results",
            error: error.message
        });
    }
});

// Get results of a particular user
router.get("/user/:userId", async (req, res) => {
    try {
        const results = await Result.find({
            userId: req.params.userId
        }).populate("examId");

        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching user results",
            error: error.message
        });
    }
});

// Get results of a particular exam
router.get("/exam/:examId", async (req, res) => {
    try {
        const results = await Result.find({
            examId: req.params.examId
        }).populate("userId");

        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching exam results",
            error: error.message
        });
    }
});

// Get one result by ID
router.get("/:id", async (req, res) => {
    try {
        const result = await Result.findById(req.params.id)
            .populate("userId")
            .populate("examId");

        if (!result) {
            return res.status(404).json({
                message: "Result not found"
            });
        }

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching result",
            error: error.message
        });
    }
});

// Delete result
router.delete("/:id", async (req, res) => {
    try {
        const result = await Result.findByIdAndDelete(req.params.id);

        if (!result) {
            return res.status(404).json({
                message: "Result not found"
            });
        }

        res.status(200).json({
            message: "Result deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting result",
            error: error.message
        });
    }
});

module.exports = router;