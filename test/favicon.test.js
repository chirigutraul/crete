import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const entryPoints = ['../index.html', '../itinerary/index.html']

test('every app entry point uses the gyro favicon', async () => {
  const documents = await Promise.all(
    entryPoints.map((entryPoint) => readFile(new URL(entryPoint, import.meta.url), 'utf8')),
  )

  for (const document of documents) {
    assert.match(document, /<link rel="icon" type="image\/png" href="\/gyro\.png" \/>/)
  }
})

test('the gyro favicon is a PNG in the public assets', async () => {
  const favicon = await readFile(new URL('../public/gyro.png', import.meta.url))

  assert.deepEqual([...favicon.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10])
})
