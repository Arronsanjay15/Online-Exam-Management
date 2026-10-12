import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentLayout from "../components/StudentLayout";

import {
    ExamIcon,
    ResultsIcon,
    ClockIcon,
    AwardIcon,
    CalendarIcon,
    GraduationIcon,
    CheckIcon
} from "../components/Icons";

function StudentDashboard() {

    const navigate = useNavigate();

    const [exams, setExams] = useState([]);
    const [results, setResults] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const username =
        localStorage.getItem("username") || "Student";

    const userId =
        localStorage.getItem("userId");


    // =========================================
    // LOAD DASHBOARD DATA
    // =========================================

    useEffect(() => {

        fetchDashboardData();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const fetchDashboardData = async () => {

        try {

            setLoading(true);
            setError("");


            const examResponse = await fetch(
                "http://localhost:5000/api/exams"
            );

            const examData = await examResponse.json();

            if (!examResponse.ok) {

                throw new Error(
                    examData.message ||
                    "Failed to load exams"
                );

            }

            setExams(examData);


            if (userId) {

                const resultResponse = await fetch(
                    `http://localhost:5000/api/results/user/${userId}`
                );

                const resultData =
                    await resultResponse.json();

                if (resultResponse.ok) {
                    setResults(resultData);
                }

            }

        } catch (fetchError) {

            console.error(fetchError);

            setError(
                "Unable to load dashboard. Make sure the backend is running."
            );

        } finally {

            setLoading(false);

        }

    };


    // =========================================
    // HELPERS
    // =========================================

    const getExamDate = (date) => {

        if (!date) {
            return "Not specified";
        }

        return date.substring(0, 10);

    };


    const getAverageScore = () => {

        if (results.length === 0) {
            return 0;
        }

        const totalPercentage = results.reduce(
            (sum, result) =>
                sum + Number(result.percentage || 0),
            0
        );

        return Math.round(
            totalPercentage / results.length
        );

    };


    const getPassRate = () => {

        if (results.length === 0) {
            return 0;
        }

        const passed = results.filter(
            (result) => result.status === "Pass"
        ).length;

        return Math.round(
            (passed / results.length) * 100
        );

    };


    const hasCompleted = (examId) =>
        results.some(
            (result) =>
                (result.examId?._id || result.examId) === examId
        );


    const startExam = (examId) => {

        navigate(`/exam/${examId}`);

    };


    return (

        <StudentLayout
            active="dashboard"
            title="Dashboard"
            subtitle={
                `Welcome back, ${username}! Here is your exam overview.`
            }
        >


            {/* ERROR */}

            {error && (

                <div className="dashboard-error" id="student-section-top">

                    <span>{error}</span>

                    <button onClick={fetchDashboardData}>
                        Retry
                    </button>

                </div>

            )}


            {/* =====================================
                WELCOME CARD
            ===================================== */}

            {!error && (
                <section
                    className="admin-welcome-card"
                    id="student-section-top"
                >

                    <div>

                        <span>
                            STUDENT DASHBOARD
                        </span>

                        <h2>
                            Ready to test your knowledge?
                        </h2>

                        <p>
                            Choose an available exam below
                            and start your assessment.
                        </p>

                    </div>


                    <div className="admin-welcome-icon">
                        <GraduationIcon size={40} />
                    </div>

                </section>
            )}


            {/* =====================================
                STATISTICS
            ===================================== */}

            <section className="admin-dashboard-stats">


                <div className="dashboard-stat-card">

                    <div className="dashboard-stat-icon exam">
                        <ExamIcon size={22} />
                    </div>

                    <div>

                        <span>
                            Available Exams
                        </span>

                        <strong>
                            {loading ? "..." : exams.length}
                        </strong>

                        <small>
                            Exams you can take
                        </small>

                    </div>

                </div>


                <div className="dashboard-stat-card">

                    <div className="dashboard-stat-icon completed">
                        <CheckIcon size={22} />
                    </div>

                    <div>

                        <span>
                            Completed Exams
                        </span>

                        <strong>
                            {loading ? "..." : results.length}
                        </strong>

                        <small>
                            Exams you have taken
                        </small>

                    </div>

                </div>


                <div className="dashboard-stat-card">

                    <div className="dashboard-stat-icon score">
                        <AwardIcon size={22} />
                    </div>

                    <div>

                        <span>
                            Average Score
                        </span>

                        <strong>
                            {loading
                                ? "..."
                                : `${getAverageScore()}%`}
                        </strong>

                        <small>
                            Across completed exams
                        </small>

                    </div>

                </div>


                <div className="dashboard-stat-card">

                    <div className="dashboard-stat-icon pass">
                        <ResultsIcon size={22} />
                    </div>

                    <div>

                        <span>
                            Pass Rate
                        </span>

                        <strong>
                            {loading
                                ? "..."
                                : `${getPassRate()}%`}
                        </strong>

                        <small>
                            Exams you passed
                        </small>

                    </div>

                </div>

            </section>


            {/* =====================================
                AVAILABLE EXAMS
            ===================================== */}

            <section
                className="admin-quick-section"
                id="student-section-exams"
            >

                <div className="dashboard-section-heading">

                    <div>

                        <h2>
                            Available Exams
                        </h2>

                        <p>
                            Exams currently available for you
                        </p>

                    </div>

                </div>


                {loading && (

                    <div className="student-message">
                        Loading exams...
                    </div>

                )}


                {!loading &&
                    !error &&
                    exams.length === 0 && (

                        <div className="student-empty">

                            <div className="student-empty-icon">
                                <ExamIcon size={30} />
                            </div>

                            <h3>
                                No exams available
                            </h3>

                            <p>
                                There are currently no exams
                                available. Please check again
                                later.
                            </p>

                        </div>

                    )}


                {!loading &&
                    !error &&
                    exams.length > 0 && (

                        <div className="student-exam-grid">

                            {exams.map((exam) => {

                                const completed =
                                    hasCompleted(exam._id);

                                return (

                                    <div
                                        className="student-exam-card"
                                        key={exam._id}
                                    >

                                        <div className="exam-card-top">

                                            <div className="exam-icon">
                                                <ExamIcon size={20} />
                                            </div>

                                            <span
                                                className={
                                                    completed
                                                        ? "exam-status completed"
                                                        : "exam-status"
                                                }
                                            >
                                                {completed
                                                    ? "Completed"
                                                    : "Available"}
                                            </span>

                                        </div>


                                        <h3>
                                            {exam.examName}
                                        </h3>


                                        <p className="exam-description">
                                            {exam.description ||
                                                "No description available."}
                                        </p>


                                        <div className="exam-details">

                                            <div>

                                                <span className="detail-icon">
                                                    <ClockIcon size={16} />
                                                </span>

                                                <div>

                                                    <small>
                                                        Duration
                                                    </small>

                                                    <strong>
                                                        {exam.duration} mins
                                                    </strong>

                                                </div>

                                            </div>


                                            <div>

                                                <span className="detail-icon">
                                                    <AwardIcon size={16} />
                                                </span>

                                                <div>

                                                    <small>
                                                        Total Marks
                                                    </small>

                                                    <strong>
                                                        {exam.totalMarks}
                                                    </strong>

                                                </div>

                                            </div>


                                            <div>

                                                <span className="detail-icon">
                                                    <CalendarIcon size={16} />
                                                </span>

                                                <div>

                                                    <small>
                                                        Exam Date
                                                    </small>

                                                    <strong>
                                                        {getExamDate(
                                                            exam.examDate
                                                        )}
                                                    </strong>

                                                </div>

                                            </div>

                                        </div>


                                        <button
                                            className="start-exam-button"
                                            onClick={() =>
                                                startExam(exam._id)
                                            }
                                        >

                                            {completed
                                                ? "Retake Exam"
                                                : "Start Exam"}

                                            <span>
                                                <CheckIcon size={16} />
                                            </span>

                                        </button>

                                    </div>

                                );

                            })}

                        </div>

                    )}

            </section>


            {/* =====================================
                MY RESULTS
            ===================================== */}

            <section
                className="admin-activity-section"
                id="student-section-results"
            >

                <div className="dashboard-section-heading">

                    <div>

                        <h2>
                            My Results
                        </h2>

                        <p>
                            Your recently completed examinations
                        </p>

                    </div>

                </div>


                <div className="admin-activity-card">

                    {loading ? (

                        <div className="activity-empty">

                            <div className="activity-empty-icon">
                                <ClockIcon size={26} />
                            </div>

                            <p>
                                Loading your results...
                            </p>

                        </div>

                    ) : results.length === 0 ? (

                        <div className="activity-empty">

                            <div className="activity-empty-icon">
                                <ResultsIcon size={26} />
                            </div>

                            <h3>
                                No results yet
                            </h3>

                            <p>
                                Complete an exam to see your
                                results here.
                            </p>

                        </div>

                    ) : (

                        <div className="activity-list">

                            {results.map((result) => (

                                <div
                                    className="activity-item"
                                    key={result._id}
                                >

                                    <div className="activity-icon result">
                                        <ResultsIcon size={16} />
                                    </div>


                                    <div className="activity-content">

                                        <strong>
                                            {result.examId?.examName ||
                                                "Exam"}
                                        </strong>

                                        <p>
                                            Score: {result.score} /{" "}
                                            {result.totalMarks}
                                            {"  \u2022  "}
                                            {result.percentage}%
                                        </p>

                                    </div>


                                    <span
                                        className={
                                            `result-status ${
                                                result.status === "Pass"
                                                    ? "pass"
                                                    : "fail"
                                            }`
                                        }
                                    >
                                        {result.status}
                                    </span>


                                    <button
                                        className="activity-action"
                                        onClick={() =>
                                            navigate(
                                                `/result/${result._id}`
                                            )
                                        }
                                    >
                                        View Result
                                    </button>

                                </div>

                            ))}

                        </div>

                    )}

                </div>

            </section>

        </StudentLayout>

    );
}

export default StudentDashboard;
