import { supabaseAdmin } from './supabase-admin';

export interface StudentEligibility {
  active: boolean;
  expires_at?: string | null;
}

export async function getStudentEligibility(userId: string): Promise<StudentEligibility> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('student_status, student_expires_at')
    .eq('id', userId)
    .single();

  if (error || !data) {
    if (error?.code !== 'PGRST116') { // Ignore "no rows returned" error
      console.error('Error fetching student eligibility:', error);
    }
    return { active: false };
  }

  const expiresAt = data.student_expires_at;
  const isExpired = expiresAt ? new Date(expiresAt).getTime() <= Date.now() : true;
  const isActive = data.student_status === 'active' && !isExpired;

  if (isExpired && data.student_status === 'active') {
    // Optionally update status to expired if the date passed
    await supabaseAdmin
      .from('profiles')
      .update({ student_status: 'expired' }) // updated_at is usually handled by triggers if present
      .eq('id', userId);
  }

  return { active: isActive, expires_at: expiresAt };
}
