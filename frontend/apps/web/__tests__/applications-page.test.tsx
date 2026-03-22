import type { AnchorHTMLAttributes, ReactNode } from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi, beforeEach } from "vitest"
import ApplicationsPage from "@/app/applications/page"

vi.mock("next/link", () => ({
  default ({
    children,
    href,
    ...rest
  }: { children?: ReactNode; href: string } & AnchorHTMLAttributes<HTMLAnchorElement>) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    )
  },
}))

const mockRefetch = vi.fn()
const mockSetData = vi.fn()

vi.mock("@/hooks/useApplications", () => ({
  useApplications: () => ({
    data: [
      {
        id: 1,
        platform_id: 1,
        job_title: "Engineer",
        company: "Acme",
        company_id: null,
        salary: null,
        salary_currency: null,
        pay_period: null,
        seniority: null,
        contract_type: null,
        application_url: null,
        status: "active",
        current_stage: "interview",
        applied_at: "2025-01-01T00:00:00.000Z",
        resume_id: null,
        archived_at: null,
        created_at: "2025-01-01T00:00:00.000Z",
        updated_at: "2025-01-01T00:00:00.000Z",
      },
    ],
    isLoading: false,
    error: null,
    refetch: mockRefetch,
    setData: mockSetData,
  }),
}))

vi.mock("@/hooks/usePlatforms", () => ({
  usePlatforms: () => ({
    data: [{ id: 1, name: "LinkedIn" }],
  }),
}))

vi.mock("@/hooks/useResumeMap", () => ({
  useResumeMap: () => ({ map: {} }),
}))

vi.mock("@/hooks/useCompanies", () => ({
  useCompanies: () => ({ data: [] }),
}))

vi.mock("@/app/applications/ApplicationForm", () => ({
  ApplicationForm: ({ open }: { open: boolean }) =>
    open ? <div role="dialog" aria-label="Application form mock" /> : null,
}))

describe("ApplicationsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders heading, filters, and application row", () => {
    render(<ApplicationsPage />)

    expect(screen.getByRole("heading", { name: /applications/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /new application/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^engineer$/i })).toBeInTheDocument()
    expect(screen.getByText("Acme")).toBeInTheDocument()
    expect(screen.getByText("interview")).toBeInTheDocument()
  })

  it("opens application form when New Application is clicked", async () => {
    const user = userEvent.setup()
    render(<ApplicationsPage />)

    await user.click(screen.getByRole("button", { name: /new application/i }))

    expect(await screen.findByRole("dialog", { name: /application form mock/i })).toBeInTheDocument()
  })
})
