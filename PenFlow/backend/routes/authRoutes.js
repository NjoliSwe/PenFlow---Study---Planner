const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/signup", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "Please fill in all fields"
      });
    }
    const emailPattern =
/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailPattern.test(email.toLowerCase())) {
  return res.status(400).json({
    message: "Please enter a valid email"
  });
}

const passwordPattern =
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-+=/\\[\];'`~]).{8,}$/;

if (!passwordPattern.test(password)) {
  return res.status(400).json({
    message: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
  });
}

    const existingUser = await User.findOne({
      email: email.toLowerCase()
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    const user = new User({
      fullName,
      email: email.toLowerCase(),
      password
    });

    await user.save();

    res.status(201).json({
      message: "Account created successfully",
      user
    });
  } catch (error) {
    console.log("Signup error:", error);

    res.status(500).json({
      message: "Signup failed. Please try again."
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter email and password"
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      password
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    res.json({
      message: "Login successful",
      user
    });
  } catch (error) {
    console.log("Login error:", error);

    res.status(500).json({
      message: "Login failed. Please try again."
    });
  }
});

module.exports = router;