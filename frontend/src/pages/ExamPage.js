import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "../components/Modal";

import {
    ClockIcon,
    GraduationIcon,
    CheckIcon,
    AlertIcon,
    QuestionIcon,
    XIcon
} from "../components/Icons";

function ExamPage() {

    const { examId } = useParams();
    const navigate = useNavigate();

    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [passingPercentage, setPassingPercentage] = useState(40);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Popups
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showExitModal, setShowExitModal] = useState(false);
    const [notice, setNotice] = useState(null);

    // Prevents a double submission (timer + click)
    const submittingRef = useRef(false);


    // Only logged in users may open an exam
    useEffect(() => {

        if (!localStorage.getItem("userId")) {
            navigate("/", { replace: true });
        }

    }, [navigate]);


    useEffect(() => {
        loadExam();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [examId]);


    const loadExam = async () => {

        try {

            setLoading(true);

            // Get exam
            const examResponse = await fetch(
                `http://localhost:5000/api/exams/${examId}`
            );

            const examData = await examResponse.json();

            if (!examResponse.ok) {
                throw new Error(
                    examData.message || "Unable to load exam"
                );
            }

            // Get questions
            const questionResponse = await fetch(
                `http://localhost:5000/api/questions/exam/${examId}`
            );

            const questionData = await questionResponse.json();

            if (!questionResponse.ok) {
                throw new Error(
                    questionData.message ||
                    "Unable to load questions"
                );
            }

            setExam(examData);
            setQuestions(questionData);

            // Duration is stored in minutes
            setTimeLeft(
                Math.max(0, Number(examData.duration) * 60 || 0)
            );

            // Passing percentage is configured by the admin
            try {
                const settingsResponse = await fetch(
                    "http://localhost:5000/api/settings"
                );
                const settingsData = await settingsResponse.json();
                if (
                    settingsResponse.ok &&
                    settingsData.passingPercentage !== undefined
                ) {
                    setPassingPercentage(
                        Number(settingsData.passingPercentage) || 40
                    );
                }
            } catch (settingsError) {
                // Fall back to the default passing percentage
            }

        } catch (error) {

            console.error(error);

            setError(
                error.message ||
                "Unable to load exam."
            );

        } finally {

            setLoading(false);

        }
    };


    // TIMER - counts down one second at a time
    useEffect(() => {

        if (loading || timeLeft <= 0) {
            return;
        }

        const timer = setTimeout(() => {

            setTimeLeft((previous) => previous - 1);

        }, 1000);

        return () => clearTimeout(timer);

    }, [loading, timeLeft]);


    // AUTO SUBMIT - when the time is over
    useEffect(() => {

        if (!loading && exam && timeLeft === 0) {
            submitExam();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, exam, timeLeft]);


    const formatTime = (seconds) => {

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${String(minutes).padStart(2, "0")}:${String(
            remainingSeconds
        ).padStart(2, "0")}`;
    };


    const handleAnswer = (questionId, answer) => {

        setAnswers({
            ...answers,
            [questionId]: answer
        });

    };


    const submitExam = async () => {

        // Block a second submission (timer + click)
        if (submittingRef.current) {
            return;
        }

        submittingRef.current = true;
        setSubmitting(true);
        setShowSubmitModal(false);
        setShowExitModal(false);

        try {

            const userId = localStorage.getItem("userId");

            if (!userId) {

                setNotice({
                    type: "error",
                    title: "Session expired",
                    message:
                        "Student session not found. Please login again."
                });

                submittingRef.current = false;
                setSubmitting(false);

                navigate("/");

                return;
            }


            let score = 0;
            let totalMarks = 0;


            questions.forEach((question) => {

                const marks = Number(question.marks) || 0;

                totalMarks += marks;

                if (
                    answers[question._id] &&
                    answers[question._id] ===
                    question.correctAnswer
                ) {

                    score += marks;

                }

            });


            const percentage =
                totalMarks > 0
                    ? Number(
                        ((score / totalMarks) * 100).toFixed(2)
                    )
                    : 0;


            const status =
                percentage >= passingPercentage
                    ? "Pass"
                    : "Fail";


            const resultResponse = await fetch(
                "http://localhost:5000/api/results",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        userId: userId,
                        examId: examId,
                        answers: answers,
                        score: score,
                        totalMarks: totalMarks,
                        percentage: percentage,
                        status: status
                    })
                }
            );


            const resultData = await resultResponse.json();


            if (!resultResponse.ok) {

                throw new Error(
                    resultData.message ||
                    "Unable to save result"
                );

            }


            navigate(
                `/result/${resultData.result._id}`
            );


        } catch (error) {

            console.error(error);

            setNotice({
                type: "error",
                title: "Submission failed",
                message:
                    error.message ||
                    "Unable to submit exam."
            });

            submittingRef.current = false;
            setSubmitting(false);

        }
    };


    // Leave the exam without saving a result
    const cancelExam = () => {

        setShowExitModal(false);
        navigate("/student-dashboard");

    };


    if (loading) {

        return (
            <div className="exam-page-message">
                <div className="exam-loading-icon">
                    <ClockIcon size={30} />
                </div>

                <h2>
                    Loading Exam...
                </h2>

                <p>
                    Please wait while we prepare your exam.
                </p>
            </div>
        );

    }


    if (error) {

        return (
            <div className="exam-page-message">

                <div className="exam-loading-icon">
                    <AlertIcon size={30} />
                </div>

                <h2>
                    Unable to Load Exam
                </h2>

                <p>
                    {error}
                </p>

                <button
                    onClick={() =>
                        navigate("/student-dashboard")
                    }
                >
                    Back to Dashboard
                </button>

            </div>
        );

    }


    return (

        <div className="exam-page">

            {/* HEADER */}

            <header className="exam-header">

                <div className="exam-header-left">

                    <div className="exam-header-logo">
                        <GraduationIcon size={22} />
                    </div>

                    <div>

                        <h2>
                            Exam<span>Pro</span>
                        </h2>

                        <small>
                            Online Examination
                        </small>

                    </div>

                </div>


                <div className="exam-header-actions">

                    <button
                        type="button"
                        className="exam-cancel-button"
                        onClick={() => setShowExitModal(true)}
                    >
                        <XIcon size={16} />
                        Cancel Exam
                    </button>


                    <div className="exam-timer">

                        <span>
                            <ClockIcon size={20} />
                        </span>

                        <div>

                            <small>
                                Time Remaining
                            </small>

                            <strong>
                                {formatTime(timeLeft)}
                            </strong>

                        </div>

                    </div>

                </div>

            </header>


            {/* EXAM INFO */}

            <div className="exam-container">

                <div className="exam-info-card">

                    <div>

                        <span className="exam-page-label">
                            EXAMINATION
                        </span>

                        <h1>
                            {exam.examName}
                        </h1>

                        <p>
                            {exam.description}
                        </p>

                    </div>


                    <div className="exam-summary">

                        <div>
                            <span>Questions</span>
                            <strong>{questions.length}</strong>
                        </div>

                        <div>
                            <span>Duration</span>
                            <strong>{exam.duration} min</strong>
                        </div>

                        <div>
                            <span>Total Marks</span>
                            <strong>{exam.totalMarks}</strong>
                        </div>

                    </div>

                </div>


                {/* QUESTIONS */}

                <div className="questions-container">

                    {questions.length === 0 ? (

                        <div className="no-questions">

                            <div>
                                <QuestionIcon size={30} />
                            </div>

                            <h2>
                                No Questions Available
                            </h2>

                            <p>
                                This exam does not have any
                                questions yet.
                            </p>

                        </div>

                    ) : (

                        questions.map((question, index) => (

                            <div
                                className="question-card"
                                key={question._id}
                            >

                                <div className="question-number">
                                    Question {index + 1}
                                </div>

                                <h3>
                                    {question.question}
                                </h3>


                                <div className="options-list">

                                    {["A", "B", "C", "D"].map(
                                        (option) => (

                                            <label
                                                key={option}
                                                className={
                                                    `option-item ${
                                                        answers[
                                                            question._id
                                                        ] === option
                                                            ? "selected"
                                                            : ""
                                                    }`
                                                }
                                            >

                                                <input
                                                    type="radio"
                                                    name={
                                                        `question-${question._id}`
                                                    }
                                                    value={option}
                                                    checked={
                                                        answers[
                                                            question._id
                                                        ] === option
                                                    }
                                                    onChange={() =>
                                                        handleAnswer(
                                                            question._id,
                                                            option
                                                        )
                                                    }
                                                />

                                                <span className="option-letter">
                                                    {option}
                                                </span>

                                                <span className="option-text">
                                                    {
                                                        question
                                                            .options[
                                                            option
                                                        ]
                                                    }
                                                </span>

                                            </label>

                                        )
                                    )}

                                </div>


                                <div className="question-marks">
                                    {question.marks} mark
                                    {Number(question.marks) !== 1
                                        ? "s"
                                        : ""}
                                </div>

                            </div>

                        ))

                    )}

                </div>


                {/* SUBMIT */}

                {questions.length > 0 && (

                    <div className="exam-submit-section">

                        <div>

                            <strong>
                                Ready to submit?
                            </strong>

                            <p>
                                Make sure you have answered
                                all the questions.
                            </p>

                        </div>


                        <button
                            className="submit-exam-button"
                            onClick={() => setShowSubmitModal(true)}
                            disabled={submitting}
                        >

                            {submitting
                                ? "Submitting..."
                                : "Submit Exam"}

                            {!submitting && (
                                <span>
                                    <CheckIcon size={16} />
                                </span>
                            )}

                        </button>

                    </div>

                )}

            </div>


            {/* SUBMIT CONFIRMATION POPUP */}

            {showSubmitModal && (
                <Modal
                    title="Submit exam?"
                    size="sm"
                    onClose={() => setShowSubmitModal(false)}
                    footer={
                        <>
                            <button
                                type="button"
                                className="modal-button secondary"
                                onClick={() => setShowSubmitModal(false)}
                            >
                                Keep Reviewing
                            </button>

                            <button
                                type="button"
                                className="modal-button primary"
                                onClick={submitExam}
                                disabled={submitting}
                            >
                                {submitting
                                    ? "Submitting..."
                                    : "Submit Exam"}
                            </button>
                        </>
                    }
                >
                    <div className="modal-result info">
                        <div className="modal-result-icon">
                            <CheckIcon size={26} />
                        </div>

                        <p>
                            You have answered{" "}
                            {Object.keys(answers).length} of{" "}
                            {questions.length} questions. Once
                            submitted, your answers cannot be
                            changed.
                        </p>
                    </div>
                </Modal>
            )}


            {/* CANCEL / EXIT EXAM POPUP */}

            {showExitModal && (
                <Modal
                    title="Cancel this exam?"
                    size="sm"
                    onClose={() => setShowExitModal(false)}
                    footer={
                        <>
                            <button
                                type="button"
                                className="modal-button secondary"
                                onClick={() => setShowExitModal(false)}
                            >
                                Keep Taking
                            </button>

                            <button
                                type="button"
                                className="modal-button danger"
                                onClick={cancelExam}
                            >
                                Yes, Cancel Exam
                            </button>
                        </>
                    }
                >
                    <div className="modal-warning">

                        <div className="modal-warning-icon">
                            <AlertIcon size={22} />
                        </div>

                        <div>

                            <strong>
                                Your progress will be lost
                            </strong>

                            <p>
                                Your answers will not be saved
                                and no result will be recorded
                                for this exam.
                            </p>

                        </div>

                    </div>
                </Modal>
            )}


            {/* NOTICE POPUP */}

            {notice && (
                <Modal
                    title={notice.title}
                    size="sm"
                    onClose={() => setNotice(null)}
                    footer={
                        <button
                            type="button"
                            className="modal-button primary"
                            onClick={() => setNotice(null)}
                        >
                            Close
                        </button>
                    }
                >
                    <div className={`modal-result ${notice.type}`}>
                        <div className="modal-result-icon">
                            <AlertIcon size={26} />
                        </div>

                        <p>
                            {notice.message}
                        </p>
                    </div>
                </Modal>
            )}

        </div>
    );
}

export default ExamPage;