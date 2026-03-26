"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"

import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (signInError) {
      setError(signInError.message)
      return
    }
    router.replace("/dashboard")
    router.refresh()
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 py-16">
      <h1 className="text-3xl font-semibold">Login</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="rounded-md border px-3 py-2"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="rounded-md border px-3 py-2"
          required
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <button type="submit" disabled={loading} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="text-sm text-muted-foreground">
        No account? <a href="/register" className="underline">Create one</a>
      </p>
    </div>
  )
}

