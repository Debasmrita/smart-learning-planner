import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "../backend/authRoutes.js";
import topicRoutes from "../backend/topicRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/topics", topicRoutes);

if (!mongoose.connection.readyState) {
 await mongoose.connect(process.env.MONGO_URI);
}

export default app;