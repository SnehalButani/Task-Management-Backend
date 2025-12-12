import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import {  loginService } from '../services/auth.service.js';

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