export function getAppRoute(pathname) {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/'
  return normalizedPath === '/itinerary' ? 'itinerary' : 'guide'
}
