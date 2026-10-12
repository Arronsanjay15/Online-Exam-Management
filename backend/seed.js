// =============================================
// SEED SCRIPT
// Creates the default Admin account in the
// database. All other users are created from
// the Register (Create Account) page.
//
// Run:  npm run seed
// =============================================

const mongoose = require("mongoose");

const Login = require("./model/loginmodel");
const User = require("./model/usermodel");
const Setting = require("./model/settingmodel");

const MONGO_URI = "mongodb://localhost:27017/examination";

// ADMIN CREDENTIALS
const ADMIN = {
    username: "admin",
    password: "admin@123",
    usertype: "Admin",

    name: "Administrator",
    email: "admin@exampro.com",
    phoneNumber: "9000000000",
    gender: "Other"
};


async function seed() {

    try {

        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");


        // ----------------------------------------
        // 1. ADMIN LOGIN ACCOUNT
        // ----------------------------------------

        const existingLogin = await Login.findOne({
            username: ADMIN.username
        });


        if (existingLogin) {

            existingLogin.password = ADMIN.password;
            existingLogin.usertype = ADMIN.usertype;
            await existingLogin.save();

            console.log("Admin login already existed -> updated");

        } else {

            await Login.create({
                username: ADMIN.username,
                password: ADMIN.password,
                usertype: ADMIN.usertype
            });

            console.log("Admin login account created");

        }


        // ----------------------------------------
        // 2. ADMIN USER PROFILE
        // ----------------------------------------

        const existingUser = await User.findOne({
            username: ADMIN.username
        });


        if (existingUser) {

            existingUser.name = ADMIN.name;
            existingUser.email = ADMIN.email;
            existingUser.phoneNumber = ADMIN.phoneNumber;
            existingUser.gender = ADMIN.gender;
            existingUser.usertype = ADMIN.usertype;
            await existingUser.save();

            console.log("Admin user profile already existed -> updated");

        } else {

            await User.create({
                username: ADMIN.username,
                name: ADMIN.name,
                email: ADMIN.email,
                phoneNumber: ADMIN.phoneNumber,
                gender: ADMIN.gender,
                usertype: ADMIN.usertype
            });

            console.log("Admin user profile created");

        }


        // ----------------------------------------
        // 3. GLOBAL SETTINGS
        // ----------------------------------------

        await Setting.findOneAndUpdate(
            { key: "global" },
            {
                $setOnInsert: {
                    key: "global",
                    passingPercentage: 40,
                    defaultExamDuration: 60,
                    defaultTotalMarks: 100,
                    allowRegistration: true
                }
            },
            { returnDocument: "after", upsert: true }
        );

        console.log("Global settings ready");


        console.log("----------------------------------------");
        console.log("Seed completed successfully.");
        console.log("Admin credentials:");
        console.log("  Username : " + ADMIN.username);
        console.log("  Password : " + ADMIN.password);
        console.log("----------------------------------------");

    } catch (error) {

        console.error("Seed failed:", error);
        process.exitCode = 1;

    } finally {

        await mongoose.disconnect();

    }

}


seed();
