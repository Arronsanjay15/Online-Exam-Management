const express = require("express");
const router = express.Router();

const Setting = require("../model/settingmodel");

// =============================================
// SETTINGS
// Reads and writes the single global settings
// document used by the whole application.
// =============================================

const DEFAULTS = {
    key: "global",
    passingPercentage: 40,
    defaultExamDuration: 60,
    defaultTotalMarks: 100,
    allowRegistration: true
};

// Helper - always return a settings document
async function getSettings() {
    let settings = await Setting.findOne({ key: "global" });

    if (!settings) {
        settings = await Setting.create(DEFAULTS);
    }

    return settings;
}

// Get current settings
router.get("/", async (req, res) => {
    try {
        const settings = await getSettings();
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching settings",
            error: error.message
        });
    }
});

// Update settings
router.put("/", async (req, res) => {
    try {
        const {
            passingPercentage,
            defaultExamDuration,
            defaultTotalMarks,
            allowRegistration
        } = req.body;

        const update = {};

        if (passingPercentage !== undefined) {
            const value = Number(passingPercentage);
            if (Number.isNaN(value) || value < 0 || value > 100) {
                return res.status(400).json({
                    message: "Passing percentage must be between 0 and 100"
                });
            }
            update.passingPercentage = value;
        }

        if (defaultExamDuration !== undefined) {
            const value = Number(defaultExamDuration);
            if (Number.isNaN(value) || value < 1) {
                return res.status(400).json({
                    message: "Default duration must be at least 1 minute"
                });
            }
            update.defaultExamDuration = value;
        }

        if (defaultTotalMarks !== undefined) {
            const value = Number(defaultTotalMarks);
            if (Number.isNaN(value) || value < 1) {
                return res.status(400).json({
                    message: "Default total marks must be at least 1"
                });
            }
            update.defaultTotalMarks = value;
        }

        if (allowRegistration !== undefined) {
            update.allowRegistration = Boolean(allowRegistration);
        }

        const settings = await Setting.findOneAndUpdate(
            { key: "global" },
            { $set: update },
            { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({
            message: "Settings updated successfully",
            settings: settings
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating settings",
            error: error.message
        });
    }
});

module.exports = router;
