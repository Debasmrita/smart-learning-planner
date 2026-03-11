import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Student from "./StudentModel.js";
import { JWT_SECRET } from "./config.js";
import { protect } from "./middleware/authMiddleware.js";

const router = express.Router();

/* =======================================================
   REGISTER
======================================================= */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const cleanEmail = email.toLowerCase();

    const existing = await Student.findOne({ email: cleanEmail });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await Student.create({
      name,
      email: cleanEmail,
      password: hashedPassword,
    });

    res.json({
      message: "Student registered successfully",
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
      },
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =======================================================
   LOGIN
======================================================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email & password required" });

    const cleanEmail = email.toLowerCase();

    const student = await Student.findOne({ email: cleanEmail });

    if (!student)
      return res.status(400).json({ message: "Student not found" });

    const isMatch = await bcrypt.compare(password, student.password);

    if (!isMatch)
      return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: student._id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
      },
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =======================================================
   GET CURRENT USER (Protected)
======================================================= */
router.get("/me", protect, async (req, res) => {
  try {

    const student = await Student
      .findById(req.student.id)
      .select("-password");

    if (!student)
      return res.status(404).json({ message: "Student not found" });

    res.json(student);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =======================================================
   UPDATE PROFILE (Protected)
======================================================= */
router.put("/update-profile", protect, async (req, res) => {
  try {

    const { name } = req.body;

    if (!name)
      return res.status(400).json({ message: "Name is required" });

    const student = await Student.findById(req.student.id);

    if (!student)
      return res.status(404).json({ message: "Student not found" });

    student.name = name;

    await student.save();

    res.json({
      message: "Profile updated successfully",
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
      },
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =======================================================
   UPDATE PASSWORD (Protected)
======================================================= */
router.put("/update-password", protect, async (req, res) => {
  try {

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "All fields required" });

    const student = await Student.findById(req.student.id);

    if (!student)
      return res.status(404).json({ message: "Student not found" });

    const isMatch = await bcrypt.compare(
      currentPassword,
      student.password
    );

    if (!isMatch)
      return res.status(400).json({ message: "Current password incorrect" });

    student.password = await bcrypt.hash(newPassword, 10);

    await student.save();

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =======================================================
   FORGOT PASSWORD
======================================================= */
router.post("/forgot-password", async (req, res) => {
  try {

    const { email } = req.body;

    if (!email)
      return res.status(400).json({ message: "Email required" });

    const cleanEmail = email.toLowerCase();

    const student = await Student.findOne({ email: cleanEmail });

    if (!student)
      return res.status(400).json({ message: "Student not found" });

    res.json({ message: "Student verified. Now reset password." });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =======================================================
   RESET PASSWORD
======================================================= */
router.post("/reset-password", async (req, res) => {
  try {

    const { email, newPassword } = req.body;

    if (!email || !newPassword)
      return res.status(400).json({ message: "Email & newPassword required" });

    const cleanEmail = email.toLowerCase();

    const student = await Student.findOne({ email: cleanEmail });

    if (!student)
      return res.status(400).json({ message: "Student not found" });

    student.password = await bcrypt.hash(newPassword, 10);

    await student.save();

    res.json({ message: "Password reset successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;