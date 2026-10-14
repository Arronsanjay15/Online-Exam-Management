import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentLayout from "../components/StudentLayout";

import {
    UserIcon,
    LockIcon,
    CheckIcon,
    AlertIcon
} from "../components/Icons";

import {
    isValidEmail,
    isValidName,
    isValidPassword,
    isValidPhone,
    sanitizePhone,
    PASSWORD_MIN_LENGTH,
    PHONE_LENGTH
} from "../utils/validation";

function StudentSettings() {
    const navigate = useNavigate();
    const username = localStorage.getItem("username") || "";
    const userId = localStorage.getItem("userId") || "";

    const [profile, setProfile] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        gender: ""
    });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [pwdSaving, setPwdSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [pwdError, setPwdError] = useState("");
    const [pwdSuccess, setPwdSuccess] = useState("");

    // Inline validation messages, keyed by field name.
    const [profileFieldErrors, setProfileFieldErrors] = useState({});
    const [pwdFieldErrors, setPwdFieldErrors] = useState({});

    useEffect(() => {
        if (!userId || !username) {
            navigate("/");
            return;
        }
        fetchProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate, userId, username]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await fetch(
                `http://localhost:5000/api/users/${userId}`
            );
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Failed to load profile");
            }
            setProfile({
                name: data.name || "",
                email: data.email || "",
                phoneNumber: data.phoneNumber || "",
                gender: data.gender || ""
            });
        } catch (err) {
            setError(err.message || "Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        const nextValue =
            name === "phoneNumber" ? sanitizePhone(value) : value;
        setProfile((prev) => ({ ...prev, [name]: nextValue }));
        setProfileFieldErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm((prev) => ({ ...prev, [name]: value }));
        setPwdFieldErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const updateProfile = async (e) => {
        e.preventDefault();

        const errors = {};

        if (!isValidName(profile.name)) {
            errors.name =
                "Please enter a valid name (2-60 characters).";
        }

        if (!isValidEmail(profile.email)) {
            errors.email =
                "Please enter a valid email address, e.g. name@example.com.";
        }

        if (!isValidPhone(profile.phoneNumber)) {
            errors.phoneNumber =
                `Phone number must be exactly ${PHONE_LENGTH} digits.`;
        }

        if (!profile.gender) {
            errors.gender = "Please select a gender.";
        }

        if (Object.keys(errors).length > 0) {
            setProfileFieldErrors(errors);
            setError("");
            setSuccess("");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");
            setProfileFieldErrors({});
            const res = await fetch(
                `http://localhost:5000/api/users/${userId}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(profile)
                }
            );
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Failed to update profile");
            }
            setProfile({
                name: data.user.name || "",
                email: data.user.email || "",
                phoneNumber: data.user.phoneNumber || "",
                gender: data.user.gender || ""
            });
            setSuccess("Your profile has been updated successfully.");
        } catch (err) {
            setError(err.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const updatePassword = async (e) => {
        e.preventDefault();

        // Validate before sending anything to the API.
        const errors = {};

        if (!passwordForm.currentPassword) {
            errors.currentPassword = "Enter your current password.";
        }

        if (!isValidPassword(passwordForm.newPassword)) {
            errors.newPassword =
                `New password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
        }

        if (passwordForm.confirmPassword !== passwordForm.newPassword) {
            errors.confirmPassword = "New passwords do not match.";
        }

        if (Object.keys(errors).length > 0) {
            setPwdFieldErrors(errors);
            setPwdError("");
            setPwdSuccess("");
            return;
        }

        try {
            setPwdSaving(true);
            setPwdError("");
            setPwdSuccess("");
            setPwdFieldErrors({});
            const res = await fetch(
                "http://localhost:5000/api/login/password",
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username,
                        currentPassword: passwordForm.currentPassword,
                        newPassword: passwordForm.newPassword
                    })
                }
            );
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Failed to update password");
            }
            setPwdSuccess("Your password has been updated successfully.");
            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
        } catch (err) {
            setPwdError(err.message || "Failed to update password");
        } finally {
            setPwdSaving(false);
        }
    };

    return (
        <StudentLayout
            active="settings"
            title="Settings"
            subtitle="Manage your profile and account security"
        >
            <div className="settings-container">
                {loading ? (
                    <div className="student-message">Loading settings...</div>
                ) : (
                    <>
                        {error && (
                            <div className="student-message error">
                                <AlertIcon size={16} />
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="student-message success">
                                <CheckIcon size={16} />
                                {success}
                            </div>
                        )}

                        <section className="settings-section">
                            <div className="settings-section-header">
                                <div className="settings-section-icon">
                                    <UserIcon size={18} />
                                </div>
                                <div>
                                    <h2>Profile Information</h2>
                                    <p>Update your personal details</p>
                                </div>
                            </div>

                            <form
                                onSubmit={updateProfile}
                                className="settings-form"
                            >
                                <div className="form-row">
                                    <label>Username</label>
                                    <input
                                        type="text"
                                        value={username}
                                        readOnly
                                        className="readonly-input"
                                    />
                                </div>
                                <div className="form-row">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={profile.name}
                                        onChange={handleProfileChange}
                                        maxLength={60}
                                        autoComplete="name"
                                        className={
                                            profileFieldErrors.name
                                                ? "input-invalid"
                                                : ""
                                        }
                                        required
                                    />
                                    {profileFieldErrors.name && (
                                        <small className="field-error">
                                            {profileFieldErrors.name}
                                        </small>
                                    )}
                                </div>
                                <div className="form-row">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={profile.email}
                                        onChange={handleProfileChange}
                                        maxLength={254}
                                        autoComplete="email"
                                        className={
                                            profileFieldErrors.email
                                                ? "input-invalid"
                                                : ""
                                        }
                                        required
                                    />
                                    {profileFieldErrors.email && (
                                        <small className="field-error">
                                            {profileFieldErrors.email}
                                        </small>
                                    )}
                                </div>
                                <div className="form-row">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={profile.phoneNumber}
                                        onChange={handleProfileChange}
                                        inputMode="numeric"
                                        maxLength={10}
                                        autoComplete="tel"
                                        className={
                                            profileFieldErrors.phoneNumber
                                                ? "input-invalid"
                                                : ""
                                        }
                                        required
                                    />
                                    {profileFieldErrors.phoneNumber && (
                                        <small className="field-error">
                                            {profileFieldErrors.phoneNumber}
                                        </small>
                                    )}
                                </div>
                                <div className="form-row">
                                    <label>Gender</label>
                                    <select
                                        name="gender"
                                        value={profile.gender}
                                        onChange={handleProfileChange}
                                        className={
                                            profileFieldErrors.gender
                                                ? "input-invalid"
                                                : ""
                                        }
                                        required
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {profileFieldErrors.gender && (
                                        <small className="field-error">
                                            {profileFieldErrors.gender}
                                        </small>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={saving}
                                >
                                    {saving ? "Saving..." : "Save Profile"}
                                </button>
                            </form>
                        </section>

                        <section className="settings-section">
                            <div className="settings-section-header">
                                <div className="settings-section-icon">
                                    <LockIcon size={18} />
                                </div>
                                <div>
                                    <h2>Change Password</h2>
                                    <p>Keep your account secure</p>
                                </div>
                            </div>

                            {pwdError && (
                                <div className="student-message error">
                                    <AlertIcon size={16} />
                                    {pwdError}
                                </div>
                            )}
                            {pwdSuccess && (
                                <div className="student-message success">
                                    <CheckIcon size={16} />
                                    {pwdSuccess}
                                </div>
                            )}

                            <form
                                onSubmit={updatePassword}
                                className="settings-form"
                            >
                                <div className="form-row">
                                    <label>Current Password</label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={passwordForm.currentPassword}
                                        onChange={handlePasswordChange}
                                        maxLength={64}
                                        autoComplete="current-password"
                                        className={
                                            pwdFieldErrors.currentPassword
                                                ? "input-invalid"
                                                : ""
                                        }
                                        required
                                    />
                                    {pwdFieldErrors.currentPassword && (
                                        <small className="field-error">
                                            {pwdFieldErrors.currentPassword}
                                        </small>
                                    )}
                                </div>
                                <div className="form-row">
                                    <label>New Password</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwordForm.newPassword}
                                        onChange={handlePasswordChange}
                                        maxLength={64}
                                        autoComplete="new-password"
                                        className={
                                            pwdFieldErrors.newPassword
                                                ? "input-invalid"
                                                : ""
                                        }
                                        required
                                    />
                                    {pwdFieldErrors.newPassword && (
                                        <small className="field-error">
                                            {pwdFieldErrors.newPassword}
                                        </small>
                                    )}
                                </div>
                                <div className="form-row">
                                    <label>Confirm New Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordForm.confirmPassword}
                                        onChange={handlePasswordChange}
                                        maxLength={64}
                                        autoComplete="new-password"
                                        className={
                                            pwdFieldErrors.confirmPassword
                                                ? "input-invalid"
                                                : ""
                                        }
                                        required
                                    />
                                    {pwdFieldErrors.confirmPassword && (
                                        <small className="field-error">
                                            {pwdFieldErrors.confirmPassword}
                                        </small>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={pwdSaving}
                                >
                                    {pwdSaving
                                        ? "Updating..."
                                        : "Update Password"}
                                </button>
                            </form>
                        </section>
                    </>
                )}
            </div>
        </StudentLayout>
    );
}

export default StudentSettings;
