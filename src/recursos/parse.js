import MarkdownIt from 'markdown-it'
import fm from 'front-matter'

const md = new MarkdownIt()

export async function parseMarkdown(path)
{
    const res = await fetch(path) // fetch markdown file
    const raw = await res.text() // turn response into plain text
    
    const { attributes, body } = fm(raw) // parse frontmatter

    return {
        path: path,
        metadata: attributes,
        html: md.render(body)
    }
}