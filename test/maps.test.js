import assert from 'node:assert/strict'
import test from 'node:test'

import { getDirectionsUrl, getItemDestination } from '../src/maps.js'

test('builds an encoded cross-platform directions URL for catalog items', () => {
  const destination = getItemDestination({ name: 'Ali Vafi’s Garden', area: 'Rethymno' })
  assert.equal(destination, 'Ali Vafi’s Garden, Rethymno, Crete, Greece')
  assert.equal(getDirectionsUrl(destination), 'https://www.google.com/maps/dir/?api=1&destination=Ali+Vafi%E2%80%99s+Garden%2C+Rethymno%2C+Crete%2C+Greece')
})

test('uses an itinerary location when a stop is not in the catalog', () => {
  assert.equal(getItemDestination(undefined, { title: 'Park and collect tickets', location: 'Kissamos Port' }), 'Kissamos Port, Crete, Greece')
  assert.equal(getItemDestination(undefined, { title: 'Drive to Hersonissos', location: 'HER Airport → Hersonissos' }), 'Hersonissos, Crete, Greece')
})

test('returns no directions URL when a destination is unavailable', () => {
  assert.equal(getItemDestination(undefined, {}), '')
  assert.equal(getDirectionsUrl(''), '')
})
