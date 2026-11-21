import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { App } from './App'
export { notFoundMeta, pages } from './documents'

export const siteUrl = import.meta.env.VITE_SITE_URL?.trim()
export const renderPage = (path: string) => renderToString(<StaticRouter location={path}><App /></StaticRouter>)
