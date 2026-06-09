"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createTenant(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) {
    return { error: "Complete organization setup first" };
  }

  const fullName = (formData.get("full_name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const dateOfBirth = (formData.get("date_of_birth") as string) || null;

  if (!fullName) {
    return { error: "Full name is required" };
  }

  const { data, error } = await supabase
    .from("tenants")
    .insert({
      org_id: profile.org_id,
      full_name: fullName,
      email,
      phone,
      date_of_birth: dateOfBirth || null,
      status: "pending",
      screening_status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/tenants");
  return { success: true, id: data.id };
}

export async function addTenantNote(tenantId: string, body: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const trimmed = body.trim();
  if (!trimmed) {
    return { error: "Note cannot be empty" };
  }

  const { error } = await supabase.from("tenant_notes").insert({
    tenant_id: tenantId,
    user_id: user.id,
    body: trimmed,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/dashboard/tenants/${tenantId}`);
  return { success: true };
}
