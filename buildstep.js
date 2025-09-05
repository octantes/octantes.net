import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import MarkdownIt from 'markdown-it'
import fm from 'front-matter'

const md = new MarkdownIt()

const contentDir = './content'
const outputDir = './dist'
const cacheFile = './.build-cache.json'

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

  // --- hash combinado de markdown + assets ---
  const hash = crypto.createHash('sha256').update(raw)
  try {
    const assets = await fs.readdir(postFolder, { withFileTypes: true })
    for (const asset of assets) {
      if (asset.isFile() && asset.name !== 'index.md') {
        const assetData = await fs.readFile(path.join(postFolder, asset.name))
        hash.update(assetData)
      }
    }
  } catch {}

  const finalHash = hash.digest('hex')

  if (cache[`${slug}/index.md`] !== finalHash) {
    let htmlContent = md.render(body)

    // --- ajustar rutas relativas de assets ---
    const slugSegments = slug.split('/').filter(Boolean).length
    const ups = slugSegments + 1
    const basePath = '../'.repeat(ups)
    htmlContent = htmlContent.replace(/(src|href)=(['"])\.\/+/g, (m, attr, quote) => {
      return `${attr}=${quote}${basePath}`
    })

    await fs.writeFile(path.join(noteOutputDir, 'index.html'), htmlContent)

    // copiar assets
    try {
      const assets = await fs.readdir(postFolder, { withFileTypes: true })
      for (const asset of assets) {
        if (asset.isFile() && asset.name !== 'index.md') {
          await fs.copyFile(path.join(postFolder, asset.name), path.join(noteOutputDir, asset.name))
        }
      }
    } catch {}

    cache[`${slug}/index.md`] = finalHash
  } else {
    console.log(`skip ${slug}/index.md (unchanged)`)
  }

  indexItems.push({
    title: attributes.title || slug,
    date: attributes.date || '',
    tags: attributes.tags || [],
    url: `/posts/${slug}/index.html`
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

// escribir cache
await fs.writeFile(cacheFile, JSON.stringify(cache, null, 2))

console.log('build completado: html de notas + index.json y cache generados.')