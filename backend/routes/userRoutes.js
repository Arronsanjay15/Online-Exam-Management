const express = require("express");
const router = express.Router();

const User = require("../model/usermodel");
const Login = require("../model/loginmodel");

// Fields a profile is allowed to contain. This prevents a
// client from changing the username or escalating to Admin.
const PROFILE_FIELDS = [
    "name",
    "email",
    "phoneNumber",
    "gender"
];

function pickProfileFields(body) {
    const data = {};

    PROFILE_FIELDS.forEach((field) => {
        if (body[field] !== undefined) {
            data[field] = body[field];
        }
    });

    return data;
}

function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Builds a case-insensitive match for a usertype. Student profiles
// created before usertype was stored are also treated as students,
// otherwise legitimate students would silently disappear from the
// admin's student list.
function buildUsertypeFilter(usertype) {
    const type = String(usertype).trim();

    if (type.toLowerCase() === "student") {
        return {
            $or: [
                { usertype: { $regex: /^student$/i } },
                { usertype: { $exists: false } },
                { usertype: null }
            ]
        };
    }

    return {
        usertype: {
            $regex: new RegExp(`^${escapeRegex(type)}$`, "i")
        }
    };
}

// Create a user profile
router.post("/", async (req, res) => {
    try {
        const { username, usertype } = req.body;

        if (!username) {
            return res.status(400).json({
                message: "Username is required"
            });
        }

        const existing = await User.findOne({ username });
        if (existing) {
            return res.status(400).json({
                message: "A user with this username already exists"
            });
        }

        const user = new User({
            ...pickProfileFields(req.body),
            username,
            usertype: usertype || "Student"
        });

        const savedUser = await user.save();

        res.status(201).json({
            message: "User added successfully",
            user: savedUser
        });
    } catch (error) {
        if (error && error.code === 11000) {
            return res.status(400).json({
                message: "Username or email already exists"
            });
        }
        res.status(500).json({
            message: "Error adding user",
            error: error.message
        });
    }
});

// Get all users (optionally filtered by usertype)
router.get("/", async (req, res) => {
    try {
        const filter = {};

        if (req.query.usertype) {
            Object.assign(
                filter,
                buildUsertypeFilter(req.query.usertype)
            );
        }

        const users = await User.find(filter).sort({ name: 1 });

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching users",
            error: error.message
        });
    }
});

// Get a user by username (must be declared before /:id)
router.get("/username/:username", async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching user",
            error: error.message
        });
    }
});

// Get one user by id
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching user",
            error: error.message
        });
    }
});

// Update a profile (name, email, phone, gender only)
router.put("/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: pickProfileFields(req.body) },
            { returnDocument: "after", runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "User updated successfully",
            user: user
        });
    } catch (error) {
        if (error && error.code === 11000) {
            return res.status(400).json({
                message: "That email is already used by another account"
            });
        }
        res.status(500).json({
            message: "Error updating user",
            error: error.message
        });
    }
});

// Update a profile by username
router.put("/username/:username", async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { username: req.params.username },
            { $set: pickProfileFields(req.body) },
            { returnDocument: "after", runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "User updated successfully",
            user: user
        });
    } catch (error) {
        if (error && error.code === 11000) {
            return res.status(400).json({
                message: "That email is already used by another account"
            });
        }
        res.status(500).json({
            message: "Error updating user",
            error: error.message
        });
    }
});

// Delete a user and the matching login account
router.delete("/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Keep the login collection in sync so the account
        // cannot sign in again after being removed.
        await Login.deleteOne({ username: user.username });

        res.status(200).json({
            message: "User deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting user",
            error: error.message
        });
    }
});

module.exports = router;
