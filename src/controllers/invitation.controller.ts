import { Request, Response } from "express";
import { acceptInviteService, inviteEmployeeService } from "../services/invitation.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const inviteEmployeeController = asyncHandler(
    async (req: Request, res: Response) => {
        let userId = req.user;
        const { orgId, email, roleId } = req.body;
        const result = await inviteEmployeeService({ inviterId: userId?.id, orgId, email, roleId });

        return res.status(200).json({
            success: true,
            message: result.message,
            data: result.data,
        });
    }
);

export const acceptInviteController = asyncHandler(
    async (req: Request, res: Response) => {
        const { token } = req.params;
        const userId = req.user?.id;
        const result = await acceptInviteService({ token, userId });

        return res.status(200).json({
            success: true,
            message: result.message,
        });
    }
);