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
    CheckIcon,
    SearchIcon
} from "../components/Icons";

import { formatDate, formatDateTime } from "../utils/time";

function StudentDashboard() {

    const navigate = useNavigate();

    const [exams, setExams] = useState([]);
    const [results, setResults] = useState([]);

    // Exam list controls
    const [examSearch, setExamSearch] = useState("");
    const [examStatusFilter, setExamStatusFilter] = useState("All");

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

        return formatDate(date) || "Not specified";

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


    // The state shown on an exam card. Kept in one place so the
    // status filter always matches the badge the student sees.
    // A "publishing soon" exam is grouped under "Upcoming" since
    // it is simply not open yet.
    const getExamState = (exam) => {

        if (hasCompleted(exam._id)) {
            return "Completed";
        }

        if (exam.isEnded === true) {
            return "Ended";
        }

        if (exam.isUpcoming === true) {
            return "Upcoming";
        }

        if (exam.isPublishPending === true) {
            return "Upcoming";
        }

        return "Available";

    };


    // Exams whose questions are complete are visible to
    // students. Exams whose exam date has not arrived yet are
    // still listed, but only as "coming soon" and they cannot
    // be started.
    const visibleExams = exams.filter(
        (exam) => exam.isPublished === true
    );

    const availableCount = visibleExams.filter(
        (exam) => exam.isAvailable === true
    ).length;


    // Narrow the visible exams down using the search box and the
    // status filter.
    const examSearchText = examSearch.trim().toLowerCase();

    const filteredExams = visibleExams.filter((exam) => {

        const matchesSearch = (exam.examName || "")
            .toLowerCase()
            .includes(examSearchText);

        if (!matchesSearch) {
            return false;
        }

        if (examStatusFilter === "All") {
            return true;
        }

        return getExamState(exam) === examStatusFilter;

    });


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
                            {loading
                                ? "..."
                                : availableCount}
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


                {/* SEARCH + STATUS FILTER */}

                {!loading &&
                    !error &&
                    visibleExams.length > 0 && (

                        <div className="exam-toolbar">

                            <div className="exam-search">

                                <span>
                                    <SearchIcon size={18} />
                                </span>

                                <input
                                    type="text"
                                    placeholder="Search exams by name..."
                                    value={examSearch}
                                    onChange={(e) =>
                                        setExamSearch(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>


                            <select
                                className="exam-filter"
                                value={examStatusFilter}
                                onChange={(e) =>
                                    setExamStatusFilter(
                                        e.target.value
                                    )
                                }
                            >

                                <option value="All">
                                    All Exams
                                </option>

                                <option value="Available">
                                    Available
                                </option>

                                <option value="Upcoming">
                                    Upcoming
                                </option>

                                <option value="Completed">
                                    Completed
                                </option>

                                <option value="Ended">
                                    Ended
                                </option>

                            </select>

                        </div>

                    )}


                {loading && (

                    <div className="student-message">
                        Loading exams...
                    </div>

                )}


                {!loading &&
                    !error &&
                    visibleExams.length === 0 && (

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
                    visibleExams.length > 0 &&
                    filteredExams.length === 0 && (

                        <div className="student-empty">

                            <div className="student-empty-icon">
                                <SearchIcon size={28} />
                            </div>

                            <h3>
                                No matching exams
                            </h3>

                            <p>
                                No exams match your search or
                                filter. Try a different name or
                                status.
                            </p>

                        </div>

                    )}


                {!loading &&
                    !error &&
                    filteredExams.length > 0 && (

                        <div className="student-exam-grid">

                            {filteredExams.map((exam) => {

                                const completed =
                                    hasCompleted(exam._id);

                                const upcoming =
                                    exam.isUpcoming === true;

                                // Questions are ready but the
                                // scheduled publish time has not
                                // arrived yet.
                                const pendingPublish =
                                    exam.isPublishPending === true;

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
                                                        : exam.isEnded
                                                        ? "exam-status ended"
                                                        : upcoming
                                                        ? "exam-status upcoming"
                                                        : pendingPublish
                                                        ? "exam-status upcoming"
                                                        : "exam-status"
                                                }
                                            >
                                                {completed
                                                    ? "Completed"
                                                    : exam.isEnded
                                                    ? "Ended"
                                                    : upcoming
                                                    ? "Coming Soon"
                                                    : pendingPublish
                                                    ? "Publishing Soon"
                                                    : "Available"}
                                            </span>

                                        </div>


                                        <h3>
                                            {exam.examName}
                                        </h3>


                                        {upcoming && !exam.isEnded ? (

                                            <p className="exam-upcoming-note">
                                                Not open yet. This exam
                                                will be available from{" "}
                                                {getExamDate(
                                                    exam.examStartDateTime || exam.examDate
                                                )}
                                                {(exam.examEndDateTime || exam.examEndDate) && (exam.examEndDateTime !== (exam.examStartDateTime || exam.examDate))
                                                    ? ` to ${getExamDate(exam.examEndDateTime || exam.examEndDate)}`
                                                    : ""}
                                                .
                                            </p>

                                        ) : pendingPublish && !exam.isEnded ? (

                                            <p className="exam-upcoming-note">
                                                Questions are complete. This
                                                exam will be published at{" "}
                                                {exam.publishTime
                                                    ? formatDateTime(exam.publishTime)
                                                    : "the scheduled time"}
                                                . Please check back then.
                                            </p>

                                        ) : exam.isEnded ? (

                                            <p className="exam-upcoming-note">
                                                This exam ended on{" "}
                                                {getExamDate(exam.examEndDateTime || exam.examEndDate || exam.examDate)}
                                                .
                                            </p>

                                        ) : (

                                            <>

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
                                                            exam.examStartDateTime || exam.examDate
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

                                            </>

                                        )}

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
