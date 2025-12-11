import { Router } from 'express';
import { fetchUsersController, loginController } from '../controllers/auth.controller.js';
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

    router.post('/login', loginController);
router.get('/', authMiddleware, fetchUsersController);

export default router;