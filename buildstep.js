import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import MarkdownIt from 'markdown-it'
import fm from 'front-matter'

const md = new MarkdownIt()

const contentDir = './content'
const outputDir = './dist' // todo en dist
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

// --- limpieza de directorios obsoletos en docs/posts ---
const docsPostsDir = './docs/posts'
try {
  const existingDocs = await fs.readdir(docsPostsDir, { withFileTypes: true })
  for (const dirent of existingDocs) {
    if (!dirent.isDirectory()) continue
    const slug = dirent.name
    if (!contentSlugs.includes(slug)) {
      await fs.rm(path.join(docsPostsDir, slug), { recursive: true, force: true })
    }
  }
} catch {}

// --- generar HTML y construir índice ---
const index = []

for (const file of files) {
  if (!file.endsWith('.md')) continue
  const filePath = path.join(contentDir, file)
  const raw = await fs.readFile(filePath, 'utf-8')
  const { attributes, body } = fm(raw)
  const slug = file.replace(/\.md$/, '')
  const hash = crypto.createHash('sha256').update(raw).digest('hex')

  // escribir html solo si cambió
  if (cache[file] !== hash) {
    const htmlContent = md.render(body)
    const noteOutputDir = path.join(postsDir, slug)
    await fs.mkdir(noteOutputDir, { recursive: true })
    await fs.writeFile(path.join(noteOutputDir, 'index.html'), htmlContent)
    cache[file] = hash
  } else {
    console.log(`skip ${file} (unchanged)`)
  }

  // agregar al índice siempre con front-matter
  index.push({
    title: attributes.title || slug,
    date: attributes.date || '',
    tags: attributes.tags || [],
    url: `/posts/${slug}/index.html`
  })
}

// asegurarse de que dist exista
await fs.mkdir(outputDir, { recursive: true })

// escribir index.json y cache dentro de dist
await fs.writeFile(path.join(outputDir, 'index.json'), JSON.stringify(index, null, 2))
await fs.writeFile(cacheFile, JSON.stringify(cache, null, 2))

console.log('build completado: html de notas + index.json y cache generados.')