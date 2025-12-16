import { Router } from 'express';
import { createOrganizationController, softDeleteOrganizationController, getAllOrganizationsController, getOrganizationByIdController, getOrgTeamMembersController, softDeleteEmployeeController, updateOrganizationController } from '../controllers/organization.controller.js';
import { authMiddleware, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

router.post('/', authMiddleware, authorizeRoles('OWNER'), createOrganizationController);
router.get("/", authMiddleware, getAllOrganizationsController);
router.get("/:orgId", authMiddleware, getOrganizationByIdController);
router.put("/:orgId", authMiddleware, authorizeRoles('OWNER'), updateOrganizationController);
router.delete("/:orgId", authMiddleware, authorizeRoles('OWNER'), softDeleteOrganizationController);
router.delete("/:orgId/employees/:employeeId", authMiddleware, authorizeRoles('OWNER'), softDeleteEmployeeController);
router.get("/by-org/:orgId", authMiddleware, authorizeRoles("OWNER", "MANAGER", 'EMPLOYEE'), getOrgTeamMembersController);

export default router;