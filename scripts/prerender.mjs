import { readFile, writeFile } from 'node:fs/promises'
import { notFoundMeta, pages, renderPage, siteUrl } from '../.generated/entry-static.js'

const template = await readFile('dist/index.html', 'utf8')
const configured = siteUrl ? new URL(siteUrl) : null
if (configured && (!['http:', 'https:'].includes(configured.protocol) || configured.href !== configured.origin + '/')) {
  throw new Error('VITE_SITE_URL deve conter a origem HTTP(S) do site, sem caminho.')
}
const origin = configured?.origin
const escape = value => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])

for (const page of [...pages, notFoundMeta]) {
  const notFound = page.path === '/404'
  const address = origin && !notFound ? escape(origin + page.path) : null
  const metadata = notFound ? '<meta name="robots" content="noindex">' : address
    ? `<link rel="canonical" href="${address}"><meta property="og:url" content="${address}">`
    : ''
  const html = template
    .replace(/<title>.*?<\/title>/, () => `<title>${escape(page.title)}</title>`)
    .replace(/(<meta (?:name="description"|property="og:description") content=")[^"]*"/g, (_, prefix) => prefix + escape(page.description) + '"')
    .replace(/(<meta property="og:title" content=")[^"]*"/, (_, prefix) => prefix + escape(page.title) + '"')
    .replace('<!-- page:metadata -->', () => metadata)
    .replace('<div id="root"></div>', () => `<div id="root">${renderPage(page.path)}</div>`)
  await writeFile(`dist/${page.path === '/' ? 'index' : page.path.slice(1)}.html`, html)
}

const urls = origin ? pages.map(page => `  <url><loc>${escape(origin + page.path)}</loc></url>`).join('\n') : ''
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`)
await writeFile('dist/robots.txt', 'User-agent: *\nAllow: /\n' + (origin ? `Sitemap: ${origin}/sitemap.xml\n` : ''))
