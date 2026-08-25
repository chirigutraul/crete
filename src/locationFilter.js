export const LOCATION_FILTERS = ['All', 'Chania', 'Rethymno', 'Heraklion', 'Lasithi']

const locationMatchers = {
  Chania: /chania|kissamos/i,
  Rethymno: /rethymno/i,
  Heraklion: /heraklion|hersonissos|analipsi|anissaras/i,
  Lasithi: /lasithi|agios nikolaos|elounda|mirabello|sitia|zakros|istron/i,
}

export function filterByLocation(items, location) {
  const safeItems = Array.isArray(items) ? items : []
  if (location === 'All') return safeItems
  const matcher = locationMatchers[location]
  if (!matcher) return safeItems
  return safeItems.filter((item) => matcher.test(item?.area ?? ''))
}
