import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import NoticeModal from "../components/NoticeModal";
import ConfirmModal from "../components/ConfirmModal";
import {
    SearchIcon,
    TrashIcon,
    StudentsIcon,
    ClockIcon
} from "../components/Icons";

function StudentManagement() {

    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Popups
    const [notice, setNotice] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // =========================================
    // LOAD STUDENTS FROM MONGODB
    // =========================================
    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                "http://localhost:5000/api/users?usertype=Student"
            );

            if (!response.ok) {
                throw new Error("Failed to fetch students");
            }

            const data = await response.json();

            setStudents(data);
        } catch (error) {
            console.error("Error fetching students:", error);

            setError(
                "Unable to load students. Make sure the backend server is running."
            );
        } finally {
            setLoading(false);
        }
    };


    // =========================================
    // DELETE STUDENT
    // =========================================
    const handleDelete = async () => {

        if (!deleteTarget) {
            return;
        }

        const id = deleteTarget;

        try {

            setDeleting(true);

            const response = await fetch(
                `http://localhost:5000/api/users/${id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to delete student"
                );
            }

            // Remove deleted student from screen
            setStudents(
                students.filter(
                    (student) => student._id !== id
                )
            );

            setDeleteTarget(null);

            const deletedResults =
                Number(data.deletedResults) || 0;

            setNotice({
                type: "success",
                title: "Student deleted",
                message:
                    data.deletedResults !== undefined
                        ? `The student was deleted successfully, along with ${deletedResults} exam result${
                              deletedResults === 1 ? "" : "s"
                          }.`
                        : "The student was deleted successfully, including their exam results."
            });

        } catch (error) {

            console.error("Error deleting student:", error);

            setDeleteTarget(null);

            setNotice({
                type: "error",
                title: "Delete failed",
                message:
                    error.message ||
                    "Unable to delete student. Please try again."
            });

        } finally {

            setDeleting(false);

        }
    };


    // =========================================
    // SEARCH STUDENTS
    // =========================================
    const filteredStudents = students.filter((student) => {

        // Admin accounts are not students
        if (
            (student.usertype || "").toLowerCase() === "admin"
        ) {
            return false;
        }

        const searchText = search.toLowerCase();

        const name =
            student.name?.toLowerCase() || "";

        const email =
            student.email?.toLowerCase() || "";

        const phone =
            student.phoneNumber?.toString() || "";

        return (
            name.includes(searchText) ||
            email.includes(searchText) ||
            phone.includes(searchText)
        );
    });

    const totalStudents = students.filter(
        (student) =>
            (student.usertype || "").toLowerCase() !== "admin"
    ).length;


    return (

        <AdminLayout
            active="students"
            title="Student Management"
            subtitle="Manage registered students"
        >



                {/* PAGE TITLE */}
                <div className="student-page-title">

                    <div>

                        <h2>
                            Students
                        </h2>

                        <p>
                            View and manage all registered students.
                        </p>

                    </div>


                    <div className="student-count">
                        <StudentsIcon size={16} />
                        {totalStudents}{" "}
                        {totalStudents === 1
                            ? "Student"
                            : "Students"}
                    </div>

                </div>


                {/* =================================
                    SEARCH
                ================================= */}
                <div className="student-search-card">

                    <div className="student-search-icon">
                        <SearchIcon size={18} />
                    </div>

                    <input
                        type="text"
                        placeholder="Search students by name, email or phone..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                </div>


                {/* =================================
                    ERROR MESSAGE
                ================================= */}
                {error && (

                    <div className="dashboard-error">

                         {error}

                        <button onClick={fetchStudents}>
                            Retry
                        </button>

                    </div>

                )}


                {/* =================================
                    STUDENT TABLE
                ================================= */}
                <div className="student-table-card">


                    <div className="student-table-header">

                        <div>

                            <h3>
                                Registered Students
                            </h3>

                            <p>
                                {loading
                                    ? "Loading students..."
                                    : `${filteredStudents.length} student${
                                          filteredStudents.length !== 1
                                              ? "s"
                                              : ""
                                      } found`}
                            </p>

                        </div>

                    </div>


                    {/* LOADING */}
                    {loading ? (

                        <div className="student-empty-state">

                            <div className="student-empty-icon">
                                <ClockIcon size={28} />
                            </div>

                            <h3>
                                Loading students...
                            </h3>

                            <p>
                                Please wait while we fetch
                                students from the database.
                            </p>

                        </div>

                    ) : filteredStudents.length === 0 ? (

                        /* NO STUDENTS */
                        <div className="student-empty-state">

                            <div className="student-empty-icon">
                                <StudentsIcon size={28} />
                            </div>

                            <h3>
                                {students.length === 0
                                    ? "No students registered"
                                    : "No students found"}
                            </h3>

                            <p>
                                {students.length === 0
                                    ? "Registered students will appear here."
                                    : "No students match your search."}
                            </p>

                        </div>

                    ) : (

                        /* TABLE */
                        <div className="student-table-wrapper">

                            <table className="student-table">

                                <thead>

                                    <tr>

                                        <th>
                                            #
                                        </th>

                                        <th>
                                            Student
                                        </th>

                                        <th>
                                            Email
                                        </th>

                                        <th>
                                            Phone
                                        </th>

                                        <th>
                                            Gender
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredStudents.map(
                                        (student, index) => (

                                            <tr
                                                key={student._id}
                                            >

                                                {/* NUMBER */}
                                                <td>

                                                    <span className="student-number">
                                                        {index + 1}
                                                    </span>

                                                </td>


                                                {/* STUDENT */}
                                                <td>

                                                    <div className="student-name-cell">

                                                        <div className="student-avatar">

                                                            {student.name
                                                                ? student.name
                                                                      .charAt(0)
                                                                      .toUpperCase()
                                                                : "S"}

                                                        </div>


                                                        <div>

                                                            <strong>
                                                                {student.name ||
                                                                    "Unknown Student"}
                                                            </strong>

                                                            <small>
                                                                Student
                                                            </small>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* EMAIL */}
                                                <td>
                                                    {student.email ||
                                                        "N/A"}
                                                </td>


                                                {/* PHONE */}
                                                <td>
                                                    {student.phoneNumber ||
                                                        "N/A"}
                                                </td>


                                                {/* GENDER */}
                                                <td>

                                                    <span
                                                        className={`gender-badge ${
                                                            student.gender
                                                                ? student.gender.toLowerCase()
                                                                : "other"
                                                        }`}
                                                    >
                                                        {student.gender ||
                                                            "Not specified"}
                                                    </span>

                                                </td>


                                                {/* DELETE */}
                                                <td>

                                                    <button
                                                        className="student-delete-btn"
                                                        onClick={() =>
                                                            setDeleteTarget(
                                                                student._id
                                                            )
                                                        }
                                                    >
                                                        <TrashIcon size={15} />
                                                        Delete
                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

                {/* DELETE CONFIRM POPUP */}

                {deleteTarget && (
                    <ConfirmModal
                        title="Delete this student?"
                        message="Deleting this student will also remove their account and all of their exam results. This action cannot be undone."
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

export default StudentManagement;