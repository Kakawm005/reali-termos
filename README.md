# Central de Transparência do Reali

Site independente em React e Vite. As três páginas públicas são geradas em HTML no build, com o conteúdo dos documentos disponível mesmo com JavaScript desativado.

## Desenvolvimento local

Na raiz do repositório, use Node.js 24 e execute `npm ci` e `npm run dev`. Para gerar e conferir a distribuição estática localmente, execute `npm run build` e `npm run preview`.

## Vercel

Ao importar o repositório na Vercel, mantenha o **Root Directory** na raiz (`.`). O `vercel.json` seleciona o preset Vite, instala dependências com `npm ci`, executa `npm run build` e publica `dist` com URLs sem extensão.

Em **Settings → Environment Variables**, mantenha **Automatically expose System Environment Variables** habilitado para que o build receba `VERCEL_ENV`. Defina `VITE_SITE_URL` para **Production** com a origem HTTPS do domínio público escolhido (por exemplo, `https://termos.example.com`). O build de produção exige essa variável e a usa para gerar as URLs canônicas, as URLs Open Graph e as entradas do sitemap. Builds Preview incluem `noindex`.

No deploy, confira `/`, `/termos-de-uso`, `/politica-de-privacidade`, `/robots.txt` e `/sitemap.xml`. Uma rota desconhecida deve retornar HTTP 404.

## Atualização dos documentos

Substitua `src/content/terms.md` ou `src/content/privacy.md` pela versão aprovada e execute um novo build. Mantenha o título principal em H1, as seções em H2, as subseções em H3 e os metadados de versão e data no início. A interface extrai a versão, a data e os itens do índice a partir do Markdown. Ao renomear títulos, verifique os links já compartilhados para as âncoras afetadas.
