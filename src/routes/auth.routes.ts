import { Router } from 'express';
import { fetchUserDetailsController,  getRolesController,  loginController } from '../controllers/auth.controller.js';
import { authMiddleware, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

router.post('/login', loginController);
router.get('/', authMiddleware, fetchUserDetailsController);
router.get('/roles', getRolesController);

export default router;