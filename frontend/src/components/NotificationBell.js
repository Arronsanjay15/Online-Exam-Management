import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    BellIcon,
    ResultsIcon,
    ExamIcon,
    StudentsIcon,
    CheckIcon,
    AlertIcon
} from "./Icons";

import {
    getRecordTime,
    formatRelativeTime
} from "../utils/time";

// =============================================
// NOTIFICATION BELL
// Shared by the admin and student layouts. It
// derives notifications from existing data (new
// exams, results and registered students) and
// keeps an unread count in localStorage.
// =============================================

const BASE = "http://localhost:5000";

function NotificationBell({ role }) {

    const navigate = useNavigate();

    const userId = localStorage.getItem("userId") || "";

    const storageKey =
        `notificationsSeen:${role}:${userId}`;

    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const [lastSeen, setLastSeen] = useState(() =>
        Number(localStorage.getItem(storageKey) || 0)
    );

    const wrapperRef = useRef(null);


    // -----------------------------------------
    // LOAD NOTIFICATIONS
    // -----------------------------------------

    useEffect(() => {

        let active = true;

        const load = async () => {

            try {

                const collected = [];

                const examsResponse = await fetch(
                    `${BASE}/api/exams`
                );

                const exams = examsResponse.ok
                    ? await examsResponse.json()
                    : [];

                // Students are only told about exams whose
                // questions are complete and publicly available.
                const visibleExams =
                    role === "student"
                        ? exams.filter(
                            (exam) => exam.isPublished === true
                        )
                        : exams;

                visibleExams.forEach((exam) => {

                    collected.push({
                        id: `exam-${exam._id}`,
                        type: "exam",
                        icon: <ExamIcon size={16} />,
                        title: !exam.isPublished
                            ? "Exam draft"
                            : exam.isPublishPending
                            ? "Exam publishing soon"
                            : exam.isUpcoming
                            ? "Exam coming soon"
                            : "Exam available",
                        text: exam.examName || "New examination",
                        date: getRecordTime(exam),
                        path:
                            role === "student"
                                ? "/student-dashboard"
                                : "/exam-management"
                    });

                });


                if (role === "admin") {

                    // Warn the admin about exams whose scheduled
                    // publish time passed without the questions
                    // being ready (incomplete questions or marks).
                    exams
                        .filter((exam) => exam.publishMissed === true)
                        .forEach((exam) => {

                            collected.push({
                                id: `exam-publish-missed-${exam._id}`,
                                type: "warning",
                                icon: <AlertIcon size={16} />,
                                title: "Publish time missed",
                                text:
                                    `"${exam.examName || "An exam"}" was not published — ${exam.missedPublishReason || "the questions are not ready"}`,
                                date:
                                    exam.publishTime ||
                                    getRecordTime(exam),
                                path: "/exam-management"
                            });

                        });

                    const resultsResponse = await fetch(
                        `${BASE}/api/results`
                    );

                    const results = resultsResponse.ok
                        ? await resultsResponse.json()
                        : [];

                    results.forEach((result) => {

                        collected.push({
                            id: `result-${result._id}`,
                            type: "result",
                            icon: <ResultsIcon size={16} />,
                            title: "Exam completed",
                            text:
                                `${result.userId?.name || "A student"} completed ${result.examId?.examName || "an exam"}`,
                            date: getRecordTime(result, ["submittedAt"]),
                            path: "/result-management"
                        });

                    });


                    const studentsResponse = await fetch(
                        `${BASE}/api/users?usertype=Student`
                    );

                    const students = studentsResponse.ok
                        ? await studentsResponse.json()
                        : [];

                    students.forEach((student) => {

                        collected.push({
                            id: `student-${student._id}`,
                            type: "student",
                            icon: <StudentsIcon size={16} />,
                            title: "Student registered",
                            text:
                                `${student.name || "A student"} joined the system`,
                            date: getRecordTime(student),
                            path: "/student-management"
                        });

                    });

                } else if (userId) {

                    const resultsResponse = await fetch(
                        `${BASE}/api/results/user/${userId}`
                    );

                    const results = resultsResponse.ok
                        ? await resultsResponse.json()
                        : [];

                    results.forEach((result) => {

                        collected.push({
                            id: `myresult-${result._id}`,
                            type: "result",
                            icon: <CheckIcon size={16} />,
                            title: "Result available",
                            text:
                                `You scored ${result.percentage}% in ${result.examId?.examName || "an exam"}`,
                            date: getRecordTime(result, ["submittedAt"]),
                            path: `/result/${result._id}`
                        });

                    });

                }


                collected.sort(
                    (a, b) =>
                        new Date(b.date || 0) -
                        new Date(a.date || 0)
                );


                if (active) {
                    setItems(collected.slice(0, 8));
                }

            } catch (error) {

                // Notifications are non-critical; stay silent.

            } finally {

                if (active) {
                    setLoading(false);
                }

            }

        };

        load();

        const interval = setInterval(load, 60000);

        return () => {
            active = false;
            clearInterval(interval);
        };

    }, [role, userId]);


    // Reload the "seen" marker when the account changes
    useEffect(() => {

        setLastSeen(
            Number(localStorage.getItem(storageKey) || 0)
        );

    }, [storageKey]);


    // -----------------------------------------
    // CLOSE ON OUTSIDE CLICK
    // -----------------------------------------

    useEffect(() => {

        const handleClick = (event) => {

            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target)
            ) {
                setOpen(false);
            }

        };

        document.addEventListener("mousedown", handleClick);

        return () =>
            document.removeEventListener(
                "mousedown",
                handleClick
            );

    }, []);


    const unreadCount = items.filter(
        (item) =>
            new Date(item.date || 0).getTime() > lastSeen
    ).length;


    const markAllAsRead = () => {

        const now = Date.now();

        localStorage.setItem(storageKey, String(now));
        setLastSeen(now);

    };


    const openItem = (item) => {

        markAllAsRead();
        setOpen(false);

        if (item.path) {
            navigate(item.path);
        }

    };


    return (

        <div className="notification-bell" ref={wrapperRef}>

            <button
                type="button"
                className="admin-notification"
                aria-label="Notifications"
                onClick={() => setOpen((previous) => !previous)}
            >

                <BellIcon size={20} />

                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}

            </button>


            {open && (

                <div className="notification-panel">

                    <div className="notification-panel-header">

                        <strong>
                            Notifications
                        </strong>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={markAllAsRead}
                            >
                                Mark all as read
                            </button>
                        )}

                    </div>


                    <div className="notification-panel-body">

                        {loading ? (

                            <div className="notification-empty">
                                Loading notifications...
                            </div>

                        ) : items.length === 0 ? (

                            <div className="notification-empty">
                                No notifications yet
                            </div>

                        ) : (

                            items.map((item) => {

                                const isUnread =
                                    new Date(
                                        item.date || 0
                                    ).getTime() > lastSeen;

                                return (

                                    <button
                                        type="button"
                                        key={item.id}
                                        className={
                                            `notification-item ${
                                                isUnread
                                                    ? "unread"
                                                    : ""
                                            }`
                                        }
                                        onClick={() =>
                                            openItem(item)
                                        }
                                    >

                                        <span
                                            className={
                                                `notification-item-icon ${item.type}`
                                            }
                                        >
                                            {item.icon}
                                        </span>


                                        <span className="notification-item-text">

                                            <strong>
                                                {item.title}
                                            </strong>

                                            <small>
                                                {item.text}
                                            </small>

                                        </span>


                                        <span className="notification-item-time">
                                            {formatRelativeTime(
                                                item.date
                                            )}
                                        </span>

                                    </button>

                                );

                            })

                        )}

                    </div>

                </div>

            )}

        </div>

    );

}

export default NotificationBell;
