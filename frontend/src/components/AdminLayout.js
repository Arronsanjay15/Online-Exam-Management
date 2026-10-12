import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";

import {
    DashboardIcon,
    ExamIcon,
    QuestionIcon,
    StudentsIcon,
    ResultsIcon,
    SettingsIcon,
    LogoutIcon,
    GraduationIcon
} from "./Icons";

// =============================================
// SHARED ADMIN LAYOUT
// Used by every admin page (Dashboard, Exams,
// Questions, Students, Results) so the sidebar,
// header and overall look stay identical.
// =============================================

const MENU_ITEMS = [
    { key: "dashboard", Icon: DashboardIcon, label: "Dashboard", path: "/admin-dashboard" },
    { key: "exams", Icon: ExamIcon, label: "Exams", path: "/exam-management" },
    { key: "questions", Icon: QuestionIcon, label: "Questions", path: "/question-management" },
    { key: "students", Icon: StudentsIcon, label: "Students", path: "/student-management" },
    { key: "results", Icon: ResultsIcon, label: "Results", path: "/result-management" }
];

function AdminLayout({ active, title, subtitle, children }) {

    const navigate = useNavigate();

    const username =
        localStorage.getItem("username") || "Admin";

    const avatarLetter =
        username.charAt(0).toUpperCase();


    // Only admins may open admin pages
    useEffect(() => {

        const usertype =
            (localStorage.getItem("usertype") || "").toLowerCase();

        if (usertype !== "admin") {
            navigate("/", { replace: true });
        }

    }, [navigate]);


    const handleLogout = () => {

        localStorage.removeItem("userId");
        localStorage.removeItem("username");
        localStorage.removeItem("usertype");

        navigate("/");

    };


    return (

        <div className="admin-layout">


            {/* =================================
                SIDEBAR
            ================================= */}

            <aside className="admin-sidebar">


                {/* LOGO */}

                <div className="admin-sidebar-logo">

                    <div className="admin-sidebar-logo-icon">
                        <GraduationIcon size={22} />
                    </div>

                    <div>

                        <h2>
                            Exam<span>Pro</span>
                        </h2>

                        <small>
                            Admin Panel
                        </small>

                    </div>

                </div>


                {/* NAVIGATION */}

                <div className="admin-sidebar-section-title">
                    MAIN MENU
                </div>


                <nav className="admin-sidebar-nav">

                    {MENU_ITEMS.map((item) => (

                        <button
                            key={item.key}
                            className={
                                `admin-sidebar-item ${
                                    active === item.key
                                        ? "active"
                                        : ""
                                }`
                            }
                            onClick={() =>
                                navigate(item.path)
                            }
                        >

                            <span className="nav-icon">
                                <item.Icon size={18} />
                            </span>

                            {item.label}

                        </button>

                    ))}

                </nav>


                <div className="admin-sidebar-section-title system-title">
                    SYSTEM
                </div>


                <nav className="admin-sidebar-nav">

                    <button
                        className={
                            `admin-sidebar-item ${
                                active === "settings"
                                    ? "active"
                                    : ""
                            }`
                        }
                        onClick={() =>
                            navigate("/admin-settings")
                        }
                    >

                        <span className="nav-icon">
                            <SettingsIcon size={18} />
                        </span>

                        Settings

                    </button>

                </nav>


                {/* SIDEBAR BOTTOM */}

                <div className="admin-sidebar-bottom">


                    <div className="admin-sidebar-user">

                        <div className="admin-user-avatar">
                            {avatarLetter}
                        </div>

                        <div>

                            <strong>
                                {username}
                            </strong>

                            <small>
                                Admin Account
                            </small>

                        </div>

                    </div>


                    <button
                        className="admin-logout-button"
                        onClick={handleLogout}
                    >

                        <span className="nav-icon">
                            <LogoutIcon size={18} />
                        </span>

                        Logout

                    </button>

                </div>

            </aside>


            {/* =================================
                MAIN
            ================================= */}

            <main className="admin-main">


                {/* HEADER */}

                <header className="admin-header">

                    <div>

                        <h1>
                            {title}
                        </h1>

                        <p>
                            {subtitle}
                        </p>

                    </div>


                    <div className="admin-header-profile">


                        <NotificationBell role="admin" />


                        <div className="admin-header-avatar">
                            {avatarLetter}
                        </div>


                        <div className="admin-header-user">

                            <strong>
                                {username}
                            </strong>

                            <small>
                                Administrator
                            </small>

                        </div>

                    </div>

                </header>


                {/* PAGE CONTENT */}

                <div className="admin-content">

                    {children}

                </div>

            </main>

        </div>

    );
}

export default AdminLayout;
