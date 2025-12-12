// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import nodemailer from "npm:nodemailer";
Deno.serve(async (req) => {
    try {
        const { to, subject, html, text, from } = await req.json();
        if (!to || !subject) {
            return new Response(JSON.stringify({ message: "Missing required fields: to, subject" }), { status: 400, headers: { "Content-Type": "application/json" } });
        }
        const transporter = nodemailer.createTransport({
            host: Deno.env.get("SMTP_HOST") ?? "",
            port: 587,
            auth: {
                user: Deno.env.get("SMTP_USER") ?? "",
                pass: Deno.env.get("SMTP_PASS") ?? "",
            },
        });
        await transporter.sendMail({
            from: from ?? "no-reply@yourdomain.com",
            to,
            subject,
            text: text ?? "",
            html: html ?? "",
        });
        return new Response(JSON.stringify({ success: true, message: "Email sent successfully" }), { headers: { "Content-Type": "application/json" } });
    }
    catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: 500,
        });
    }
});
