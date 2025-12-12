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

  const { error: userRoleErr } = await supabase
    .from("user_roles")
    .upsert({
      user_id: userId,
      role_id: roleId,
    });

  if (userRoleErr) {
    throw new Error(userRoleErr.message);
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
  if (org.owner_id !== userId) throw new Error("Unauthorized: Not the owner");

  const { data, error } = await supabase
    .from("organizations")
    .update({
      ...(org_name && { org_name }),
      ...(industry && { industry }),
      ...(timezone && { timezone }),
    })
    .eq("id", orgId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
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

export const getUsersByOrgService = async (org_id: string) => {
  const { data, error } = await supabase
    .from("employees")
    .select(`
      id,
      user_id,
      org_id,
      created_at,
      roles:role_id (name),
      auth_users:user_id (email, user_metadata)
    `)
    .eq("org_id", org_id);

  if (error) throw new Error(error.message);

  // Map response to a cleaner format
  return data.map((emp: any) => ({
    employee_id: emp.id,
    user_id: emp.user_id,
    email: emp.auth_users?.email,
    full_name: emp.auth_users?.user_metadata?.full_name || null,
    role: emp.roles?.name,
    joined_at: emp.created_at,
  }));
};