import express from "express";
import {
  createTask,
  deleteTask,
  getAllTasks,
  updateTask,
} from "../controllers/tasks.controller.js";

const router = express.Router();

router.get("/getalltasks", getAllTasks);
router.post("/create", createTask);
router.post("/update", updateTask);
router.delete("/delete", deleteTask);

export default router;
