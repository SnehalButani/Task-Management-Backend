export interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    html?: string;
}

export const sendEmail = async ({ to, subject, text, html }: EmailOptions) => {
    try {
        const res = await fetch(`${process.env.SUPABASE_EDGE_URL}/send-email`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ to, subject, text, html }),
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Email send failed: ${errorText}`);
        }
    } catch (err) {
        console.error("Failed to send email:", err);
        throw err;
    }
};
