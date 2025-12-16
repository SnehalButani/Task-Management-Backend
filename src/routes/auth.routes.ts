import { Router } from 'express';
import { changePasswordController, deleteAuthUserController, fetchUserDetailsController,  getRolesController,  loginController, updateUserController } from '../controllers/auth.controller.js';
import { authMiddleware, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

router.post('/login', loginController);
router.get('/', authMiddleware, fetchUserDetailsController);
router.get('/roles', getRolesController);
router.delete('/:userId', authMiddleware, authorizeRoles('OWNER', 'MANAGER'), deleteAuthUserController);
router.post('/change-password', authMiddleware, changePasswordController);
router.put('/update', authMiddleware, updateUserController);

export default router;