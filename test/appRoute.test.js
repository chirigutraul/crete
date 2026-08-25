import assert from 'node:assert/strict'
import test from 'node:test'

import { getAppRoute, getGuideTab } from '../src/appRoute.js'

test('opens the standalone itinerary for its dedicated route', () => {
  assert.deepEqual(getAppRoute('/itinerary'), { name: 'itinerary' })
  assert.deepEqual(getAppRoute('/itinerary/'), { name: 'itinerary' })
})

test('opens a dedicated catalog detail route', () => {
  assert.deepEqual(getAppRoute('/places/balos-lagoon'), { name: 'place-detail', id: 'balos-lagoon' })
  assert.deepEqual(getAppRoute('/restaurants/tamam-chania/'), { name: 'restaurant-detail', id: 'tamam-chania' })
})

test('decodes safe ids and rejects incomplete detail routes', () => {
  assert.deepEqual(getAppRoute('/places/chania%20old%20town'), { name: 'place-detail', id: 'chania old town' })
  assert.deepEqual(getAppRoute('/places'), { name: 'guide' })
})

test('keeps other paths on the full guide', () => {
  assert.deepEqual(getAppRoute('/'), { name: 'guide' })
  assert.deepEqual(getAppRoute('/somewhere-else'), { name: 'guide' })
})

test('restores a linked guide tab and safely defaults unknown hashes', () => {
  assert.equal(getGuideTab('#food'), 'food')
  assert.equal(getGuideTab('#itinerary'), 'itinerary')
  assert.equal(getGuideTab('#unknown'), 'places')
  assert.equal(getGuideTab(''), 'places')
})
