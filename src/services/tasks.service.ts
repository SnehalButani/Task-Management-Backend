import { supabase } from "../config/supabase.js";

export interface TaskData {
  title: string;
  description?: string;
  assigned_to?: string | null;
  created_by: string;
  status?: "pending" | "in_progress" | "completed" | "expired";
  due_date?: string;
  org_id: string;
}

async function mapUsersFullName(userIds: string[]) {
  if (userIds.length === 0) return {};

  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) throw userError;

  const usersMap = users.users.reduce((acc: Record<string, any>, user: any) => {
    if (userIds.includes(user.id)) {
      acc[user.id] = {
        email: user.email,
        full_name: user.email
          ?.split("@")[0]
          .replace(/[_-]/g, " ")
          .replace(/\b\w/g, (c: string) => c.toUpperCase()),
      };
    }
    return acc;
  }, {} as Record<string, any>);

  return usersMap;
}

export async function createTaskService(task: TaskData) {
  const { data, error } = await supabase.from("tasks").insert(task).select().single();
  if (error) throw error;
  return data;
}

export async function getTasksService(orgId: string) {
  if (!orgId) throw new Error("orgId is required");

  const { data: tasks, error: taskError } = await supabase
    .from("tasks")
    .select(`*, employee:assigned_to(user_id)`)
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (taskError) throw taskError;
  if (!tasks || tasks.length === 0) return [];

  const userIds = tasks.map((t: any) => t.employee?.user_id).filter(Boolean);
  const usersMap = await mapUsersFullName(userIds);

  return tasks.map((task: any) => {
    const userId = task.employee?.user_id;
    return {
      ...task,
      assigned_to_full_name: usersMap[userId]?.full_name || "",
      assigned_to_email: usersMap[userId]?.email || "",
    };
  });
}

export async function getTaskByIdService(id: string) {
  const { data, error } = await supabase.from("tasks").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function updateTaskService(id: string, updates: Partial<TaskData>) {
  const { data, error } = await supabase.from("tasks").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}


export async function deleteTaskService(id: string) {
  const { data, error } = await supabase
    .from("tasks")
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return {
    success: true,
    message: "Task soft-deleted successfully",
  };
}

export const getOrgEmployeeService = async (
  orgId: string,
  role: "OWNER" | "MANAGER" | "EMPLOYEE",
  currentUserId?: string
) => {
  let query = supabase
    .from("employees")
    .select(`id, user_id, created_at, roles:role_id(name)`)
    .eq("org_id", orgId);

  if (role === "EMPLOYEE") {
    if (!currentUserId) throw new Error("Current user ID is required for EMPLOYEE role");
    query = query.eq("user_id", currentUserId);
  }

  const { data: employees, error: empError } = await query;
  if (empError) throw new Error(empError.message);
  if (!employees || employees.length === 0) return [];

  const userIds = employees.map((e) => e.user_id).filter(Boolean);
  const usersMap = await mapUsersFullName(userIds);

  return employees.map((emp) => {
    const user = usersMap[emp.user_id];
    return {
      ...emp,
      email: user?.email || "",
      full_name: user?.full_name || "",
    };
  });
};