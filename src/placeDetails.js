const practicalNotes = [
  { pattern: /beach|cove|lagoon|coast/i, note: 'Bring water, sun protection and footwear that suits the access. Shade and facilities can be limited, and sea conditions should decide whether you swim.' },
  { pattern: /gorge|hike|mountain|cave/i, note: 'Wear grippy closed shoes, carry more water than you expect to need and check weather, access and opening conditions before leaving.' },
  { pattern: /monastery|church/i, note: 'Dress respectfully with shoulders and knees covered, keep voices low and check visitor hours before making a special journey.' },
  { pattern: /museum|archaeological|palace|fortress|old town/i, note: 'Go early for cooler temperatures and a quieter visit. Check seasonal opening hours and ticket arrangements on the day.' },
  { pattern: /restaurant|taverna|eatery|bar|café|coffee|beach club/i, note: 'Check same-day opening hours before setting out. Popular tables and weekend evenings can fill quickly.' },
]

function formatRatingDate(value) {
  if (!value) return ''
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return ''
  return `Rating checked ${new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, day)))}`
}

export function buildPlaceDetails(item = {}, kind = 'place', researched = {}) {
  const descriptor = [item.type, item.cuisine].filter(Boolean).join(' · ')
  const practicalBase = practicalNotes.find(({ pattern }) => pattern.test(descriptor))?.note
    ?? 'Confirm current opening or access conditions before setting out, and allow a little flexibility for island roads and seasonal schedules.'
  const practical = item.bookingRecommended
    ? `${practicalBase} A reservation is recommended.`
    : practicalBase
  const fallbackWhyVisit = item.highlight
    ? `${item.highlight} is the headline, but the pleasure is in experiencing it at an unhurried Cretan pace.`
    : kind === 'restaurant'
      ? `A useful stop for ${item.cuisine?.toLowerCase() ?? 'local food and drink'} while exploring Crete.`
      : `A distinctive way to experience ${item.area ?? 'Crete'} beyond the journey between stops.`
  const ratingLabel = Number.isFinite(item.googleRating)
    ? `${item.googleRating} · ${item.googleReviewCount?.toLocaleString('en-GB') ?? 'recent'} Google reviews`
    : ''

  return {
    whyVisit: researched.whyVisit ?? fallbackWhyVisit,
    practical,
    bestTime: researched.bestTime ?? 'Check current conditions and plan around the coolest, least busy part of the day.',
    access: researched.access ?? 'Confirm the current route, parking or transport options before setting out.',
    tips: Array.isArray(researched.tips) ? researched.tips : [],
    duration: item.suggestedDuration ?? 'Allow time to explore at your own pace',
    ratingLabel,
    ratingCheckedAt: formatRatingDate(item.ratingCheckedAt),
  }
}
