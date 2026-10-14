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
    TrashIcon
} from "../components/Icons";

function ExamManagement() {

    const [exams, setExams] = useState([]);

    const [examName, setExamName] = useState("");
    const [description, setDescription] = useState("");
    const [duration, setDuration] = useState("");
    const [totalMarks, setTotalMarks] = useState("");
    const [examDate, setExamDate] = useState(""); // legacy start date
    const [examStartDateTime, setExamStartDateTime] = useState("");
    const [examEndDateTime, setExamEndDateTime] = useState("");
    const [examEndDate, setExamEndDate] = useState(""); // legacy
    const [publishAt, setPublishAt] = useState("");

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

        const hasStart = examStartDateTime || examDate;
        const hasEnd = examEndDateTime || examEndDate;

        if (!hasStart) {
            setNotice({
                type: "error",
                title: "Exam start time required",
                message:
                    "Please choose the start date/time of the examination."
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
        const startVal = examStartDateTime || examDate;
        const endVal = examEndDateTime || examEndDate;
        if (endVal < startVal) {
            setNotice({
                type: "error",
                title: "Invalid exam times",
                message:
                    "Exam end time cannot be earlier than exam start time."
            });
            return;
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
                            examDate: examStartDateTime || examDate,
                            examStartDateTime: examStartDateTime || examDate,
                            examEndDateTime: examEndDateTime || examEndDate,
                            examEndDate: examEndDateTime ? examEndDateTime.split('T')[0] : examEndDate || (examStartDateTime || examDate).split('T')[0],
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
                    String(data.exam.examDate || "").substring(0, 10) ||
                    "the scheduled date";

                setNotice({
                    type: "success",
                    title: "Exam updated",
                    message:
                        data.exam.isPublished
                            ? data.exam.isUpcoming
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
                            examDate: examStartDateTime || examDate,
                            examStartDateTime: examStartDateTime || examDate,
                            examEndDateTime: examEndDateTime || examEndDate,
                            examEndDate: examEndDateTime ? examEndDateTime.split('T')[0] : examEndDate || (examStartDateTime || examDate).split('T')[0],
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
                    String(data.exam.examDate || "").substring(0, 10) ||
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
        setExamStartDateTime("");
        setExamEndDateTime("");
        setExamEndDate("");
        setPublishAt("");
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

        // Prefill with new datetime fields if available, else legacy
        setExamStartDateTime(
            exam.examStartDateTime || (exam.examDate && !exam.examDate.includes('T') ? exam.examDate + 'T00:00' : exam.examDate) || ""
        );
        setExamEndDateTime(
            exam.examEndDateTime || (exam.examEndDate && !exam.examEndDate.includes('T') ? exam.examEndDate + 'T23:59' : exam.examEndDate) || (exam.examDate && !exam.examDate.includes('T') ? exam.examDate + 'T23:59' : exam.examDate) || ""
        );
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
        setPublishAt(exam.publishAt || "");


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


                            {/* EXAM START DATE & TIME */}

                            <div className="input-group">

                                <label>
                                    Exam Start Date & Time
                                    <span>*</span>
                                </label>

                                <input
                                    type="datetime-local"
                                    value={examStartDateTime}
                                    onChange={(e) =>
                                        setExamStartDateTime(
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
                                    value={examEndDateTime}
                                    onChange={(e) =>
                                        setExamEndDateTime(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>

                            {/* PUBLISH AT (Optional) */}

                            <div className="input-group full-width">

                                <label>
                                    Publish At (Optional)
                                </label>

                                <input
                                    type="datetime-local"
                                    value={publishAt}
                                    onChange={(e) =>
                                        setPublishAt(
                                            e.target.value
                                        )
                                    }
                                />
                                <small style={{ fontSize: '11px', color: '#666', marginTop: '4px', display: 'block' }}>
                                    If questions not complete by this time, exam won't auto-publish.
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

                                {exams.length}{" "}

                                {exams.length === 1
                                    ? "Exam"
                                    : "Exams"}

                            </span>

                        )}

                    </div>


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

                    ) : (

                        /* EXAM CARDS */

                        <div className="exam-cards">

                            {exams.map((exam) => (

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
                                            className={
                                                exam.isPublished
                                                    ? exam.isEnded
                                                        ? "exam-publish-status ended"
                                                        : exam.isUpcoming
                                                        ? "exam-publish-status upcoming"
                                                        : "exam-publish-status published"
                                                    : "exam-publish-status draft"
                                            }
                                        >
                                            {exam.isPublished
                                                ? exam.isEnded
                                                    ? "Ended"
                                                    : exam.isUpcoming
                                                    ? "Coming Soon"
                                                    : "Published"
                                                : "Draft"}
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
                                                {exam.examStartDateTime
                                                    ? (String(exam.examStartDateTime).includes('T')
                                                        ? String(exam.examStartDateTime).substring(0, 16).replace('T', ' ')
                                                        : String(exam.examStartDateTime).substring(0, 10))
                                                    : exam.examDate
                                                    ? exam.examDate.substring(0, 10)
                                                    : ""}
                                                {(exam.examEndDateTime || exam.examEndDate)
                                                    ? ` to ${exam.examEndDateTime
                                                        ? (String(exam.examEndDateTime).includes('T')
                                                            ? String(exam.examEndDateTime).substring(0, 16).replace('T', ' ')
                                                            : String(exam.examEndDateTime).substring(0, 10))
                                                        : String(exam.examEndDate).substring(0, 10)}`
                                                    : ""}
                                            </strong>

                                            <small>
                                                exam window
                                            </small>

                                        </div>

                                    </div>


                                    <p
                                        className={
                                            exam.isPublished
                                                ? exam.isEnded
                                                    ? "exam-publish-note ended"
                                                    : exam.isUpcoming
                                                    ? "exam-publish-note upcoming"
                                                    : "exam-publish-note published"
                                                : "exam-publish-note draft"
                                        }
                                    >

                                        {exam.isPublished
                                            ? exam.isEnded
                                                ? `Questions complete — exam ended on ${
                                                      exam.examEndDateTime
                                                          ? (String(exam.examEndDateTime).includes('T')
                                                              ? String(exam.examEndDateTime).substring(0, 16).replace('T', ' ')
                                                              : String(exam.examEndDateTime).substring(0, 10))
                                                          : exam.examEndDate
                                                          ? String(exam.examEndDate).substring(0, 10)
                                                          : "the scheduled end date"
                                                  }`
                                                : exam.isUpcoming
                                                ? `Questions complete — opens to students from ${
                                                      exam.examStartDateTime
                                                          ? (String(exam.examStartDateTime).includes('T')
                                                              ? String(exam.examStartDateTime).substring(0, 16).replace('T', ' ')
                                                              : String(exam.examStartDateTime).substring(0, 10))
                                                          : exam.examDate
                                                          ? String(exam.examDate).substring(0, 10)
                                                          : "the scheduled date"
                                                  }`
                                                : "Questions complete — available to students"
                                            : exam.questionCount === 0
                                            ? "No questions added yet — not available to students"
                                            : `Questions total ${exam.questionsTotalMarks} of ${exam.totalMarks} marks — not available to students`}

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

                            ))}

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