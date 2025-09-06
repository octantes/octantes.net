import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import MarkdownIt from 'markdown-it'
import fm from 'front-matter'
import sizeOf from 'image-size'
import sharp from 'sharp'
import { minify } from 'html-minifier-terser'

const md = new MarkdownIt()

const contentDir = './content'
const outputDir = './dist'
const cacheFile = './.build-cache.json'
const siteUrl = 'https://octantes.github.io'

let cache = {}
try { cache = JSON.parse(await fs.readFile(cacheFile, 'utf-8')) } catch {}

const postDirs = (await fs.readdir(contentDir, { withFileTypes: true }))
  .filter(d => d.isDirectory())
  .map(d => d.name)

const postsDir = path.join(outputDir, 'posts')
try {
  const existingDirs = await fs.readdir(postsDir, { withFileTypes: true })
  for (const dirent of existingDirs) {
    if (!dirent.isDirectory()) continue
    const slug = dirent.name
    if (!postDirs.includes(slug)) {
      await fs.rm(path.join(postsDir, slug), { recursive: true, force: true })
      delete cache[`${slug}/index.md`]
    }
  }
} catch { await fs.mkdir(postsDir, { recursive: true }) }

const indexItems = []

for (const slug of postDirs) {
  const postFolder = path.join(contentDir, slug)
  const mdPath = path.join(postFolder, 'index.md')
  let raw
  try { raw = await fs.readFile(mdPath, 'utf-8') }
  catch { console.warn(`no se encontró index.md en ${slug}, se saltea`); continue }

  const { attributes, body } = fm(raw)
  const noteOutputDir = path.join(postsDir, slug)
  await fs.mkdir(noteOutputDir, { recursive: true })

  const hash = crypto.createHash('sha256').update(raw)
  try {
    const assets = await fs.readdir(postFolder, { withFileTypes: true })
    for (const asset of assets) {
      if (!asset.isFile() || asset.name === 'index.md') continue
      const assetPath = path.join(postFolder, asset.name)
      const destPath = path.join(noteOutputDir, asset.name)
      const data = await fs.readFile(assetPath)
      hash.update(data)

      if (/\.(jpe?g|png)$/i.test(asset.name)) {
        await sharp(assetPath)
          .resize({ width: 1200 })
          .webp({ quality: 80 })
          .toFile(destPath.replace(/\.(jpe?g|png)$/i, '.webp'))
      } else {
        await fs.writeFile(destPath, data)
      }
    }
  } catch {}

  const finalHash = hash.digest('hex')

  if (cache[`${slug}/index.md`] !== finalHash) {
    let htmlContent = md.render(body)

    // --- rutas relativas ---
    const relativeDepth = path.relative(outputDir, noteOutputDir).split(path.sep).length
    const basePath = '../'.repeat(relativeDepth)
    htmlContent = htmlContent.replace(/(src|href)=['"]\.\/([^'"]+)['"]/g, `$1=$2${basePath}$2`)

    // --- lazy loading, dimensiones, alt ---
    htmlContent = htmlContent.replace(/<img\s+([^>]+?)>/g, (match, attrs) => {
      const srcMatch = attrs.match(/src=['"]([^'"]+)['"]/)
      const altMatch = attrs.match(/alt=['"]([^'"]*)['"]/)
      if (!srcMatch) return match
      const src = path.join(noteOutputDir, srcMatch[1])
      let dimensions = { width: 600, height: 400 }
      if (srcMatch[1] === attributes.portada) dimensions = { width: 1200, height: 630 }
      else { try { dimensions = sizeOf(src) } catch {} }
      const altText = altMatch ? altMatch[1] : ''
      let newAttrs = attrs
        .replace(/width=['"][^'"]*['"]/, '')
        .replace(/height=['"][^'"]*['"]/, '')
        .replace(/alt=['"][^'"]*['"]/, '')
      newAttrs += ` width="${dimensions.width}" height="${dimensions.height}" loading="lazy" alt="${altText}"`
      return `<img ${newAttrs}>`
    })

    const title = attributes.title || slug
    const description = attributes.description || ''
    const portada = attributes.portada ? `${siteUrl}/posts/${slug}/${attributes.portada}` : ''
    const canonicalUrl = `${siteUrl}/posts/${slug}/`
    const handle = attributes.handle ? attributes.handle.replace(/^@/, '') : ''

    const metaTags = `
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${description}">
<link rel="canonical" href="${canonicalUrl}">

<meta property="og:type" content="article">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${canonicalUrl}">
${portada ? `<meta property="og:image" content="${portada}">` : ''}

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
${portada ? `<meta name="twitter:image" content="${portada}">` : ''}
${handle ? `<meta name="twitter:creator" content="@${handle}">` : ''}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "${title}",
  "description": "${description}",
  "image": "${portada || ''}",
  "url": "${canonicalUrl}",
  "datePublished": "${attributes.date || new Date().toISOString()}",
  "author": ${handle ? `{"@type":"Person","name":"${handle}","url":"https://twitter.com/${handle}"}` : '{"@type":"Person","name":"Desconocido"}'}
}
</script>
`.trim()

    let fullHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
<title>${title}</title>
${metaTags}
</head>
<body>
${htmlContent}
</body>
</html>
`.trim()

    fullHtml = await minify(fullHtml, {
      collapseWhitespace: true,
      removeComments: true,
      removeRedundantAttributes: true,
      removeEmptyAttributes: true,
    })

    await fs.writeFile(path.join(noteOutputDir, 'index.html'), fullHtml)
    cache[`${slug}/index.md`] = finalHash
  } else console.log(`skip ${slug}/index.md (unchanged)`)

  indexItems.push({
    slug,
    title: attributes.title || slug,
    date: attributes.date || '',
    tags: attributes.tags || [],
    url: `/posts/${slug}/`
  })
}

await fs.mkdir(outputDir, { recursive: true })

// --- index.json ---
const indexPath = path.join(outputDir, 'index.json')
let prevIndex = '[]'
try { prevIndex = await fs.readFile(indexPath, 'utf-8') } catch {}
indexItems.sort((a,b)=> (a.date?new Date(a.date):new Date(0)) - (b.date?new Date(b.date):new Date(0))).reverse()
const newIndexStr = JSON.stringify(indexItems,null,2)
if (prevIndex !== newIndexStr) await fs.writeFile(indexPath,newIndexStr),console.log('index.json actualizado')
else console.log('index.json sin cambios')

// --- sitemap.xml ---
const staticPages = [
  { url: '/', lastmod: new Date().toISOString() },
  { url: '/about/', lastmod: new Date().toISOString() },
  { url: '/contact/', lastmod: new Date().toISOString() }
]
const postPages = indexItems.map(post=>({url:post.url,lastmod:post.date||new Date().toISOString()}))
const allPages = [...staticPages,...postPages]
const sitemapItems = allPages.map(p=>`
  <url>
    <loc>${siteUrl}${p.url}</loc>
    <lastmod>${p.lastmod}</lastmod>
  </url>
`).join('\n')
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapItems}
</urlset>`
await fs.writeFile(path.join(outputDir,'sitemap.xml'),sitemap)
console.log('sitemap.xml actualizado')

// --- robots.txt ---
const robots = `User-agent: *
Disallow:

Sitemap: ${siteUrl}/sitemap.xml
`
await fs.writeFile(path.join(outputDir,'robots.txt'),robots)
console.log('robots.txt generado')

// --- cache ---
await fs.writeFile(cacheFile,JSON.stringify(cache,null,2))

// --- 404.html (clonado de index.html para GitHub Pages SPA routing) ---
try {
  const indexHtmlPath = path.join(outputDir, 'index.html')
  const notFoundPath = path.join(outputDir, '404.html')
  const indexHtml = await fs.readFile(indexHtmlPath, 'utf-8')
  await fs.writeFile(notFoundPath, indexHtml)
  console.log('404.html generado a partir de index.html')
} catch (e) {
  console.error('no se pudo generar 404.html', e)
}

console.log('build completado: notas + index.json + sitemap.xml + robots.txt + cache + 404.html generados.')