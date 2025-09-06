import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import MarkdownIt from 'markdown-it'
import fm from 'front-matter'

const md = new MarkdownIt()

const contentDir = './content'
const outputDir = './dist'
const cacheFile = './.build-cache.json'
const siteUrl = 'https://octantes.github.io'

let cache = {}
try {
  const cacheRaw = await fs.readFile(cacheFile, 'utf-8')
  cache = JSON.parse(cacheRaw)
} catch {
  cache = {}
}

// --- limpieza de directorios obsoletos en dist/posts ---
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
} catch {
  await fs.mkdir(postsDir, { recursive: true })
}

// --- generar HTML y construir índice ---
const indexItems = []
for (const slug of postDirs) {
  const postFolder = path.join(contentDir, slug)
  const mdPath = path.join(postFolder, 'index.md')
  let raw
  try {
    raw = await fs.readFile(mdPath, 'utf-8')
  } catch {
    console.warn(`no se encontró index.md en ${slug}, se saltea`)
    continue
  }

  const { attributes, body } = fm(raw)
  const noteOutputDir = path.join(postsDir, slug)
  await fs.mkdir(noteOutputDir, { recursive: true })

  // --- hash combinado de markdown + assets + copia de assets ---
  const hash = crypto.createHash('sha256').update(raw)
  try {
    const assets = await fs.readdir(postFolder, { withFileTypes: true })
    for (const asset of assets) {
      if (asset.isFile() && asset.name !== 'index.md') {
        const assetPath = path.join(postFolder, asset.name)
        const data = await fs.readFile(assetPath)
        hash.update(data)
        await fs.writeFile(path.join(noteOutputDir, asset.name), data)
      }
    }
  } catch {}

  const finalHash = hash.digest('hex')

  if (cache[`${slug}/index.md`] !== finalHash) {
    let htmlContent = md.render(body)

    // --- ajustar rutas relativas de assets ---
    const relativeDepth = path.relative(outputDir, noteOutputDir).split(path.sep).length
    const basePath = '../'.repeat(relativeDepth)
    htmlContent = htmlContent.replace(/(src|href)=(['"])\.\//g, `$1=$2${basePath}`)

    // --- agregar <title> y <meta description> básicos ---
    const title = attributes.title || slug
    const description = attributes.description || ''
    htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<meta name="description" content="${description}">
</head>
<body>
${htmlContent}
</body>
</html>
`.trim()

    await fs.writeFile(path.join(noteOutputDir, 'index.html'), htmlContent)
    cache[`${slug}/index.md`] = finalHash
  } else {
    console.log(`skip ${slug}/index.md (unchanged)`)
  }

  indexItems.push({
    slug,
    title: attributes.title || slug,
    date: attributes.date || '',
    tags: attributes.tags || [],
    url: `/posts/${slug}/` // URL limpia sin index.html
  })
}

// asegurarse de que dist exista
await fs.mkdir(outputDir, { recursive: true })

// --- minimizar escrituras de index.json ---
const indexPath = path.join(outputDir, 'index.json')
let prevIndex = '[]'
try {
  prevIndex = await fs.readFile(indexPath, 'utf-8')
} catch {}

indexItems.sort((a, b) => {
  const dateA = a.date ? new Date(a.date) : new Date(0)
  const dateB = b.date ? new Date(b.date) : new Date(0)
  return dateB - dateA
})

const newIndexStr = JSON.stringify(indexItems, null, 2)

if (prevIndex !== newIndexStr) {
  await fs.writeFile(indexPath, newIndexStr)
  console.log('index.json actualizado')
} else {
  console.log('index.json sin cambios, no se sobrescribe')
}

// --- generar sitemap.xml ---
const sitemapItems = indexItems.map(post => `
  <url>
    <loc>${siteUrl}${post.url}</loc>
    <lastmod>${post.date || new Date().toISOString()}</lastmod>
  </url>
`).join('\n')

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapItems}
</urlset>`

await fs.writeFile(path.join(outputDir, 'sitemap.xml'), sitemap)
console.log('sitemap.xml generado')

// --- generar robots.txt ---
const robots = `User-agent: *
Disallow:

Sitemap: ${siteUrl}/sitemap.xml
`
await fs.writeFile(path.join(outputDir, 'robots.txt'), robots)
console.log('robots.txt generado')

// escribir cache
await fs.writeFile(cacheFile, JSON.stringify(cache, null, 2))

console.log('build completado: html de notas + index.json + sitemap.xml + robots.txt + cache generados.')