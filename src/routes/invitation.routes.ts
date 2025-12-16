import { Router } from 'express';
import { acceptInviteController, inviteEmployeeController } from '../controllers/invitation.controller.js';
import { authMiddleware, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

router.post('/', authMiddleware, authorizeRoles('OWNER', 'MANAGER'), inviteEmployeeController);
router.get('/accept/:token', acceptInviteController);


export default router;