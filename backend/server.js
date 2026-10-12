const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const loginRoutes = require("./routes/loginRoutes");
const userRoutes = require("./routes/userRoutes");
const examRoutes = require("./routes/examRoutes");
const questionRoutes = require("./routes/questionRoutes");
const resultRoutes = require("./routes/resultRoutes");
const settingRoutes = require("./routes/settingRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// API Routes
app.use("/api/login", loginRoutes);
app.use("/api/users", userRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/settings", settingRoutes);

// MongoDB connection
mongoose
    .connect("mongodb://localhost:27017/examination")
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.log("MongoDB connection error!", err);
    });

// Home route
app.get("/", (req, res) => {
    res.send("Online Exam Management System Backend is running");
});

// Start server
app.listen(5000, () => {
    console.log("Server running on port 5000");
});