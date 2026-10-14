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


// Today's date/time as ISO-like for comparison using server's local time
const getNowDate = () => new Date();

// Parse date/time safely - handles both YYYY-MM-DD and YYYY-MM-DDTHH:mm formats
const parseExamDateTime = (value) => {
    if (!value) return null;
    const str = String(value);
    // If it's datetime-local format (YYYY-MM-DDTHH:mm), convert to Date
    if (str.includes('T')) {
        return new Date(str);
    }
    // If it's date only (YYYY-MM-DD), treat as start of day
    return new Date(str + 'T00:00:00');
};


// An exam is only publicly available once its questions
// have been completed (marks add up to the exam total) AND
// the current time is between exam start and end times.
// If scheduled publish time is set, also respect it.
// If questions are not complete by publish time, it won't auto-publish - admin is notified conceptually.

const withPublishStatus = (exam, stats) => {

    const questionCount =
        stats ? stats.questionCount : 0;

    const questionsTotalMarks =
        stats ? stats.questionsTotalMarks : 0;

    const totalMarks = Number(exam.totalMarks) || 0;

    const isPublishedQuestions =
        questionCount > 0 &&
        totalMarks > 0 &&
        Math.abs(
            Number(questionsTotalMarks) - totalMarks
        ) < 0.001;

    const now = getNowDate();

    // Determine start time (prefer new fields, fallback to legacy)
    let startTime = parseExamDateTime(exam.examStartDateTime || exam.examDate);
    // If only date was provided without time, treat as start of day
    if (!exam.examStartDateTime && exam.examDate && !String(exam.examDate).includes('T')) {
        startTime = parseExamDateTime(exam.examDate);
    }

    // Determine end time
    let endTime = parseExamDateTime(exam.examEndDateTime || exam.examEndDate || exam.examDate);
    // If only legacy end date without time, treat as end of day? Or allow - better treat as end of day
    if (!exam.examEndDateTime && (exam.examEndDate || exam.examDate)) {
        const endStr = exam.examEndDate || exam.examDate;
        if (!String(endStr).includes('T')) {
            // End of day
            const d = new Date(endStr + 'T23:59:59');
            endTime = d;
        }
    }

    const isUpcoming = startTime ? startTime > now : false;
    const isEnded = endTime ? endTime < now : false;

    // Check scheduled publish time if set
    const publishTime = parseExamDateTime(exam.publishAt);
    const publishTimeReached = publishTime ? publishTime <= now : true;

    // Exam is available if questions are complete, publish time reached, started, and not ended
    // If publishAt is specified but questions not complete by publish time, exam is NOT auto-published
    // This means isAvailable remains false until admin completes questions - even if publish time passed
    let isAvailable;
    if (publishTime) {
        // If scheduled publish time is set, check both conditions
        isAvailable = isPublishedQuestions && publishTimeReached && !isUpcoming && !isEnded;
    } else {
        isAvailable = isPublishedQuestions && !isUpcoming && !isEnded;
    }

    // Also track if it's published (questions complete) regardless of time
    const isPublished = isPublishedQuestions;

    // Check if exam should have been published but wasn't due to incomplete questions
    const publishMissed = publishTime && publishTimeReached && !isPublishedQuestions;
    const missedPublishReason = publishMissed ? 'Questions not completed by publish time' : null;

    return {
        ...exam,
        questionCount,
        questionsTotalMarks,
        isPublished,
        isPublishedQuestions,
        isUpcoming,
        isEnded,
        isAvailable,
        publishTimeReached,
        canAutoPublish: isPublishedQuestions && publishTimeReached,
        publishMissed,
        missedPublishReason
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