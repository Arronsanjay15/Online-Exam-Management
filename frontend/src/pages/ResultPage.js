import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeftIcon,
    PrinterIcon,
    CheckIcon,
    XIcon,
    ResultsIcon,
    AwardIcon,
    ClockIcon,
    AlertIcon,
    GraduationIcon
} from "../components/Icons";

function ResultPage() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {

        fetchResult();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);


    // Only logged in users may open a result
    useEffect(() => {

        if (!localStorage.getItem("userId")) {
            navigate("/", { replace: true });
        }

    }, [navigate]);


    const fetchResult = async () => {

        try {

            setLoading(true);

            const response = await fetch(
                `http://localhost:5000/api/results/${id}`
            );

            const data = await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to load result"
                );

            }

            setResult(data);

        } catch (error) {

            console.error(error);

            setError(
                error.message ||
                "Unable to load result."
            );

        } finally {

            setLoading(false);

        }
    };


    const getResultMessage = () => {

        if (!result) {
            return "";
        }

        if (result.status === "Pass") {
            return "Congratulations! You passed the examination.";
        }

        return "You did not pass this examination. Keep practicing and try again.";
    };


    const formatDate = (date) => {

        if (!date) {
            return "Not available";
        }

        return new Date(date).toLocaleString();

    };


    if (loading) {

        return (

            <div className="result-page-message">

                <div className="result-message-icon">
                    <ClockIcon size={30} />
                </div>

                <h2>
                    Loading Result...
                </h2>

                <p>
                    Please wait while we load your examination result.
                </p>

            </div>

        );

    }


    if (error) {

        return (

            <div className="result-page-message">

                <div className="result-message-icon">
                    <AlertIcon size={30} />
                </div>

                <h2>
                    Unable to Load Result
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


    if (!result) {
        return null;
    }


    return (

        <div className="result-page">


            {/* HEADER */}

            <header className="result-header">

                <div className="result-brand">

                    <div className="result-brand-icon">
                        <GraduationIcon size={22} />
                    </div>

                    <div>

                        <h2>
                            Exam<span>Pro</span>
                        </h2>

                        <small>
                            Examination Result
                        </small>

                    </div>

                </div>


                <button
                    className="result-dashboard-button"
                    onClick={() =>
                        navigate("/student-dashboard")
                    }
                >
                    Dashboard
                </button>

            </header>


            {/* MAIN */}

            <main className="result-container">


                {/* SUCCESS / FAIL CARD */}

                <section
                    className={
                        result.status === "Pass"
                            ? "result-status-card pass"
                            : "result-status-card fail"
                    }
                >

                    <div className="result-status-icon">

                        {result.status === "Pass"
                            ? <CheckIcon size={30} />
                            : <XIcon size={30} />}

                    </div>


                    <div>

                        <span className="result-status-label">
                            EXAMINATION COMPLETED
                        </span>

                        <h1>
                            {result.status === "Pass"
                                ? "Congratulations!"
                                : "Keep Practicing!"}
                        </h1>

                        <p>
                            {getResultMessage()}
                        </p>

                    </div>

                </section>


                {/* EXAM INFORMATION */}

                <section className="result-exam-card">

                    <div className="result-exam-info">

                        <span>
                            EXAMINATION
                        </span>

                        <h2>
                            {result.examId?.examName ||
                                "Examination"}
                        </h2>

                        <p>
                            {result.examId?.description ||
                                "Online examination"}
                        </p>

                    </div>


                    <div className="result-exam-meta">

                        <div>

                            <span>
                                Total Marks
                            </span>

                            <strong>
                                {result.totalMarks}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Submitted
                            </span>

                            <strong>
                                {formatDate(
                                    result.submittedAt
                                )}
                            </strong>

                        </div>

                    </div>

                </section>


                {/* SCORE */}

                <section className="result-score-section">


                    <div className="result-score-card">

                        <div className="result-score-icon">
                            <AwardIcon size={22} />
                        </div>

                        <span>
                            YOUR SCORE
                        </span>

                        <strong>
                            {result.score}
                            <small>
                                / {result.totalMarks}
                            </small>
                        </strong>

                    </div>


                    <div className="result-score-card">

                        <div className="result-score-icon">
                            <ResultsIcon size={22} />
                        </div>

                        <span>
                            PERCENTAGE
                        </span>

                        <strong>
                            {result.percentage}%
                        </strong>

                    </div>


                    <div
                        className={
                            result.status === "Pass"
                                ? "result-score-card status-pass"
                                : "result-score-card status-fail"
                        }
                    >

                        <div className="result-score-icon">

                            {result.status === "Pass"
                                ? <CheckIcon size={22} />
                                : <XIcon size={22} />}

                        </div>

                        <span>
                            STATUS
                        </span>

                        <strong>
                            {result.status}
                        </strong>

                    </div>

                </section>


                {/* PERFORMANCE */}

                <section className="result-performance-card">

                    <div className="result-section-title">

                        <div>

                            <h2>
                                Performance Summary
                            </h2>

                            <p>
                                Your performance in this examination
                            </p>

                        </div>

                    </div>


                    <div className="result-progress-wrapper">

                        <div className="result-progress-label">

                            <span>
                                Overall Score
                            </span>

                            <strong>
                                {result.percentage}%
                            </strong>

                        </div>


                        <div className="result-progress">

                            <div
                                className={
                                    result.status === "Pass"
                                        ? "result-progress-bar pass"
                                        : "result-progress-bar fail"
                                }
                                style={{
                                    width: `${Math.min(
                                        result.percentage,
                                        100
                                    )}%`
                                }}
                            />

                        </div>

                    </div>


                    <div className="result-performance-details">

                        <div>

                            <span>
                                Marks Obtained
                            </span>

                            <strong>
                                {result.score}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Maximum Marks
                            </span>

                            <strong>
                                {result.totalMarks}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Result
                            </span>

                            <strong>
                                {result.status}
                            </strong>

                        </div>

                    </div>

                </section>


                {/* ANSWERS */}

                {result.answers &&
                    Object.keys(result.answers).length > 0 && (

                        <section className="result-answers-card">

                            <div className="result-section-title">

                                <div>

                                    <h2>
                                        Answer Summary
                                    </h2>

                                    <p>
                                        Options selected during the examination
                                    </p>

                                </div>

                            </div>


                            <div className="answer-summary">

                                {Object.entries(
                                    result.answers
                                ).map(
                                    ([questionId, answer], index) => (

                                        <div
                                            className="answer-summary-item"
                                            key={questionId}
                                        >

                                            <span>
                                                Question {index + 1}
                                            </span>

                                            <strong>
                                                {answer}
                                            </strong>

                                        </div>

                                    )
                                )}

                            </div>

                        </section>

                    )}


                {/* ACTIONS */}

                <section className="result-actions">

                    <button
                        className="result-primary-button"
                        onClick={() =>
                            navigate("/student-dashboard")
                        }
                    >

                        <ArrowLeftIcon size={16} />
                        Back to Dashboard

                    </button>


                    <button
                        className="result-secondary-button"
                        onClick={() =>
                            window.print()
                        }
                    >

                        <PrinterIcon size={16} />
                        Print Result

                    </button>

                </section>

            </main>

        </div>

    );
}

export default ResultPage;