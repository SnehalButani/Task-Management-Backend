import { Request, Response } from "express";
import { createOrganizationService,  getAllOrganizationsService, getOrganizationByIdService, getOrgTeamMembersService,  softDeleteEmployeeService,  softDeleteOrganizationService,  updateOrganizationService } from "../services/organization.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createOrganizationController = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const { org_name, industry, timezone } = req.body;

  await createOrganizationService({
    userId: user.id,
    roleId: user.roleId,
    org_name,
    industry,
    timezone,
  });

  return res.status(201).json({
    success: true,
    message: "Organization created successfully"
  });
})

export const getAllOrganizationsController = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  const organizations = await getAllOrganizationsService(user.id);

  return res.status(200).json({
    success: true,
    data: organizations,
  });
});

export const getOrganizationByIdController = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const { orgId } = req.params;

  const organization = await getOrganizationByIdService(orgId);

  return res.status(200).json({
    success: true,
    data: organization,
  });
});

export const updateOrganizationController = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const { orgId } = req.params;

  const { org_name, industry, timezone } = req.body;

  const updatedOrg = await updateOrganizationService({
    orgId,
    userId: user.id,
    org_name,
    industry,
    timezone,
  });

  return res.status(200).json({
    success: true,
    message: "Organization updated successfully",
    data: updatedOrg,
  });
});

export const softDeleteOrganizationController = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const { orgId } = req.params;

  const result = await softDeleteOrganizationService(orgId, user.id);

  return res.status(200).json({
    success: true,
    message: result.message,
  });
});

export const getOrgTeamMembersController = asyncHandler(async (req: any, res: Response) => {
  const org_id = req.params.orgId as string;
  const { role } = req.user;

  const users = await getOrgTeamMembersService(org_id, role);
  res.status(200).json({ success: true, data: users });
})

export const softDeleteEmployeeController = asyncHandler(
  async (req: Request, res: Response) => {
    const { orgId, employeeId } = req.params;

    const result = await softDeleteEmployeeService(orgId, employeeId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  }
);
