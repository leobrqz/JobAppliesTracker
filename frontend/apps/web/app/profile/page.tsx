"use client"

import { ProfileDataSection } from "./ProfileDataSection"
import { ResumesSection } from "./ResumesSection"

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <ProfileDataSection />
      <ResumesSection />
    </div>
  )
}
