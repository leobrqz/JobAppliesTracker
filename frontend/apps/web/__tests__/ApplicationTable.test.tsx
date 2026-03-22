import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { ApplicationTable } from "@/app/applications/ApplicationTable"
import type { ApplicationResponse, CompanyResponse, ResumeResponse } from "@/types"

const { sampleApp, StageHistoryDialogSpy } = vi.hoisted(() => {
  const sampleApp: ApplicationResponse = {
    id: 7,
    platform_id: 1,
    job_title: "Backend Dev",
    company: "Globex",
    company_id: null,
    salary: null,
    seniority: null,
    contract_type: null,
    application_url: null,
    status: "active",
    current_stage: "screening",
    applied_at: "2025-02-01T00:00:00.000Z",
    resume_id: null,
    archived_at: null,
    created_at: "2025-02-01T00:00:00.000Z",
    updated_at: "2025-02-01T00:00:00.000Z",
  }
  return { sampleApp, StageHistoryDialogSpy: vi.fn() }
})

vi.mock("@/components/StageHistoryDialog", () => ({
  StageHistoryDialog: (props: {
    applicationId: number
    open: boolean
    onOpenChange: (open: boolean) => void
    onStageChanged?: () => void
  }) => {
    StageHistoryDialogSpy(props)
    return null
  },
}))

vi.mock("@/services/applications.service", () => ({
  archiveApplication: vi.fn().mockResolvedValue({ data: sampleApp, error: null }),
  restoreApplication: vi.fn().mockResolvedValue({ data: sampleApp, error: null }),
  deleteApplication: vi.fn().mockResolvedValue({ data: null, error: null }),
}))

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}))

describe("ApplicationTable", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("wires stage history to the row application id and refresh callback", async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    const onRefresh = vi.fn()

    render(
      <ApplicationTable
        data={[sampleApp]}
        platforms={{ 1: "Indeed" }}
        resumeMap={{} as Record<number, ResumeResponse>}
        companies={[] as CompanyResponse[]}
        archived={false}
        onEdit={onEdit}
        onRefresh={onRefresh}
      />,
    )

    await user.click(screen.getByRole("button", { name: /stage history/i }))

    expect(StageHistoryDialogSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        applicationId: 7,
        open: true,
        onStageChanged: onRefresh,
      }),
    )
  })
})
