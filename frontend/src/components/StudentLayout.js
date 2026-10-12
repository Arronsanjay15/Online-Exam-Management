import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";

import {
    DashboardIcon,
    ExamIcon,
    ResultsIcon,
    SettingsIcon,
    LogoutIcon,
    GraduationIcon
} from "./Icons";

// =============================================
// SHARED STUDENT LAYOUT
// Mirrors AdminLayout (same sidebar, header and
// styling) so the student portal shares the exact
// professional look of the admin dashboard.
// =============================================

const MENU_ITEMS = [
    {
        key: "dashboard",
        Icon: DashboardIcon,
        label: "Dashboard",
        scrollId: "student-section-top"
    },
    {
        key: "exams",
        Icon: ExamIcon,
        label: "Available Exams",
        scrollId: "student-section-exams"
    },
    {
        key: "results",
        Icon: ResultsIcon,
        label: "My Results",
        scrollId: "student-section-results"
    }
];

function StudentLayout({ active, title, subtitle, children }) {

    const navigate = useNavigate();

    const username =
        localStorage.getItem("username") || "Student";

    const avatarLetter =
        username.charAt(0).toUpperCase();


    // Only students may open student pages
    useEffect(() => {

        const usertype =
            (localStorage.getItem("usertype") || "").toLowerCase();

        if (usertype !== "student") {
            navigate("/", { replace: true });
        }

    }, [navigate]);


    const handleLogout = () => {

        localStorage.removeItem("userId");
        localStorage.removeItem("username");
        localStorage.removeItem("usertype");

        navigate("/");

    };


    // Sections live on the dashboard, so if we are on a
    // different student page we first go back to it.
    const scrollToSection = (id) => {

        const run = () => {

            const element = document.getElementById(id);

            if (element) {
                element.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }

        };

        if (window.location.pathname !== "/student-dashboard") {
            navigate("/student-dashboard");
            setTimeout(run, 120);
        } else {
            run();
        }

    };


    return (

        <div className="admin-layout">


            {/* SIDEBAR */}

            <aside className="admin-sidebar">


                <div className="admin-sidebar-logo">

                    <div className="admin-sidebar-logo-icon">
                        <GraduationIcon size={22} />
                    </div>

                    <div>

                        <h2>
                            Exam<span>Pro</span>
                        </h2>

                        <small>
                            Student Portal
                        </small>

                    </div>

                </div>


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
                            onClick={() => {

                                if (item.scrollId) {
                                    scrollToSection(item.scrollId);
                                } else {
                                    navigate(item.path);
                                }

                            }}
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
                            navigate("/student-settings")
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
                                Student Account
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


            {/* MAIN */}

            <main className="admin-main">


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


                        <NotificationBell role="student" />


                        <div className="admin-header-avatar">
                            {avatarLetter}
                        </div>


                        <div className="admin-header-user">

                            <strong>
                                {username}
                            </strong>

                            <small>
                                Student
                            </small>

                        </div>

                    </div>

                </header>


                <div className="admin-content">

                    {children}

                </div>

            </main>

        </div>

    );
}

export default StudentLayout;
