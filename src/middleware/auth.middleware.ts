import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase.js';

declare global {
  namespace Express {
    interface Request {
      user?: any;
      role?: string;
      roleId?: string; 
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : undefined;

    if (!token) {
      res.status(403).json({ success: false, error: "No token provided" });
      return;
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      res.status(403).json({ success: false, error: "Invalid token" });
      return;
    }

    const user = data.user;

    /* 1️⃣ Get global role */
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role_id, roles(name)")
      .eq("user_id", user.id)
      .single();

    if (roleError) {
      res.status(500).json({ success: false, error: "Failed to fetch role" });
      return;
    }

    const role = (userRole?.roles as any)?.name;

    /* 2️⃣ If OWNER → get orgIds */
    let orgIds: string[] | null = null;

    if (role === "OWNER") {
      const { data: orgs, error: orgError } = await supabase
        .from("organizations")
        .select("id")
        .eq("owner_id", user.id);

      if (orgError) {
        res.status(500).json({ success: false, error: "Failed to fetch orgs" });
        return;
      }

      orgIds = orgs?.map((o: any) => o.id) ?? [];
    }

    /* 3️⃣ Attach to req.user */
    req.user = {
      id: user.id,
      email: user.email,
      displayName: user.user_metadata?.displayName || null,
      emailVerified: user.user_metadata?.email_verified || false,
      phone: user.phone || null,
      role,
      roleId: userRole?.role_id,
      orgIds, // ✅ owner only, else null
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };

    next();
  } catch (err) {
    res.status(403).json({ success: false, error: "Forbidden: Invalid token" });
  }
};


export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ success: false, message: "No role assigned" });
    }
    const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role];

    const hasRole = userRoles.some((role: string) => roles.includes(role));

    if (!hasRole) {
      return res.status(403).json({ success: false, message: "Forbidden: insufficient role" });
    }

    next();
  };
};