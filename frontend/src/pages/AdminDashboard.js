import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import {
    ExamIcon,
    QuestionIcon,
    StudentsIcon,
    ResultsIcon,
    AwardIcon,
    CheckIcon,
    GraduationIcon,
    ClockIcon
} from "../components/Icons";

import {
    getRecordTime,
    formatDate
} from "../utils/time";

function AdminDashboard() {

    const navigate = useNavigate();

    const [exams, setExams] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [students, setStudents] = useState([]);
    const [results, setResults] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // =========================================
    // LOAD DASHBOARD DATA
    // =========================================

    useEffect(() => {

        fetchDashboardData();

    }, []);


    const fetchDashboardData = async () => {

        try {

            setLoading(true);
            setError("");


            const [
                examsResponse,
                questionsResponse,
                studentsResponse,
                resultsResponse
            ] = await Promise.all([

                fetch(
                    "http://localhost:5000/api/exams"
                ),

                fetch(
                    "http://localhost:5000/api/questions"
                ),

                fetch(
                    "http://localhost:5000/api/users?usertype=Student"
                ),

                fetch(
                    "http://localhost:5000/api/results"
                )

            ]);


            const examsData =
                await examsResponse.json();

            const questionsData =
                await questionsResponse.json();

            const studentsData =
                await studentsResponse.json();

            const resultsData =
                await resultsResponse.json();


            if (!examsResponse.ok) {
                throw new Error(
                    "Unable to load exams"
                );
            }


            if (!questionsResponse.ok) {
                throw new Error(
                    "Unable to load questions"
                );
            }


            if (!studentsResponse.ok) {
                throw new Error(
                    "Unable to load students"
                );
            }


            if (!resultsResponse.ok) {
                throw new Error(
                    "Unable to load results"
                );
            }


            setExams(examsData);
            setQuestions(questionsData);
            // Only keep real students (exclude admin profiles)
            setStudents(
                studentsData.filter(
                    (student) =>
                        (student.usertype || "")
                            .toLowerCase() !== "admin"
                )
            );
            setResults(resultsData);


        } catch (error) {

            console.error(
                "Dashboard error:",
                error
            );

            setError(
                "Unable to load dashboard data. Make sure the backend is running."
            );

        } finally {

            setLoading(false);

        }

    };


    // =========================================
    // AVERAGE SCORE
    // =========================================

    const getAverageScore = () => {

        if (results.length === 0) {
            return 0;
        }

        const total = results.reduce(
            (sum, result) =>
                sum +
                Number(
                    result.percentage || 0
                ),
            0
        );

        return Math.round(
            total / results.length
        );

    };


    // =========================================
    // PASS RATE
    // =========================================

    const getPassRate = () => {

        if (results.length === 0) {
            return 0;
        }

        const passed = results.filter(
            result =>
                result.status === "Pass"
        ).length;

        return Math.round(
            (passed / results.length) * 100
        );

    };


    // =========================================
    // RECENT ACTIVITY
    // =========================================

    const getRecentActivities = () => {

        const activities = [];


        // Results

        results.forEach(result => {

            activities.push({

                id:
                    `result-${result._id}`,

                type: "result",

                icon: <ResultsIcon size={16} />,

                title:
                    "Exam completed",

                description:
                    `${result.userId?.name || "Student"} completed ${result.examId?.examName || "an exam"}`,

                date:
                    getRecordTime(result, ["submittedAt"]) ||
                    new Date(0)

            });

        });


        // Exams

        exams.forEach(exam => {

            activities.push({

                id:
                    `exam-${exam._id}`,

                type: "exam",

                icon: <ExamIcon size={16} />,

                title:
                    "Exam available",

                description:
                    `${exam.examName} is available in the system`,

                date:
                    getRecordTime(exam) ||
                    new Date(0)

            });

        });


        // Students

        students.forEach(student => {

            activities.push({

                id:
                    `student-${student._id}`,

                type: "student",

                icon: <StudentsIcon size={16} />,

                title:
                    "Student registered",

                description:
                    `${student.name || "A student"} is registered in the system`,

                date:
                    getRecordTime(student) ||
                    new Date(0)

            });

        });


        return activities
            .sort(
                (a, b) =>
                    b.date - a.date
            )
            .slice(0, 5);

    };


    const recentActivities =
        getRecentActivities();


    // =========================================
    // FORMAT DATE
    // =========================================

    const formatActivityDate = (date) => {

        if (
            !date ||
            date.getTime() === 0
        ) {
            return "Recently";
        }

        const now = new Date();

        const difference =
            now.getTime() -
            date.getTime();


        const minutes =
            Math.floor(
                difference /
                (1000 * 60)
            );


        const hours =
            Math.floor(
                difference /
                (1000 * 60 * 60)
            );


        const days =
            Math.floor(
                difference /
                (1000 * 60 * 60 * 24)
            );


        if (minutes < 1) {
            return "Just now";
        }

        if (minutes < 60) {
            return `${minutes} min ago`;
        }

        if (hours < 24) {
            return `${hours} hr ago`;
        }

        if (days < 7) {
            return `${days} day${days > 1 ? "s" : ""} ago`;
        }


        return formatDate(date);

    };


    // =========================================
    // QUICK ACTION
    // =========================================

    const quickActions = [

        {
            icon: <ExamIcon size={20} />,
            title: "Manage Exams",
            description:
                "Create, edit and delete examinations.",
            button:
                "Open Exams",
            path:
                "/exam-management",
            className:
                "quick-exam"
        },

        {
            icon: <QuestionIcon size={20} />,
            title: "Manage Questions",
            description:
                "Add and manage exam questions.",
            button:
                "Open Questions",
            path:
                "/question-management",
            className:
                "quick-question"
        },

        {
            icon: <StudentsIcon size={20} />,
            title: "Manage Students",
            description:
                "View and manage registered students.",
            button:
                "View Students",
            path:
                "/student-management",
            className:
                "quick-student"
        },

        {
            icon: <ResultsIcon size={20} />,
            title: "View Results",
            description:
                "Monitor student performance and examination results.",
            button:
                "View Results",
            path:
                "/result-management",
            className:
                "quick-result"
        }

    ];


    return (

        <AdminLayout
            active="dashboard"
            title="Dashboard"
            subtitle="Welcome back! Here's what's happening today."
        >



                    {/* ERROR */}

                    {error && (

                        <div className="dashboard-error">

                             {error}

                            <button
                                onClick={
                                    fetchDashboardData
                                }
                            >
                                Retry
                            </button>

                        </div>

                    )}


                    {/* =====================================
                        WELCOME CARD
                    ===================================== */}

                    <section className="admin-welcome-card">

                        <div>

                            <span>
                                ADMINISTRATOR
                            </span>

                            <h2>
                                Welcome, Admin!
                            </h2>

                            <p>
                                Manage your examinations,
                                students, questions and
                                results from one place.
                            </p>

                        </div>


                        <div className="admin-welcome-icon">
                            <GraduationIcon size={40} />
                        </div>

                    </section>


                    {/* =====================================
                        STATISTICS
                    ===================================== */}

                    <section className="admin-dashboard-stats">


                        {/* EXAMS */}

                        <div className="dashboard-stat-card">

                            <div className="dashboard-stat-icon exam">
                                <ExamIcon size={22} />
                            </div>

                            <div>

                                <span>
                                    Total Exams
                                </span>

                                <strong>

                                    {loading
                                        ? "..."
                                        : exams.length}

                                </strong>

                                <small>
                                    Examinations created
                                </small>

                            </div>

                        </div>


                        {/* QUESTIONS */}

                        <div className="dashboard-stat-card">

                            <div className="dashboard-stat-icon question">
                                <QuestionIcon size={22} />
                            </div>

                            <div>

                                <span>
                                    Total Questions
                                </span>

                                <strong>

                                    {loading
                                        ? "..."
                                        : questions.length}

                                </strong>

                                <small>
                                    Questions available
                                </small>

                            </div>

                        </div>


                        {/* STUDENTS */}

                        <div className="dashboard-stat-card">

                            <div className="dashboard-stat-icon student">
                                <StudentsIcon size={22} />
                            </div>

                            <div>

                                <span>
                                    Total Students
                                </span>

                                <strong>

                                    {loading
                                        ? "..."
                                        : students.length}

                                </strong>

                                <small>
                                    Registered students
                                </small>

                            </div>

                        </div>


                        {/* RESULTS */}

                        <div className="dashboard-stat-card">

                            <div className="dashboard-stat-icon result">
                                <ResultsIcon size={22} />
                            </div>

                            <div>

                                <span>
                                    Results
                                </span>

                                <strong>

                                    {loading
                                        ? "..."
                                        : results.length}

                                </strong>

                                <small>
                                    Exams completed
                                </small>

                            </div>

                        </div>

                    </section>


                    {/* =====================================
                        PERFORMANCE SUMMARY
                    ===================================== */}

                    <section className="admin-performance-row">


                        <div className="admin-performance-card">

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
                                    Across all completed exams
                                </small>

                            </div>

                            <div className="performance-icon">
                                <AwardIcon size={26} />
                            </div>

                        </div>


                        <div className="admin-performance-card">

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
                                    Students who passed
                                </small>

                            </div>

                            <div className="performance-icon">
                                <CheckIcon size={26} />
                            </div>

                        </div>

                    </section>


                    {/* =====================================
                        QUICK ACTIONS
                    ===================================== */}

                    <section className="admin-quick-section">

                        <div className="dashboard-section-heading">

                            <div>

                                <h2>
                                    Quick Actions
                                </h2>

                                <p>
                                    Manage your examination system
                                </p>

                            </div>

                        </div>


                        <div className="admin-quick-grid">

                            {quickActions.map(
                                (action) => (

                                    <div
                                        className="admin-quick-card"
                                        key={action.title}
                                    >

                                        <div
                                            className={
                                                `quick-action-icon ${action.className}`
                                            }
                                        >
                                            {action.icon}
                                        </div>


                                        <div className="quick-action-content">

                                            <h3>
                                                {action.title}
                                            </h3>

                                            <p>
                                                {action.description}
                                            </p>

                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        action.path
                                                    )
                                                }
                                            >
                                                {action.button}
                                            </button>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    </section>


                    {/* =====================================
                        RECENT ACTIVITY
                    ===================================== */}

                    <section className="admin-activity-section">

                        <div className="dashboard-section-heading">

                            <div>

                                <h2>
                                    Recent Activity
                                </h2>

                                <p>
                                    Latest activity in the system
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
                                        Loading recent activity...
                                    </p>

                                </div>

                            ) : recentActivities.length === 0 ? (

                                <div className="activity-empty">

                                    <div className="activity-empty-icon">
                                        <ResultsIcon size={26} />
                                    </div>

                                    <h3>
                                        No recent activity
                                    </h3>

                                    <p>
                                        Activity will appear here
                                        when students take exams
                                        or new data is added.
                                    </p>

                                </div>

                            ) : (

                                <div className="activity-list">

                                    {recentActivities.map(
                                        (activity) => (

                                            <div
                                                className="activity-item"
                                                key={
                                                    activity.id
                                                }
                                            >

                                                <div
                                                    className={
                                                        `activity-icon ${activity.type}`
                                                    }
                                                >
                                                    {activity.icon}
                                                </div>


                                                <div className="activity-content">

                                                    <strong>
                                                        {activity.title}
                                                    </strong>

                                                    <p>
                                                        {activity.description}
                                                    </p>

                                                </div>


                                                <span className="activity-time">

                                                    {formatActivityDate(
                                                        activity.date
                                                    )}

                                                </span>

                                            </div>

                                        )
                                    )}

                                </div>

                            )}

                        </div>

                    </section>

        </AdminLayout>

    );
}

export default AdminDashboard;