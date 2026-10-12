const express = require("express");
const router = express.Router();

const Exam = require("../model/exammodel");
const Question = require("../model/questionmodel");
const Result = require("../model/resultmodel");


// ==========================================
// QUESTION STATISTICS PER EXAM
// ==========================================

// Groups the questions by exam and returns a Map that
// gives the number of questions and the total marks for
// each exam. Passing examIds limits the aggregation to
// the exams we actually care about.
const getQuestionStats = async (examIds) => {

    // Nothing to look up when there are no exams yet.
    if (Array.isArray(examIds) && examIds.length === 0) {
        return new Map();
    }

    const match =
        examIds && examIds.length > 0
            ? { examId: { $in: examIds } }
            : {};

    const rows = await Question.aggregate([
        { $match: match },
        {
            $group: {
                _id: "$examId",
                questionCount: { $sum: 1 },
                questionsTotalMarks: { $sum: "$marks" }
            }
        }
    ]);

    return new Map(
        rows.map((row) => [String(row._id), row])
    );
};


// Today's date as a YYYY-MM-DD string using the server's
// local time. Comparing plain date strings avoids any
// timezone problems that appear when parsing dates.
const getTodayDateString = () => {

    const now = new Date();

    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${now.getFullYear()}-${month}-${day}`;
};


// An exam is only publicly available once its questions
// have been completed (marks add up to the exam total) AND
// its exam date has arrived. Until the date arrives the
// exam is shown to students as "coming soon" but cannot be
// started.

const withPublishStatus = (exam, stats) => {

    const questionCount =
        stats ? stats.questionCount : 0;

    const questionsTotalMarks =
        stats ? stats.questionsTotalMarks : 0;

    const totalMarks = Number(exam.totalMarks) || 0;

    const isPublished =
        questionCount > 0 &&
        totalMarks > 0 &&
        Math.abs(
            Number(questionsTotalMarks) - totalMarks
        ) < 0.001;

    // examDate is stored as a string, e.g. "2026-10-13".
    const examDate = String(exam.examDate || "").substring(0, 10);

    const isUpcoming =
        examDate !== "" && examDate > getTodayDateString();

    const isAvailable = isPublished && !isUpcoming;

    return {
        ...exam,
        questionCount,
        questionsTotalMarks,
        isPublished,
        isUpcoming,
        isAvailable
    };
};


// Add a new exam
router.post("/", async (req, res) => {
    try {
        const exam = new Exam(req.body);
        const savedExam = await exam.save();

        // A brand new exam has no questions yet, so it stays
        // a draft until its questions are completed.
        const statsMap = await getQuestionStats([savedExam._id]);

        res.status(201).json({
            message: "Exam added successfully",
            exam: withPublishStatus(
                savedExam.toObject(),
                statsMap.get(String(savedExam._id))
            )
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
        const exams = await Exam.find().lean();

        const statsMap = await getQuestionStats(
            exams.map((exam) => exam._id)
        );

        const examsWithStatus = exams.map((exam) =>
            withPublishStatus(
                exam,
                statsMap.get(String(exam._id))
            )
        );

        res.status(200).json(examsWithStatus);
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
        const exam = await Exam.findById(req.params.id).lean();

        if (!exam) {
            return res.status(404).json({
                message: "Exam not found"
            });
        }

        const statsMap = await getQuestionStats([exam._id]);

        res.status(200).json(
            withPublishStatus(
                exam,
                statsMap.get(String(exam._id))
            )
        );
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
        ).lean();

        if (!exam) {
            return res.status(404).json({
                message: "Exam not found"
            });
        }

        const statsMap = await getQuestionStats([exam._id]);

        res.status(200).json({
            message: "Exam updated successfully",
            exam: withPublishStatus(
                exam,
                statsMap.get(String(exam._id))
            )
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

        // Remove all data that belongs to this exam so no
        // orphaned records are left behind:
        //   - the questions created for the exam
        //   - every student result for the exam (score,
        //     percentage, status, answers, etc.)
        const [questionRemoval, resultRemoval] =
            await Promise.all([
                Question.deleteMany({ examId: exam._id }),
                Result.deleteMany({ examId: exam._id })
            ]);

        res.status(200).json({
            message: "Exam deleted successfully",
            deletedQuestions: questionRemoval.deletedCount,
            deletedResults: resultRemoval.deletedCount
        });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting exam",
            error: error.message
        });
    }
});

module.exports = router;