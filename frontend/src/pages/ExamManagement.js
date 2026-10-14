import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import NoticeModal from "../components/NoticeModal";
import ConfirmModal from "../components/ConfirmModal";
import {
    EditIcon,
    PlusIcon,
    CalendarIcon,
    ClockIcon,
    AwardIcon,
    ExamIcon,
    TrashIcon,
    SearchIcon
} from "../components/Icons";

import {
    formatDate,
    formatDateTime,
    todayDateValue
} from "../utils/time";

// Legacy exams may store a full datetime in publishAt, but the
// publish input only accepts "HH:mm". Pull the time part out.
const toTimeValue = (value) => {
    if (!value) {
        return "";
    }

    const match = String(value).match(/(\d{2}:\d{2})/);

    return match ? match[1] : "";
};


// Combines a "YYYY-MM-DD" style date with an "HH:mm" time into
// a local Date, or null when either part is missing/invalid.
const combineDateAndTime = (dateValue, timeValue) => {

    if (!dateValue || !timeValue) {
        return null;
    }

    const datePart = String(dateValue).substring(0, 10);

    const result = new Date(`${datePart}T${timeValue}:00`);

    return Number.isNaN(result.getTime()) ? null : result;

};


// Reads an exam end value ("YYYY-MM-DD" or "YYYY-MM-DDTHH:mm")
// as a Date, treating a plain date as the end of that day.
const toEndDateTime = (value) => {

    if (!value) {
        return null;
    }

    const str = String(value);

    const result = str.includes("T")
        ? new Date(str)
        : new Date(`${str.substring(0, 10)}T23:59:59`);

    return Number.isNaN(result.getTime()) ? null : result;

};


// The status shown on an exam card. Kept in one function so the
// badge and the status filter can never disagree.
const getExamStatus = (exam) => {

    if (exam.publishMissed === true) {
        return "Publish Missed";
    }

    if (exam.isPublished !== true) {
        return "Draft";
    }

    if (exam.isEnded === true) {
        return "Ended";
    }

    if (exam.isUpcoming === true) {
        return "Coming Soon";
    }

    if (exam.isPublishPending === true) {
        return "Scheduled";
    }

    return "Published";

};

function ExamManagement() {

    const [exams, setExams] = useState([]);

    // Exam list controls
    const [examSearch, setExamSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const [examName, setExamName] = useState("");
    const [description, setDescription] = useState("");
    const [duration, setDuration] = useState("");
    const [totalMarks, setTotalMarks] = useState("");
    const [examDate, setExamDate] = useState(""); // legacy start date
    const [examStartDate, setExamStartDate] = useState("");
    const [examEndDateTime, setExamEndDateTime] = useState("");
    const [examEndDate, setExamEndDate] = useState(""); // legacy
    const [publishAt, setPublishAt] = useState("");

    // The end date stored on the exam being edited, so an
    // already-passed date can be preserved without the
    // "no previous date" rule blocking the edit.
    const [originalEndDate, setOriginalEndDate] = useState("");

    // The publish time stored on the exam being edited, so a
    // time that has already passed (the exam is live/published)
    // can be preserved without blocking the edit.
    const [originalPublishAt, setOriginalPublishAt] = useState("");

    // Today's date (YYYY-MM-DD). Used so previous dates
    // cannot be chosen when publishing (creating) an exam.
    const todayInputValue = todayDateValue();

    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Popups
    const [notice, setNotice] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [defaults, setDefaults] = useState({
        defaultExamDuration: "",
        defaultTotalMarks: ""
    });


    // ==========================================
    // LOAD EXAMS FROM MONGODB
    // ==========================================

    useEffect(() => {
        fetchExams();
        fetchDefaults();
    }, []);


    // Default values come from the Admin Settings page
    const fetchDefaults = async () => {
        try {
            const response = await fetch(
                "http://localhost:5000/api/settings"
            );
            const data = await response.json();
            if (response.ok) {
                setDefaults({
                    defaultExamDuration: data.defaultExamDuration || "",
                    defaultTotalMarks: data.defaultTotalMarks || ""
                });
            }
        } catch (error) {
            // Defaults are optional, ignore failures.
        }
    };


    // Prefill the form with the configured defaults
    useEffect(() => {
        if (!editingId) {
            setDuration((prev) => prev || defaults.defaultExamDuration);
            setTotalMarks((prev) => prev || defaults.defaultTotalMarks);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaults]);


    const fetchExams = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await fetch(
                "http://localhost:5000/api/exams"
            );

            if (!response.ok) {
                throw new Error("Failed to fetch exams");
            }

            const data = await response.json();

            setExams(data);

        } catch (error) {

            console.error(
                "Error fetching exams:",
                error
            );

            setError(
                "Unable to load exams. Make sure the backend server is running."
            );

        } finally {

            setLoading(false);

        }
    };


    // ==========================================
    // CREATE / UPDATE EXAM
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        const examNameText = examName.trim();
        const descriptionText = description.trim();
        const durationValue = Number(duration);
        const totalMarksValue = Number(totalMarks);


        // ---------- Exam name ----------

        if (!examNameText) {
            setNotice({
                type: "error",
                title: "Exam name required",
                message:
                    "Please enter a name for the examination."
            });
            return;
        }


        // ---------- Description ----------

        if (!descriptionText) {
            setNotice({
                type: "error",
                title: "Description required",
                message:
                    "Please enter a short description for the examination."
            });
            return;
        }


        // ---------- Duration ----------

        if (
            duration === "" ||
            duration === null ||
            duration === undefined
        ) {
            setNotice({
                type: "error",
                title: "Duration required",
                message:
                    "Please enter the duration of the examination in minutes."
            });
            return;
        }

        if (!Number.isFinite(durationValue) || durationValue <= 0) {
            setNotice({
                type: "error",
                title: "Invalid duration",
                message:
                    "Duration must be a number of minutes greater than 0."
            });
            return;
        }


        // ---------- Total marks ----------

        if (
            totalMarks === "" ||
            totalMarks === null ||
            totalMarks === undefined
        ) {
            setNotice({
                type: "error",
                title: "Total marks required",
                message:
                    "Please enter the total marks for the examination."
            });
            return;
        }

        if (!Number.isFinite(totalMarksValue) || totalMarksValue <= 0) {
            setNotice({
                type: "error",
                title: "Invalid total marks",
                message:
                    "Total marks must be a number greater than 0."
            });
            return;
        }


        // ---------- Exam date ----------

        const hasStart = examStartDate || examDate;
        const hasEnd = examEndDateTime || examEndDate;

        if (!hasStart) {
            setNotice({
                type: "error",
                title: "Exam start date required",
                message:
                    "Please choose the start date of the examination."
            });
            return;
        }

        if (!hasEnd) {
            setNotice({
                type: "error",
                title: "Exam end time required",
                message:
                    "Please choose the end date/time of the examination."
            });
            return;
        }

        // Validate start < end
        const startVal = examStartDate || examDate;
        const endVal = examEndDateTime || examEndDate;

        // The end date cannot be a previous date. Compared on
        // the date only so today is always allowed. When editing,
        // an unchanged already-passed end date is still allowed so
        // finished exams can be updated.
        const endDateOnly = String(endVal).substring(0, 10);
        const endDateUnchanged =
            editingId && endDateOnly === originalEndDate;

        if (!endDateUnchanged && endDateOnly < todayInputValue) {
            setNotice({
                type: "error",
                title: "Invalid exam end date",
                message:
                    "The exam end date cannot be a previous date. Please choose today or a future date."
            });
            return;
        }

        if (endVal < startVal) {
            setNotice({
                type: "error",
                title: "Invalid exam times",
                message:
                    "Exam end time cannot be earlier than exam start time."
            });
            return;
        }

        // On creation the exam must still be running: an end
        // date/time already in the past would make it instantly
        // unavailable. When editing, a past end that is left
        // unchanged is allowed so finished exams can be updated.
        if (!editingId) {

            const endDateTime = toEndDateTime(endVal);

            if (
                endDateTime &&
                endDateTime.getTime() < Date.now()
            ) {
                setNotice({
                    type: "error",
                    title: "Invalid exam end time",
                    message:
                        "The exam end date/time cannot be in the past. Please choose today or a future date/time."
                });
                return;
            }

        }

        // ---------- Publish time (optional) ----------

        // The publish time is applied to the exam start date, so
        // a time that has already gone by would publish the exam
        // the instant the questions are complete. That is
        // rejected, unless it is the value already stored on the
        // exam being edited (a live/published exam).
        if (publishAt) {

            const publishDateTime = combineDateAndTime(
                startVal,
                publishAt
            );

            const publishUnchanged =
                editingId && publishAt === originalPublishAt;

            if (
                !publishUnchanged &&
                publishDateTime &&
                publishDateTime.getTime() < Date.now()
            ) {
                setNotice({
                    type: "error",
                    title: "Invalid publish time",
                    message:
                        "The publish time cannot be in the past. Choose a later time on the exam start date, or leave it blank to publish as soon as the questions are ready."
                });
                return;
            }

            const endDateTime = toEndDateTime(endVal);

            if (
                publishDateTime &&
                endDateTime &&
                publishDateTime.getTime() >
                    endDateTime.getTime()
            ) {
                setNotice({
                    type: "error",
                    title: "Invalid publish time",
                    message:
                        "The publish time must be on or before the exam end date/time."
                });
                return;
            }

        }

        try {

            setSaving(true);
            setError("");


            // ==================================
            // UPDATE EXISTING EXAM
            // ==================================

            if (editingId) {

                const response = await fetch(
                    `http://localhost:5000/api/exams/${editingId}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json",
                        },

                        body: JSON.stringify({
                            examName: examNameText,
                            description: descriptionText,
                            duration: durationValue,
                            totalMarks: totalMarksValue,
                            examDate: examStartDate || examDate,
                            examStartDateTime: examStartDate || examDate,
                            examEndDateTime: examEndDateTime || examEndDate,
                            examEndDate: (examEndDateTime || examEndDate || examStartDate || examDate || "").split('T')[0],
                            publishAt: publishAt || null,
                        }),
                    }
                );


                const data = await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to update exam"
                    );

                }


                // Update screen with database data
                setExams(
                    exams.map((exam) =>
                        exam._id === editingId
                            ? data.exam
                            : exam
                    )
                );


                const examDateLabel =
                    formatDate(
                        data.exam.examStartDateTime || data.exam.examDate
                    ) ||
                    "the scheduled date";

                const publishLabel = data.exam.publishTime
                    ? formatDateTime(data.exam.publishTime)
                    : "";

                setNotice({
                    type: "success",
                    title: "Exam updated",
                    message:
                        data.exam.isPublished
                            ? data.exam.isPublishPending && publishLabel
                                ? `The examination was updated successfully. Its questions are complete and it is scheduled to publish at ${publishLabel}.`
                                : data.exam.isUpcoming
                                ? `The examination was updated successfully. Its questions are complete and it will open to students on ${examDateLabel}.`
                                : "The examination was updated successfully. Its questions are complete, so it is available to students."
                            : `The examination was updated successfully, but it stays a draft. It becomes available to students only when its questions total exactly ${data.exam.totalMarks} marks.`
                });

            }

            // ==================================
            // CREATE NEW EXAM
            // ==================================

            else {

                const response = await fetch(
                    "http://localhost:5000/api/exams",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json",
                        },

                        body: JSON.stringify({
                            examName: examNameText,
                            description: descriptionText,
                            duration: durationValue,
                            totalMarks: totalMarksValue,
                            examDate: examStartDate || examDate,
                            examStartDateTime: examStartDate || examDate,
                            examEndDateTime: examEndDateTime || examEndDate,
                            examEndDate: (examEndDateTime || examEndDate || examStartDate || examDate || "").split('T')[0],
                            publishAt: publishAt || null,
                            createdDate:
                                new Date()
                                    .toISOString()
                                    .split("T")[0],
                        }),
                    }
                );


                const data = await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to create exam"
                    );

                }


                // Add database exam to screen
                setExams([
                    ...exams,
                    data.exam,
                ]);


                const createdDateLabel =
                    formatDate(
                        data.exam.examStartDateTime || data.exam.examDate
                    ) ||
                    "the scheduled date";

                setNotice({
                    type: "success",
                    title: "Exam created",
                    message:
                        `The examination was created successfully and is saved as a draft. Add questions until their total marks equal the exam total of ${data.exam.totalMarks} marks.` +
                        (data.exam.isUpcoming
                            ? ` It will open to students on ${createdDateLabel}.`
                            : " It will then be available to students.")
                });

            }


            clearForm();

        } catch (error) {

            console.error(
                "Error saving exam:",
                error
            );

            setError(
                error.message ||
                "Unable to save exam"
            );

        } finally {

            setSaving(false);

        }
    };


    // ==========================================
    // CLEAR FORM
    // ==========================================

    const clearForm = () => {

        setExamName("");
        setDescription("");
        setDuration(defaults.defaultExamDuration);
        setTotalMarks(defaults.defaultTotalMarks);
        setExamDate("");
        setExamStartDate("");
        setExamEndDateTime("");
        setExamEndDate("");
        setPublishAt("");
        setOriginalEndDate("");
        setOriginalPublishAt("");
        setEditingId(null);

    };


    // ==========================================
    // EDIT EXAM
    // ==========================================

    const handleEdit = (exam) => {

        setEditingId(exam._id);

        setExamName(
            exam.examName || ""
        );

        setDescription(
            exam.description || ""
        );

        setDuration(
            exam.duration || ""
        );

        setTotalMarks(
            exam.totalMarks || ""
        );

        // The start date is date-only now, so trim any time
        // that may be stored on older exams.
        setExamStartDate(
            String(exam.examStartDateTime || exam.examDate || "").substring(0, 10)
        );

        // The end date/time input needs a "YYYY-MM-DDTHH:mm"
        // value. Older records stored a plain date, so give
        // those a sensible end-of-day time.
        const endRaw = String(
            exam.examEndDateTime || exam.examEndDate || exam.examDate || ""
        );
        setExamEndDateTime(
            endRaw
                ? endRaw.includes('T')
                    ? endRaw.substring(0, 16)
                    : endRaw + 'T23:59'
                : ""
        );

        // Remember the stored end date so an already-passed
        // exam can be edited without changing that date.
        setOriginalEndDate(endRaw ? endRaw.substring(0, 10) : "");

        setExamDate(
            exam.examDate
                ? exam.examDate.substring(0, 10)
                : ""
        );
        setExamEndDate(
            exam.examEndDate
                ? exam.examEndDate.substring(0, 10)
                : exam.examDate
                ? exam.examDate.substring(0, 10)
                : ""
        );
        setPublishAt(toTimeValue(exam.publishAt));
        setOriginalPublishAt(toTimeValue(exam.publishAt));


        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });

    };


    // ==========================================
    // DELETE EXAM
    // ==========================================

    const handleDelete = async () => {

        if (!deleteTarget) {
            return;
        }

        const id = deleteTarget;

        try {

            setDeleting(true);

            const response = await fetch(
                `http://localhost:5000/api/exams/${id}`,
                {
                    method: "DELETE",
                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to delete exam"
                );

            }


            setExams(
                exams.filter(
                    (exam) =>
                        exam._id !== id
                )
            );


            setDeleteTarget(null);

            const hasCounts =
                data.deletedQuestions !== undefined ||
                data.deletedResults !== undefined;

            const deletedQuestions =
                Number(data.deletedQuestions) || 0;

            const deletedResults =
                Number(data.deletedResults) || 0;

            setNotice({
                type: "success",
                title: "Exam deleted",
                message: hasCounts
                    ? `The examination was deleted successfully, along with ${deletedQuestions} question${
                          deletedQuestions === 1 ? "" : "s"
                      } and ${deletedResults} student result${
                          deletedResults === 1 ? "" : "s"
                      }.`
                    : "The examination was deleted successfully, including its questions and student results."
            });


        } catch (error) {

            console.error(
                "Error deleting exam:",
                error
            );

            setDeleteTarget(null);

            setNotice({
                type: "error",
                title: "Delete failed",
                message:
                    error.message ||
                    "Unable to delete exam."
            });

        } finally {

            setDeleting(false);

        }

    };


    // Narrow the exam list down using the search box and the
    // status filter.
    const examSearchText = examSearch.trim().toLowerCase();

    const filteredExams = exams.filter((exam) => {

        const matchesSearch = (exam.examName || "")
            .toLowerCase()
            .includes(examSearchText);

        if (!matchesSearch) {
            return false;
        }

        if (statusFilter === "All") {
            return true;
        }

        return getExamStatus(exam) === statusFilter;

    });


    return (

        <AdminLayout
            active="exams"
            title="Exam Management"
            subtitle="Create and manage online examinations"
        >



                {/* PAGE TITLE */}

                <div className="page-title">

                    <div>

                        <h2>
                            {editingId
                                ? "Edit Examination"
                                : "Create New Examination"}
                        </h2>

                        <p>
                            {editingId
                                ? "Update the details of this examination."
                                : "Enter the details below to create a new examination."}
                        </p>

                    </div>


                    <div className="exam-count">

                        <span>
                            {exams.length}
                        </span>

                        <small>
                            Total Exams
                        </small>

                    </div>

                </div>


                {/* =================================
                    ERROR MESSAGE
                ================================= */}

                {error && (

                    <div className="dashboard-error">

                         {error}

                        <button onClick={fetchExams}>
                            Retry
                        </button>

                    </div>

                )}


                {/* =================================
                    EXAM FORM
                ================================= */}

                <section className="exam-form-card">


                    <div className="section-header">

                        <div className="section-icon">

                            {editingId
                                ? <EditIcon size={18} />
                                : <PlusIcon size={18} />}

                        </div>


                        <div>

                            <h3>

                                {editingId
                                    ? "Update Exam"
                                    : "Exam Details"}

                            </h3>

                            <p>
                                Fill in the information for
                                the examination.
                            </p>

                        </div>

                    </div>


                    <form
                        onSubmit={handleSubmit}
                    >

                        <div className="form-grid">


                            {/* EXAM NAME */}

                            <div className="input-group full-width">

                                <label>
                                    Exam Name
                                    <span>*</span>
                                </label>

                                <input
                                    type="text"
                                    placeholder="e.g. Data Structures and Algorithms"
                                    value={examName}
                                    maxLength={150}
                                    onChange={(e) =>
                                        setExamName(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>


                            {/* DESCRIPTION */}

                            <div className="input-group full-width">

                                <label>
                                    Description
                                    <span>*</span>
                                </label>

                                <textarea
                                    rows="4"
                                    placeholder="Enter a short description about the examination..."
                                    value={description}
                                    maxLength={1000}
                                    onChange={(e) =>
                                        setDescription(
                                            e.target.value
                                        )
                                    }
                                ></textarea>

                            </div>


                            {/* DURATION */}

                            <div className="input-group">

                                <label>
                                    Duration
                                    <span>*</span>
                                </label>

                                <div className="input-with-icon">

                                    <input
                                        type="number"
                                        min="1"
                                        max="1440"
                                        step="1"
                                        placeholder="60"
                                        value={duration}
                                        onChange={(e) =>
                                            setDuration(
                                                e.target.value
                                            )
                                        }
                                    />

                                    <span>
                                        minutes
                                    </span>

                                </div>

                            </div>


                            {/* TOTAL MARKS */}

                            <div className="input-group">

                                <label>
                                    Total Marks
                                    <span>*</span>
                                </label>

                                <div className="input-with-icon">

                                    <input
                                        type="number"
                                        min="1"
                                        max="100000"
                                        step="1"
                                        placeholder="100"
                                        value={totalMarks}
                                        onChange={(e) =>
                                            setTotalMarks(
                                                e.target.value
                                            )
                                        }
                                    />

                                    <span>
                                        marks
                                    </span>

                                </div>

                            </div>


                            {/* EXAM START DATE */}

                            <div className="input-group">

                                <label>
                                    Exam Start Date
                                    <span>*</span>
                                </label>

                                <input
                                    type="date"
                                    min={editingId ? undefined : todayInputValue}
                                    value={examStartDate}
                                    onChange={(e) =>
                                        setExamStartDate(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>

                            {/* EXAM END DATE & TIME */}

                            <div className="input-group">

                                <label>
                                    Exam End Date & Time
                                    <span>*</span>
                                </label>

                                <input
                                    type="datetime-local"
                                    min={editingId ? undefined : `${todayInputValue}T00:00`}
                                    value={examEndDateTime}
                                    onChange={(e) =>
                                        setExamEndDateTime(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>

                            {/* PUBLISH TIME (Optional) */}

                            <div className="input-group full-width">

                                <label>
                                    Publish Time (Optional)
                                </label>

                                <input
                                    type="time"
                                    value={publishAt}
                                    onChange={(e) =>
                                        setPublishAt(
                                            e.target.value
                                        )
                                    }
                                />
                                <small style={{ fontSize: '11px', color: '#666', marginTop: '4px', display: 'block' }}>
                                    The exam auto-publishes at this time on the exam start
                                    date once the questions are complete. It cannot be a
                                    time that has already passed. Leave blank to publish
                                    as soon as it is ready.
                                </small>

                            </div>

                        </div>


                        {/* FORM BUTTONS */}

                        <div className="form-actions">


                            {editingId && (

                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={clearForm}
                                >
                                    Cancel
                                </button>

                            )}


                            <button
                                type="submit"
                                className="save-exam-btn"
                                disabled={saving}
                            >

                                {saving
                                    ? "Saving..."
                                    : editingId
                                    ? (
                                        <>
                                            <EditIcon size={16} />
                                            Update Exam
                                        </>
                                    )
                                    : (
                                        <>
                                            <PlusIcon size={16} />
                                            Create Exam
                                        </>
                                    )}

                            </button>


                        </div>

                    </form>

                </section>


                {/* =================================
                    EXAM LIST
                ================================= */}

                <section className="exam-list-section">


                    <div className="list-header">

                        <div>

                            <h2>
                                All Examinations
                            </h2>

                            <p>
                                Manage your existing examinations
                            </p>

                        </div>


                        {exams.length > 0 && (

                            <span className="exam-badge">

                                {filteredExams.length}{" "}

                                {filteredExams.length === 1
                                    ? "Exam"
                                    : "Exams"}

                            </span>

                        )}

                    </div>


                    {/* SEARCH + STATUS FILTER */}

                    {!loading &&
                        exams.length > 0 && (

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
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="All">
                                        All Statuses
                                    </option>

                                    <option value="Published">
                                        Published
                                    </option>

                                    <option value="Scheduled">
                                        Scheduled
                                    </option>

                                    <option value="Coming Soon">
                                        Coming Soon
                                    </option>

                                    <option value="Ended">
                                        Ended
                                    </option>

                                    <option value="Draft">
                                        Draft
                                    </option>

                                    <option value="Publish Missed">
                                        Publish Missed
                                    </option>

                                </select>

                            </div>

                        )}


                    {/* LOADING */}

                    {loading ? (

                        <div className="empty-state">

                            <div className="empty-icon">
                                <ClockIcon size={28} />
                            </div>

                            <h3>
                                Loading examinations...
                            </h3>

                            <p>
                                Please wait while exams
                                are loaded from MongoDB.
                            </p>

                        </div>

                    ) : exams.length === 0 ? (

                        /* EMPTY */

                        <div className="empty-state">

                            <div className="empty-icon">
                                <ExamIcon size={28} />
                            </div>

                            <h3>
                                No examinations yet
                            </h3>

                            <p>
                                You haven't created any
                                examinations.
                                <br />
                                Use the form above to
                                create your first exam.
                            </p>

                        </div>

                    ) : filteredExams.length === 0 ? (

                        /* NO MATCHES */

                        <div className="empty-state">

                            <div className="empty-icon">
                                <SearchIcon size={28} />
                            </div>

                            <h3>
                                No matching examinations
                            </h3>

                            <p>
                                No examinations match your
                                search or filter. Try a
                                different name or status.
                            </p>

                        </div>

                    ) : (

                        /* EXAM CARDS */

                        <div className="exam-cards">

                            {filteredExams.map((exam) => {

                                const pendingPublish =
                                    exam.isPublishPending === true;

                                const publishMissed =
                                    exam.publishMissed === true;

                                const statusClass = publishMissed
                                    ? "exam-publish-status missed"
                                    : !exam.isPublished
                                    ? "exam-publish-status draft"
                                    : exam.isEnded
                                    ? "exam-publish-status ended"
                                    : exam.isUpcoming
                                    ? "exam-publish-status upcoming"
                                    : pendingPublish
                                    ? "exam-publish-status scheduled"
                                    : "exam-publish-status published";

                                const statusLabel =
                                    getExamStatus(exam);

                                const noteClass = publishMissed
                                    ? "exam-publish-note missed"
                                    : !exam.isPublished
                                    ? "exam-publish-note draft"
                                    : exam.isEnded
                                    ? "exam-publish-note ended"
                                    : exam.isUpcoming
                                    ? "exam-publish-note upcoming"
                                    : pendingPublish
                                    ? "exam-publish-note scheduled"
                                    : "exam-publish-note published";

                                let noteText;

                                if (publishMissed) {
                                    noteText = `Publish time reached (${
                                        formatDateTime(exam.publishTime) ||
                                        "the scheduled time"
                                    }) but ${
                                        exam.missedPublishReason ||
                                        "the exam is not ready"
                                    } — not available to students`;
                                } else if (!exam.isPublished) {
                                    noteText =
                                        exam.questionCount === 0
                                            ? "No questions added yet — not available to students"
                                            : `Questions total ${exam.questionsTotalMarks} of ${exam.totalMarks} marks — not available to students`;
                                } else if (exam.isEnded) {
                                    noteText = `Questions complete — exam ended on ${
                                        formatDateTime(
                                            exam.examEndDateTime ||
                                                exam.examEndDate
                                        ) || "the scheduled end date"
                                    }`;
                                } else if (exam.isUpcoming) {
                                    noteText = `Questions complete — opens to students from ${
                                        formatDateTime(
                                            exam.examStartDateTime ||
                                                exam.examDate
                                        ) || "the scheduled date"
                                    }`;
                                } else if (pendingPublish) {
                                    noteText = `Questions complete — scheduled to publish at ${
                                        formatDateTime(exam.publishTime) ||
                                        "the scheduled time"
                                    }`;
                                } else {
                                    noteText =
                                        "Questions complete — available to students";
                                }

                                return (

                                <div
                                    className="exam-card"
                                    key={exam._id}
                                >


                                    <div className="exam-card-top">

                                        <div className="exam-card-icon">
                                            <ExamIcon size={20} />
                                        </div>


                                        <div className="exam-card-info">

                                            <h3>
                                                {exam.examName}
                                            </h3>

                                            <p>
                                                {exam.description}
                                            </p>

                                        </div>


                                        <span
                                            className={statusClass}
                                        >
                                            {statusLabel}
                                        </span>

                                    </div>


                                    <div className="exam-details">


                                        <div>

                                            <span>
                                                <ClockIcon size={16} />
                                            </span>

                                            <strong>
                                                {exam.duration}
                                            </strong>

                                            <small>
                                                minutes
                                            </small>

                                        </div>


                                        <div>

                                            <span>
                                                <AwardIcon size={16} />
                                            </span>

                                            <strong>
                                                {exam.totalMarks}
                                            </strong>

                                            <small>
                                                marks
                                            </small>

                                        </div>


                                        <div>

                                            <span>
                                                <CalendarIcon size={16} />
                                            </span>

                                            <strong>
                                                {exam.examStartDateTime || exam.examDate
                                                    ? formatDateTime(
                                                        exam.examStartDateTime || exam.examDate
                                                    )
                                                    : ""}
                                                {(exam.examEndDateTime || exam.examEndDate)
                                                    ? ` to ${formatDateTime(
                                                        exam.examEndDateTime || exam.examEndDate
                                                    )}`
                                                    : ""}
                                            </strong>

                                            <small>
                                                exam window
                                            </small>

                                        </div>

                                    </div>


                                    <p
                                        className={noteClass}
                                    >
                                        {noteText}
                                    </p>


                                    <div className="exam-card-actions">


                                        <button
                                            className="edit-btn"
                                            onClick={() =>
                                                handleEdit(
                                                    exam
                                                )
                                            }
                                        >
                                            <EditIcon size={15} />
                                            Edit
                                        </button>


                                        <button
                                            className="delete-btn"
                                            onClick={() =>
                                                setDeleteTarget(
                                                    exam._id
                                                )
                                            }
                                        >
                                            <TrashIcon size={15} />
                                            Delete
                                        </button>


                                    </div>

                                </div>

                                );

                            })}

                        </div>

                    )}

                </section>


                {/* DELETE CONFIRM POPUP */}

                {deleteTarget && (
                    <ConfirmModal
                        title="Delete this exam?"
                        message="Deleting this exam will also permanently remove all of its questions and student results. This action cannot be undone."
                        confirmLabel="Yes, Delete"
                        cancelLabel="Cancel"
                        danger
                        busy={deleting}
                        onConfirm={handleDelete}
                        onCancel={() => setDeleteTarget(null)}
                    />
                )}


                {/* NOTICE POPUP */}

                <NoticeModal
                    notice={notice}
                    onClose={() => setNotice(null)}
                />

        </AdminLayout>

    );
}

export default ExamManagement;