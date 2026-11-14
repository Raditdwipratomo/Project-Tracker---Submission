const timestampFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatTimestamp(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return ''
  return timestampFormatter.format(date)
}
