/**
 * getLast7Days — menghasilkan array 7 string tanggal format YYYY-MM-DD (terlama → terbaru).
 * sameDay — membandingkan dua string ISO/date apakah jatuh pada hari yang sama.
 */

export const getLast7Days = (): string[] => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
}

export const sameDay = (dateStr: string, target: string): boolean =>
  dateStr.split('T')[0] === target

/** Format tanggal YYYY-MM-DD menjadi label pendek, mis. "Sen 02" */
export const formatDayLabel = (dateStr: string): string => {
  const d = new Date(dateStr + 'T00:00:00')
  return new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: '2-digit' }).format(d)
}
