import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
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
    const [examDate, setExamDate] = useState("");

    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

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

        if (
            !examName ||
            !description ||
            !duration ||
            !totalMarks ||
            !examDate
        ) {
            alert("Please fill all fields");
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
                            examName,
                            description,
                            duration: Number(duration),
                            totalMarks: Number(totalMarks),
                            examDate,
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


                alert(
                    "Exam updated successfully"
                );

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
                            examName,
                            description,
                            duration: Number(duration),
                            totalMarks: Number(totalMarks),
                            examDate,
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


                alert(
                    "Exam added successfully"
                );

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

        setExamDate(
            exam.examDate
                ? exam.examDate.substring(0, 10)
                : ""
        );


        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });

    };


    // ==========================================
    // DELETE EXAM
    // ==========================================

    const handleDelete = async (id) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this exam?"
            );


        if (!confirmDelete) {
            return;
        }


        try {

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


            alert(
                "Exam deleted successfully"
            );


        } catch (error) {

            console.error(
                "Error deleting exam:",
                error
            );

            alert(
                "Unable to delete exam"
            );

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


                            {/* EXAM DATE */}

                            <div className="input-group">

                                <label>
                                    Exam Date
                                    <span>*</span>
                                </label>

                                <input
                                    type="date"
                                    value={examDate}
                                    onChange={(e) =>
                                        setExamDate(
                                            e.target.value
                                        )
                                    }
                                />

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
                                                {exam.examDate
                                                    ? exam.examDate.substring(
                                                          0,
                                                          10
                                                      )
                                                    : ""}
                                            </strong>

                                            <small>
                                                exam date
                                            </small>

                                        </div>

                                    </div>


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
                                                handleDelete(
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

        </AdminLayout>

    );
}

export default ExamManagement;