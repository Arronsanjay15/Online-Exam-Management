import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import {
    ResultsIcon,
    CheckIcon,
    XIcon,
    SearchIcon,
    RefreshIcon,
    TrashIcon,
    ClockIcon,
    AwardIcon,
    AlertIcon
} from "../components/Icons";

function ResultManagement() {


    const [results, setResults] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // ==========================================
    // LOAD RESULTS
    // ==========================================

    useEffect(() => {

        fetchResults();

    }, []);


    const fetchResults = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await fetch(
                "http://localhost:5000/api/results"
            );

            const data = await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to load results"
                );

            }

            setResults(data);

        } catch (error) {

            console.error(
                "Result loading error:",
                error
            );

            setError(
                "Unable to load results. Make sure the backend is running."
            );

        } finally {

            setLoading(false);

        }

    };


    // ==========================================
    // DELETE RESULT
    // ==========================================

    const handleDelete = async (id) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this result?"
        );

        if (!confirmed) {
            return;
        }


        try {

            const response = await fetch(
                `http://localhost:5000/api/results/${id}`,
                {
                    method: "DELETE"
                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to delete result"
                );

            }


            setResults(
                previousResults =>
                    previousResults.filter(
                        result =>
                            result._id !== id
                    )
            );


        } catch (error) {

            console.error(error);

            alert(
                error.message ||
                "Unable to delete result."
            );

        }

    };


    // ==========================================
    // FILTER RESULTS
    // ==========================================

    const filteredResults = results.filter(
        (result) => {

            const studentName =
                result.userId?.name || "";

            const studentEmail =
                result.userId?.email || "";

            const examName =
                result.examId?.examName || "";


            const searchText =
                search.toLowerCase();


            const matchesSearch =
                studentName
                    .toLowerCase()
                    .includes(searchText) ||

                studentEmail
                    .toLowerCase()
                    .includes(searchText) ||

                examName
                    .toLowerCase()
                    .includes(searchText);


            const matchesStatus =
                statusFilter === "All" ||
                result.status === statusFilter;


            return (
                matchesSearch &&
                matchesStatus
            );

        }
    );


    // ==========================================
    // STATISTICS
    // ==========================================

    const totalResults =
        results.length;


    const passedResults =
        results.filter(
            result =>
                result.status === "Pass"
        ).length;


    const failedResults =
        results.filter(
            result =>
                result.status === "Fail"
        ).length;


    const averageScore =
        results.length > 0
            ? Math.round(
                results.reduce(
                    (sum, result) =>
                        sum +
                        Number(
                            result.percentage || 0
                        ),
                    0
                ) / results.length
            )
            : 0;


    // ==========================================
    // DATE
    // ==========================================

    const formatDate = (date) => {

        if (!date) {
            return "N/A";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "N/A";
        }

        return parsedDate.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    };


    return (

        <AdminLayout
            active="results"
            title="Result Management"
            subtitle="View and manage student examination results"
        >



                    {/* ERROR */}

                    {error && (

                        <div className="dashboard-error">

                            <span className="dashboard-error-text">
                                <AlertIcon size={16} />
                                {error}
                            </span>

                            <button onClick={fetchResults}>
                                Retry
                            </button>

                        </div>

                    )}


                    {/* =================================
                        STATISTICS
                    ================================= */}

                    <section className="result-stat-grid">


                        <div className="result-stat-card">

                            <div className="result-stat-icon blue">
                                <ResultsIcon size={22} />
                            </div>

                            <div>

                                <span>
                                    Total Results
                                </span>

                                <strong>
                                    {loading
                                        ? "..."
                                        : totalResults}
                                </strong>

                                <small>
                                    Exams completed
                                </small>

                            </div>

                        </div>


                        <div className="result-stat-card">

                            <div className="result-stat-icon green">
                                <CheckIcon size={22} />
                            </div>

                            <div>

                                <span>
                                    Passed
                                </span>

                                <strong>
                                    {loading
                                        ? "..."
                                        : passedResults}
                                </strong>

                                <small>
                                    Successful attempts
                                </small>

                            </div>

                        </div>


                        <div className="result-stat-card">

                            <div className="result-stat-icon red">
                                <XIcon size={22} />
                            </div>

                            <div>

                                <span>
                                    Failed
                                </span>

                                <strong>
                                    {loading
                                        ? "..."
                                        : failedResults}
                                </strong>

                                <small>
                                    Unsuccessful attempts
                                </small>

                            </div>

                        </div>


                        <div className="result-stat-card">

                            <div className="result-stat-icon purple">
                                <AwardIcon size={22} />
                            </div>

                            <div>

                                <span>
                                    Average Score
                                </span>

                                <strong>
                                    {loading
                                        ? "..."
                                        : `${averageScore}%`}
                                </strong>

                                <small>
                                    Overall average
                                </small>

                            </div>

                        </div>

                    </section>


                    {/* =================================
                        RESULTS CARD
                    ================================= */}

                    <section className="results-panel">


                        <div className="results-panel-header">

                            <div>

                                <h2>
                                    Examination Results
                                </h2>

                                <p>
                                    View and manage student examination results
                                </p>

                            </div>


                            <button
                                className="results-refresh-button"
                                onClick={
                                    fetchResults
                                }
                            >
                                <RefreshIcon size={16} />
                                Refresh
                            </button>

                        </div>


                        {/* SEARCH */}

                        <div className="results-toolbar">

                            <div className="results-search">

                                <span>
                                    <SearchIcon size={18} />
                                </span>

                                <input
                                    type="text"
                                    placeholder="Search student, email or examination..."
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>


                            <select
                                className="results-filter"
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(
                                        e.target.value
                                    )
                                }
                            >

                                <option value="All">
                                    All Results
                                </option>

                                <option value="Pass">
                                    Passed
                                </option>

                                <option value="Fail">
                                    Failed
                                </option>

                            </select>

                        </div>


                        {/* TABLE */}

                        <div className="results-table-wrapper">

                            {loading ? (

                                <div className="results-loading">

                                    <div className="loading-spinner">
                                        <ClockIcon size={28} />
                                    </div>

                                    <h3>
                                        Loading results...
                                    </h3>

                                    <p>
                                        Please wait.
                                    </p>

                                </div>

                            ) : filteredResults.length === 0 ? (

                                <div className="results-empty">

                                    <div>
                                        <ResultsIcon size={30} />
                                    </div>

                                    <h3>
                                        No results found
                                    </h3>

                                    <p>
                                        No examination results
                                        match your search.
                                    </p>

                                </div>

                            ) : (

                                <table className="results-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                STUDENT
                                            </th>

                                            <th>
                                                EXAMINATION
                                            </th>

                                            <th>
                                                SCORE
                                            </th>

                                            <th>
                                                PERCENTAGE
                                            </th>

                                            <th>
                                                STATUS
                                            </th>

                                            <th>
                                                SUBMITTED
                                            </th>

                                            <th>
                                                ACTION
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {filteredResults.map(
                                            (result) => {

                                                const studentName =
                                                    result.userId?.name ||
                                                    "Unknown Student";

                                                const studentEmail =
                                                    result.userId?.email ||
                                                    "No email";

                                                const examName =
                                                    result.examId?.examName ||
                                                    "Unknown Exam";

                                                const percentage =
                                                    Number(
                                                        result.percentage ||
                                                        0
                                                    );


                                                return (

                                                    <tr
                                                        key={
                                                            result._id
                                                        }
                                                    >


                                                        {/* STUDENT */}

                                                        <td>

                                                            <div className="result-student">

                                                                <div className="result-student-avatar">

                                                                    {studentName
                                                                        .charAt(0)
                                                                        .toUpperCase()}

                                                                </div>


                                                                <div>

                                                                    <strong>
                                                                        {studentName}
                                                                    </strong>

                                                                    <small>
                                                                        {studentEmail}
                                                                    </small>

                                                                </div>

                                                            </div>

                                                        </td>


                                                        {/* EXAM */}

                                                        <td>

                                                            <strong className="result-exam-name">
                                                                {examName}
                                                            </strong>

                                                        </td>


                                                        {/* SCORE */}

                                                        <td>

                                                            <strong className="result-score">
                                                                {result.score}
                                                            </strong>

                                                            <span className="result-score-total">
                                                                {" "}
                                                                /{" "}
                                                                {result.totalMarks}
                                                            </span>

                                                        </td>


                                                        {/* PERCENTAGE */}

                                                        <td>

                                                            <div className="percentage-cell">

                                                                <div className="percentage-bar">

                                                                    <div
                                                                        className="percentage-fill"
                                                                        style={{
                                                                            width:
                                                                                `${Math.min(
                                                                                    percentage,
                                                                                    100
                                                                                )}%`
                                                                        }}
                                                                    />

                                                                </div>

                                                                <strong>
                                                                    {percentage}%
                                                                </strong>

                                                            </div>

                                                        </td>


                                                        {/* STATUS */}

                                                        <td>

                                                            <span
                                                                className={
                                                                    `result-status ${
                                                                        result.status ===
                                                                        "Pass"
                                                                            ? "pass"
                                                                            : "fail"
                                                                    }`
                                                                }
                                                            >

                                                                {result.status ===
                                                                "Pass"
                                                                    ? <CheckIcon size={14} />
                                                                    : <XIcon size={14} />}

                                                                {" "}

                                                                {result.status}

                                                            </span>

                                                        </td>


                                                        {/* DATE */}

                                                        <td>

                                                            <span className="result-date">
                                                                {formatDate(
                                                                    result.submittedAt
                                                                )}
                                                            </span>

                                                        </td>


                                                        {/* ACTION */}

                                                        <td>

                                                            <button
                                                                className="delete-result-button"
                                                                title="Delete result"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        result._id
                                                                    )
                                                                }
                                                            >
                                                                <TrashIcon size={15} />
                                                            </button>

                                                        </td>

                                                    </tr>

                                                );

                                            }
                                        )}

                                    </tbody>

                                </table>

                            )}

                        </div>


                        {/* FOOTER */}

                        {!loading &&
                            filteredResults.length > 0 && (

                                <div className="results-panel-footer">

                                    <span>
                                        Showing{" "}
                                        <strong>
                                            {filteredResults.length}
                                        </strong>{" "}
                                        of{" "}
                                        <strong>
                                            {results.length}
                                        </strong>{" "}
                                        results
                                    </span>

                                    <span>
                                        Average score:{" "}
                                        <strong>
                                            {averageScore}%
                                        </strong>
                                    </span>

                                </div>

                            )}

                    </section>

        </AdminLayout>

    );
}

export default ResultManagement;