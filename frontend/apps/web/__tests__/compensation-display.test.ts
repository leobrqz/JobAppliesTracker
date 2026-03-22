import { describe, expect, it } from "vitest"
import { formatCompensation } from "@/lib/compensation-display"

describe("formatCompensation", () => {
  it("returns null for empty salary", () => {
    expect(
      formatCompensation({
        salary: null,
        salary_currency: "USD",
        pay_period: "annual",
        locale: "en-US",
      }),
    ).toBeNull()
  })

  it("formats number-only when currency missing", () => {
    expect(
      formatCompensation({
        salary: "50000",
        salary_currency: null,
        pay_period: "annual",
        locale: "en-US",
      }),
    ).toBe("50,000/yr")
  })

  it("formats currency and period suffix", () => {
    const s = formatCompensation({
      salary: "75000.5",
      salary_currency: "USD",
      pay_period: "annual",
      locale: "en-US",
    })
    expect(s).toContain("75,000.5")
    expect(s).toContain("/yr")
    expect(s).toMatch(/\$/)
  })

  it("handles hourly with BRL", () => {
    const s = formatCompensation({
      salary: 50,
      salary_currency: "BRL",
      pay_period: "hourly",
      locale: "pt-BR",
    })
    expect(s).toContain("/hr")
  })
})
