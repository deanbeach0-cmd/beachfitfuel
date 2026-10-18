// Read-only audit of how many photos each Square catalog item actually has.
//
//   node --env-file=.env.local scripts/square-photo-audit.mjs
//
// Answers three questions the site can't answer on its own:
//   1. Which items still need photos attached in Square's item editor?
//   2. Are any imageIds failing to resolve to a URL?
//   3. Are the image URLs on a host next.config.js actually allows?
//
// Mirrors the resolution logic in app/api/square/sync/route.ts deliberately —
// if this script and the site disagree, the sync is the thing that's wrong.

import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { SquareClient, SquareEnvironment } = require('square')

// Kept in step with next.config.js images.remotePatterns.
const ALLOWED_IMAGE_HOSTS = [
  'items-images-production.s3.us-west-2.amazonaws.com',
  'items-images-sandbox.s3.us-west-2.amazonaws.com',
]

if (!process.env.SQUARE_ACCESS_TOKEN) {
  console.error('SQUARE_ACCESS_TOKEN is not set. Run with: node --env-file=.env.local scripts/square-photo-audit.mjs')
  process.exit(1)
}

const environment =
  process.env.SQUARE_ENVIRONMENT === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox

const client = new SquareClient({ token: process.env.SQUARE_ACCESS_TOKEN, environment })

console.log(`Square environment: ${process.env.SQUARE_ENVIRONMENT ?? 'sandbox (default)'}\n`)

const allObjects = []
const page = await client.catalog.list({ types: 'ITEM,IMAGE' })
for await (const obj of page) allObjects.push(obj)

const imageUrlById = new Map()
for (const obj of allObjects) {
  if (obj.type !== 'IMAGE' || obj.isDeleted) continue
  const url = obj.imageData?.url
  if (obj.id && url) imageUrlById.set(obj.id, url)
}

const items = allObjects
  .filter((o) => o.type === 'ITEM' && !o.isDeleted && !o.itemData?.isArchived)
  .map((o) => {
    const imageIds = o.itemData?.imageIds ?? []
    const resolved = imageIds.map((id) => imageUrlById.get(id)).filter(Boolean)
    return {
      name: o.itemData?.name ?? '(unnamed)',
      attached: imageIds.length,
      resolved: resolved.length,
      unresolvedIds: imageIds.filter((id) => !imageUrlById.get(id)),
      urls: resolved,
    }
  })
  .sort((a, b) => b.resolved - a.resolved || a.name.localeCompare(b.name))

const nameWidth = Math.max(16, ...items.map((i) => i.name.length))
console.log(`${'ITEM'.padEnd(nameWidth)}  ATTACHED  RESOLVED`)
console.log('-'.repeat(nameWidth + 20))
for (const item of items) {
  const flag = item.attached !== item.resolved ? '  <-- unresolved ids' : item.resolved > 1 ? '  <-- carousel' : ''
  console.log(
    `${item.name.padEnd(nameWidth)}  ${String(item.attached).padStart(8)}  ${String(item.resolved).padStart(8)}${flag}`
  )
}

const withMultiple = items.filter((i) => i.resolved > 1)
const withNone = items.filter((i) => i.resolved === 0)
const broken = items.filter((i) => i.unresolvedIds.length > 0)

console.log(`\n${items.length} active items — ${withMultiple.length} with 2+ photos, ${withNone.length} with none.`)

if (withMultiple.length === 0) {
  console.log('No item has more than one photo, so the carousel will render as a single static image.')
  console.log('Attach more photos in Square: Items & Orders > Items > (item) > Images.')
}

if (broken.length > 0) {
  console.log('\nItems whose imageIds did not resolve to a URL (deleted or inaccessible IMAGE objects):')
  for (const item of broken) console.log(`  ${item.name}: ${item.unresolvedIds.join(', ')}`)
}

// A URL on an unlisted host still syncs fine but next/image refuses to optimize
// it, so the site falls back to the category emoji with no obvious cause.
const hosts = new Map()
for (const item of items) {
  for (const url of item.urls) {
    let host
    try {
      host = new URL(url).hostname
    } catch {
      host = `(unparseable: ${url})`
    }
    hosts.set(host, (hosts.get(host) ?? 0) + 1)
  }
}

if (hosts.size > 0) {
  console.log('\nImage hosts in use:')
  for (const [host, count] of hosts) {
    const ok = ALLOWED_IMAGE_HOSTS.includes(host)
    console.log(`  ${ok ? 'OK     ' : 'BLOCKED'} ${host} (${count} photo${count === 1 ? '' : 's'})`)
    if (!ok) console.log('          -> add this hostname to images.remotePatterns in next.config.js')
  }
}
