import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createTaskService, getTasksService, getTaskByIdService, updateTaskService, deleteTaskService, TaskData, getOrgEmployeeService } from "../services/tasks.service.js";

export const createTaskController = asyncHandler(async (req: Request, res: Response) => {
    const task: TaskData = { ...req.body, created_by: req.user.id };
    const newTask = await createTaskService(task);
    res.status(201).json({ success: true, message: "Task created successfully" });
});

export const getOrgEmpolyeeController = asyncHandler(
  async (req: any, res: Response) => {
    const { orgId } = req.params;
    const { role, id } = req.user; 

    const data = await getOrgEmployeeService(
      orgId,
      role,
      id
    );

    res.status(200).json({
      success: true,
      data,
    });
  }
);
 
export const getTasksController = asyncHandler(async (req: Request, res: Response) => {
    const orgId = req.params.orgId as string;
    const tasks = await getTasksService(orgId);
    res.json({ success: true, data: tasks });
});


export const getTaskByIdController = asyncHandler(async (req: Request, res: Response) => {
    const taskId = req.params.taskId;
    const task = await getTaskByIdService(taskId);
    res.json({ success: true, data: task });
});

export const updateTaskController = asyncHandler(async (req: Request, res: Response) => {
    const taskId = req.params.taskId;
    const updates = req.body;
    const updatedTask = await updateTaskService(taskId, updates);
    res.json({ success: true, message: "Task updated successfully" });
});

export const deleteTaskController = asyncHandler(async (req: Request, res: Response) => {
    const taskId = req.params.taskId;
    const deletedTask = await deleteTaskService(taskId);
    res.json({ success: true, message: deletedTask.message });
});
