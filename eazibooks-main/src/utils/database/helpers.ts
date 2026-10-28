import { supabase } from '../supabase/client';

/**
 * Get the current user's company_id from their profile
 */
export async function getCurrentUserCompanyId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('❌ No authenticated user found');
    throw new Error('Not authenticated. Please log in again.');
  }

  console.log('✅ User authenticated:', user.email);

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('❌ Error fetching profile:', error);
    throw new Error('Profile not found. Please try logging out and logging back in, or contact support.');
  }

  if (!profile) {
    console.error('❌ Profile does not exist for user:', user.email);
    throw new Error('Your profile is not set up. Please log out and log back in, or contact support.');
  }

  if (!profile.company_id) {
    console.error('❌ Profile has no company_id for user:', user.email);
    console.error('📋 SOLUTION: Run /EMERGENCY_FIX.sql in Supabase SQL Editor while logged in as this user');
    throw new Error('Your account setup is incomplete. Please log out and log back in. If this persists, contact support.');
  }

  console.log('✅ Company ID found:', profile.company_id);
  return profile.company_id;
}

/**
 * Check if user has a valid profile and company setup
 */
export async function checkUserSetup(): Promise<{
  hasProfile: boolean;
  hasCompany: boolean;
  companyId: string | null;
  error?: string;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        hasProfile: false,
        hasCompany: false,
        companyId: null,
        error: 'Not authenticated'
      };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return {
        hasProfile: false,
        hasCompany: false,
        companyId: null,
        error: 'Profile not found'
      };
    }

    return {
      hasProfile: true,
      hasCompany: !!profile.company_id,
      companyId: profile.company_id || null,
      error: !profile.company_id ? 'No company assigned to profile' : undefined
    };
  } catch (error) {
    return {
      hasProfile: false,
      hasCompany: false,
      companyId: null,
      error: 'Error checking user setup'
    };
  }
}