export function formatInt(value: number) {
  return new Intl.NumberFormat('en-CA').format(value)
}

export function formatMonth(iso: string) {
  const normalized = iso.length === 10 ? `${iso}T00:00:00` : iso
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-CA', { month: 'short', year: 'numeric' })
}

export function safeNext(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/'
  return value
}
