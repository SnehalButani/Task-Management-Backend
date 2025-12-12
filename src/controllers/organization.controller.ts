import { Request, Response } from "express";
import { createOrganizationService, deleteOrganizationService, getAllOrganizationsService, getOrganizationByIdService, getUsersByOrgService, updateOrganizationService } from "../services/organization.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createOrganizationController = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user; 
    const { org_name, industry, timezone } = req.body;

    const organization = await createOrganizationService({
        userId: user.id,
        roleId: user.roleId,
        org_name,
        industry,
        timezone,
    });

    return res.status(201).json({
        success: true,
        message: "Organization created successfully",
        organization,
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
    organization,
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
    organization: updatedOrg,
  });
});

export const deleteOrganizationController = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const { orgId } = req.params;

  const result = await deleteOrganizationService(orgId, user.id);

  return res.status(200).json({
    success: true,
    message: result.message,
  });
});

export const getUsersByOrgController = asyncHandler(async (req: any, res: Response) => {
  const org_id = req.query.org_id as string;

  if (!org_id) {
    return res.status(400).json({ success: false, message: "org_id is required" });
  }

  const users = await getUsersByOrgService(org_id);
  res.status(200).json({ success: true, data: users });
})