import { Router } from 'express';
import { fetchUserDetailsController,  loginController } from '../controllers/auth.controller.js';
import { authMiddleware, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

router.post('/login', loginController);
router.get('/', authMiddleware, fetchUserDetailsController);

export default router;