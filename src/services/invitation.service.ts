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
    text: `You have been invited to join. Click here to accept: ${process.env.FRONTEND_URL}/accept-invite/${token}`,
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
  userId: string;
}) => {
  const { data: invite, error: inviteError } = await supabase
    .from("invitations")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (inviteError) throw new Error(inviteError.message);
  if (!invite) throw new Error("Invalid or expired invitation");

  if (invite.status !== "pending") {
    throw new Error("This invitation has already been used or cancelled");
  }

  const { data: employeeData, error: employeeError } = await supabase
    .from("employees")
    .insert({
      user_id: userId,
      org_id: invite.org_id,
      role_id: invite.role_id,
      joined_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (employeeError) throw new Error(employeeError.message);

  const { error: userRoleError } = await supabase
    .from("user_roles")
    .insert({
      user_id: userId,
      role_id: invite.role_id,
    })
    .select()
    .single();

  if (userRoleError) throw new Error(userRoleError.message);

  const { error: updateError } = await supabase
    .from("invitations")
    .update({
      status: "accepted",
      accepted_at: new Date().toISOString(),
    })
    .eq("id", invite.id)
    .select()
    .single();

  if (updateError) throw new Error(updateError.message);

  const { error: authMetaError } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: {
      org_id: invite.org_id,
      role_id: invite.role_id,
    },
  });

  if (authMetaError) console.warn("Failed to update user metadata:", authMetaError.message);

  return {
    message: "Invitation accepted successfully",
    employee: employeeData,
  };
};
