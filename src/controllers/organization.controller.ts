import { Request, Response } from "express";
import { createOrganizationService } from "../services/organization.service.js";
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
