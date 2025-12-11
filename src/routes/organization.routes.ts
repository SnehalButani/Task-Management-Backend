import { Router } from 'express';
import { createOrganizationController } from '../controllers/organization.controller.js';
import { authMiddleware, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

router.post('/', authMiddleware, authorizeRoles('OWNER'), createOrganizationController);

export default router;