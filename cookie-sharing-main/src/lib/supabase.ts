
import { supabase } from "@/integrations/supabase/client";

export interface User {
  id: number;
  username: string;
  created_at: string;
}

export interface SessionCookie {
  id: number;
  cookie_data: any;
  file_name: string;
  uploaded_by: string;
  uploaded_at: string;
  is_active: boolean;
}

// User management functions
export const checkUserExists = async (username: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('users')
    .select('username')
    .eq('username', username)
    .single();
  
  return !error && !!data;
};

export const registerUser = async (username: string): Promise<boolean> => {
  const { error } = await supabase
    .from('users')
    .insert([{ username }]);
  
  return !error;
};

// Session cookie management functions
export const fetchActiveSession = async (): Promise<SessionCookie | null> => {
  const { data, error } = await supabase
    .from('session_cookies')
    .select('*')
    .eq('is_active', true)
    .order('uploaded_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error || !data) return null;
  return data;
};

export const uploadCookie = async (
  cookieData: any,
  username: string,
  fileName: string
): Promise<boolean> => {
  const { error } = await supabase
    .from('session_cookies')
    .insert([{
      cookie_data: cookieData,
      file_name: fileName,
      uploaded_by: username
    }]);
  
  return !error;
};

export const deleteCookie = async (id: number): Promise<boolean> => {
  const { error } = await supabase
    .from('session_cookies')
    .delete()
    .eq('id', id);
  
  return !error;
};

export const cleanupExpiredSessions = async (): Promise<void> => {
  await supabase.rpc('cleanup_expired_sessions');
};
