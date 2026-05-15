import { createClient } from '@supabase/supabase-js';

const getSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

/**
 * Refresh the authentication token if it's within 5 minutes of expiry
 * This is called periodically to maintain session continuity
 */
export async function refreshTokenIfNeeded(): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();

    // Get current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('No active session found');
      return false;
    }

    // Check if token expires within 5 minutes
    const expiresAt = session.expires_at ? session.expires_at * 1000 : 0; // Convert to milliseconds
    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;
    const fiveMinutesInMs = 5 * 60 * 1000;

    // Only refresh if within 5 minutes of expiry
    if (timeUntilExpiry > fiveMinutesInMs) {
      return true; // Token is still valid, no need to refresh
    }

    // Refresh the session
    const { error: refreshError, data: refreshData } = await supabase.auth.refreshSession();

    if (refreshError || !refreshData.session) {
      console.error('Failed to refresh token:', refreshError?.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
}

/**
 * Setup automatic token refresh on an interval
 * Refreshes every 4 minutes to stay ahead of the 5-minute window
 */
export function setupTokenRefreshInterval(): () => void {
  const intervalId = setInterval(async () => {
    await refreshTokenIfNeeded();
  }, 4 * 60 * 1000); // Refresh every 4 minutes

  // Return cleanup function
  return () => clearInterval(intervalId);
}
