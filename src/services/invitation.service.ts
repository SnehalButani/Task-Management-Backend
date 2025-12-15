import { supabase } from "../config/supabase.js";
import crypto from "crypto";
import { sendEmail } from "../utils/email.js";

interface InviteEmployeeInput {
  inviterId: string;
  orgId: string;
  email: string;
  roleId: string;
}

export const inviteEmployeeService = async ({
  inviterId,
  orgId,
  email,
  roleId,
}: InviteEmployeeInput) => {

  // 1. Check if inviter belongs to the org
  const { data: inviterRecord, error: inviterError } = await supabase
    .from("employees")
    .select("id")
    .eq("user_id", inviterId)
    .eq("org_id", orgId)
    .maybeSingle();

  if (inviterError) {
    throw new Error(inviterError.message);
  }

  if (!inviterRecord) {
    throw new Error("Inviter does not belong to this organization");
  }

  // 2. Check if email already invited in same org
  const { data: existingInvite, error: existingInviteError } = await supabase
    .from("invitations")
    .select("id, status")
    .eq("email", email)
    .eq("org_id", orgId)
    .maybeSingle();

  if (existingInviteError) {
    throw new Error(existingInviteError.message);
  }

  if (existingInvite && existingInvite.status === "pending") {
    throw new Error("This email is already invited and pending");
  }

  // 3. Generate secure token
  const token = crypto.randomBytes(32).toString("hex");

  // 4. Create new invitation
  const { data: inviteData, error: inviteError } = await supabase
    .from("invitations")
    .insert({
      email,
      org_id: orgId,
      role_id: roleId,
      token,
      status: "pending",
    })
    .select()
    .single();

  if (inviteError) {
    throw new Error(inviteError.message);
  }

  sendEmail({
    to: email,
    subject: "You're invited to join our organization",
    text: `You have been invited to join.`,
    html: `<p>You have been invited to join our organization.</p>
             <p>Click <a href="${process.env.FRONTEND_URL}/accept-invite/${token}">here</a> to accept the invitation.</p>`,
  });

  return {
    message: "Invitation created successfully",
    data: inviteData,
  };
};


export const acceptInviteService = async ({
  token,
  userId,
}: {
  token: string;
  userId?: string;
}) => {
  const { data: invite, error: inviteError } = await supabase
    .from("invitations")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (inviteError) throw new Error(inviteError.message);
  if (!invite) throw new Error("Invalid or expired invitation");
  if (invite.status !== "pending") {
    throw new Error("This invitation has already been used");
  }

  let finalUserId = userId;
  let tempPassword: string | null = null;
  let isNewUser = false;

  if (!finalUserId) {
    const { data, error } = await supabase.auth.admin.listUsers({
      perPage: 1000,
    });
    if (error) throw new Error(error.message);

    const existingUser = data.users.find(
      (u) => u.email === invite.email
    );

    if (existingUser) {
      finalUserId = existingUser.id;
    } else {
      // 🔐 create new user
      tempPassword = crypto.randomBytes(6).toString("hex");
      isNewUser = true;

      const { data: newUser, error: createUserError } =
        await supabase.auth.admin.createUser({
          email: invite.email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            org_id: invite.org_id,
            role_id: invite.role_id,
            force_password_change: true,
          },
        });

      if (createUserError) throw new Error(createUserError.message);
      finalUserId = newUser.user.id;
    }
  }

  const { data: employeeData, error: employeeError } = await supabase
    .from("employees")
    .insert({
      user_id: finalUserId,
      org_id: invite.org_id,
      role_id: invite.role_id,
      joined_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (employeeError) throw new Error(employeeError.message);

  await supabase.from("user_roles").insert({
    user_id: finalUserId,
    role_id: invite.role_id,
  });


  await supabase
    .from("invitations")
    .update({
      status: "accepted",
      accepted_at: new Date().toISOString(),
    })
    .eq("id", invite.id);


  await supabase.auth.admin.updateUserById(finalUserId, {
    user_metadata: {
      org_id: invite.org_id,
      role_id: invite.role_id,
    },
  });


  if (isNewUser && tempPassword) {
    await sendEmail({
      to: invite.email,
      subject: "Your account is ready – Login details",
      text: `Your invitation has been accepted successfully`,
      html: `
        <p>Your invitation has been accepted successfully.</p>
        <p><b>Login details:</b></p>
        <p>Email: ${invite.email}</p>
        <p>Password: <b>${tempPassword}</b></p>
        <p>
          <a href="${process.env.FRONTEND_URL}/login">
            Click here to login
          </a>
        </p>
        <p>Please change your password after login.</p>
      `,
    });
  }

  return {
    success: true,
    message:
      "Invitation accepted successfully. Login credentials have been sent to your email.",
    employee: employeeData,
  };
};
