export function getItemDestination(item, activity) {
  if (!item && activity?.location) {
    const destination = activity.location.split('→').at(-1).trim()
    return [destination, 'Crete', 'Greece'].filter(Boolean).join(', ')
  }

  const name = item?.name ?? activity?.title
  if (!name) return ''

  const area = item?.area ?? activity?.location
  return [name, area, 'Crete', 'Greece'].filter(Boolean).join(', ')
}

export function getDirectionsUrl(destination) {
  if (!destination) return ''
  const params = new URLSearchParams({ api: '1', destination })
  return `https://www.google.com/maps/dir/?${params.toString()}`
}
