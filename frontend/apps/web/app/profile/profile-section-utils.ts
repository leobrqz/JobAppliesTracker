export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length || from < 0 || from >= items.length || from === to) {
    return items
  }
  const next = [...items]
  const [moved] = next.splice(from, 1)
  if (moved === undefined) {
    return items
  }
  next.splice(to, 0, moved)
  return next
}

export function buildReorderPayload(items: Array<{ id: number }>): Array<{ id: number; display_order: number }> {
  return items.map((item, index) => ({ id: item.id, display_order: index }))
}

export function formatDate(value?: string | null): string {
  if (!value) return "Present"
  return value
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
