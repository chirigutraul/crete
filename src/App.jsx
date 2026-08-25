import { useMemo, useState } from 'react'
import places from './data/places.json'
import venues from './data/restaurants.json'
import itinerary from './data/itinerary.json'
import sources from './data/sources.json'
import { filterByLocation, LOCATION_FILTERS } from './locationFilter.js'
import { getDirectionsUrl, getItemDestination } from './maps.js'
import { buildPlaceDetails } from './placeDetails.js'
import { getGuideTab } from './appRoute.js'

const iconPaths = {
  compass: <><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2.1 4.9-4.9 2.1 2.1-4.9 4.9-2.1Z"/></>,
  fork: <><path d="M7 3v7M4 3v4a3 3 0 0 0 6 0V3M7 10v11M17 3v18M17 3c-2 2-2 7 0 9h2"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
  map: <><path d="m3 6 5-3 8 3 5-3v15l-5 3-8-3-5 3V6Z"/><path d="M8 3v15M16 6v15"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/></>,
  euro: <><circle cx="12" cy="12" r="9"/><path d="M16 8.5a4.5 4.5 0 1 0 0 7M7 10.5h7M7 13.5h6"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
  info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
  star: <><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/></>,
}

function Icon({ name, size = 18, className = '' }) {
  return <svg aria-hidden="true" className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{iconPaths[name]}</svg>
}

const tabs = [
  { id: 'places', label: 'Places to visit', shortLabel: 'Places', icon: 'compass' },
  { id: 'food', label: 'Restaurants & bars', shortLabel: 'Food & drink', icon: 'fork' },
  { id: 'itinerary', label: 'Itinerary', shortLabel: 'Itinerary', icon: 'calendar' },
]

function App({ route = { name: 'guide' } }) {
  const [activeTab, setActiveTab] = useState(() => getGuideTab(window.location.hash))
  const [placeLocation, setPlaceLocation] = useState('All')
  const [foodLocation, setFoodLocation] = useState('All')

  if (route.name === 'itinerary') {
    return (
      <div className="standalone-itinerary min-h-screen bg-[#f6f4ee] text-[#173d36]">
        <title>Crete itinerary</title>
        <main id="main-content" className="mx-auto min-h-screen w-full max-w-[430px]">
          <Itinerary standalone days={itinerary} places={places} venues={venues} />
        </main>
      </div>
    )
  }

  if (route.name === 'place-detail' || route.name === 'restaurant-detail') {
    const kind = route.name === 'place-detail' ? 'place' : 'restaurant'
    const catalog = kind === 'place' ? places : venues
    const item = catalog.find((entry) => entry.id === route.id)
    return <DetailPage item={item} kind={kind} />
  }

  function handleTabKeyDown(event) {
    const index = tabs.findIndex((tab) => tab.id === activeTab)
    let nextIndex
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = tabs.length - 1
    if (nextIndex === undefined) return
    event.preventDefault()
    setActiveTab(tabs[nextIndex].id)
    document.getElementById(`tab-${tabs[nextIndex].id}`)?.focus()
  }

  return (
    <div className="app-shell min-h-screen bg-[#f6f4ee] text-[#173d36]">
      <header className="relative overflow-hidden border-b border-[#173d36]/10 bg-[#f2eee5]">
        <div className="absolute -right-24 -top-40 h-96 w-96 rounded-full bg-[#e6b66a]/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 pb-7 pt-7 sm:px-8 lg:px-12 lg:pb-10 lg:pt-10">
          <div className="mb-10 flex items-center justify-between lg:mb-16">
            <a href="#main-content" className="flex items-center gap-3 font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b76243]"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#173d36] text-[#f8f2e7]"><Icon name="map" size={20} /></span><span>Crete, slowly</span></a>
            <div className="hidden items-center gap-2 rounded-full border border-[#173d36]/15 bg-white/50 px-4 py-2 text-sm font-medium sm:flex"><Icon name="sun" size={16} className="text-[#b76243]" /> Curated island guide</div>
          </div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#b76243]">Save less. Experience more.</p>
          <h1 className="max-w-3xl font-serif text-5xl leading-[0.95] tracking-[-0.04em] text-[#173d36] sm:text-6xl lg:text-7xl">Your considered guide to Crete</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#47635d] sm:text-lg">Discover island favourites, then see them come together in one calm, readable itinerary.</p>
        </div>
      </header>

      <div className="sticky top-0 z-20 border-b border-[#173d36]/10 bg-[#f6f4ee]/95 backdrop-blur-lg">
        <nav aria-label="Trip sections" className="mx-auto max-w-7xl px-3 sm:px-8 lg:px-12"><div role="tablist" aria-label="Trip content" className="grid grid-cols-3 gap-1 py-2 sm:flex sm:gap-3">
          {tabs.map((tab) => <button key={tab.id} id={`tab-${tab.id}`} role="tab" type="button" aria-selected={activeTab === tab.id} aria-controls={`panel-${tab.id}`} tabIndex={activeTab === tab.id ? 0 : -1} onClick={() => setActiveTab(tab.id)} onKeyDown={handleTabKeyDown} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b76243] sm:flex-row sm:gap-2 sm:px-5 sm:py-3 sm:text-sm ${activeTab === tab.id ? 'bg-[#173d36] text-white shadow-sm' : 'text-[#5d716d] hover:bg-white/70 hover:text-[#173d36]'}`}><Icon name={tab.icon} size={17} /><span className="sm:hidden">{tab.shortLabel}</span><span className="hidden sm:inline">{tab.label}</span></button>)}
        </div></nav>
      </div>

      <main id="main-content" className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
        {activeTab === 'places' && <TabPanel id="places"><Places items={places} location={placeLocation} onLocationChange={setPlaceLocation} /></TabPanel>}
        {activeTab === 'food' && <TabPanel id="food"><Food items={venues} location={foodLocation} onLocationChange={setFoodLocation} /></TabPanel>}
        {activeTab === 'itinerary' && <TabPanel id="itinerary"><Itinerary days={itinerary} places={places} venues={venues} /></TabPanel>}
      </main>
    </div>
  )
}

function TabPanel({ id, children }) { return <section id={`panel-${id}`} role="tabpanel" aria-labelledby={`tab-${id}`} tabIndex="0" className="focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[#b76243]">{children}</section> }

function SectionHeading({ eyebrow, title, description, compact = false }) {
  return <div className={`mb-8 ${compact ? '' : 'sm:mb-10'}`}><p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#b76243]">{eyebrow}</p><h2 className={`font-serif tracking-[-0.03em] ${compact ? 'text-4xl' : 'text-4xl sm:text-5xl'}`}>{title}</h2><p className="mt-3 max-w-2xl leading-7 text-[#63736f]">{description}</p></div>
}

function EmptyState({ icon, title, message }) { return <div className="rounded-3xl border border-dashed border-[#173d36]/20 bg-white/45 px-6 py-16 text-center"><span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-[#e9e4da] text-[#47635d]"><Icon name={icon} /></span><h3 className="font-serif text-2xl">{title}</h3><p className="mx-auto mt-2 max-w-md text-[#63736f]">{message}</p></div> }

function LocationFilters({ items, selected, onChange, label }) {
  return <div className="-mx-5 mb-8 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0" aria-label={label}><div className="flex min-w-max gap-2" role="group">{LOCATION_FILTERS.map((location) => {
    const count = filterByLocation(items, location).length
    const isSelected = selected === location
    return <button key={location} type="button" aria-pressed={isSelected} aria-label={`${location}, ${count} results`} onClick={() => onChange(location)} className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b76243] ${isSelected ? 'border-[#173d36] bg-[#173d36] text-white shadow-sm' : 'border-[#173d36]/15 bg-[#fffdf8] text-[#526963] hover:border-[#173d36]/35 hover:text-[#173d36]'}`}>{location} ({count})</button>
  })}</div></div>
}

function DirectionsLink({ item, activity, className = '' }) {
  const destination = getItemDestination(item, activity)
  const href = getDirectionsUrl(destination)
  if (!href) return null
  return <a href={href} target="_blank" rel="noreferrer" aria-label={`Directions to ${item?.name ?? activity?.title}`} className={`relative z-10 inline-flex min-h-11 items-center justify-center gap-2 rounded-full font-bold text-[#173d36] no-underline transition hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b76243] ${className}`}>Directions <span aria-hidden="true">→</span></a>
}

function CardActions({ item, detailHref }) {
  return <div className="relative z-10 mt-4 grid grid-cols-2 gap-2">
    <a href={detailHref} aria-label={`View details for ${item.name}`} className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#173d36]/20 px-4 text-sm font-bold text-[#173d36] no-underline transition hover:border-[#173d36]/45 hover:bg-[#f2eee5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b76243]">View details</a>
    <DirectionsLink item={item} className="bg-[#173d36] px-4 text-sm text-[#fffdf8]" />
  </div>
}

function Places({ items, location, onLocationChange }) {
  if (!Array.isArray(items) || !items.length) return <EmptyState icon="compass" title="No places curated yet" message="Beaches, villages, and landmarks will appear here once added to the local catalog." />
  const filteredItems = filterByLocation(items, location)
  return <><SectionHeading eyebrow="Discover Crete" title="Places to visit" description="A considered shortlist—from turquoise lagoons to mountain villages." /><LocationFilters items={items} selected={location} onChange={onLocationChange} label="Filter places by location" />{filteredItems.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filteredItems.map((item, index) => <article key={item.id ?? index} className="group relative overflow-hidden rounded-3xl border border-[#173d36]/10 bg-[#fffdf8] shadow-[0_8px_30px_rgba(29,61,52,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_40px_rgba(29,61,52,0.1)] focus-within:ring-2 focus-within:ring-[#b76243] focus-within:ring-offset-2"><a href={`/places/${item.id}`} aria-label={`View details for ${item.name}`} className="absolute inset-0 z-[1] rounded-3xl focus:outline-none" /><div className={`relative h-44 overflow-hidden place-art place-art-${index % 6}`}><span className="absolute left-4 top-4 rounded-full bg-[#fffdf8]/90 px-3 py-1.5 text-xs font-bold backdrop-blur">{item.type ?? 'Place'}</span><span className="absolute bottom-4 right-4 grid h-9 w-9 place-items-center rounded-full bg-[#173d36] text-white"><Icon name="compass" size={17} /></span></div><div className="p-6"><div className="mb-3 flex items-start justify-between gap-4"><h3 className="font-serif text-2xl leading-tight">{item.name ?? 'Untitled place'}</h3>{item.highlight && <span className="shrink-0 rounded-full bg-[#efe0bd] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#8a522f]">{item.highlight}</span>}</div><p className="line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-[#63736f]">{item.description ?? 'Details coming soon.'}</p><div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#173d36]/10 pt-4 text-xs font-semibold text-[#526963]"><span className="flex items-center gap-1.5"><Icon name="clock" size={15} />{item.suggestedDuration ?? 'Flexible'}</span><span className="flex items-center gap-1.5"><Icon name="pin" size={15} />{item.area ?? 'Crete'}</span></div><CardActions item={item} detailHref={`/places/${item.id}`} /></div></article>)}</div> : <EmptyState icon="map" title={`No places in ${location}`} message="Choose another location to see the rest of the island guide." />}</>
}

function Food({ items, location, onLocationChange }) {
  if (!Array.isArray(items) || !items.length) return <EmptyState icon="fork" title="No venues curated yet" message="Tavernas, cafés, and sunset bars will appear here once added to the local catalog." />
  const filteredItems = filterByLocation(items, location)
  return <>
    <SectionHeading eyebrow="Eat like a local" title="Restaurants & bars" description="Tavernas worth the drive, slow lunches, and drinks by the water." />
    <LocationFilters items={items} selected={location} onChange={onLocationChange} label="Filter restaurants and bars by location" />
    {filteredItems.length ? <div className="space-y-4">{filteredItems.map((item, index) =>
      <article key={item.id ?? index} className="relative grid overflow-hidden rounded-3xl border border-[#173d36]/10 bg-[#fffdf8] shadow-[0_8px_30px_rgba(29,61,52,0.04)] transition hover:border-[#173d36]/25 focus-within:ring-2 focus-within:ring-[#b76243] focus-within:ring-offset-2 sm:grid-cols-[180px_1fr] lg:grid-cols-[220px_1fr]">
        <a href={`/restaurants/${item.id}`} aria-label={`Open details for ${item.name}`} className="absolute inset-0 z-[1] rounded-3xl focus:outline-none" />
        <div className={`min-h-40 food-art food-art-${index % 5}`} aria-hidden="true" />
        <div className="flex min-w-0 flex-col">
          <div className="p-6 lg:p-7">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#b76243]"><span>{item.type ?? 'Restaurant'}</span><span aria-hidden="true">·</span><span>{item.cuisine ?? 'Cretan'}</span></div>
            <h3 className="mt-2 font-serif text-2xl sm:text-3xl">{item.name ?? 'Untitled venue'}</h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#63736f]">{item.description ?? 'Details coming soon.'}</p>
            {(Array.isArray(item.goodFor) || item.bookingRecommended) && <div className="mt-4 flex flex-wrap gap-2">
              {item.goodFor?.map((tag) => <span key={tag} className="rounded-full bg-[#f0ece4] px-3 py-1.5 text-xs font-semibold text-[#526963]">{tag}</span>)}
              {item.bookingRecommended && <span className="rounded-full bg-[#e8dbc5] px-3 py-1.5 text-xs font-bold text-[#8a522f]">Book ahead</span>}
            </div>}
          </div>
          <div className="mt-auto border-t border-[#173d36]/10 px-6 py-5 lg:px-7">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-[#526963]">
              <p className="flex min-w-0 items-center gap-2"><Icon name="pin" size={16} className="shrink-0" /><span className="truncate">{item.area ?? 'Crete'}</span></p>
              <p className="flex shrink-0 items-center gap-2"><Icon name="euro" size={16} />{item.price ?? '€€'}</p>
            </div>
            <CardActions item={item} detailHref={`/restaurants/${item.id}`} />
          </div>
        </div>
      </article>
    )}</div> : <EmptyState icon="fork" title={`No venues in ${location}`} message="Choose another location to see the rest of the food and drink guide." />}
  </>
}

function DetailPage({ item, kind }) {
  const backHref = kind === 'place' ? '/#places' : '/#food'
  const backLabel = kind === 'place' ? 'All places' : 'All restaurants & bars'

  if (!item) {
    return <div className="detail-shell min-h-screen bg-[#f6f4ee] px-5 py-8 text-[#173d36]"><main id="main-content" className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-start justify-center"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b76243]">Not found</p><h1 className="mt-3 font-serif text-5xl tracking-[-0.04em]">This stop isn’t in the guide.</h1><p className="mt-5 leading-7 text-[#63736f]">The link may be outdated, but the rest of the island guide is ready for you.</p><a href="/" className="mt-8 inline-flex min-h-12 items-center rounded-full bg-[#173d36] px-6 font-bold text-[#fffdf8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b76243]">Return to the guide</a></main></div>
  }

  const details = buildPlaceDetails(item, kind)
  const sourceLinks = sources[`${kind === 'place' ? 'places' : 'restaurants'}`]?.[item.id] ?? []
  const isPlace = kind === 'place'

  return <div className="detail-shell min-h-screen bg-[#f6f4ee] text-[#173d36]">
    <title>{item.name} · Crete, slowly</title>
    <header className="border-b border-[#173d36]/10 bg-[#f2eee5] px-5 pb-6 pt-5 sm:px-8"><div className="mx-auto flex max-w-5xl items-center justify-between"><a href={backHref} className="inline-flex min-h-11 items-center gap-2 font-bold text-[#47635d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b76243]"><span aria-hidden="true">←</span> {backLabel}</a><span className="text-sm font-semibold">Crete, slowly</span></div></header>
    <main id="main-content">
      <div className={`detail-art ${isPlace ? 'place-art place-art-0' : 'food-art food-art-1'}`} aria-hidden="true" />
      <article className="mx-auto max-w-5xl px-5 pb-16 sm:px-8 sm:pb-24">
        <div className="-mt-7 relative z-10 rounded-[2rem] bg-[#fffdf8] px-5 py-7 shadow-[0_18px_60px_rgba(29,61,52,0.12)] sm:-mt-12 sm:px-10 sm:py-10">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#b76243]"><span>{item.type ?? (isPlace ? 'Place' : 'Venue')}</span>{item.cuisine && <><span aria-hidden="true">·</span><span>{item.cuisine}</span></>}</div>
          <h1 className="mt-3 max-w-4xl font-serif text-5xl leading-[0.95] tracking-[-0.045em] sm:text-7xl">{item.name}</h1>
          <p className="mt-5 flex items-start gap-2 text-sm font-semibold text-[#526963]"><Icon name="pin" size={17} className="mt-0.5 shrink-0" />{item.area ?? 'Crete'}</p>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#47635d]">{item.description ?? 'A curated stop in Crete. Check current local information before visiting.'}</p>
          <div className="mt-8 border-t border-[#173d36]/10 pt-6"><DirectionsLink item={item} className="w-full bg-[#173d36] px-6 text-[#fffdf8] no-underline sm:w-auto" /></div>
        </div>

        <div className="detail-grid mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-16">
          <div className="space-y-12">
            <section aria-labelledby="why-visit"><p className="detail-number">01</p><h2 id="why-visit" className="mt-2 font-serif text-3xl">Why it’s worth your time</h2><p className="mt-4 text-base leading-7 text-[#526963]">{details.whyVisit}</p>{Array.isArray(item.goodFor) && <div className="mt-5 flex flex-wrap gap-2">{item.goodFor.map((tag) => <span key={tag} className="rounded-full bg-[#e9e1d3] px-3 py-1.5 text-xs font-bold text-[#526963]">{tag}</span>)}</div>}</section>
            <section aria-labelledby="before-you-go"><p className="detail-number">02</p><h2 id="before-you-go" className="mt-2 font-serif text-3xl">Before you go</h2><p className="mt-4 text-base leading-7 text-[#526963]">{details.practical}</p><p className="mt-4 rounded-2xl bg-[#efe0bd]/65 p-4 text-sm leading-6 text-[#69482f]"><strong>Island reality:</strong> opening hours, access and weather can change seasonally. Recheck on the day, especially before a long drive.</p></section>
            <section aria-labelledby="traveler-snapshot"><p className="detail-number">03</p><h2 id="traveler-snapshot" className="mt-2 font-serif text-3xl">Traveler snapshot</h2>{details.ratingLabel ? <div className="mt-5 flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#173d36] text-[#f6d789]"><Icon name="star" size={20} /></span><div><p className="font-serif text-2xl">{details.ratingLabel}</p><p className="mt-1 text-xs text-[#788783]">{details.ratingCheckedAt}. Ratings can change; open Google Maps for current reviews.</p></div></div> : <p className="mt-4 text-base leading-7 text-[#526963]">This guide avoids copying anonymous review snippets. Use the practical notes above for planning, then open Google Maps to read the latest first-hand visitor experiences.</p>}</section>
            {sourceLinks.length > 0 && <section aria-labelledby="research"><p className="detail-number">04</p><h2 id="research" className="mt-2 font-serif text-3xl">Research & current information</h2><p className="mt-3 text-sm leading-6 text-[#63736f]">Use these sources to confirm details close to your visit.</p><ul className="mt-4 space-y-2">{sourceLinks.map((url, index) => <li key={url}><a href={url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 font-bold text-[#173d36] underline decoration-[#b76243]/45 underline-offset-4">Visitor source {index + 1} <Icon name="arrow" size={15} /></a></li>)}</ul></section>}
          </div>
          <aside className="h-fit border-y border-[#173d36]/15 py-6 lg:sticky lg:top-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b76243]">At a glance</p><dl className="mt-5 space-y-5"><InfoRow icon="clock" label={isPlace ? 'Time to allow' : 'Best for'} value={isPlace ? details.duration : (item.goodFor?.join(', ') ?? 'A relaxed stop')} /><InfoRow icon="pin" label="Area" value={item.area ?? 'Crete'} />{!isPlace && <InfoRow icon="euro" label="Price guide" value={item.price ?? 'Check current menu'} />}</dl><DirectionsLink item={item} className="mt-6 w-full bg-[#173d36] px-5 text-[#fffdf8] no-underline" /></aside>
        </div>
      </article>
    </main>
  </div>
}

function Itinerary({ days, places, venues, standalone = false }) {
  const [selectedDay, setSelectedDay] = useState(0)
  const safeDays = Array.isArray(days) ? days : []
  const activeDay = safeDays[selectedDay] ?? safeDays[0]
  const catalog = useMemo(() => new Map([...places, ...venues].filter((entry) => entry?.id).map((entry) => [entry.id, entry])), [places, venues])
  const totalStops = safeDays.reduce((sum, day) => sum + (Array.isArray(day.activities) ? day.activities.length : 0), 0)
  const tripName = itinerary.tripName ?? 'Crete itinerary'
  if (!activeDay) return <EmptyState icon="calendar" title="Your days are wide open" message="Add day plans to the itinerary JSON to see them here." />
  const activities = Array.isArray(activeDay.activities) ? activeDay.activities : []
  return <div className={standalone ? 'min-h-screen w-full bg-[#f6f4ee] px-5 py-7' : 'mx-auto w-full max-w-3xl'}>
    <SectionHeading compact eyebrow="Your saved plan" title={tripName} description={`${safeDays.length} days · ${totalStops} planned stops · curated picks linked from the guide`} />
    <div className={`mb-8 snap-x snap-mandatory overflow-x-auto pb-2 ${standalone ? '-mx-5 px-5' : '-mx-5 px-5 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0'}`} aria-label="Choose itinerary day"><div className="flex min-w-max gap-2">{safeDays.map((day, index) => <button key={day.id ?? index} type="button" onClick={() => setSelectedDay(index)} aria-pressed={selectedDay === index} className={`min-h-12 snap-start rounded-2xl border px-5 py-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b76243] ${selectedDay === index ? 'border-[#173d36] bg-[#173d36] text-white shadow-md' : 'border-[#173d36]/10 bg-[#fffdf8] text-[#526963] hover:border-[#173d36]/30'}`}><span className="block text-[11px] font-bold uppercase tracking-widest opacity-70">Day {index + 1}</span><span className="mt-0.5 block font-serif text-lg">{day.shortDate ?? day.date ?? `Day ${index + 1}`}</span></button>)}</div></div>
    <div className="grid gap-8"><div><div className="mb-7"><p className="text-sm font-semibold text-[#b76243]">Day {selectedDay + 1} · {activeDay.date ?? 'Date TBD'}</p><h3 className="mt-1 font-serif text-3xl">{activeDay.title ?? 'Open day'}</h3><p className="mt-2 text-[#63736f]">{activeDay.summary ?? 'A flexible day to make your own.'}</p></div>{activities.length ? <ol className="relative ml-2 border-l border-[#173d36]/15">{activities.map((activity, index) => <TimelineItem key={activity.id ?? index} activity={activity} item={catalog.get(activity.placeId ?? activity.venueId)} kind={activity.placeId ? 'place' : activity.venueId ? 'restaurant' : ''} last={index === activities.length - 1} />)}</ol> : <EmptyState icon="clock" title="Nothing timed yet" message="This day is free for spontaneous plans." />}</div><aside className="h-fit rounded-3xl bg-[#e9e1d3] p-6"><p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[#8a522f]">Day notes</p><dl className="space-y-4 text-sm"><InfoRow icon="map" label="Base" value={activeDay.base ?? 'Flexible'} /><InfoRow icon="clock" label="Driving" value={activeDay.driving ?? 'Not set'} /><InfoRow icon="sun" label="Pace" value={activeDay.pace ?? 'Easy'} /></dl>{activeDay.tip && <div className="mt-6 border-t border-[#173d36]/10 pt-5"><p className="flex gap-2 text-sm leading-6 text-[#47635d]"><Icon name="info" size={18} className="mt-0.5 shrink-0 text-[#b76243]" />{activeDay.tip}</p></div>}</aside></div>
  </div>
}

function TimelineItem({ activity, item, kind, last }) {
  const hasBrokenReference = (activity.placeId || activity.venueId) && !item
  const detailHref = item && kind ? `/${kind === 'place' ? 'places' : 'restaurants'}/${item.id}` : ''
  return <li className={`relative pl-7 ${last ? 'pb-1' : 'pb-8'}`}><span className="absolute -left-[6px] top-1.5 h-3 w-3 rounded-full border-2 border-[#f6f4ee] bg-[#b76243] ring-1 ring-[#b76243]" /><time className="mb-2 block text-sm font-bold text-[#b76243]">{activity.time ?? 'Anytime'}</time><div className="rounded-2xl border border-[#173d36]/10 bg-[#fffdf8] p-5 shadow-[0_6px_20px_rgba(29,61,52,0.04)] sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wider text-[#788783]">{activity.type ?? item?.type ?? 'Activity'}</p><h4 className="mt-1 break-words font-serif text-2xl">{detailHref ? <a href={detailHref} className="underline decoration-[#b76243]/30 underline-offset-4 hover:decoration-[#b76243] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b76243]">{item.name}</a> : (item?.name ?? activity.title ?? (hasBrokenReference ? 'Unavailable catalog item' : 'Untitled stop'))}</h4></div>{activity.duration && <span className="shrink-0 rounded-full bg-[#f0ece4] px-3 py-1 text-xs font-semibold text-[#526963]">{activity.duration}</span>}</div><p className="mt-3 text-sm leading-6 text-[#63736f]">{activity.note ?? item?.description ?? (hasBrokenReference ? 'This itinerary reference no longer matches a catalog entry.' : 'Details coming soon.')}</p>{(item?.area || activity.location) && <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#526963]"><Icon name="pin" size={15} />{item?.area ?? activity.location}</p>}<DirectionsLink item={item} activity={activity} className="mt-4 w-full bg-[#173d36] px-4 text-sm text-[#fffdf8]" /></div></li>
}

function InfoRow({ icon, label, value }) { return <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#fffdf8]/70"><Icon name={icon} size={17} /></span><div><dt className="text-xs text-[#788783]">{label}</dt><dd className="font-semibold">{value}</dd></div></div> }

export default App
