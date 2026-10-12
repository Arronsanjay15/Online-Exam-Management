import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";

import {
    UserIcon,
    MailIcon,
    PhoneIcon,
    KeyIcon,
    LockIcon,
    EyeIcon,
    EyeOffIcon,
    GraduationIcon,
    ChevronRightIcon,
    CheckIcon,
    AlertIcon,
    XIcon,
    RefreshIcon
} from "../components/Icons";

function Register() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        gender: "",
        username: "",
        password: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [registrationOpen, setRegistrationOpen] = useState(true);

    // Live username availability: idle | invalid | checking |
    // available | taken
    const [usernameStatus, setUsernameStatus] = useState("idle");

    // Popups
    const [showConfirm, setShowConfirm] = useState(false);
    const [resultModal, setResultModal] = useState(null);

    // Respect the global toggle from Admin Settings
    useEffect(() => {
        const checkRegistration = async () => {
            try {
                const res = await fetch(
                    "http://localhost:5000/api/settings"
                );
                const data = await res.json();
                if (res.ok && data.allowRegistration === false) {
                    setRegistrationOpen(false);
                }
            } catch (error) {
                // If settings cannot be loaded we keep registration open.
            }
        };
        checkRegistration();
    }, []);


    // Debounced check so we only ask the server once the
    // student pauses typing.
    useEffect(() => {

        const username = formData.username.trim();

        if (!username) {
            setUsernameStatus("idle");
            return;
        }

        if (username.length < 3) {
            setUsernameStatus("invalid");
            return;
        }

        setUsernameStatus("checking");

        const controller = new AbortController();

        const timer = setTimeout(async () => {

            try {

                const res = await fetch(
                    `http://localhost:5000/api/login/check-username/${encodeURIComponent(username)}`,
                    { signal: controller.signal }
                );

                const data = await res.json();

                setUsernameStatus(
                    data.available ? "available" : "taken"
                );

            } catch (error) {

                if (error.name !== "AbortError") {
                    setUsernameStatus("idle");
                }

            }

        }, 450);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };

    }, [formData.username]);


    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };


    // Opening the popup instead of submitting straight away
    const handleSubmit = (e) => {

        e.preventDefault();

        if (usernameStatus === "taken") {

            setResultModal({
                type: "error",
                title: "Username unavailable",
                message:
                    "That username is already taken. Please choose another one."
            });

            return;
        }

        if (usernameStatus === "invalid") {

            setResultModal({
                type: "error",
                title: "Username too short",
                message:
                    "Please choose a username with at least 3 characters."
            });

            return;
        }

        if (usernameStatus === "checking") {
            return;
        }

        setShowConfirm(true);

    };


    // Real submission, triggered from the confirmation popup
    const confirmRegistration = async () => {

        setShowConfirm(false);
        setLoading(true);

        try {

            const response = await fetch(
                "http://localhost:5000/api/login/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username: formData.username,
                        password: formData.password,
                        name: formData.name,
                        email: formData.email,
                        phoneNumber: formData.phoneNumber,
                        gender: formData.gender
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {

                setResultModal({
                    type: "error",
                    title: "Registration failed",
                    message:
                        data.message ||
                        "Unable to create account"
                });

                setLoading(false);
                return;
            }

            setResultModal({
                type: "success",
                title: "Account created",
                message:
                    "Your account has been created successfully. You can now sign in with your username and password."
            });

        } catch (error) {

            console.error("Registration error:", error);

            setResultModal({
                type: "error",
                title: "Connection error",
                message:
                    "Cannot connect to server. Make sure the backend is running."
            });

        }

        setLoading(false);

    };


    const closeResultModal = () => {

        const wasSuccess =
            resultModal?.type === "success";

        setResultModal(null);

        if (wasSuccess) {
            navigate("/");
        }

    };


    return (

        <div className="register-page">

            {/* LEFT SIDE */}

            <div className="register-left">

                <div className="register-brand">

                    <div className="register-brand-icon">
                        <GraduationIcon size={26} />
                    </div>

                    <h1>
                        Exam<span>Pro</span>
                    </h1>

                    <p>
                        Online Examination Management System
                    </p>

                </div>


                <div className="register-welcome">

                    <h2>
                        Start your
                        <br />
                        <span>learning journey.</span>
                    </h2>

                    <p>
                        Create your account and get access
                        to online examinations, instant results
                        and performance tracking.
                    </p>

                </div>


                <div className="register-benefits">

                    <div className="register-benefit">

                        <span className="benefit-check">
                            <CheckIcon size={16} />
                        </span>

                        <div>
                            <strong>Easy Registration</strong>
                            <p>Create your account in seconds</p>
                        </div>

                    </div>


                    <div className="register-benefit">

                        <span className="benefit-check">
                            <CheckIcon size={16} />
                        </span>

                        <div>
                            <strong>Online Examinations</strong>
                            <p>Attend exams anytime, anywhere</p>
                        </div>

                    </div>


                    <div className="register-benefit">

                        <span className="benefit-check">
                            <CheckIcon size={16} />
                        </span>

                        <div>
                            <strong>Track Your Results</strong>
                            <p>Monitor your exam performance</p>
                        </div>

                    </div>

                </div>

            </div>


            {/* RIGHT SIDE */}

            <div className="register-right">

                <div className="register-card">

                    <div className="register-card-header">

                        <div className="register-mobile-icon">
                            <GraduationIcon size={26} />
                        </div>

                        <h2>
                            Create Account
                        </h2>

                        <p>
                            Join ExamPro and start your
                            examination journey
                        </p>

                    </div>


                    {!registrationOpen && (
                        <div className="student-message error">
                            <AlertIcon size={16} />
                            New registrations are currently disabled by the
                            administrator.
                        </div>
                    )}


                    <form onSubmit={handleSubmit}>

                        <div className="register-form-grid">

                            {/* NAME */}

                            <div className="register-input-group">

                                <label>
                                    Full Name
                                </label>

                                <div className="register-input-wrapper">

                                    <span className="register-field-icon">
                                        <UserIcon size={18} />
                                    </span>

                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                        required
                                    />

                                </div>

                            </div>


                            {/* EMAIL */}

                            <div className="register-input-group">

                                <label>
                                    Email Address
                                </label>

                                <div className="register-input-wrapper">

                                    <span className="register-field-icon">
                                        <MailIcon size={18} />
                                    </span>

                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email"
                                        required
                                    />

                                </div>

                            </div>


                            {/* PHONE */}

                            <div className="register-input-group">

                                <label>
                                    Phone Number
                                </label>

                                <div className="register-input-wrapper">

                                    <span className="register-field-icon">
                                        <PhoneIcon size={18} />
                                    </span>

                                    <input
                                        type="text"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        placeholder="Enter phone number"
                                        required
                                    />

                                </div>

                            </div>


                            {/* GENDER */}

                            <div className="register-input-group">

                                <label>
                                    Gender
                                </label>

                                <div className="register-input-wrapper">

                                    <span className="register-field-icon">
                                        <UserIcon size={18} />
                                    </span>

                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        required
                                    >

                                        <option value="">
                                            Select gender
                                        </option>

                                        <option value="Male">
                                            Male
                                        </option>

                                        <option value="Female">
                                            Female
                                        </option>

                                        <option value="Other">
                                            Other
                                        </option>

                                    </select>

                                </div>

                            </div>


                            {/* USERNAME */}

                            <div className="register-input-group">

                                <label>
                                    Username
                                </label>

                                <div className="register-input-wrapper">

                                    <span className="register-field-icon">
                                        <KeyIcon size={18} />
                                    </span>

                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="Choose a username"
                                        required
                                    />

                                </div>

                                {usernameStatus === "checking" && (
                                    <small className="username-status checking">
                                        <RefreshIcon
                                            size={13}
                                            className="spin"
                                        />
                                        Checking availability...
                                    </small>
                                )}

                                {usernameStatus === "available" && (
                                    <small className="username-status available">
                                        <CheckIcon size={13} />
                                        Username is available
                                    </small>
                                )}

                                {usernameStatus === "taken" && (
                                    <small className="username-status taken">
                                        <XIcon size={13} />
                                        Username is already taken
                                    </small>
                                )}

                                {usernameStatus === "invalid" && (
                                    <small className="username-status invalid">
                                        <AlertIcon size={13} />
                                        Use at least 3 characters
                                    </small>
                                )}

                            </div>


                            {/* ACCOUNT TYPE */}

                            <div className="register-input-group">

                                <label>
                                    Account Type
                                </label>

                                <div className="register-input-wrapper">

                                    <span className="register-field-icon">
                                        <GraduationIcon size={18} />
                                    </span>

                                    <input
                                        type="text"
                                        value="Student"
                                        readOnly
                                    />

                                </div>

                            </div>


                            {/* PASSWORD */}

                            <div className="register-input-group register-full-width">

                                <label>
                                    Password
                                </label>

                                <div className="register-input-wrapper">

                                    <span className="register-field-icon">
                                        <LockIcon size={18} />
                                    </span>

                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Create a password"
                                        required
                                    />

                                    <button
                                        type="button"
                                        className="register-password-toggle"
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                    >
                                        {showPassword
                                            ? <EyeOffIcon size={18} />
                                            : <EyeIcon size={18} />}
                                    </button>

                                </div>

                            </div>

                        </div>


                        {/* SUBMIT */}

                        <button
                            type="submit"
                            className="register-button"
                            disabled={
                                loading ||
                                usernameStatus === "taken" ||
                                usernameStatus === "checking"
                            }
                        >

                            {loading
                                ? "Creating Account..."
                                : "Create Account"}

                            {!loading && (
                                <span className="button-arrow">
                                    <ChevronRightIcon size={18} />
                                </span>
                            )}

                        </button>

                    </form>


                    {/* LOGIN LINK */}

                    <div className="already-account">

                        <span>
                            Already have an account?
                        </span>

                        <button
                            type="button"
                            onClick={() => navigate("/")}
                        >
                            Sign In
                        </button>

                    </div>


                    <div className="register-footer">

                        <span>Secure Registration</span>

                        <span>•</span>

                        <span>ExamPro</span>

                    </div>

                </div>

            </div>


            {/* CONFIRMATION POPUP */}

            {showConfirm && (
                <Modal
                    title="Confirm your details"
                    onClose={() => setShowConfirm(false)}
                    footer={
                        <>
                            <button
                                type="button"
                                className="modal-button secondary"
                                onClick={() => setShowConfirm(false)}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="modal-button primary"
                                onClick={confirmRegistration}
                                disabled={loading}
                            >
                                {loading
                                    ? "Creating..."
                                    : "Confirm & Create"}
                            </button>
                        </>
                    }
                >
                    <p className="modal-text">
                        Please review your information before
                        creating your account.
                    </p>

                    <div className="modal-summary">
                        <div className="modal-summary-row">
                            <span>Full Name</span>
                            <strong>{formData.name || "-"}</strong>
                        </div>
                        <div className="modal-summary-row">
                            <span>Username</span>
                            <strong>{formData.username || "-"}</strong>
                        </div>
                        <div className="modal-summary-row">
                            <span>Email</span>
                            <strong>{formData.email || "-"}</strong>
                        </div>
                        <div className="modal-summary-row">
                            <span>Phone</span>
                            <strong>{formData.phoneNumber || "-"}</strong>
                        </div>
                        <div className="modal-summary-row">
                            <span>Gender</span>
                            <strong>{formData.gender || "-"}</strong>
                        </div>
                        <div className="modal-summary-row">
                            <span>Account Type</span>
                            <strong>Student</strong>
                        </div>
                    </div>
                </Modal>
            )}


            {/* RESULT POPUP */}

            {resultModal && (
                <Modal
                    title={resultModal.title}
                    size="sm"
                    onClose={closeResultModal}
                    footer={
                        <button
                            type="button"
                            className="modal-button primary"
                            onClick={
                                resultModal.type === "success"
                                    ? () => navigate("/")
                                    : () => setResultModal(null)
                            }
                        >
                            {resultModal.type === "success"
                                ? "Continue to Sign In"
                                : "Close"}
                        </button>
                    }
                >
                    <div
                        className={`modal-result ${resultModal.type}`}
                    >
                        <div className="modal-result-icon">
                            {resultModal.type === "success"
                                ? <CheckIcon size={26} />
                                : <AlertIcon size={26} />}
                        </div>

                        <p>{resultModal.message}</p>
                    </div>
                </Modal>
            )}

        </div>
    );
}

export default Register;