import bcrypt from 'bcryptjs';
import User from "../models/User.js"
import { Router } from "express";

const router = Router();

// @route   POST api/auth/signup
router.post("/signup", async (req, res) => {
    const { name, email, password, confirmPassword} = req.body;

  try {
    // Validate required fields
    if (!name || !email  || !password ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    // Check if user exists
    const normalizedEmail = email.trim().toLowerCase();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (matches your User model)
    const user = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email: email?.trim().toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = user.password ? await bcrypt.compare(password, user.password) : false;
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Select user data to send (exclude password)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    req.logIn(user, (error) => {
      if (error) return res.status(500).json({ message: "Could not start login session" });
      res.json({ message: "Login successful", user: userResponse });
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router
