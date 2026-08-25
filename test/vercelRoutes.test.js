import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const vercelConfigUrl = new URL('../vercel.json', import.meta.url)

test('serves client-side detail routes through the guide entry point', async () => {
  const config = JSON.parse(await readFile(vercelConfigUrl, 'utf8'))

  assert.deepEqual(config.rewrites, [
    { source: '/places/:id', destination: '/index.html' },
    { source: '/restaurants/:id', destination: '/index.html' },
  ])
})
