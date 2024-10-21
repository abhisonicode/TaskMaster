import Task from "../models/task.model.js";

// Get All Tasks
export const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong while fetching tasks", error });
  }
};

// Create Task
export const createTask = async (req, res) => {
  try {
    const { title, assignee, deadline, status } = req.body;
    const newTask = new Task({ title, assignee, deadline, status });
    await newTask.save();
    res
      .status(201)
      .json({ message: "Task created successfully!", task: newTask });
  } catch (error) {
    res.status(500).json({ message: " while creating task", error });
  }
};

// Update Task
export const updateTask = async (req, res) => {
  try {
    const { id } = req.query;
    const updatedTask = await Task.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    res
      .status(200)
      .json({ message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    res.status(500).json({ message: "Error while updating task", error });
  }
};

// Delete Task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.query;
    const delTask = await Task.findByIdAndDelete(id);
    console.log(delTask);
    if (!delTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    res
      .status(200)
      .json({ message: "Task deleted successfully", task: delTask });
  } catch (error) {
    res.status(500).json({ message: "Error while deleting task", error });
  }
};
