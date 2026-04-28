import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    name: { type: String, required: true },

    priority: { type: Number, default: 3 }, // 3=High,2=Medium,1=Low
    done: { type: Boolean, default: false },

    createdAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Topic", topicSchema);
