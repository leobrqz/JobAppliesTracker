export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 py-16">
      <h1 className="text-4xl font-bold tracking-tight">JobAppliesTracker</h1>
      <p className="text-lg text-muted-foreground">
        Track applications, interviews, resumes, and progress in one place with private, authenticated workspaces.
      </p>
      <div className="flex gap-3">
        <a href="/login" className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
          Login
        </a>
        <a href="/register" className="rounded-md border px-4 py-2">
          Create account
        </a>
      </div>
    </div>
  )
}
