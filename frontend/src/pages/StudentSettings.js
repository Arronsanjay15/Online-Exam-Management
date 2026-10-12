import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentLayout from "../components/StudentLayout";

import {
    UserIcon,
    LockIcon,
    CheckIcon,
    AlertIcon
} from "../components/Icons";

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
        setProfile((prev) => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm((prev) => ({ ...prev, [name]: value }));
    };

    const updateProfile = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setError("");
            setSuccess("");
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
