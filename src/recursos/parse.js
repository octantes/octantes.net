import MarkdownIt from 'markdown-it'
import fm from 'front-matter'

const md = new MarkdownIt()

export async function parseMarkdown(path) {
    const res = await fetch(path)
    const raw = await res.text()
    
    const { attributes, body } = fm(raw)
    return {
        metadata: attributes,
        html: md.render(body)
    }
}