const express = require("express");
const router = express.Router();

const Login = require("../model/loginmodel");
const User = require("../model/usermodel");
const Setting = require("../model/settingmodel");

const {
    isValidUsername,
    isValidPassword,
    validateProfileFields
} = require("../utils/validate");

// REGISTER
router.post("/register", async (req, res) => {
    try {
        // Respect the global "allow registration" preference
        const settings = await Setting.findOne({ key: "global" });
        if (settings && settings.allowRegistration === false) {
            return res.status(403).json({
                message: "New registrations are currently disabled"
            });
        }

        const {
            username,
            password,
            name,
            email,
            phoneNumber,
            gender
        } = req.body;

        if (
            !username ||
            !password ||
            !name ||
            !email ||
            !phoneNumber ||
            !gender
        ) {
            return res.status(400).json({
                message: "Please fill all fields"
            });
        }

        // Format checks that mirror the register form.
        if (!isValidUsername(username)) {
            return res.status(400).json({
                message:
                    "Username must be 3-30 characters using letters, numbers, dot, underscore or hyphen"
            });
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const profileErrors = validateProfileFields({
            name,
            email,
            phoneNumber,
            gender
        });

        if (profileErrors.length > 0) {
            return res.status(400).json({
                message: profileErrors[0]
            });
        }

        const existingLogin = await Login.findOne({ username });
        if (existingLogin) {
            return res.status(400).json({
                message: "Username already exists"
            });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({
                message: "Username already exists"
            });
        }

        const existingEmail = await User.findOne({
            email: String(email).toLowerCase()
        });
        if (existingEmail) {
            return res.status(400).json({
                message: "Email is already registered"
            });
        }

        const login = new Login({
            username,
            password,
            usertype: "Student"
        });
        await login.save();

        let user;
        try {
            user = await User.create({
                username,
                name,
                email,
                phoneNumber,
                gender,
                usertype: "Student"
            });
        } catch (profileError) {
            await Login.deleteOne({ _id: login._id });
            throw profileError;
        }

        res.status(201).json({
            message: "Account created successfully",
            user: user
        });
    } catch (error) {
        if (error && error.code === 11000) {
            return res.status(400).json({
                message: "Username or email already exists"
            });
        }
        res.status(500).json({
            message: "Error creating account",
            error: error.message
        });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const {
            username,
            password
        } = req.body;

        const loginUser = await Login.findOne({ username });
        if (!loginUser) {
            return res.status(401).json({
                message: "Invalid username or password"
            });
        }

        if (loginUser.password !== password) {
            return res.status(401).json({
                message: "Invalid username or password"
            });
        }

        let user = await User.findOne({ username });
        if (!user) {
            // Store a canonical usertype so the profile always sorts
            // into the correct list regardless of how the login account
            // was created.
            const usertype =
                String(loginUser.usertype).toLowerCase() === "admin"
                    ? "Admin"
                    : "Student";

            user = await User.create({
                username,
                name: username,
                email: `${username}@exampro.local`,
                phoneNumber: "N/A",
                gender: "Other",
                usertype: usertype
            });
        }

        res.status(200).json({
            message: "Login successful",
            usertype: loginUser.usertype,
            username: loginUser.username,
            userId: user._id
        });
    } catch (error) {
        res.status(500).json({
            message: "Login error",
            error: error.message
        });
    }
});

// CHECK USERNAME AVAILABILITY
// Used by the register form to tell the student, live, whether
// the username they typed is still free.
router.get("/check-username/:username", async (req, res) => {
    try {
        const username = String(req.params.username || "").trim();

        if (!username) {
            return res.status(400).json({
                available: false,
                message: "Username is required"
            });
        }

        const [existingLogin, existingUser] = await Promise.all([
            Login.findOne({ username }),
            User.findOne({ username })
        ]);

        const available = !existingLogin && !existingUser;

        return res.status(200).json({
            available: available,
            message: available
                ? "Username is available"
                : "Username is already taken"
        });
    } catch (error) {
        return res.status(500).json({
            available: false,
            message: "Error checking username",
            error: error.message
        });
    }
});

// UPDATE PASSWORD
router.put("/password", async (req, res) => {
    try {
        const { username, currentPassword, newPassword } = req.body;
        if (!username || !currentPassword || !newPassword) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (!isValidPassword(newPassword)) {
            return res.status(400).json({
                message: "New password must be at least 6 characters"
            });
        }

        const loginUser = await Login.findOne({ username });
        if (!loginUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (loginUser.password !== currentPassword) {
            return res.status(400).json({
                message: "Current password is incorrect"
            });
        }

        loginUser.password = newPassword;
        await loginUser.save();

        res.status(200).json({
            message: "Password updated successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating password",
            error: error.message
        });
    }
});

router.get("/", async (req, res) => {
    try {
        const users = await Login.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching login accounts",
            error: error.message
        });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const user = await Login.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({
                message: "Login account not found"
            });
        }
        res.status(200).json({
            message: "Login account deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting login account",
            error: error.message
        });
    }
});

module.exports = router;
