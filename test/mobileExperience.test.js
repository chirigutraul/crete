import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const appSource = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8')
const documentSource = await readFile(new URL('../index.html', import.meta.url), 'utf8')

test('uses the mobile guide directly without a preview toggle', () => {
  assert.doesNotMatch(appSource, /Mobile preview|Preview layout|mobilePreview/)
  assert.match(appSource, /function Itinerary\(\{ days, places, venues, standalone = false \}\) \{\s+const \[selectedDay/)
})

test('uses mobile layouts as the responsive baseline for every section', () => {
  assert.match(appSource, /className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"/)
  assert.match(appSource, /className="relative grid overflow-hidden[^\n]+sm:grid-cols-\[180px_1fr\]/)
  assert.doesNotMatch(appSource, /lg:grid-cols-\[minmax\(0,1fr\)_300px\]/)
  assert.doesNotMatch(appSource, /sm:grid sm:grid-cols-\[90px_1fr\]/)
  assert.match(documentSource, /viewport-fit=cover/)
})

test('uses the gyro photo behind a high-contrast hero treatment', () => {
  assert.match(appSource, /backgroundImage: "url\('\/gyro-hero\.webp'\)"/)
  assert.match(appSource, /bg-gradient-to-r from-\[#102d28\]\/85 via-\[#102d28\]\/58 to-\[#102d28\]\/20/)
  assert.match(appSource, /text-\[#fff8ed\]/)
})

test('catalog cards expose separate detail and directions actions', () => {
  assert.match(appSource, /href={`\/places\/\$\{item\.id\}`}/)
  assert.match(appSource, /href={`\/restaurants\/\$\{item\.id\}`}/)
  assert.match(appSource, /Directions <span aria-hidden="true">→<\/span>/)
  assert.match(appSource, /function DirectionsLink/)
})

test('detail pages provide practical tourist information and navigation', () => {
  assert.match(appSource, /function DetailPage/)
  assert.match(appSource, /Why it’s worth your time/)
  assert.match(appSource, /Before you go/)
  assert.match(appSource, /Traveler snapshot/)
})

test('itinerary stops can open directions without losing their context', () => {
  assert.match(appSource, /<TimelineItem[^>]+kind=/)
  assert.match(appSource, /<DirectionsLink item={item} activity={activity}/)
})
