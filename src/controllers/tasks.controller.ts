import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createTaskService, getTasksService, getTaskByIdService, updateTaskService, deleteTaskService, TaskData } from "../services/tasks.service.js";

export const createTaskController = asyncHandler(async (req: Request, res: Response) => {
    const task: TaskData = { ...req.body, created_by: req.user.id };
    const newTask = await createTaskService(task);
    res.status(201).json({ success: true, message: "Task created successfully" });
});


export const getTasksController = asyncHandler(async (req: Request, res: Response) => {
    const org_id = req.query.org_id as string;
    const tasks = await getTasksService(org_id);
    res.json({ success: true, data: tasks });
});


export const getTaskByIdController = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;
    const task = await getTaskByIdService(id);
    res.json({ success: true, data: task });
});

export const updateTaskController = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;
    const updates = req.body;
    const updatedTask = await updateTaskService(id, updates);
    res.json({ success: true, message: "Task updated successfully" });
});

export const deleteTaskController = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;
    const deletedTask = await deleteTaskService(id);
    res.json({ success: true, message: "Task deleted successfully" });
});
