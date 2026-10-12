import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    UserIcon,
    LockIcon,
    EyeIcon,
    EyeOffIcon,
    GraduationIcon,
    ChevronRightIcon,
    ClockIcon,
    AwardIcon,
    ResultsIcon
} from "../components/Icons";

function Login() {

    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);


    // Already logged in -> go straight to the dashboard
    useEffect(() => {

        const usertype =
            (localStorage.getItem("usertype") || "").toLowerCase();

        if (usertype === "admin") {
            navigate("/admin-dashboard", { replace: true });
        } else if (usertype === "student") {
            navigate("/student-dashboard", { replace: true });
        }

    }, [navigate]);

    const handleLogin = async (e) => {

        e.preventDefault();

        setLoading(true);

        try {

            const response = await fetch(
                "http://localhost:5000/api/login/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        username,
                        password
                    })
                }
            );

            const data = await response.json();

            console.log("Login response:", data);

            if (!response.ok) {
                alert(data.message || "Login failed");
                setLoading(false);
                return;
            }

            localStorage.setItem("userId", data.userId);
            localStorage.setItem("username", data.username);
            localStorage.setItem("usertype", data.usertype);

            if (data.usertype.toLowerCase() === "admin") {
                navigate("/admin-dashboard");
            } else {
                navigate("/student-dashboard");
            }

        } catch (error) {

            console.error("Login error:", error);

            alert(
                "Cannot connect to server. Make sure the backend is running."
            );

        }

        setLoading(false);
    };


    return (

        <div className="login-page">

            {/* LEFT SIDE */}

            <div className="login-left">

                <div className="brand-section">

                    <div className="brand-icon">
                        <GraduationIcon size={26} />
                    </div>

                    <h1>Exam<span>Pro</span></h1>

                    <p>
                        Online Examination Management System
                    </p>

                </div>


                <div className="welcome-section">

                    <h2>
                        Test your knowledge.
                        <br />
                        <span>Achieve your goals.</span>
                    </h2>

                    <p>
                        Take online examinations, track your
                        performance and improve your results
                        with ease.
                    </p>

                </div>


                <div className="feature-list">

                    <div className="feature-item">
                        <div className="feature-icon">
                            <ResultsIcon size={18} />
                        </div>
                        <div>
                            <strong>Easy Online Exams</strong>
                            <p>Attend exams from anywhere</p>
                        </div>
                    </div>


                    <div className="feature-item">
                        <div className="feature-icon">
                            <ClockIcon size={18} />
                        </div>
                        <div>
                            <strong>Instant Results</strong>
                            <p>Get your results immediately</p>
                        </div>
                    </div>


                    <div className="feature-item">
                        <div className="feature-icon">
                            <AwardIcon size={18} />
                        </div>
                        <div>
                            <strong>Track Performance</strong>
                            <p>Monitor your academic progress</p>
                        </div>
                    </div>

                </div>

            </div>


            {/* RIGHT SIDE */}

            <div className="login-right">

                <div className="login-card">

                    <div className="mobile-logo">
                        <GraduationIcon size={26} />
                    </div>

                    <h2>Welcome Back!</h2>

                    <p className="login-subtitle">
                        Login to continue to your account
                    </p>


                    <form onSubmit={handleLogin}>

                        {/* USERNAME */}

                        <div className="login-input-group">

                            <label>
                                Username
                            </label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    <UserIcon size={18} />
                                </span>

                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    placeholder="Enter your username"
                                    required
                                />

                            </div>

                        </div>


                        {/* PASSWORD */}

                        <div className="login-input-group">

                            <label>
                                Password
                            </label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    <LockIcon size={18} />
                                </span>

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="Enter your password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOffIcon size={18} />
                                    ) : (
                                        <EyeIcon size={18} />
                                    )}
                                </button>

                            </div>

                        </div>


                        {/* LOGIN BUTTON */}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >

                            {loading
                                ? "Signing in..."
                                : "Sign In"}

                            {!loading && (
                                <span className="button-arrow">
                                    <ChevronRightIcon size={18} />
                                </span>
                            )}

                        </button>

                    </form>


                    <div className="register-section">

                        <span>
                            Don't have an account?
                        </span>

                        <button
                            type="button"
                            onClick={() => navigate("/register")}
                        >
                            Create Account
                        </button>

                    </div>


                    <div className="login-footer">

                        <span>Secure Login</span>

                        <span>•</span>

                        <span>Online Exam System</span>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Login;