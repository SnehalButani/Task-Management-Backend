import { Router } from 'express';
import { createTaskController, getTasksController, getTaskByIdController, updateTaskController, deleteTaskController } from "../controllers/tasks.controller.js"
import { authMiddleware, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

router.post('/', authMiddleware, authorizeRoles('OWNER','MANAGER'), createTaskController);
router.get('/', authMiddleware, authorizeRoles('OWNER','MANAGER'), getTasksController);
router.get('/:id', authMiddleware, authorizeRoles('OWNER','MANAGER'), getTaskByIdController);
router.put('/:id', authMiddleware, authorizeRoles('OWNER','MANAGER','EMPLOYEE'), updateTaskController);
router.delete('/:id', authMiddleware, authorizeRoles('OWNER','MANAGER'), deleteTaskController);


export default router;