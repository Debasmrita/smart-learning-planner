import express from "express";
import Topic from "./TopicModel.js";
import { protect } from "./middleware/authMiddleware.js";

const router = express.Router();

/**
 * ✅ GET all topics for logged in student
 */
router.get("/", protect, async (req, res) => {
  try {
    const topics = await Topic.find({ studentId: req.student.id }).sort({
      priority: -1,
      createdAt: -1,
    });

    res.json(topics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * ✅ ADD new topic
 */
router.post("/", protect, async (req, res) => {
  try {
    const { name, priority } = req.body;

    if (!name) return res.status(400).json({ message: "Topic name required" });

    const newTopic = await Topic.create({
      studentId: req.student.id,
      name,
      priority: Number(priority) || 3,
      done: false,
      completedAt: null,
    });

    res.json({ message: "Topic added ✅", topic: newTopic });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * ✅ UPDATE topic (edit name or priority)
 */
router.put("/:id", protect, async (req, res) => {
  try {
    const { name, priority } = req.body;

    const topic = await Topic.findOne({
      _id: req.params.id,
      studentId: req.student.id,
    });

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    if (name !== undefined) topic.name = name;
    if (priority !== undefined) topic.priority = Number(priority);

    await topic.save();

    res.json({
      message: "Topic updated ✏️",
      topic,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * ✅ MARK DONE
 */
router.put("/:id/done", protect, async (req, res) => {
  try {
    const topic = await Topic.findOne({
      _id: req.params.id,
      studentId: req.student.id,
    });

    if (!topic) return res.status(404).json({ message: "Topic not found" });

    topic.done = true;
    topic.completedAt = new Date();
    await topic.save();

    res.json({ message: "Marked done ✅", topic });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * ✅ UNDO DONE
 */
router.put("/:id/undo", protect, async (req, res) => {
  try {
    const topic = await Topic.findOne({
      _id: req.params.id,
      studentId: req.student.id,
    });

    if (!topic) return res.status(404).json({ message: "Topic not found" });

    topic.done = false;
    topic.completedAt = null;
    await topic.save();

    res.json({ message: "Undo successful ✅", topic });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * ✅ MISSED (priority increase)
 */
router.put("/:id/missed", protect, async (req, res) => {
  try {
    const topic = await Topic.findOne({
      _id: req.params.id,
      studentId: req.student.id,
    });

    if (!topic) return res.status(404).json({ message: "Topic not found" });

    topic.priority = topic.priority + 1;
    await topic.save();

    res.json({ message: "Plan adjusted! Priority increased. ⚡", topic });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * ✅ DELETE topic
 */
router.delete("/:id", protect, async (req, res) => {
  try {
    const topic = await Topic.findOneAndDelete({
      _id: req.params.id,
      studentId: req.student.id,
    });

    if (!topic) return res.status(404).json({ message: "Topic not found" });

    res.json({ message: "Deleted successfully 🗑️" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * ✅ GET STUDY PROGRESS
 */
router.get("/progress", protect, async (req, res) => {
  try {

    const total = await Topic.countDocuments({
      studentId: req.student.id
    });

    const completed = await Topic.countDocuments({
      studentId: req.student.id,
      done: true
    });

    const pending = total - completed;

    const percentage =
      total === 0 ? 0 : Math.round((completed / total) * 100);

    res.json({
      total,
      completed,
      pending,
      percentage
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * ✅ NEXT TOPIC TO STUDY
 */
router.get("/next", protect, async (req, res) => {
  try {

    const topic = await Topic.findOne({
      studentId: req.student.id,
      done: false
    })
      .sort({ priority: -1, createdAt: 1 });

    if (!topic) {
      return res.json({
        message: "All topics completed 🎉"
      });
    }

    res.json({
      message: "Next topic to study",
      topic
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
