import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
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
    // ADD / UPDATE QUESTION
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (
            !examId ||
            !question ||
            !optionA ||
            !optionB ||
            !optionC ||
            !optionD ||
            !correctAnswer ||
            !marks
        ) {
            alert("Please fill all fields");
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
                            question,

                            options: {
                                A: optionA,
                                B: optionB,
                                C: optionC,
                                D: optionD,
                            },

                            correctAnswer,
                            marks: Number(marks),
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


                alert(
                    "Question updated successfully"
                );

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
                            question,

                            options: {
                                A: optionA,
                                B: optionB,
                                C: optionC,
                                D: optionD,
                            },

                            correctAnswer,
                            marks: Number(marks),
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


                alert(
                    "Question added successfully"
                );

            }


            clearForm();

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

    const clearForm = () => {

        setExamId("");
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

    const handleDelete = async (id) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this question?"
            );


        if (!confirmDelete) {
            return;
        }


        try {

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


            alert(
                "Question deleted successfully"
            );

        } catch (error) {

            console.error(
                "Error deleting question:",
                error
            );

            alert(
                "Unable to delete question"
            );

        }
    };


    // ==========================================
    // GET EXAM NAME
    // ==========================================

    const getExamName = (item) => {

        // If examId is populated
        if (
            item.examId &&
            typeof item.examId === "object"
        ) {
            return item.examId.examName;
        }

        // If only exam ID exists
        const exam = exams.find(
            (exam) =>
                exam._id === item.examId
        );

        return exam
            ? exam.examName
            : "Unknown Exam";
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
                                {questions.length}
                            </strong>

                            <small>
                                Total Questions
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
                                    onClick={clearForm}
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
                                All Questions
                            </h2>

                            <p>
                                Manage questions created
                                for your exams
                            </p>

                        </div>


                        <div className="question-list-badge">
                            {questions.length} Questions
                        </div>

                    </div>


                    {loading ? (

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

                    ) : questions.length === 0 ? (

                        <div className="question-empty-state">

                            <div className="question-empty-icon">
                                <QuestionIcon size={28} />
                            </div>

                            <h3>
                                No questions yet
                            </h3>

                            <p>
                                Add your first question
                                using the form above.
                            </p>

                        </div>

                    ) : (

                        <div className="question-cards">

                            {questions.map(
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

                                                    <span className="exam-tag">
                                                        {" "}
                                                        {getExamName(
                                                            item
                                                        )}
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
                                                        handleDelete(
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

        </AdminLayout>

    );
}

export default QuestionManagement;