const EXPORT_FILENAME = 'crete-itinerary-mobile.html'

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function text(value, fallback) {
  return escapeHtml(value ?? fallback)
}

function detail(label, value) {
  if (value === undefined || value === null || value === '') return ''
  return `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`
}

function activityMarkup(activity, item) {
  const hasBrokenReference = (activity?.placeId || activity?.venueId) && !item
  const title = item?.name ?? activity?.title ?? (hasBrokenReference ? 'Unavailable catalog item' : 'Untitled stop')
  const category = activity?.type ?? item?.type ?? 'Activity'
  const description = activity?.note ?? item?.description ?? (hasBrokenReference
    ? 'This itinerary reference no longer matches a catalog entry.'
    : 'Details coming soon.')
  const location = item?.area ?? activity?.location
  const catalogDetails = [
    detail('Suggested time', item?.suggestedDuration),
    detail('Highlight', item?.highlight),
    detail('Cuisine', item?.cuisine),
    detail('Price', item?.price),
    detail('Good for', Array.isArray(item?.goodFor) ? item.goodFor.join(' · ') : undefined),
    item?.bookingRecommended ? detail('Booking', 'Recommended') : '',
  ].join('')

  return `<li class="stop">
    <time>${text(activity?.time, 'Anytime')}</time>
    <article class="stop-card">
      <div class="stop-heading">
        <div><p class="category">${escapeHtml(category)}</p><h3>${escapeHtml(title)}</h3></div>
        ${activity?.duration ? `<span class="duration">${escapeHtml(activity.duration)}</span>` : ''}
      </div>
      <p class="description">${escapeHtml(description)}</p>
      ${location ? `<p class="location"><span aria-hidden="true">●</span> ${escapeHtml(location)}</p>` : ''}
      ${catalogDetails ? `<dl class="catalog-details">${catalogDetails}</dl>` : ''}
    </article>
  </li>`
}

function dayMarkup(day, index, catalog) {
  const activities = Array.isArray(day?.activities) ? day.activities : []
  const stops = activities.length
    ? `<ol class="timeline">${activities.map((activity) => activityMarkup(activity, catalog.get(activity?.placeId ?? activity?.venueId))).join('')}</ol>`
    : '<p class="empty">Nothing timed yet. This day is free for spontaneous plans.</p>'

  return `<section class="day" id="day-panel-${index}" role="tabpanel" aria-labelledby="day-tab-${index}"${index === 0 ? '' : ' hidden style="display:none"'}>
    <header class="day-heading">
      <p class="day-label">Day ${index + 1} · ${text(day?.date, 'Date TBD')}</p>
      <h2>${text(day?.title, 'Open day')}</h2>
      <p>${text(day?.summary, 'A flexible day to make your own.')}</p>
    </header>
    ${stops}
    <aside class="day-notes">
      <h3>Day notes</h3>
      <dl>
        ${detail('Base', day?.base ?? 'Flexible')}
        ${detail('Driving', day?.driving ?? 'Not set')}
        ${detail('Pace', day?.pace ?? 'Easy')}
      </dl>
      ${day?.tip ? `<p class="tip"><strong>Good to know</strong>${escapeHtml(day.tip)}</p>` : ''}
    </aside>
  </section>`
}

function daySelectorMarkup(days) {
  if (!days.length) return ''
  return `<nav class="day-selector" aria-label="Choose itinerary day">
    <div class="day-tabs" role="tablist" aria-label="Itinerary days">
      ${days.map((day, index) => `<button class="day-tab" id="day-tab-${index}" type="button" role="tab" aria-selected="${index === 0}" aria-controls="day-panel-${index}" tabindex="${index === 0 ? '0' : '-1'}" onclick="showDay(${index})" onkeydown="return moveDay(event, ${index})">
        <span>Day ${index + 1}</span><strong>${text(day?.shortDate ?? day?.date, `Day ${index + 1}`)}</strong>
      </button>`).join('')}
    </div>
  </nav>`
}

export function createItineraryHtml({ days, places, venues, tripName = 'Crete itinerary' }) {
  const safeDays = Array.isArray(days) ? days : []
  const catalogEntries = [
    ...(Array.isArray(places) ? places : []),
    ...(Array.isArray(venues) ? venues : []),
  ]
  const catalog = new Map(catalogEntries.filter((entry) => entry?.id).map((entry) => [entry.id, entry]))
  const totalStops = safeDays.reduce((sum, day) => sum + (Array.isArray(day?.activities) ? day.activities.length : 0), 0)
  const content = safeDays.length
    ? safeDays.map((day, index) => dayMarkup(day, index, catalog)).join('')
    : '<section class="empty empty-trip"><h2>Your days are wide open</h2><p>No itinerary days have been added yet.</p></section>'
  const safeTripName = escapeHtml(tripName)

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${safeTripName}</title>
  <style>
    :root { color: #173d36; background: #e9e1d3; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-synthesis: none; }
    * { box-sizing: border-box; }
    html { -webkit-text-size-adjust: 100%; }
    body { margin: 0; min-width: 280px; background: #e9e1d3; }
    .page { width: 100%; max-width: 46rem; min-height: 100vh; margin: 0 auto; padding: 2rem 1.25rem 3rem; background: #f6f4ee; box-shadow: 0 1.5rem 4rem rgba(23,61,54,.13); }
    .trip-header { padding: .5rem 0 2.25rem; border-bottom: 1px solid rgba(23,61,54,.12); }
    .eyebrow, .day-label, .category, .day-notes > h3 { margin: 0; color: #a64f34; font-size: .72rem; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; }
    h1, h2, h3, p { overflow-wrap: anywhere; }
    h1, h2, .stop-card h3 { font-family: Georgia, "Times New Roman", serif; letter-spacing: -.025em; }
    h1 { margin: .55rem 0 .75rem; font-size: clamp(2.5rem, 13vw, 4rem); line-height: .98; }
    .trip-summary { margin: 0; color: #63736f; line-height: 1.65; }
    .day-selector { margin: 1.5rem -1.25rem 0; padding: 0 1.25rem .65rem; overflow-x: auto; scrollbar-width: thin; }
    .day-tabs { display: flex; width: max-content; gap: .5rem; }
    .day-tab { min-width: 6.75rem; padding: .75rem 1rem; border: 1px solid rgba(23,61,54,.1); border-radius: 1rem; background: #fffdf8; color: #526963; font: inherit; text-align: left; cursor: pointer; transition: border-color .18s, background .18s, color .18s, box-shadow .18s; }
    .day-tab span { display: block; font-size: .65rem; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; opacity: .72; }
    .day-tab strong { display: block; margin-top: .18rem; font-family: Georgia, "Times New Roman", serif; font-size: 1rem; }
    .day-tab[aria-selected="true"] { border-color: #173d36; background: #173d36; color: #fff; box-shadow: 0 .35rem .8rem rgba(23,61,54,.16); }
    .day-tab:focus-visible { outline: 2px solid #b76243; outline-offset: 3px; }
    .day { padding: 2.75rem 0; border-bottom: 1px solid rgba(23,61,54,.12); break-inside: avoid; }
    .day:last-child { border-bottom: 0; }
    .day-heading { margin-bottom: 1.75rem; }
    .day-heading h2 { margin: .35rem 0 .55rem; font-size: 2rem; line-height: 1.08; }
    .day-heading > p:last-child { margin: 0; color: #63736f; line-height: 1.55; }
    .timeline { position: relative; margin: 0 0 1.75rem .35rem; padding: 0 0 0 1.55rem; border-left: 1px solid rgba(23,61,54,.18); list-style: none; }
    .stop { position: relative; padding: 0 0 1.65rem; break-inside: avoid; }
    .stop:last-child { padding-bottom: 0; }
    .stop::before { position: absolute; top: .35rem; left: -1.91rem; width: .7rem; height: .7rem; border: 2px solid #f6f4ee; border-radius: 50%; background: #b76243; box-shadow: 0 0 0 1px #b76243; content: ""; }
    .stop > time { display: block; margin: 0 0 .55rem; color: #b76243; font-size: .86rem; font-weight: 800; }
    .stop-card { padding: 1.2rem; border: 1px solid rgba(23,61,54,.1); border-radius: 1rem; background: #fffdf8; box-shadow: 0 .35rem 1.25rem rgba(29,61,52,.04); }
    .stop-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: .75rem; }
    .category { color: #788783; font-size: .66rem; letter-spacing: .1em; }
    .stop-card h3 { margin: .22rem 0 0; font-size: 1.45rem; line-height: 1.12; }
    .duration { flex: none; padding: .35rem .65rem; border-radius: 999px; background: #f0ece4; color: #526963; font-size: .72rem; font-weight: 700; }
    .description { margin: .85rem 0 0; color: #63736f; font-size: .88rem; line-height: 1.6; }
    .location { margin: .9rem 0 0; color: #526963; font-size: .76rem; font-weight: 700; }
    .location span { color: #b76243; font-size: .55rem; }
    .catalog-details { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .75rem 1rem; margin: 1rem 0 0; padding-top: 1rem; border-top: 1px solid rgba(23,61,54,.09); }
    .catalog-details div { min-width: 0; }
    dt { color: #788783; font-size: .7rem; }
    dd { margin: .12rem 0 0; font-size: .8rem; font-weight: 700; line-height: 1.35; overflow-wrap: anywhere; }
    .day-notes { padding: 1.25rem; border-radius: 1.25rem; background: #e9e1d3; break-inside: avoid; }
    .day-notes > h3 { margin-bottom: .85rem; color: #8a522f; }
    .day-notes > dl { display: grid; grid-template-columns: repeat(3, 1fr); gap: .8rem; margin: 0; }
    .tip { margin: 1rem 0 0; padding-top: 1rem; border-top: 1px solid rgba(23,61,54,.1); color: #47635d; font-size: .85rem; line-height: 1.55; }
    .tip strong { display: block; margin-bottom: .2rem; color: #8a522f; }
    .empty { margin: 0 0 1.75rem; padding: 1.5rem; border: 1px dashed rgba(23,61,54,.22); border-radius: 1.25rem; color: #63736f; text-align: center; }
    .empty-trip { margin-top: 2rem; }
    .empty h2 { margin: 0 0 .4rem; color: #173d36; font-family: Georgia, "Times New Roman", serif; }
    .empty p { margin: 0; }
    .export-footer { padding-top: 1.5rem; color: #788783; font-size: .72rem; text-align: center; }
    @media (min-width: 48rem) { .page { padding: 3.5rem 3.25rem 4rem; } .day-selector { margin-right: -3.25rem; margin-left: -3.25rem; padding-right: 3.25rem; padding-left: 3.25rem; } .stop-card { padding: 1.4rem; } }
    @media (max-width: 23rem) { .day-notes > dl, .catalog-details { grid-template-columns: 1fr; } .stop-heading { display: block; } .duration { display: inline-block; margin-top: .65rem; } }
    @media print {
      :root, body { background: #fff; }
      .page { max-width: none; min-height: 0; padding: 0; box-shadow: none; }
      .trip-header { padding-top: 0; }
      .day-selector { display: none; }
      .day[hidden] { display: block !important; }
      .day { break-inside: auto; }
      .stop-card, .day-notes { box-shadow: none; }
      .export-footer { display: none; }
      @page { margin: 14mm; }
    }
  </style>
</head>
<body>
  <main class="page">
    <header class="trip-header">
      <p class="eyebrow">Your saved plan</p>
      <h1>${safeTripName}</h1>
      <p class="trip-summary">${safeDays.length} ${safeDays.length === 1 ? 'day' : 'days'} · ${totalStops} planned ${totalStops === 1 ? 'stop' : 'stops'} · mobile itinerary</p>
    </header>
    ${daySelectorMarkup(safeDays)}
    ${content}
    <footer class="export-footer">Offline itinerary · Crete, slowly</footer>
  </main>
  <script>
    function showDay(index, moveFocus) {
      var tabs = document.querySelectorAll('[role="tab"]');
      var i;
      for (i = 0; i < tabs.length; i += 1) {
        var active = i === index;
        var panel = document.getElementById(tabs[i].getAttribute('aria-controls'));
        tabs[i].setAttribute('aria-selected', active ? 'true' : 'false');
        tabs[i].setAttribute('tabindex', active ? '0' : '-1');
        if (panel) {
          panel.hidden = !active;
          panel.style.display = active ? 'block' : 'none';
        }
      }
      if (moveFocus && tabs[index]) tabs[index].focus();
    }
    function moveDay(event, index) {
      var tabs = document.querySelectorAll('[role="tab"]');
      var next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return true;
      event.preventDefault();
      showDay(next, true);
      return false;
    }
    showDay(0);
  </script>
</body>
</html>`
}

export function downloadItineraryHtml(data) {
  const html = createItineraryHtml(data)
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = EXPORT_FILENAME
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
