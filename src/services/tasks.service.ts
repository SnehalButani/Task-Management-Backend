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

export async function createTaskService(task: TaskData) {
  const { data, error } = await supabase.from("tasks").insert(task).select().single();
  if (error) throw error;
  return data;
}

export async function getTasksService(org_id: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("org_id", org_id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
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
  const { data, error } = await supabase.from("tasks").delete().eq("id", id).select().single();
  if (error) throw error;
  return data;
}
