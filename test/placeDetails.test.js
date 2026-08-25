import assert from 'node:assert/strict'
import test from 'node:test'

import { buildPlaceDetails } from '../src/placeDetails.js'

test('turns beach catalog information into useful visitor guidance', () => {
  const details = buildPlaceDetails({ type: 'Wild beach', area: 'Sfakia', highlight: 'Boat access', suggestedDuration: 'Half day' }, 'place')
  assert.match(details.whyVisit, /Boat access/)
  assert.match(details.practical, /water|shade/i)
  assert.equal(details.duration, 'Half day')
})

test('keeps venue ratings factual and dated', () => {
  const details = buildPlaceDetails({ type: 'Restaurant', cuisine: 'Cretan', googleRating: 4.7, googleReviewCount: 812, ratingCheckedAt: '2026-08-26', bookingRecommended: true }, 'restaurant')
  assert.equal(details.ratingLabel, '4.7 · 812 Google reviews')
  assert.equal(details.ratingCheckedAt, 'Rating checked 26 Aug 2026')
  assert.match(details.practical, /reserv/i)
})

test('provides honest fallbacks instead of fabricating reviews', () => {
  const details = buildPlaceDetails({}, 'place')
  assert.match(details.whyVisit, /Crete/)
  assert.equal(details.ratingLabel, '')
})
