// Generates PWA icons from a font-free vector SVG (+ − × ÷ on a gradient).
// Run once: `node scripts/gen-icons.mjs`
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

const svg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#6366f1"/>
      <stop offset="1" stop-color="#a855f7"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#g)"/>
  <g fill="#ffffff">
    <!-- plus (top-left) -->
    <rect x="134" y="167" width="84" height="18" rx="9"/>
    <rect x="167" y="134" width="18" height="84" rx="9"/>
    <!-- minus (top-right) -->
    <rect x="294" y="167" width="84" height="18" rx="9"/>
    <!-- multiply (bottom-left) -->
    <rect x="134" y="327" width="84" height="18" rx="9" transform="rotate(45 176 336)"/>
    <rect x="134" y="327" width="84" height="18" rx="9" transform="rotate(-45 176 336)"/>
    <!-- divide (bottom-right) -->
    <rect x="294" y="327" width="84" height="18" rx="9"/>
    <circle cx="336" cy="304" r="11"/>
    <circle cx="336" cy="368" r="11"/>
  </g>
</svg>`

const buf = Buffer.from(svg)
mkdirSync('public', { recursive: true })

await sharp(buf).resize(512, 512).png().toFile('public/icon-512.png')
await sharp(buf).resize(192, 192).png().toFile('public/icon-192.png')
await sharp(buf).resize(512, 512).png().toFile('src/app/icon.png')
await sharp(buf).resize(180, 180).png().toFile('src/app/apple-icon.png')

console.log('✓ icons generated')
