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
const files = await fs.readdir(contentDir)
const contentSlugs = files.filter(f => f.endsWith('.md')).map(f => f.replace(/\.md$/, ''))

const postsDir = path.join(outputDir, 'posts')
try {
  const existingDirs = await fs.readdir(postsDir, { withFileTypes: true })
  for (const dirent of existingDirs) {
    if (!dirent.isDirectory()) continue
    const slug = dirent.name
    if (!contentSlugs.includes(slug)) {
      await fs.rm(path.join(postsDir, slug), { recursive: true, force: true })
      delete cache[`${slug}.md`]
    }
  }
} catch {
  await fs.mkdir(postsDir, { recursive: true })
}

// --- generar HTML y construir índice en paralelo de manera segura ---
const indexItems = await Promise.all(
  files
    .filter(f => f.endsWith('.md'))
    .map(async (file) => {
      const filePath = path.join(contentDir, file)
      const raw = await fs.readFile(filePath, 'utf-8')
      const { attributes, body } = fm(raw)
      const slug = file.replace(/\.md$/, '')
      const hash = crypto.createHash('sha256').update(raw).digest('hex')

      const noteOutputDir = path.join(postsDir, slug)
      await fs.mkdir(noteOutputDir, { recursive: true })

      if (cache[file] !== hash) {
        let htmlContent = md.render(body)

        // --- ajustar rutas relativas de assets ---
        const slugSegments = slug.split('/').filter(Boolean).length
        const ups = slugSegments + 1
        const basePath = '../'.repeat(ups)
        htmlContent = htmlContent.replace(/(src|href)=(['"])\.\/+/g, (m, attr, quote) => {
          return `${attr}=${quote}${basePath}`
        })
        // ---------------------------------------

        await fs.writeFile(path.join(noteOutputDir, 'index.html'), htmlContent)
        cache[file] = hash
      } else {
        console.log(`skip ${file} (unchanged)`)
      }

      return {
        title: attributes.title || slug,
        date: attributes.date || '',
        tags: attributes.tags || [],
        url: `/posts/${slug}/index.html`
      }
    })
)

const index = []
index.push(...indexItems)

// asegurarse de que dist exista
await fs.mkdir(outputDir, { recursive: true })

// --- minimizar escrituras de index.json ---
const indexPath = path.join(outputDir, 'index.json')
let prevIndex = '[]'
try {
  prevIndex = await fs.readFile(indexPath, 'utf-8')
} catch {}

// ordenar index cronológicamente descendente (más reciente primero)
index.sort((a, b) => {
  const dateA = new Date(a.date)
  const dateB = new Date(b.date)
  return dateB - dateA
})

const newIndexStr = JSON.stringify(index, null, 2)

if (prevIndex !== newIndexStr) {
  await fs.writeFile(indexPath, newIndexStr)
  console.log('index.json actualizado')
} else {
  console.log('index.json sin cambios, no se sobrescribe')
}

// escribir cache
await fs.writeFile(cacheFile, JSON.stringify(cache, null, 2))

console.log('build completado: html de notas + index.json y cache generados.')