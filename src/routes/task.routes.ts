import { Router } from 'express';
import { createTaskController, getTasksController, getTaskByIdController, updateTaskController, deleteTaskController, getOrgEmpolyeeController } from "../controllers/tasks.controller.js"
import { authMiddleware, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

router.post('/', authMiddleware, authorizeRoles('OWNER','MANAGER'), createTaskController);
router.get('/org/:orgId', authMiddleware, authorizeRoles('OWNER','MANAGER', 'EMPLOYEE'), getTasksController);
router.get('/org/:orgId/employees', authMiddleware, authorizeRoles('OWNER','MANAGER'), getOrgEmpolyeeController);
router.get('/:taskId', authMiddleware, authorizeRoles('OWNER','MANAGER','EMPLOYEE'), getTaskByIdController);
router.put('/:taskId', authMiddleware, authorizeRoles('OWNER','MANAGER','EMPLOYEE'), updateTaskController);
router.delete('/:taskId', authMiddleware, authorizeRoles('OWNER','MANAGER'), deleteTaskController);


export default router;
