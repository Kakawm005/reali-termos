# Central de Transparência do Reali

Site independente em React e Vite. As três páginas públicas são geradas em HTML no build, com o conteúdo dos documentos disponível mesmo com JavaScript desativado.

## Desenvolvimento local

Na pasta `transparencia`, execute `npm ci` e `npm run dev`. Para verificar a distribuição estática, execute `npm run build` e `npm run preview`.

## Vercel

Configure a pasta `transparencia` como **Root Directory** e defina `VITE_SITE_URL` com a origem pública do site (protocolo e domínio). O build usa essa variável para gerar URLs canônicas, URLs Open Graph e as entradas do sitemap. O `vercel.json` aponta para `dist` e habilita URLs sem extensão.

## Atualização dos documentos

Substitua `src/content/terms.md` ou `src/content/privacy.md` pela versão aprovada e execute um novo build. Mantenha o título principal em H1, as seções em H2, as subseções em H3 e os metadados de versão e data no início. A interface extrai a versão, a data e os itens do índice a partir do Markdown. Ao renomear títulos, verifique os links já compartilhados para as âncoras afetadas.
