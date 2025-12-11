import { supabase } from "../config/supabase.js";

interface CreateOrganizationInput {
  userId: string;
  roleId: string;
  org_name: string;
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
