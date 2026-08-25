import assert from 'node:assert/strict'
import test from 'node:test'

import { getAppRoute } from '../src/appRoute.js'

test('opens the standalone itinerary for its dedicated route', () => {
  assert.equal(getAppRoute('/itinerary'), 'itinerary')
  assert.equal(getAppRoute('/itinerary/'), 'itinerary')
})

test('keeps other paths on the full guide', () => {
  assert.equal(getAppRoute('/'), 'guide')
  assert.equal(getAppRoute('/somewhere-else'), 'guide')
})
