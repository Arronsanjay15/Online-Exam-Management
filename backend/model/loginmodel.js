const mongoose = require("mongoose");

const loginSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  password: {
    type: String,
    required: true
  },

  usertype: {
    type: String,
    required: true
  }
});

const Login = mongoose.model("Login", loginSchema);

module.exports = Login;