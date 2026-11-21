import { useEffect, useState, type RefObject } from 'react'
import { ChevronDown, ChevronUp, Search, X } from 'lucide-react'

function findMatches(container: HTMLElement, query: string) {
  const ranges: Range[] = []
  const pattern = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'giu')
  for (const block of container.querySelectorAll('.document-display-title, .legal-content :is(h2,h3,p,li)')) {
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT)
    const nodes: { node: Node; start: number; end: number }[] = []
    let value = ''
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (node.parentElement?.closest('button, h1, h2, h3, p, li') !== block) continue
      if (node.previousSibling instanceof HTMLBRElement) value += ' '
      const start = value.length
      value += node.textContent ?? ''
      nodes.push({ node, start, end: value.length })
    }
    for (const match of value.matchAll(pattern)) {
      const start = match.index
      const end = start + match[0].length
      const first = nodes.find(node => node.end > start)
      const last = nodes.find(node => node.end >= end)
      if (!first || !last) continue
      const range = new Range()
      range.setStart(first.node, start - first.start)
      range.setEnd(last.node, end - last.start)
      ranges.push(range)
    }
  }
  return ranges
}

export function DocumentSearch({ content }: { content: RefObject<HTMLElement | null> }) {
  const [query, setQuery] = useState('')
  const [matches, setMatches] = useState<Range[]>([])
  const [index, setIndex] = useState(-1)

  useEffect(() => {
    const phrase = query.trim()
    const ranges = phrase && content.current ? findMatches(content.current, phrase) : []
    setMatches(ranges)
    setIndex(-1)
    if (!globalThis.Highlight || !CSS.highlights) return
    CSS.highlights.set('document-matches', new Highlight(...ranges))
    return () => {
      CSS.highlights.delete('document-matches')
      CSS.highlights.delete('document-current')
    }
  }, [query, content])

  function visit(direction: number) {
    if (!matches.length) return
    const next = index < 0 ? (direction > 0 ? 0 : matches.length - 1) : (index + direction + matches.length) % matches.length
    const range = matches[next]
    setIndex(next)
    if (globalThis.Highlight && CSS.highlights) {
      const current = new Highlight(range)
      current.priority = 1
      CSS.highlights.set('document-current', current)
    } else {
      window.getSelection()?.removeAllRanges()
      window.getSelection()?.addRange(range)
    }
    const sidebar = matchMedia('(max-width: 760px)').matches ? document.querySelector('.document-sidebar') : null
    const headerHeight = document.querySelector('.site-header')?.getBoundingClientRect().height ?? 0
    const offset = headerHeight + (sidebar?.getBoundingClientRect().height ?? 0) + 20
    const top = range.getBoundingClientRect().top + window.scrollY - Math.max(offset, window.innerHeight * .35)
    window.scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }

  return <form className="search" role="search" onSubmit={event => { event.preventDefault(); visit(1) }}>
    <div className="search-field">
      <Search aria-hidden size={18} />
      <input aria-label="Buscar neste documento" placeholder="Buscar neste documento" value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => {
        if (event.key === 'Enter' && event.shiftKey) { event.preventDefault(); visit(-1) }
        if (event.key === 'Escape') setQuery('')
      }} />
      {query && <button type="button" className="icon-button" aria-label="Limpar busca" onClick={() => setQuery('')}><X size={16} /></button>}
    </div>
    {query.trim() && <div className="search-results">
      <span role="status">{matches.length ? (index < 0 ? `${matches.length} resultados` : `${index + 1} de ${matches.length}`) : 'Nenhum resultado'}</span>
      <button type="button" className="icon-button" aria-label="Ocorrência anterior" disabled={!matches.length} onClick={() => visit(-1)}><ChevronUp size={18} /></button>
      <button type="submit" className="icon-button" aria-label="Próxima ocorrência" disabled={!matches.length}><ChevronDown size={18} /></button>
    </div>}
  </form>
}
