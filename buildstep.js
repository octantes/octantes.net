import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import MarkdownIt from 'markdown-it'
import fm from 'front-matter'

const md = new MarkdownIt()

const contentDir = './content'
const outputDir = './docs/posts'
const cacheFile = './.build-cache.json'

let cache = {}
try {
  const cacheRaw = await fs.readFile(cacheFile, 'utf-8')
  cache = JSON.parse(cacheRaw)
} catch {
  cache = {}
}

// --- limpieza de directorios obsoletos ---
const files = await fs.readdir(contentDir)
const contentSlugs = files.filter(f => f.endsWith('.md')).map(f => f.replace(/\.md$/, ''))

try {
  const existingDirs = await fs.readdir(outputDir, { withFileTypes: true })
  for (const dirent of existingDirs) {
    if (!dirent.isDirectory()) continue
    const slug = dirent.name
    if (!contentSlugs.includes(slug)) {
      await fs.rm(path.join(outputDir, slug), { recursive: true, force: true })
      delete cache[`${slug}.md`]
    }
  }
} catch {
  await fs.mkdir(outputDir, { recursive: true })
}

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
    const noteOutputDir = path.join(outputDir, slug)
    await fs.mkdir(noteOutputDir, { recursive: true })
    await fs.writeFile(path.join(noteOutputDir, 'index.html'), htmlContent)
    cache[file] = hash
  } else {
    console.log(`skip ${file} (unchanged)`)
  }

  // agregar a index siempre usando front-matter
  index.push({
    title: attributes.title || slug,
    date: attributes.date || '',
    tags: attributes.tags || [],
    url: `/posts/${slug}/index.html`
  })
}

// escribir index.json y cache

await fs.mkdir('./dist', { recursive: true })
await fs.writeFile('./dist/index.json', JSON.stringify(index, null, 2))

console.log('build completado: html de notas + index.json generados.')