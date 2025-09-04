import fs from 'fs/promises'
import path from 'path'
import MarkdownIt from 'markdown-it'
import fm from 'front-matter'

const md = new MarkdownIt()

const contentDir = './content'
const outputDir = './docs/posts'
const index = []

// limpiar output
await fs.rm('./docs', { recursive: true, force: true })
await fs.mkdir(outputDir, { recursive: true })

const files = await fs.readdir(contentDir)

for (const file of files) {
  if (!file.endsWith('.md')) continue
  const filePath = path.join(contentDir, file)
  const raw = await fs.readFile(filePath, 'utf-8')
  const { attributes, body } = fm(raw)
  const htmlContent = md.render(body)
  const slug = file.replace(/\.md$/, '')

  // escribir html por nota
  const noteOutputDir = path.join(outputDir, slug)
  await fs.mkdir(noteOutputDir, { recursive: true })
  await fs.writeFile(path.join(noteOutputDir, 'index.html'), htmlContent)

  // agregar a index
  index.push({
    title: attributes.title || slug,
    date: attributes.date || '',
    tags: attributes.tags || [],
    url: `/posts/${slug}/index.html`
  })
}

// escribir index.json para la tabla
await fs.writeFile('./docs/index.json', JSON.stringify(index, null, 2))

console.log('Build completado: html de notas + index.json generados.')