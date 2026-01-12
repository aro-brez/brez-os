/**
 * Supabase Client with DEV MODE Fallback
 *
 * This module provides a Supabase client that gracefully falls back to
 * local storage (DEV MODE) when Supabase environment variables are not set.
 *
 * Usage:
 *   import { supabase, isSupabaseEnabled, isDevMode } from "@/lib/supabaseClient";
 *
 *   if (isSupabaseEnabled) {
 *     // Use supabase client
 *     const { data } = await supabase.from("table").select();
 *   } else {
 *     // Fallback to devStore
 *     const data = devStore.getData();
 *   }
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Check if Supabase is configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseEnabled = !!(supabaseUrl && supabaseAnonKey);
export const isDevMode = !isSupabaseEnabled;

// Create Supabase client (or null if not configured)
let supabaseClient: SupabaseClient | null = null;

if (isSupabaseEnabled) {
  supabaseClient = createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
}

// Export client (may be null)
export const supabase = supabaseClient;

// Helper to get authenticated user (returns null in dev mode)
export async function getUser() {
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Helper to check if user is allowed (email domain check)
export function isAllowedEmail(email: string): boolean {
  const allowedDomains = (process.env.ALLOWED_EMAIL_DOMAINS || "drinkbrez.com")
    .split(",")
    .map((d) => d.trim().toLowerCase());

  const emailDomain = email.split("@")[1]?.toLowerCase();
  return allowedDomains.includes(emailDomain);
}

// Sign in with Google (via Supabase Auth)
export async function signInWithGoogle() {
  if (!supabase) {
    console.warn("Supabase not configured. Running in DEV MODE.");
    return { error: null, data: null };
  }

  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}

// Sign out
export async function signOut() {
  if (!supabase) {
    // Clear local storage in dev mode
    if (typeof window !== "undefined") {
      localStorage.removeItem("brez-dev-user");
    }
    return { error: null };
  }

  return supabase.auth.signOut();
}

// Environment info for debugging
export const envInfo = {
  isSupabaseEnabled,
  isDevMode,
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV || "development",
  version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
};
