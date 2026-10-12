import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ExamManagement from "./pages/ExamManagement";
import QuestionManagement from "./pages/QuestionManagement";
import StudentManagement from "./pages/StudentManagement";
import ResultManagement from "./pages/ResultManagement";
import ExamPage from "./pages/ExamPage";
import ResultPage from "./pages/ResultPage";
import StudentSettings from "./pages/StudentSettings";
import AdminSettings from "./pages/AdminSettings";


function App() {

    return (

        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/admin-dashboard"
                    element={<AdminDashboard />}
                />

                <Route
                    path="/student-dashboard"
                    element={<StudentDashboard />}
                />

                <Route
                    path="/exam-management"
                    element={<ExamManagement />}
                />

                <Route
                    path="/question-management"
                    element={<QuestionManagement />}
                />

                <Route
                    path="/student-management"
                    element={<StudentManagement />}
                />

                <Route
                    path="/result-management"
                    element={<ResultManagement />}
                />

                <Route
                    path="/exam/:examId"
                    element={<ExamPage />}
                />

                <Route
                    path="/result/:id"
                    element={<ResultPage />}
                />

                <Route
                    path="/student-settings"
                    element={<StudentSettings />}
                />

                <Route
                    path="/admin-settings"
                    element={<AdminSettings />}
                />

            </Routes>

        </BrowserRouter>

    );
}

export default App;