export type PayPeriod = "annual" | "monthly" | "hourly"

export const PAY_PERIODS: { value: PayPeriod; label: string }[] = [
  { value: "annual", label: "Annual" },
  { value: "monthly", label: "Monthly" },
  { value: "hourly", label: "Hourly" },
]

/** Sentinel for Select when no value (Radix Select disallows empty string). */
export const NO_PAY_PERIOD = "__none__"
export const NO_CURRENCY = "__none__"

const PERIOD_SUFFIX: Record<PayPeriod, string> = {
  annual: "/yr",
  monthly: "/mo",
  hourly: "/hr",
}

function isPayPeriod(v: string | null | undefined): v is PayPeriod {
  return v === "annual" || v === "monthly" || v === "hourly"
}

export const CURATED_CURRENCY_CODES: string[] = [
  "AUD",
  "BRL",
  "CAD",
  "CHF",
  "CNY",
  "CZK",
  "DKK",
  "EUR",
  "GBP",
  "HKD",
  "HUF",
  "ILS",
  "INR",
  "JPY",
  "KRW",
  "MXN",
  "NOK",
  "NZD",
  "PLN",
  "SEK",
  "SGD",
  "USD",
  "ZAR",
].sort()

export interface FormatCompensationInput {
  salary: string | number | null | undefined
  salary_currency: string | null | undefined
  pay_period: string | null | undefined
  locale: string
}

export function formatCompensation(input: FormatCompensationInput): string | null {
  const raw = input.salary
  if (raw == null || raw === "") {
    return null
  }
  const n = typeof raw === "number" ? raw : Number(raw)
  if (Number.isNaN(n)) {
    return null
  }

  const currency = input.salary_currency?.trim().toUpperCase() || null
  const period = input.pay_period
  const suffix = isPayPeriod(period) ? PERIOD_SUFFIX[period] : ""

  let base: string
  if (currency && /^[A-Z]{3}$/.test(currency)) {
    try {
      base = new Intl.NumberFormat(input.locale, {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(n)
    } catch {
      base = new Intl.NumberFormat(input.locale, { maximumFractionDigits: 2 }).format(n)
      if (suffix) {
        return `${base} ${currency}${suffix}`
      }
      return currency ? `${base} ${currency}` : base
    }
  } else {
    base = new Intl.NumberFormat(input.locale, { maximumFractionDigits: 2 }).format(n)
  }

  return suffix ? `${base}${suffix}` : base
}
