import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import NoticeModal from "../components/NoticeModal";
import ConfirmModal from "../components/ConfirmModal";
import {
    EditIcon,
    PlusIcon,
    TrashIcon,
    QuestionIcon,
    CheckIcon,
    ClockIcon
} from "../components/Icons";

function QuestionManagement() {

    const [questions, setQuestions] = useState([]);
    const [exams, setExams] = useState([]);

    const [examId, setExamId] = useState("");
    const [question, setQuestion] = useState("");
    const [optionA, setOptionA] = useState("");
    const [optionB, setOptionB] = useState("");
    const [optionC, setOptionC] = useState("");
    const [optionD, setOptionD] = useState("");
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [marks, setMarks] = useState("");

    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Popups
    const [notice, setNotice] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);


    // ==========================================
    // LOAD EXAMS AND QUESTIONS
    // ==========================================

    useEffect(() => {
        fetchExams();
        fetchQuestions();
    }, []);


    // ==========================================
    // FETCH EXAMS
    // ==========================================

    const fetchExams = async () => {
        try {

            const response = await fetch(
                "http://localhost:5000/api/exams"
            );

            if (!response.ok) {
                throw new Error("Failed to fetch exams");
            }

            const data = await response.json();

            setExams(data);

        } catch (error) {

            console.error(
                "Error fetching exams:",
                error
            );

            setError(
                "Unable to load exams. Make sure the backend is running."
            );
        }
    };


    // ==========================================
    // FETCH QUESTIONS
    // ==========================================

    const fetchQuestions = async () => {

        try {

            setLoading(true);

            const response = await fetch(
                "http://localhost:5000/api/questions"
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to fetch questions"
                );
            }

            const data = await response.json();

            setQuestions(data);

        } catch (error) {

            console.error(
                "Error fetching questions:",
                error
            );

            setError(
                "Unable to load questions."
            );

        } finally {

            setLoading(false);

        }
    };


    // ==========================================
    // SELECTED EXAM + MARK CRITERIA
    // Only the questions that belong to the
    // currently selected exam are shown, and the
    // sum of their marks is compared with the
    // total marks set on the exam.
    // ==========================================

    const selectedExam =
        exams.find((exam) => exam._id === examId) || null;

    const examQuestions = examId
        ? questions.filter((item) => {
            const itemExamId =
                item.examId?._id || item.examId;

            return itemExamId === examId;
        })
        : [];

    const questionsTotalMarks = examQuestions.reduce(
        (sum, item) => sum + (Number(item.marks) || 0),
        0
    );

    const examTotalMarks = Number(selectedExam?.totalMarks) || 0;

    const marksRemaining =
        examTotalMarks - questionsTotalMarks;


    // A short, logical message about the marks criteria
    const getMarksCriteriaMessage = () => {

        if (!selectedExam) {
            return "";
        }

        if (examTotalMarks <= 0) {
            return "This examination has no total marks set, so the marks criteria cannot be checked.";
        }

        if (examQuestions.length === 0) {
            return `No questions added yet. The marks of all questions must add up to exactly ${examTotalMarks} to satisfy the exam total.`;
        }

        if (questionsTotalMarks === examTotalMarks) {
            return `All questions add up to exactly ${examTotalMarks} marks, which matches the exam total. This exam is available to students.`;
        }

        if (questionsTotalMarks < examTotalMarks) {
            return `Questions currently add up to ${questionsTotalMarks} of ${examTotalMarks} marks. Add ${marksRemaining} more mark${marksRemaining === 1 ? "" : "s"} of questions to match the exam total.`;
        }

        return `Questions add up to ${questionsTotalMarks} marks, which is ${questionsTotalMarks - examTotalMarks} mark${questionsTotalMarks - examTotalMarks === 1 ? "" : "s"} more than the exam total of ${examTotalMarks}. The questions do not satisfy the total marks criteria.`;
    };


    const marksCriteriaStatus =
        !selectedExam || examTotalMarks <= 0
            ? "empty"
            : questionsTotalMarks === examTotalMarks
            ? "matched"
            : questionsTotalMarks < examTotalMarks
            ? "short"
            : "over";


    // Feedback sentence used after a question is saved so the
    // admin knows whether the marks now satisfy the exam total.
    const getMarksFeedback = (total) => {

        if (!selectedExam || examTotalMarks <= 0) {
            return "";
        }

        if (total === examTotalMarks) {
            return ` The questions now add up to exactly ${examTotalMarks} marks, matching the exam total. The exam is now available to students.`;
        }

        if (total < examTotalMarks) {
            const remaining = examTotalMarks - total;

            return ` The questions add up to ${total} of ${examTotalMarks} marks — ${remaining} mark${remaining === 1 ? "" : "s"} still remaining.`;
        }

        return ` The questions add up to ${total} marks, which is more than the exam total of ${examTotalMarks} marks.`;
    };


    // ==========================================
    // ADD / UPDATE QUESTION
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        const questionText = question.trim();

        const options = {
            A: optionA.trim(),
            B: optionB.trim(),
            C: optionC.trim(),
            D: optionD.trim()
        };

        const marksValue = Number(marks);


        // ---------- Exam selected ----------

        if (!examId) {
            setNotice({
                type: "error",
                title: "No exam selected",
                message:
                    "Please select the examination this question belongs to."
            });
            return;
        }


        // ---------- Question text ----------

        if (!questionText) {
            setNotice({
                type: "error",
                title: "Question is empty",
                message: "Please enter the question text."
            });
            return;
        }


        // ---------- Options ----------

        const missingOption = ["A", "B", "C", "D"].find(
            (key) => !options[key]
        );

        if (missingOption) {
            setNotice({
                type: "error",
                title: `Option ${missingOption} is missing`,
                message:
                    `Please enter a value for option ${missingOption}.`
            });
            return;
        }


        const uniqueOptions = new Set(
            Object.values(options).map(
                (value) => value.toLowerCase()
            )
        );

        if (uniqueOptions.size !== 4) {
            setNotice({
                type: "error",
                title: "Duplicate options",
                message:
                    "All four answer options must be different from each other."
            });
            return;
        }


        // ---------- Correct answer ----------

        if (!correctAnswer) {
            setNotice({
                type: "error",
                title: "No correct answer selected",
                message:
                    "Please choose which option is the correct answer."
            });
            return;
        }


        if (!["A", "B", "C", "D"].includes(correctAnswer)) {
            setNotice({
                type: "error",
                title: "Invalid correct answer",
                message:
                    "The correct answer must be one of A, B, C or D."
            });
            return;
        }


        // ---------- Marks ----------

        if (marks === "" || marks === null || marks === undefined) {
            setNotice({
                type: "error",
                title: "Marks missing",
                message:
                    "Please enter the marks for this question."
            });
            return;
        }


        if (!Number.isFinite(marksValue) || marksValue <= 0) {
            setNotice({
                type: "error",
                title: "Invalid marks",
                message:
                    "Marks must be a number greater than 0."
            });
            return;
        }


        // ---------- Total marks criteria ----------
        // The marks of every question must add up to the
        // total marks set on the exam. Adding a question
        // that would push the total above the exam total
        // is not allowed.

        const otherMarks = examQuestions
            .filter((item) => item._id !== editingId)
            .reduce(
                (sum, item) =>
                    sum + (Number(item.marks) || 0),
                0
            );

        const projectedTotal = otherMarks + marksValue;

        if (examTotalMarks > 0 && projectedTotal > examTotalMarks) {

            const excess = projectedTotal - examTotalMarks;

            setNotice({
                type: "error",
                title: "Total marks exceeded",
                message:
                    `The questions for "${selectedExam.examName}" would add up to ${projectedTotal} marks, but the exam total is ${examTotalMarks} marks. Reduce this question's marks by at least ${excess} so the totals match.`
            });

            return;
        }


        try {

            setSaving(true);
            setError("");


            // ======================================
            // UPDATE QUESTION
            // ======================================

            if (editingId) {

                const response = await fetch(
                    `http://localhost:5000/api/questions/${editingId}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json",
                        },

                        body: JSON.stringify({
                            examId,
                            question: questionText,

                            options,

                            correctAnswer,
                            marks: marksValue,
                        }),
                    }
                );


                const data = await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to update question"
                    );

                }


                setQuestions(
                    questions.map((item) =>
                        item._id === editingId
                            ? data.question
                            : item
                    )
                );


                setNotice({
                    type: "success",
                    title: "Question updated",
                    message:
                        "The question was updated successfully." +
                        getMarksFeedback(projectedTotal)
                });

            }

            // ======================================
            // ADD QUESTION
            // ======================================

            else {

                const response = await fetch(
                    "http://localhost:5000/api/questions",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json",
                        },

                        body: JSON.stringify({
                            examId,
                            question: questionText,

                            options,

                            correctAnswer,
                            marks: marksValue,
                        }),
                    }
                );


                const data = await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to add question"
                    );

                }


                setQuestions([
                    ...questions,
                    data.question,
                ]);


                setNotice({
                    type: "success",
                    title: "Question added",
                    message:
                        "The question was added successfully. You can now add another question for the same exam." +
                        getMarksFeedback(projectedTotal)
                });

            }


            // Keep the selected exam so the admin can add
            // many questions for the same exam in one go.
            clearForm({ keepExam: true });

        } catch (error) {

            console.error(
                "Error saving question:",
                error
            );

            setError(
                error.message ||
                "Unable to save question"
            );

        } finally {

            setSaving(false);

        }
    };


    // ==========================================
    // CLEAR FORM
    // ==========================================

    const clearForm = ({ keepExam = false } = {}) => {

        if (!keepExam) {
            setExamId("");
        }

        setQuestion("");
        setOptionA("");
        setOptionB("");
        setOptionC("");
        setOptionD("");
        setCorrectAnswer("");
        setMarks("");
        setEditingId(null);

    };


    // ==========================================
    // EDIT QUESTION
    // ==========================================

    const handleEdit = (item) => {

        setEditingId(item._id);

        setExamId(
            item.examId?._id ||
            item.examId ||
            ""
        );

        setQuestion(
            item.question || ""
        );

        setOptionA(
            item.options?.A || ""
        );

        setOptionB(
            item.options?.B || ""
        );

        setOptionC(
            item.options?.C || ""
        );

        setOptionD(
            item.options?.D || ""
        );

        setCorrectAnswer(
            item.correctAnswer || ""
        );

        setMarks(
            item.marks || ""
        );


        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });

    };


    // ==========================================
    // DELETE QUESTION
    // ==========================================

    const handleDelete = async () => {

        if (!deleteTarget) {
            return;
        }

        const id = deleteTarget;

        try {

            setDeleting(true);

            const response = await fetch(
                `http://localhost:5000/api/questions/${id}`,
                {
                    method: "DELETE",
                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to delete question"
                );

            }


            setQuestions(
                questions.filter(
                    (item) =>
                        item._id !== id
                )
            );


            setDeleteTarget(null);

            setNotice({
                type: "success",
                title: "Question deleted",
                message:
                    "The question was deleted successfully."
            });

        } catch (error) {

            console.error(
                "Error deleting question:",
                error
            );

            setDeleteTarget(null);

            setNotice({
                type: "error",
                title: "Delete failed",
                message:
                    error.message ||
                    "Unable to delete question."
            });

        } finally {

            setDeleting(false);

        }
    };


    return (

        <AdminLayout
            active="questions"
            title="Question Management"
            subtitle="Create and manage exam questions"
        >



                {/* PAGE TITLE */}

                <div className="question-page-title">

                    <div>

                        <h2>
                            {editingId
                                ? "Edit Question"
                                : "Add New Question"}
                        </h2>

                        <p>
                            {editingId
                                ? "Update the selected question"
                                : "Create a new question for an examination"}
                        </p>

                    </div>


                    <div className="question-count">

                        <span>
                            <QuestionIcon size={22} />
                        </span>

                        <div>

                            <strong>
                                {selectedExam
                                    ? examQuestions.length
                                    : questions.length}
                            </strong>

                            <small>
                                {selectedExam
                                    ? "Exam Questions"
                                    : "Total Questions"}
                            </small>

                        </div>

                    </div>

                </div>


                {/* =================================
                    ERROR
                ================================= */}

                {error && (

                    <div className="dashboard-error">

                         {error}

                        <button
                            onClick={() => {
                                fetchExams();
                                fetchQuestions();
                            }}
                        >
                            Retry
                        </button>

                    </div>

                )}


                {/* =================================
                    FORM CARD
                ================================= */}

                <div className="question-form-card">


                    <div className="question-section-header">

                        <div className="question-section-icon">
                            <EditIcon size={18} />
                        </div>

                        <div>

                            <h3>
                                {editingId
                                    ? "Edit Question"
                                    : "Question Details"}
                            </h3>

                            <p>
                                Enter the question and
                                its answer options
                            </p>

                        </div>

                    </div>


                    <form
                        onSubmit={handleSubmit}
                    >


                        {/* =================================
                            EXAM
                        ================================= */}

                        <div className="question-input-group">

                            <label>
                                Select Exam
                            </label>

                            <select
                                value={examId}
                                onChange={(e) =>
                                    setExamId(
                                        e.target.value
                                    )
                                }
                            >

                                <option value="">
                                    Select an examination
                                </option>


                                {exams.map((exam) => (

                                    <option
                                        key={exam._id}
                                        value={exam._id}
                                    >
                                        {exam.examName}
                                    </option>

                                ))}

                            </select>

                        </div>


                        {/* =================================
                            QUESTION
                        ================================= */}

                        <div className="question-input-group">

                            <label>
                                Question
                            </label>

                            <textarea
                                value={question}
                                onChange={(e) =>
                                    setQuestion(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter your question here..."
                                maxLength={1000}
                                rows="4"
                            />

                        </div>


                        {/* =================================
                            OPTIONS
                        ================================= */}

                        <div className="options-title">
                            Answer Options
                        </div>


                        <div className="options-grid">


                            {/* A */}

                            <div className="option-input">

                                <label>

                                    <span className="option-label option-a">
                                        A
                                    </span>

                                    Option A

                                </label>

                                <input
                                    type="text"
                                    value={optionA}
                                    onChange={(e) =>
                                        setOptionA(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter option A"
                                    maxLength={300}
                                />

                            </div>


                            {/* B */}

                            <div className="option-input">

                                <label>

                                    <span className="option-label option-b">
                                        B
                                    </span>

                                    Option B

                                </label>

                                <input
                                    type="text"
                                    value={optionB}
                                    onChange={(e) =>
                                        setOptionB(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter option B"
                                    maxLength={300}
                                />

                            </div>


                            {/* C */}

                            <div className="option-input">

                                <label>

                                    <span className="option-label option-c">
                                        C
                                    </span>

                                    Option C

                                </label>

                                <input
                                    type="text"
                                    value={optionC}
                                    onChange={(e) =>
                                        setOptionC(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter option C"
                                    maxLength={300}
                                />

                            </div>


                            {/* D */}

                            <div className="option-input">

                                <label>

                                    <span className="option-label option-d">
                                        D
                                    </span>

                                    Option D

                                </label>

                                <input
                                    type="text"
                                    value={optionD}
                                    onChange={(e) =>
                                        setOptionD(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter option D"
                                    maxLength={300}
                                />

                            </div>

                        </div>


                        {/* =================================
                            CORRECT ANSWER + MARKS
                        ================================= */}

                        <div className="question-bottom-grid">


                            <div className="question-input-group">

                                <label>
                                    Correct Answer
                                </label>

                                <select
                                    value={correctAnswer}
                                    onChange={(e) =>
                                        setCorrectAnswer(
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        Select correct answer
                                    </option>

                                    <option value="A">
                                        A
                                    </option>

                                    <option value="B">
                                        B
                                    </option>

                                    <option value="C">
                                        C
                                    </option>

                                    <option value="D">
                                        D
                                    </option>

                                </select>

                            </div>


                            <div className="question-input-group">

                                <label>
                                    Marks
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    max="1000"
                                    step="1"
                                    value={marks}
                                    onChange={(e) =>
                                        setMarks(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter marks"
                                />

                            </div>

                        </div>


                        {/* =================================
                            BUTTONS
                        ================================= */}

                        <div className="question-form-actions">


                            {editingId && (

                                <button
                                    type="button"
                                    className="question-cancel-btn"
                                    onClick={() => clearForm()}
                                >
                                    Cancel
                                </button>

                            )}


                            <button
                                type="submit"
                                className="question-save-btn"
                                disabled={saving}
                            >

                                {saving
                                    ? "Saving..."
                                    : editingId
                                    ? (
                                        <>
                                            <EditIcon size={16} />
                                            Update Question
                                        </>
                                    )
                                    : (
                                        <>
                                            <PlusIcon size={16} />
                                            Add Question
                                        </>
                                    )}

                            </button>

                        </div>

                    </form>

                </div>


                {/* =================================
                    QUESTION LIST
                ================================= */}

                <section className="question-list-section">


                    <div className="question-list-header">

                        <div>

                            <h2>
                                {selectedExam
                                    ? `${selectedExam.examName} Questions`
                                    : "Questions"}
                            </h2>

                            <p>
                                {selectedExam
                                    ? "Questions created for the selected examination"
                                    : "Select an examination above to view its questions"}
                            </p>

                        </div>


                        {selectedExam && (
                            <div className="question-list-badge">
                                {examQuestions.length}{" "}
                                {examQuestions.length === 1
                                    ? "Question"
                                    : "Questions"}
                            </div>
                        )}

                    </div>


                    {/* MARK CRITERIA */}

                    {selectedExam && (
                        <div
                            className={
                                `marks-criteria ${marksCriteriaStatus}`
                            }
                        >

                            <div className="marks-criteria-text">

                                <strong>
                                    {marksCriteriaStatus === "matched"
                                        ? "Marks criteria satisfied"
                                        : marksCriteriaStatus === "over"
                                        ? "Marks criteria not satisfied"
                                        : "Marks criteria"}
                                </strong>

                                <p>
                                    {getMarksCriteriaMessage()}
                                </p>

                            </div>


                            <div className="marks-criteria-values">

                                <div>
                                    <span>
                                        Questions Total
                                    </span>
                                    <strong>
                                        {questionsTotalMarks}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Exam Total
                                    </span>
                                    <strong>
                                        {examTotalMarks}
                                    </strong>
                                </div>

                            </div>

                        </div>
                    )}


                    {!examId ? (

                        <div className="question-empty-state">

                            <div className="question-empty-icon">
                                <QuestionIcon size={28} />
                            </div>

                            <h3>
                                Select an examination
                            </h3>

                            <p>
                                Choose an examination from the
                                form above to view and manage
                                the questions created for it.
                            </p>

                        </div>

                    ) : loading ? (

                        <div className="question-empty-state">

                            <div className="question-empty-icon">
                                <ClockIcon size={28} />
                            </div>

                            <h3>
                                Loading questions...
                            </h3>

                            <p>
                                Please wait while questions
                                are loaded from MongoDB.
                            </p>

                        </div>

                    ) : examQuestions.length === 0 ? (

                        <div className="question-empty-state">

                            <div className="question-empty-icon">
                                <QuestionIcon size={28} />
                            </div>

                            <h3>
                                No questions yet
                            </h3>

                            <p>
                                This examination has no questions
                                yet. Add the first question using
                                the form above.
                            </p>

                        </div>

                    ) : (

                        <div className="question-cards">

                            {examQuestions.map(
                                (item, index) => (

                                    <div
                                        className="question-card"
                                        key={item._id}
                                    >


                                        {/* TOP */}

                                        <div className="question-card-top">

                                            <div className="question-number">
                                                Q{index + 1}
                                            </div>


                                            <div className="question-card-info">

                                                <div className="question-card-meta">

                                                    <span className="question-index-tag">
                                                        Question{" "}
                                                        {index + 1} of{" "}
                                                        {examQuestions.length}
                                                    </span>

                                                    <span className="marks-tag">
                                                        {item.marks}{" "}
                                                        Marks
                                                    </span>

                                                </div>


                                                <h3>
                                                    {item.question}
                                                </h3>

                                            </div>

                                        </div>


                                        {/* OPTIONS */}

                                        <div className="question-options">


                                            <div
                                                className={
                                                    item.correctAnswer ===
                                                    "A"
                                                        ? "answer-option correct"
                                                        : "answer-option"
                                                }
                                            >

                                                <span>
                                                    A
                                                </span>

                                                {item.options?.A}

                                                {item.correctAnswer ===
                                                    "A" && (
                                                    <b className="correct-mark"><CheckIcon size={12} /></b>
                                                )}

                                            </div>


                                            <div
                                                className={
                                                    item.correctAnswer ===
                                                    "B"
                                                        ? "answer-option correct"
                                                        : "answer-option"
                                                }
                                            >

                                                <span>
                                                    B
                                                </span>

                                                {item.options?.B}

                                                {item.correctAnswer ===
                                                    "B" && (
                                                    <b className="correct-mark"><CheckIcon size={12} /></b>
                                                )}

                                            </div>


                                            <div
                                                className={
                                                    item.correctAnswer ===
                                                    "C"
                                                        ? "answer-option correct"
                                                        : "answer-option"
                                                }
                                            >

                                                <span>
                                                    C
                                                </span>

                                                {item.options?.C}

                                                {item.correctAnswer ===
                                                    "C" && (
                                                    <b className="correct-mark"><CheckIcon size={12} /></b>
                                                )}

                                            </div>


                                            <div
                                                className={
                                                    item.correctAnswer ===
                                                    "D"
                                                        ? "answer-option correct"
                                                        : "answer-option"
                                                }
                                            >

                                                <span>
                                                    D
                                                </span>

                                                {item.options?.D}

                                                {item.correctAnswer ===
                                                    "D" && (
                                                    <b className="correct-mark"><CheckIcon size={12} /></b>
                                                )}

                                            </div>

                                        </div>


                                        {/* FOOTER */}

                                        <div className="question-card-footer">


                                            <span className="correct-answer-info">

                                                <CheckIcon size={14} />
                                                Correct Answer:{" "}

                                                {item.correctAnswer}

                                            </span>


                                            <div className="question-card-actions">


                                                <button
                                                    className="question-edit-btn"
                                                    onClick={() =>
                                                        handleEdit(
                                                            item
                                                        )
                                                    }
                                                >
                                                    <EditIcon size={15} />
                                                    Edit
                                                </button>


                                                <button
                                                    className="question-delete-btn"
                                                    onClick={() =>
                                                        setDeleteTarget(
                                                            item._id
                                                        )
                                                    }
                                                >
                                                    <TrashIcon size={15} />
                                                    Delete
                                                </button>

                                            </div>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </section>


                {/* DELETE CONFIRM POPUP */}

                {deleteTarget && (
                    <ConfirmModal
                        title="Delete this question?"
                        message="This question will be permanently removed. This action cannot be undone."
                        confirmLabel="Yes, Delete"
                        cancelLabel="Cancel"
                        danger
                        busy={deleting}
                        onConfirm={handleDelete}
                        onCancel={() => setDeleteTarget(null)}
                    />
                )}


                {/* NOTICE POPUP */}

                <NoticeModal
                    notice={notice}
                    onClose={() => setNotice(null)}
                />

        </AdminLayout>

    );
}

export default QuestionManagement;