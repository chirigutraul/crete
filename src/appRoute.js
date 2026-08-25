export function getAppRoute(pathname) {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/'
  if (normalizedPath === '/itinerary') return { name: 'itinerary' }

  const match = normalizedPath.match(/^\/(places|restaurants)\/([^/]+)$/)
  if (!match) return { name: 'guide' }

  try {
    return {
      name: match[1] === 'places' ? 'place-detail' : 'restaurant-detail',
      id: decodeURIComponent(match[2]),
    }
  } catch {
    return { name: 'guide' }
  }
}

export function getGuideTab(hash) {
  const tab = hash.replace(/^#/, '')
  return ['places', 'food', 'itinerary'].includes(tab) ? tab : 'places'
}
