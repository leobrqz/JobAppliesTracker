import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { toast } from "sonner"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { StageHistoryDialog } from "@/components/StageHistoryDialog"
import * as applicationsService from "@/services/applications.service"

const { mockHistory, mockRefetch } = vi.hoisted(() => ({
  mockHistory: [
    {
      id: 10,
      application_id: 1,
      stage: "interview",
      date: "2025-03-01T14:00:00.000Z",
      notes: "First round",
      created_at: "2025-03-01T15:00:00.000Z",
    },
  ],
  mockRefetch: vi.fn(),
}))

vi.mock("@/services/applications.service", () => ({
  advanceStage: vi.fn(),
  deleteHistoryEntry: vi.fn(),
  updateHistoryEntry: vi.fn(),
}))

vi.mock("@/hooks/useApplicationHistory", () => ({
  useApplicationHistory: () => ({
    data: mockHistory,
    isLoading: false,
    error: null,
    refetch: mockRefetch,
  }),
}))

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe("StageHistoryDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRefetch.mockResolvedValue(undefined)
    localStorage.clear()
  })

  it("shows stage history title and entries when open", () => {
    render(
      <StageHistoryDialog applicationId={1} open onOpenChange={() => {}} />,
    )

    expect(screen.getByRole("dialog", { name: /stage history/i })).toBeInTheDocument()
    expect(screen.getByText("interview")).toBeInTheDocument()
    expect(screen.getByText("First round")).toBeInTheDocument()
  })

  it("opens edit dialog and calls updateHistoryEntry on save", async () => {
    const user = userEvent.setup()
    const onStageChanged = vi.fn()
    const entry = mockHistory[0]!
    vi.mocked(applicationsService.updateHistoryEntry).mockResolvedValue({
      data: {
        id: 10,
        application_id: 1,
        stage: "offer",
        date: entry.date,
        notes: "First round",
        created_at: entry.created_at,
      },
      error: null,
    })

    render(
      <StageHistoryDialog applicationId={1} open onOpenChange={() => {}} onStageChanged={onStageChanged} />,
    )

    await user.click(screen.getByRole("button", { name: /^edit$/i }))

    const editDialog = await screen.findByRole("dialog", { name: /edit history entry/i })
    expect(editDialog).toBeInTheDocument()

    const stageSelect = within(editDialog).getByRole("combobox", { name: /^stage$/i })
    await user.click(stageSelect)
    const offerOption = await screen.findByRole("option", { name: /^offer$/i })
    await user.click(offerOption)

    await user.click(within(editDialog).getByRole("button", { name: /^save$/i }))

    await waitFor(() => {
      expect(applicationsService.updateHistoryEntry).toHaveBeenCalledWith(
        1,
        10,
        expect.objectContaining({
          stage: "offer",
          notes: "First round",
        }),
      )
    })
    expect(mockRefetch).toHaveBeenCalled()
    expect(onStageChanged).toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith("Entry updated")
  })

  it("calls advanceStage when adding a new entry", async () => {
    const user = userEvent.setup()
    const onStageChanged = vi.fn()
    vi.mocked(applicationsService.advanceStage).mockResolvedValue({
      data: {
        id: 11,
        application_id: 1,
        stage: "screening",
        date: new Date().toISOString(),
        notes: null,
        created_at: new Date().toISOString(),
      },
      error: null,
    })

    render(
      <StageHistoryDialog applicationId={42} open onOpenChange={() => {}} onStageChanged={onStageChanged} />,
    )

    const mainDialog = screen.getByRole("dialog", { name: /stage history/i })
    const stageSelect = within(mainDialog).getByRole("combobox", { name: /^stage$/i })
    await user.click(stageSelect)
    const screening = await screen.findByRole("option", { name: /^screening$/i })
    await user.click(screening)

    await user.click(screen.getByRole("button", { name: /add entry/i }))

    await waitFor(() => {
      expect(applicationsService.advanceStage).toHaveBeenCalledWith(
        42,
        expect.objectContaining({
          stage: "screening",
        }),
      )
    })
    expect(mockRefetch).toHaveBeenCalled()
    expect(onStageChanged).toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith("Stage added")
  })

  it("does not call advanceStage when stage is missing", async () => {
    const user = userEvent.setup()

    render(
      <StageHistoryDialog applicationId={42} open onOpenChange={() => {}} />,
    )

    await user.click(screen.getByRole("button", { name: /add entry/i }))

    expect(applicationsService.advanceStage).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledWith("Stage is required")
  })

  describe("with 24-hour display preference", () => {
    beforeEach(() => {
      localStorage.setItem("display.timeFormat", JSON.stringify("24h"))
      localStorage.setItem("display.locale", JSON.stringify("en-US"))
    })

    it("renders history timestamps without AM/PM", async () => {
      render(
        <StageHistoryDialog applicationId={1} open onOpenChange={() => {}} />,
      )

      const dialog = screen.getByRole("dialog", { name: /stage history/i })
      await waitFor(() => {
        expect(dialog.textContent).not.toMatch(/\b(AM|PM)\b/)
      })
    })
  })
})
