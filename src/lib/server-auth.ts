import { supabase } from "@/integrations/supabase/client";

export async function adminAuthHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) {
    throw new Error("Not signed in");
  }
  return { Authorization: `Bearer ${token}` };
}
