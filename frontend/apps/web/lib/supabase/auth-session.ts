"use client"

import { createClient } from "@/lib/supabase/client"

let refreshInFlight: Promise<string | null> | null = null
let signOutInFlight: Promise<void> | null = null

function getSupabase() {
  return createClient()
}

export async function getValidAccessToken(forceRefresh = false): Promise<string | null> {
  const supabase = getSupabase()
  if (!forceRefresh) {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token ?? null
  }
  if (refreshInFlight) {
    return refreshInFlight
  }
  refreshInFlight = (async () => {
    const { data, error } = await supabase.auth.refreshSession()
    if (error) {
      return null
    }
    return data.session?.access_token ?? null
  })()
  try {
    return await refreshInFlight
  } finally {
    refreshInFlight = null
  }
}

export async function hardSignOutAndRedirect(): Promise<void> {
  if (signOutInFlight) {
    return signOutInFlight
  }
  signOutInFlight = (async () => {
    const supabase = getSupabase()
    await supabase.auth.signOut()
    window.location.replace("/login")
  })()
  try {
    await signOutInFlight
  } finally {
    signOutInFlight = null
  }
}

export function subscribeToAuthState() {
  const supabase = getSupabase()
  const { data } = supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
      void hardSignOutAndRedirect()
    }
  })
  return () => data.subscription.unsubscribe()
}
