import { memo, useEffect, useRef, useState } from 'react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { motion, MotionConfig, useReducedMotion } from 'motion/react'
import { ArrowUp, BookOpen, CalendarDays, Check, ChevronDown, ExternalLink, Leaf, Link2, List, Printer } from 'lucide-react'
import Markdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
import { contact, documents, mainSite, notFoundMeta, pages, type LegalDocument } from './documents'
import { DocumentSearch } from './DocumentSearch'

function Brand() {
  return <Link to="/" className="brand" aria-label="Reali — Início"><img src="/reali.webp" alt="" width="84" height="31" /></Link>
}

function Header() {
  const header = useRef<HTMLElement>(null)
  useEffect(() => {
    const element = header.current
    if (!element) return
    const resize = new ResizeObserver(() => {
      document.documentElement.style.setProperty('--measured-header', element.offsetHeight + 'px')
    })
    resize.observe(element)
    return () => {
      resize.disconnect()
      document.documentElement.style.removeProperty('--measured-header')
    }
  }, [])
  return <header className="site-header" ref={header}>
    <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <div className="shell header-inner">
      <Brand />
      <nav aria-label="Navegação principal">
        <NavLink to="/" end>Início</NavLink>
        {documents.map(doc => <NavLink key={doc.path} to={doc.path}>{doc.name}</NavLink>)}
      </nav>
      <a className="main-site" href={mainSite}>Site do Reali <ExternalLink size={14} aria-hidden /></a>
    </div>
  </header>
}

function Footer() {
  return <footer className="site-footer"><div className="shell">
    <div className="footer-row">
      <Brand />
      <nav aria-label="Navegação do rodapé">
        <a href={mainSite}>Site do Reali</a>
        {documents.map(doc => <Link key={doc.path} to={doc.path}>{doc.name}</Link>)}
      </nav>
      {contact && <a className="contact" href={'mailto:' + contact}>{contact}</a>}
    </div>
    <p>© {new Date().getFullYear()} Reali. Todos os direitos reservados.</p>
  </div></footer>
}

function Home() {
  const reduce = useReducedMotion()
  return <main id="conteudo" tabIndex={-1} className="home shell">
    <section className="home-hero">
      <motion.div className="hero-copy" initial={false} animate={reduce ? undefined : { opacity: [.74, 1], y: [7, 0] }} transition={{ duration: .42 }}>
        <p className="eyebrow"><BookOpen size={17} aria-hidden /> Central de Transparência do Reali</p>
        <h1>Transparência e confiança em cada decisão.</h1>
        <p className="intro">Este é o espaço oficial para consultar os Termos de Uso e a Política de Privacidade da plataforma Reali.</p>
      </motion.div>
      <div className="hero-art" aria-hidden="true"><div className="hero-grid" /><span /><span /><span /><img src="/simbolo.webp" alt="" width="125" height="129" /></div>
    </section>
    <section className="documents" aria-labelledby="documentos">
      <h2 id="documentos">Documentos legais</h2>
      <div className="document-cards">{documents.map((doc, index) => <motion.div key={doc.path} initial={false} animate={reduce ? undefined : { opacity: [.76, 1], y: [8, 0] }} transition={{ duration: .35, delay: index * .08 }}>
        <Link to={doc.path} className="document-card">
          <span className="document-icon"><doc.icon size={26} aria-hidden /></span>
          <h3>{doc.name}</h3><p>{doc.description}</p>
          <div className="card-meta"><span><CalendarDays size={15} aria-hidden /> {doc.date}</span><span>Ler documento</span></div>
        </Link>
      </motion.div>)}</div>
    </section>
    <section className="commitment" aria-labelledby="compromisso">
      <Leaf size={24} aria-hidden />
      <div><h2 id="compromisso">Nosso compromisso</h2><p>Transparência sobre o uso da plataforma, respeito à privacidade e uso responsável da tecnologia na alimentação escolar.</p></div>
    </section>
  </main>
}

function CopyLink({ anchor, label }: { anchor?: string; label?: string }) {
  const [status, setStatus] = useState('')
  const [manual, setManual] = useState('')
  useEffect(() => {
    if (status !== 'Link copiado') return
    const timeout = window.setTimeout(() => setStatus(''), 2400)
    return () => window.clearTimeout(timeout)
  }, [status])

  async function copy() {
    const url = new URL(window.location.href)
    url.hash = anchor ?? ''
    try {
      await navigator.clipboard.writeText(url.href)
      setStatus('Link copiado')
    } catch {
      setManual(url.href)
      setStatus('Selecione e copie o endereço')
    }
  }

  return <span className="copy-control">
    <button type="button" className={anchor ? 'icon-button section-link' : 'tool-button'} onClick={copy}
      aria-label={anchor ? 'Copiar link da seção ' + label : undefined} title={anchor ? 'Copiar link da seção' : undefined}>
      {status === 'Link copiado' ? <Check size={17} aria-hidden /> : <Link2 size={17} aria-hidden />}
      {!anchor && (status === 'Link copiado' ? status : 'Copiar link')}
    </button>
    <span className="sr-only" role="status">{status}</span>
    {manual && <input className="copy-fallback" aria-label="Endereço para copiar" readOnly value={manual} onFocus={event => event.target.select()} onBlur={() => setManual('')} autoFocus />}
  </span>
}

function ReadingProgress() {
  const line = useRef<HTMLDivElement>(null)
  const [showTop, setShowTop] = useState(false)
  useEffect(() => {
    let frame = 0
    function update() {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      if (line.current) line.current.style.transform = `scaleX(${progress})`
      setShowTop(window.scrollY > 520)
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    const observer = new ResizeObserver(schedule)
    observer.observe(document.body)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      observer.disconnect()
    }
  }, [])
  return <><div className="reading-track" aria-hidden="true"><div ref={line} /></div>
    {showTop && <button className="back-top" type="button" aria-label="Voltar ao topo" title="Voltar ao topo" onClick={() => {
      document.getElementById('conteudo')?.focus({ preventScroll: true })
      window.scrollTo({ top: 0 })
    }}><ArrowUp size={20} aria-hidden /></button>}</>
}

const LegalContent = memo(function LegalContent({ doc }: { doc: LegalDocument }) {
  function heading(level: 2 | 3, line?: number, children?: React.ReactNode) {
    const item = doc.headings.find(entry => entry.line === line)
    const Tag = level === 2 ? 'h2' : 'h3'
    return <div className={'legal-heading level-' + level}><Tag id={item?.id} tabIndex={-1}>{children}</Tag>{item && <CopyLink anchor={item.id} label={item.label} />}</div>
  }

  return <article className="legal-content">
    <Markdown skipHtml remarkPlugins={[remarkBreaks, remarkGfm]} components={{
      h2: ({ node, children }) => heading(2, node?.position?.start.line, children),
      h3: ({ node, children }) => heading(3, node?.position?.start.line, children),
      p: ({ node, children }) => {
        const item = doc.headings.find(entry => entry.level === 4 && entry.line === node?.position?.start.line)
        return item
          ? <div className="legal-heading inline-clause"><p id={item.id} tabIndex={-1}>{children}</p><CopyLink anchor={item.id} label={item.label} /></div>
          : <p>{children}</p>
      },
    }}>{doc.body}</Markdown>
  </article>
})

function DocumentPage({ doc }: { doc: LegalDocument }) {
  const content = useRef<HTMLElement>(null)
  const sidebar = useRef<HTMLElement>(null)
  const desktopIndex = useRef<HTMLOListElement>(null)
  const mobileIndex = useRef<HTMLDetailsElement>(null)
  const [active, setActive] = useState(doc.headings[0]?.id)
  const reduce = useReducedMotion()
  const other = documents.find(item => item !== doc)!
  useEffect(() => {
    const headings = Array.from(content.current?.querySelectorAll<HTMLElement>('h2[id]') ?? [])
    const header = document.querySelector('.site-header')
    let observer: IntersectionObserver | undefined
    function observe() {
      observer?.disconnect()
      const sticky = sidebar.current
      const mobileOffset = sticky && matchMedia('(max-width: 760px)').matches ? sticky.offsetHeight : 0
      const offset = Math.min(window.innerHeight - 2, Math.ceil((header?.getBoundingClientRect().height ?? 0) + mobileOffset + 48))
      observer = new IntersectionObserver(() => {
        const visible = headings.findLast(heading => heading.getBoundingClientRect().top < offset)
        setActive((visible ?? headings[0])?.id)
      }, { rootMargin: `-${offset}px 0px 0px 0px` })
      headings.forEach(heading => observer?.observe(heading))
    }
    const resize = new ResizeObserver(observe)
    if (header) resize.observe(header)
    if (sidebar.current) resize.observe(sidebar.current)
    observe()
    return () => { observer?.disconnect(); resize.disconnect() }
  }, [])

  useEffect(() => {
    const list = desktopIndex.current
    const item = list?.querySelector('[aria-current="location"]')
    if (!list || !item || !list.clientHeight) return
    const bounds = item.getBoundingClientRect()
    const viewport = list.getBoundingClientRect()
    if (bounds.bottom > viewport.bottom) list.scrollTop += bounds.bottom - viewport.bottom
    if (bounds.top < viewport.top) list.scrollTop += bounds.top - viewport.top
  }, [active])

  function indexLinks(mobile: boolean) {
    return <ol ref={mobile ? undefined : desktopIndex}>{doc.headings.filter(heading => mobile || heading.level === 2).map(heading =>
      <li key={heading.id} className={heading.level > 2 ? 'subsection' : undefined}>
        <a href={'#' + heading.id} aria-current={heading.id === active ? 'location' : undefined} onClick={() => {
          if (mobile && mobileIndex.current) mobileIndex.current.open = false
          if (heading.level === 2) setActive(heading.id)
          document.getElementById(heading.id)?.focus({ preventScroll: true })
        }}>
          {heading.id === active && !mobile && <motion.span className="active-indicator" layoutId="active-section" transition={{ duration: reduce ? 0 : .18 }} aria-hidden />}
          {heading.label}
        </a>
      </li>)}</ol>
  }


  return <main id="conteudo" tabIndex={-1} className="document-page" ref={content}>
    <ReadingProgress />
    <div className="shell">
      <div className="document-hero">
        <motion.div initial={false} animate={reduce ? undefined : { opacity: [.78, 1], y: [6, 0] }} transition={{ duration: .35 }}>
          <p className="eyebrow"><BookOpen size={16} aria-hidden /> Documentação jurídica</p>
          <h1 className="document-display-title">{doc.originalTitle}</h1>
          <p className="intro">{doc.description}</p>
          <div className="document-meta"><span>Versão {doc.version}</span><span><CalendarDays size={16} aria-hidden /> {doc.date}</span></div>
        </motion.div>
        <div className="document-emblem" aria-hidden="true"><doc.icon size={48} strokeWidth={1.45} /></div>
      </div>
      <div className="document-grid">
        <aside className="document-sidebar" aria-label="Ferramentas de leitura" ref={sidebar}>
          <DocumentSearch content={content} />
          <details className="mobile-index" ref={mobileIndex}>
            <summary><List size={18} aria-hidden /> Índice do documento <ChevronDown size={16} aria-hidden /></summary>
            <nav aria-label="Índice do documento">{indexLinks(true)}</nav>
          </details>
          <nav className="desktop-index" aria-label="Nesta página">
            <h2>Nesta página</h2>{indexLinks(false)}
          </nav>
        </aside>
        <div className="reading-column">
          <div className="document-tools">
            <CopyLink />
            <button className="tool-button" type="button" onClick={() => window.print()}><Printer size={17} aria-hidden /> Imprimir documento</button>
          </div>
          <LegalContent doc={doc} />
          <Link className="other-document" to={other.path}><other.icon size={23} aria-hidden /><span>Consulte também<strong>{other.name}</strong></span></Link>
        </div>
      </div>
    </div>
  </main>
}

function RouteEffects() {
  const { pathname, hash } = useLocation()
  const previousPath = useRef(pathname)
  useEffect(() => {
    const page = pages.find(entry => entry.path === (pathname.replace(/\/$/, '') || '/')) ?? notFoundMeta
    document.title = page.title
    for (const [selector, value] of [
      ['meta[name="description"]', page.description],
      ['meta[property="og:title"]', page.title],
      ['meta[property="og:description"]', page.description],
    ]) document.querySelector(selector)?.setAttribute('content', value)
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (canonical) {
      const address = new URL(page.path, canonical.href).href
      canonical.href = address
      document.querySelector('meta[property="og:url"]')?.setAttribute('content', address)
    }
    if (!hash) {
      if (previousPath.current !== pathname) document.getElementById('conteudo')?.focus({ preventScroll: true })
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    else document.getElementById(hash.slice(1))?.scrollIntoView()
    previousPath.current = pathname
  }, [pathname, hash])
  return null
}

export function App() {
  return <MotionConfig reducedMotion="user"><RouteEffects /><Header />
    <Routes>
      <Route path="/" element={<Home />} />
      {documents.map(doc => <Route key={doc.path} path={doc.path} element={<DocumentPage key={doc.path} doc={doc} />} />)}
      <Route path="*" element={<main className="shell missing" id="conteudo" tabIndex={-1}><h1>Página não encontrada</h1><Link to="/">Voltar para a Central de Transparência</Link></main>} />
    </Routes>
    <Footer />
  </MotionConfig>
}


