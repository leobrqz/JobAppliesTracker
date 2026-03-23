"use client"

import { ProfileDataSection } from "./ProfileDataSection"
import { ResumesSection } from "./ResumesSection"
import { EducationSection } from "./EducationSection"
import { ExperienceSection } from "./ExperienceSection"
import { ProjectsSection } from "./ProjectsSection"
import { SkillsSection } from "./SkillsSection"

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <ProfileDataSection />
      <ResumesSection />
      <ExperienceSection />
      <EducationSection />
      <ProjectsSection />
      <SkillsSection />
    </div>
  )
}
