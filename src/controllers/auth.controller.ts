import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import {  changePasswordService, deleteAuthUserService, getRolesService, loginService, updateDisplayNameService } from '../services/auth.service.js';

export const fetchUserDetailsController = asyncHandler(async (req: Request, res: Response) => {
    let user = req.user;
    res.status(200).json({ success: true, data: user });
});

export const loginController = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const { user, session } = await loginService(email, password);

    res.cookie('sb-access-token', session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });
    res.cookie('sb-refresh-token', session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });

    res.status(200).json({
        success: true,
        message: 'Login successful',
        data: { user, session },
    });
});

export const getRolesController = asyncHandler(async (req: Request, res: Response) => {
    const roles = await getRolesService();
    res.status(200).json({ success: true, data: roles });
});

export const deleteAuthUserController = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const result = await deleteAuthUserService(userId);
    res.status(200).json({ success: true, message: result.message });
});

export const changePasswordController = asyncHandler(async (req: Request, res: Response) => {
    const { newPassword } = req.body;
    const userId = req.user.id;
    const result = await changePasswordService({ userId, newPassword });
    res.status(200).json({ success: true, message: result.message });
});

export const updateUserController = asyncHandler(async (req: Request, res: Response) => {
    const { displayName } = req.body;
    const userId = req.user.id;
    const result = await updateDisplayNameService({ userId, displayName });
    res.status(200).json({ success: true, message: result.message });
}); 