import { supabase } from "../config/supabase.js";

interface CreateOrganizationInput {
  userId: string;
  roleId: string;
  org_name: string;
  industry?: string;
  timezone?: string;
}

interface UpdateOrganizationInput {
  orgId: string;
  userId: string;
  org_name?: string;
  industry?: string;
  timezone?: string;
}

export const createOrganizationService = async ({
  userId,
  roleId,
  org_name,
  industry,
  timezone,
}: CreateOrganizationInput) => {

  const { data: orgData, error: orgError } = await supabase
    .from("organizations")
    .insert({
      org_name,
      industry,
      timezone,
      owner_id: userId,
    })
    .select()
    .single();

  if (orgError) {
    throw new Error(orgError.message);
  }

  const { error: empError } = await supabase
    .from("employees")
    .insert({
      user_id: userId,
      org_id: orgData.id,
      role_id: roleId,
    });

  if (empError) {
    throw new Error(empError.message);
  }

  return orgData;
};


export const getAllOrganizationsService = async (userId: string) => {
  const { data: employeeOrgs, error: empError } = await supabase
    .from("employees")
    .select("organizations(*)")
    .eq("user_id", userId);

  if (empError) {
    throw new Error(empError.message);
  }

  const organizations = employeeOrgs.map((row: any) => row.organizations);

  return organizations;
};

export const getOrganizationByIdService = async (orgId: string) => {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", orgId)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const updateOrganizationService = async ({
  orgId,
  userId,
  org_name,
  industry,
  timezone,
}: UpdateOrganizationInput) => {
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("owner_id")
    .eq("id", orgId)
    .single();

  if (orgError) throw new Error(orgError.message);
  if (!org) throw new Error("Organization not found");
  if (org.owner_id !== userId) {
    throw new Error("Unauthorized: Not the owner");
  }

  const { data: updatedRows, error: updateError } = await supabase
    .from("organizations")
    .update({
      ...(org_name !== undefined && { org_name }),
      ...(industry !== undefined && { industry }),
      ...(timezone !== undefined && { timezone }),
    })
    .eq("id", orgId)
    .select();

  if (updateError) throw new Error(updateError.message);
  if (!updatedRows || updatedRows.length === 0) {
    throw new Error("Update failed or no rows affected");
  }

  return updatedRows[0];
};


export const deleteOrganizationService = async (orgId: string, userId: string) => {
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("owner_id")
    .eq("id", orgId)
    .single();

  if (orgError) throw new Error(orgError.message);
  if (!org) throw new Error("Organization not found");
  if (org.owner_id !== userId) throw new Error("Unauthorized: Not the owner");

  const { error: delError } = await supabase
    .from("organizations")
    .delete()
    .eq("id", orgId);

  if (delError) throw new Error(delError.message);

  return { success: true, message: "Organization deleted successfully" };
};

export const getOrgTeamMembersService = async (orgId: string) => {
  /* 1️⃣ Employees */
  const { data: employees, error: empError } = await supabase
    .from("employees")
    .select(`
      id,
      user_id,
      created_at,
      roles:role_id (name)
    `)
    .eq("org_id", orgId);

  if (empError) throw new Error(empError.message);

  /* 2️⃣ Get user emails from auth.users */
  const userIds = (employees ?? []).map((e) => e.user_id).filter(Boolean);

  let usersMap: Record<string, any> = {};

  if (userIds.length > 0) {
    const { data: users, error: userError } =
      await supabase.auth.admin.listUsers();

    if (userError) throw new Error(userError.message);

    usersMap = users.users.reduce((acc: any, user: any) => {
      acc[user.id] = user;
      return acc;
    }, {});
  }

  /* 3️⃣ Invitations */
  const { data: invitations, error: invError } = await supabase
    .from("invitations")
    .select(`
      id,
      email,
      created_at,
      roles:role_id (name)
    `)
    .eq("org_id", orgId)
    .eq("status", "pending");

  if (invError) throw new Error(invError.message);

  /* 4️⃣ Normalize */
  const activeMembers =
    (employees ?? []).map((emp: any) => ({
      id: emp.id,
      email: usersMap[emp.user_id]?.email ?? null,
      full_name:
        usersMap[emp.user_id]?.email.split("@")[0]
          .replace(/[._-]/g, " ")
          .replace(/\b\w/g, (c: string) => c.toUpperCase()) ?? null,
      role: emp.roles?.name ?? null,
      status: "Accepted",
      joined_at: emp.created_at,
      is_invitation: false,
    }));

  const pendingMembers =
    (invitations ?? []).map((inv: any) => ({
      id: inv.id,
      email: inv.email,
      full_name:
        inv.email.split("@")[0]
          .replace(/[._-]/g, " ")
          .replace(/\b\w/g, (c: string) => c.toUpperCase()) ?? null,
      role: inv.roles?.name ?? null,
      status: "Pending Invitation",
      joined_at: inv.created_at,
      is_invitation: true,
    }));

  return [...activeMembers, ...pendingMembers];
};

