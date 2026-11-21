import { FileText, ShieldCheck } from 'lucide-react'
import terms from './content/terms.md?raw'
import privacy from './content/privacy.md?raw'

export const mainSite = 'https://reali-omega.vercel.app/'
export const homeMeta = {
  path: '/',
  title: 'Central de Transparência | Reali',
  description: 'Consulte os Termos de Uso e a Política de Privacidade da plataforma Reali.',
}

export const notFoundMeta = {
  path: '/404',
  title: 'Página não encontrada | Reali',
  description: 'Volte à Central de Transparência do Reali.',
}

function makeDocument(source: string, path: string, name: string, description: string, icon: typeof FileText) {
  const [originalTitle, ...body] = source.trimStart().split(/\r?\n/)
  const headings = body.flatMap((line, index) => {
    const match = /^(#{2,3}) (.+)$/.exec(line)
    const inline = /^\*\*(\d+\.\d+\. [^*]+?)\*\*/.exec(line)
    const label = match?.[2] ?? inline?.[1]?.replace(/:$/, '')
    if (!label) return []
    const id = label.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '')
    return [{ id, label, level: match?.[1].length ?? 4, line: index + 1 }]
  })
  return {
    path, name, description, icon, headings, body: body.join('\n'),
    title: name + ' | Reali',
    originalTitle: originalTitle.slice(2),
    version: source.match(/\*\*Versão(?::\*\*)?\s+(\d+\.\d+)/)?.[1],
    date: source.match(/\*\*(?:Data de atualização|Última atualização):\*\* (.+)/)?.[1],
  }
}

export const documents = [
  makeDocument(terms, '/termos-de-uso', 'Termos de Uso', 'Condições de acesso, direitos e responsabilidades no uso da plataforma Reali.', FileText),
  makeDocument(privacy, '/politica-de-privacidade', 'Política de Privacidade', 'Como os dados pessoais podem ser tratados e quais são os direitos dos titulares.', ShieldCheck),
]
export type LegalDocument = (typeof documents)[number]
export const contact = terms.match(/[\w.]+\\@[\w.-]+/)?.[0].replace('\\', '') ?? ''
export const pages = [homeMeta, ...documents]
