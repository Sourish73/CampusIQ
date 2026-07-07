

"use strict";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { User } = require("../models");



const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};


const buildAuthResponse = (user, token) => ({
  token,
  user: {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    profile_data: user.profile_data || {},
    createdAt: user.createdAt,
  },
});

// ─── Controllers ──────────────────────────────────────────────────────────────


const register = async (req, res) => {
  try {
   
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        message: "Validation failed",
        errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }

    const { name, email, password } = req.body;

    
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

 
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });


    const token = signToken(newUser.id);
    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: buildAuthResponse(newUser, token),
    });
  } catch (error) {
    console.error("[AuthController.register]", error);
    return res.status(500).json({ success: false, message: "Registration failed. Please try again." });
  }
};


const login = async (req, res) => {
  try {
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        message: "Validation failed",
        errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }

    const { email, password } = req.body;

    const user = await User.scope("withPassword").findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

   
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }


    const token = signToken(user.id);
    return res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      data: buildAuthResponse(user, token),
    });
  } catch (error) {
    console.error("[AuthController.login]", error);
    return res.status(500).json({ success: false, message: "Login failed. Please try again." });
  }
};


const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    return res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    console.error("[AuthController.getMe]", error);
    return res.status(500).json({ success: false, message: "Could not fetch profile." });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const profileData = {
      name: req.body.name ?? "",
      address: req.body.address ?? "",
      marks10: req.body.marks10 ?? "",
      marks12: req.body.marks12 ?? "",
      schoolName: req.body.schoolName ?? "",
      dob: req.body.dob ?? "",
      email: req.body.email ?? user.email,
      age: req.body.age ?? "",
      location: req.body.location ?? "",
      dropper: req.body.dropper ?? "No",
      stream: req.body.stream ?? "PCM",
      mobile: req.body.mobile ?? "",
      preferredExam: req.body.preferredExam ?? "",
      preferredCollege: req.body.preferredCollege ?? "",
    };

    await user.update({ profile_data: profileData });
    await user.reload();

    return res.status(200).json({
      success: true,
      message: "Profile saved successfully.",
      data: { user },
    });
  } catch (error) {
    console.error("[AuthController.updateProfile]", error);
    return res.status(500).json({ success: false, message: "Could not save profile." });
  }
};

module.exports = { register, login, getMe, updateProfile };
