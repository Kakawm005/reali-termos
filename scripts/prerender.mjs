import { readFile, writeFile } from 'node:fs/promises'
import { notFoundMeta, pages, renderPage, siteUrl } from '../.generated/entry-static.js'

const template = await readFile('dist/index.html', 'utf8')
const production = process.env.VERCEL_ENV === 'production'
const preview = process.env.VERCEL_ENV === 'preview'
const productionDomain = production ? process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() : undefined
const siteAddress = siteUrl || (productionDomain ? `https://${productionDomain}` : undefined)
const configured = siteAddress ? URL.parse(siteAddress) : null
if (siteAddress && (!configured || !['http:', 'https:'].includes(configured.protocol) || configured.href !== configured.origin + '/')) {
  throw new Error('A URL do site deve conter apenas a origem HTTP(S), sem caminho, parâmetros ou fragmento.')
}
if (production && configured?.protocol !== 'https:') {
  throw new Error('Defina VITE_SITE_URL com a origem HTTPS ou habilite VERCEL_PROJECT_PRODUCTION_URL nas variáveis de sistema da Vercel.')
}
const origin = preview ? undefined : configured?.origin
const escape = value => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])

for (const page of [...pages, notFoundMeta]) {
  const notFound = page.path === '/404'
  const address = origin && !notFound ? escape(origin + page.path) : null
  const metadata = notFound || preview ? '<meta name="robots" content="noindex">' : address
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
