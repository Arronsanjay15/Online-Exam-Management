import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";

import {
    UserIcon,
    SlidersIcon,
    LockIcon,
    InfoIcon,
    CheckIcon,
    AlertIcon
} from "../components/Icons";

function AdminSettings() {
    const navigate = useNavigate();
    const username = localStorage.getItem("username") || "";
    const userId = localStorage.getItem("userId") || "";

    const [profile, setProfile] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        gender: ""
    });

    const [preferences, setPreferences] = useState({
        passingPercentage: 40,
        defaultExamDuration: 60,
        defaultTotalMarks: 100,
        allowRegistration: true
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [profileSaving, setProfileSaving] = useState(false);
    const [prefSaving, setPrefSaving] = useState(false);
    const [pwdSaving, setPwdSaving] = useState(false);

    const [error, setError] = useState("");
    const [profileError, setProfileError] = useState("");
    const [profileSuccess, setProfileSuccess] = useState("");
    const [prefError, setPrefError] = useState("");
    const [prefSuccess, setPrefSuccess] = useState("");
    const [pwdError, setPwdError] = useState("");
    const [pwdSuccess, setPwdSuccess] = useState("");

    useEffect(() => {
        const usertype = (localStorage.getItem("usertype") || "").toLowerCase();
        if (usertype !== "admin") {
            navigate("/");
            return;
        }
        fetchProfile();
        fetchPreferences();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate]);

    // =========================================
    // LOAD DATA
    // =========================================

    const fetchProfile = async () => {
        if (!userId) {
            return;
        }
        try {
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
        }
    };

    const fetchPreferences = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/settings");
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Failed to load preferences");
            }
            setPreferences({
                passingPercentage: data.passingPercentage ?? 40,
                defaultExamDuration: data.defaultExamDuration ?? 60,
                defaultTotalMarks: data.defaultTotalMarks ?? 100,
                allowRegistration: data.allowRegistration ?? true
            });
        } catch (err) {
            setPrefError(err.message || "Failed to load preferences");
        }
    };

    // =========================================
    // HANDLERS
    // =========================================

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile((prev) => ({ ...prev, [name]: value }));
    };

    const handlePreferencesChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPreferences((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm((prev) => ({ ...prev, [name]: value }));
    };

    const updateProfile = async (e) => {
        e.preventDefault();
        try {
            setProfileSaving(true);
            setProfileError("");
            setProfileSuccess("");

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
            setProfileSuccess("Admin profile updated successfully.");
        } catch (err) {
            setProfileError(err.message || "Failed to update profile");
        } finally {
            setProfileSaving(false);
        }
    };

    const updatePreferences = async (e) => {
        e.preventDefault();
        try {
            setPrefSaving(true);
            setPrefError("");
            setPrefSuccess("");

            const res = await fetch("http://localhost:5000/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    passingPercentage: Number(preferences.passingPercentage),
                    defaultExamDuration: Number(preferences.defaultExamDuration),
                    defaultTotalMarks: Number(preferences.defaultTotalMarks),
                    allowRegistration: preferences.allowRegistration
                })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Failed to update preferences");
            }
            setPreferences({
                passingPercentage: data.settings.passingPercentage,
                defaultExamDuration: data.settings.defaultExamDuration,
                defaultTotalMarks: data.settings.defaultTotalMarks,
                allowRegistration: data.settings.allowRegistration
            });
            setPrefSuccess("System preferences saved successfully.");
        } catch (err) {
            setPrefError(err.message || "Failed to update preferences");
        } finally {
            setPrefSaving(false);
        }
    };

    const updatePassword = async (e) => {
        e.preventDefault();
        try {
            setPwdSaving(true);
            setPwdError("");
            setPwdSuccess("");
            if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                throw new Error("New passwords do not match");
            }
            if (passwordForm.newPassword.length < 4) {
                throw new Error("New password must be at least 4 characters");
            }
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
            setPwdSuccess("Admin password updated successfully.");
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
        <AdminLayout
            active="settings"
            title="Settings"
            subtitle="Manage your admin account and system preferences"
        >
            <div className="settings-container">
                {error && (
                    <div className="dashboard-error">
                        <span>{error}</span>
                        <button onClick={fetchProfile}>Retry</button>
                    </div>
                )}

                {/* =================================
                    ADMIN PROFILE
                ================================= */}
                <section className="settings-section">
                    <div className="settings-section-header">
                        <div className="settings-section-icon">
                            <UserIcon size={18} />
                        </div>
                        <div>
                            <h2>Admin Profile</h2>
                            <p>Update your personal account details</p>
                        </div>
                    </div>

                    {profileError && (
                        <div className="student-message error">
                            <AlertIcon size={16} />
                            {profileError}
                        </div>
                    )}
                    {profileSuccess && (
                        <div className="student-message success">
                            <CheckIcon size={16} />
                            {profileSuccess}
                        </div>
                    )}

                    <form onSubmit={updateProfile} className="settings-form">
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
                                required
                            />
                        </div>
                        <div className="form-row">
                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={profile.email}
                                onChange={handleProfileChange}
                                required
                            />
                        </div>
                        <div className="form-row">
                            <label>Phone Number</label>
                            <input
                                type="text"
                                name="phoneNumber"
                                value={profile.phoneNumber}
                                onChange={handleProfileChange}
                                required
                            />
                        </div>
                        <div className="form-row">
                            <label>Gender</label>
                            <select
                                name="gender"
                                value={profile.gender}
                                onChange={handleProfileChange}
                                required
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="primary-button"
                            disabled={profileSaving}
                        >
                            {profileSaving ? "Saving..." : "Save Profile"}
                        </button>
                    </form>
                </section>

                {/* =================================
                    SYSTEM PREFERENCES
                ================================= */}
                <section className="settings-section">
                    <div className="settings-section-header">
                        <div className="settings-section-icon">
                            <SlidersIcon size={18} />
                        </div>
                        <div>
                            <h2>System Preferences</h2>
                            <p>Defaults applied across the examination system</p>
                        </div>
                    </div>

                    {prefError && (
                        <div className="student-message error">
                            <AlertIcon size={16} />
                            {prefError}
                        </div>
                    )}
                    {prefSuccess && (
                        <div className="student-message success">
                            <CheckIcon size={16} />
                            {prefSuccess}
                        </div>
                    )}

                    <form onSubmit={updatePreferences} className="settings-form">
                        <div className="form-row">
                            <label>Passing Percentage</label>
                            <input
                                type="number"
                                name="passingPercentage"
                                min="0"
                                max="100"
                                value={preferences.passingPercentage}
                                onChange={handlePreferencesChange}
                                required
                            />
                            <small className="field-hint">
                                Minimum percentage a student needs to pass an exam.
                            </small>
                        </div>
                        <div className="form-row">
                            <label>Default Exam Duration (minutes)</label>
                            <input
                                type="number"
                                name="defaultExamDuration"
                                min="1"
                                value={preferences.defaultExamDuration}
                                onChange={handlePreferencesChange}
                                required
                            />
                        </div>
                        <div className="form-row">
                            <label>Default Total Marks</label>
                            <input
                                type="number"
                                name="defaultTotalMarks"
                                min="1"
                                value={preferences.defaultTotalMarks}
                                onChange={handlePreferencesChange}
                                required
                            />
                        </div>
                        <div className="form-row checkbox-row">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="allowRegistration"
                                    checked={preferences.allowRegistration}
                                    onChange={handlePreferencesChange}
                                />
                                Allow new student registrations
                            </label>
                        </div>
                        <button
                            type="submit"
                            className="primary-button"
                            disabled={prefSaving}
                        >
                            {prefSaving ? "Saving..." : "Save Preferences"}
                        </button>
                    </form>
                </section>

                {/* =================================
                    CHANGE PASSWORD
                ================================= */}
                <section className="settings-section">
                    <div className="settings-section-header">
                        <div className="settings-section-icon">
                            <LockIcon size={18} />
                        </div>
                        <div>
                            <h2>Change Password</h2>
                            <p>Keep your administrator account secure</p>
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

                    <form onSubmit={updatePassword} className="settings-form">
                        <div className="form-row">
                            <label>Current Password</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={passwordForm.currentPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>
                        <div className="form-row">
                            <label>New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwordForm.newPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>
                        <div className="form-row">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwordForm.confirmPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="primary-button"
                            disabled={pwdSaving}
                        >
                            {pwdSaving ? "Updating..." : "Update Password"}
                        </button>
                    </form>
                </section>

                {/* =================================
                    SYSTEM INFORMATION
                ================================= */}
                <section className="settings-section">
                    <div className="settings-section-header">
                        <div className="settings-section-icon">
                            <InfoIcon size={18} />
                        </div>
                        <div>
                            <h2>System Information</h2>
                            <p>Details about this installation</p>
                        </div>
                    </div>

                    <div className="settings-info">
                        <div className="info-row">
                            <span>Role</span>
                            <strong>Administrator</strong>
                        </div>
                        <div className="info-row">
                            <span>Username</span>
                            <strong>{username}</strong>
                        </div>
                        <div className="info-row">
                            <span>Environment</span>
                            <strong>Development</strong>
                        </div>
                        <div className="info-row">
                            <span>Database</span>
                            <strong>MongoDB</strong>
                        </div>
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}

export default AdminSettings;
