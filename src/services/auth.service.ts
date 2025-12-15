import { supabase } from '../config/supabase.js';

interface UserData {
    id: string;
    email: string | null;
    role?: string | null;
}

interface SessionData {
    access_token: string;
    refresh_token: string;
}

export async function loginService(email: string, password: string): Promise<{ user: UserData; session: SessionData }> {
    if (!email || !password) {
        throw new Error("Email and password are required");
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error?.message.includes("Email not confirmed")) {
        await supabase.auth.resend({ type: "signup", email });
        throw new Error("Your email is not verified. A new verification link has been sent.");
    }

    if (error) {
        throw new Error("Invalid email or password");
    }

    if (!data.user || !data.session) {
        throw new Error("Failed to create session");
    }

    return {
        user: {
            id: data.user.id,
            email: data.user.email ?? null, // convert undefined to null
            role: (data.user as any).role || null, // optional role
        },
        session: {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
        },
    };

}

export const getRolesService = async () => {
     const { data, error } = await supabase
      .from("roles")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) throw error;
    return data;
}