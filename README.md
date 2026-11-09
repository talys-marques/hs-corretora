# Herval Corretora de Seguros — site estático

Reconstrução do site [hervalcorretora.com.br](https://hervalcorretora.com.br) (antes WordPress + Elementor) como site estático em [Astro](https://astro.build).

- 61 páginas geradas: 8 institucionais, 28 de produto, 24 posts do blog e a 404
- **Todas as URLs antigas mantidas**, incluindo os posts em `/AAAA/MM/DD/slug/`
- Nenhum jQuery nem plugin: só HTML e CSS, com uns poucos scripts pequenos (menu mobile, carrossel e formulário)

## Comandos

| Comando | O que faz |
|---|---|
| `npm install` | Instala as dependências (Node 22.23 ou mais novo, exigência do Astro 7) |
| `npm run dev` | Servidor local em `http://localhost:4321` |
| `npm run build` | Gera o site em `dist/` |
| `npm run preview` | Serve o `dist/` localmente |
| `npm run import:wp` | Importa de novo conteúdo e imagens do WordPress (ver abaixo) |

## Prévia no GitHub Pages

A cada push na `main`, o workflow `.github/workflows/deploy-pages.yml` publica uma prévia em
**https://talys-marques.github.io/hs-corretora/**.

Por estar num subcaminho, essa prévia é gerada com `BASE_PATH=/hs-corretora`. A integração `integrations/base-path.mjs` acrescenta esse prefixo a todos os links e imagens do HTML gerado. Na prévia, o site também:

- marca as páginas com `noindex`, e o canonical continua apontando para `hervalcorretora.com.br`
- não carrega o GA4, para não misturar visitas da prévia com os dados de produção

O formulário de contato continua enviando ao Emarsys de verdade. Não use dados de teste nele sem combinar com quem cuida do CRM.

Sem as variáveis `SITE_URL` e `BASE_PATH`, o build gera a versão de produção, servida na raiz do domínio.

> Para testar a prévia localmente no Git Bash do Windows, use `MSYS_NO_PATHCONV=1`. Sem isso, o Git Bash converte `/hs-corretora` num caminho do Windows.

## Onde mudar o quê

| Quero mudar… | Arquivo |
|---|---|
| Telefones, e-mail, WhatsApp, redes sociais, links de cotação, GA4 | `src/config/site.ts` |
| Texto ou imagem de um seguro | `src/content/produtos/<slug>.md` |
| Criar um seguro novo | Novo `.md` em `src/content/produtos/` (copie um existente) |
| Ordem e lista em "Para você" / "Para empresas" | Frontmatter `audience`, `order`, `orderPj` e `listed` do produto |
| Post do blog | `src/content/blog/*.md` (o `legacyPath` define a URL) |
| Seguradoras da página Ajuda | `src/data/ajuda.json` |
| Logos do carrossel de parceiras | `src/data/seguradoras-parceiras.json` |
| Empresas do Grupo | `src/data/empresas-grupo.json` |
| Cores, fonte e espaçamentos | `src/styles/global.css` (variáveis em `:root`) |

### Frontmatter de um produto

```yaml
title: "Automóvel"          # nome no card e no H1
heading: "Automóvel"        # título do texto
description: "..."          # meta description (SEO)
audience: ["pf"]            # pf = Para você, pj = Para empresas (pode ter os dois)
order: 2                    # posição na listagem
orderPj: 99                 # posição em "Para empresas", quando o produto aparece nas duas
listed: true                # false = a página existe, mas não aparece nas listagens
hero: "/uploads/..."        # banner do topo
card: "/uploads/..."        # imagem do card na listagem
```

## Estrutura

```
src/
  config/site.ts          dados de contato, links e IDs (fonte única)
  content/produtos/       28 seguros em Markdown
  content/blog/           24 posts em Markdown
  data/                   seguradoras, links úteis, empresas do grupo
  components/             Header, Footer, PageHero, ImageCard, ProductGrid, LogoCarousel,
                          ContactForm, PostCard, WhatsAppButton, Icon
  layouts/Base.astro      <head> com SEO, Open Graph, JSON-LD e GA4
  pages/                  rotas (o [produto].astro gera os seguros; o [...post].astro, os posts)
public/
  uploads/                imagens e PDFs migrados de /wp-content/uploads/
  _redirects              301 das URLs do WordPress (formato Netlify/Cloudflare Pages)
scripts/import-wp.mjs     importador do WordPress (REST API + HTML)
docs/ANALISE.md           análise do site antigo que guiou a reconstrução
```

## Integrações

- **Formulário de contato:** envia direto para o **SAP Emarsys** (`link.hervalcorretora.com.br`), com o mesmo formulário e os mesmos campos do site antigo, então não precisa de backend. Como o Emarsys não responde com CORS, o envio usa `no-cors`: se a rede falhar, aparece uma mensagem de erro (o site antigo mostrava "sucesso" mesmo quando falhava).
- **Cotação:** o botão "Cotar agora" leva ao `seucorretor.digital`, e os botões das páginas de produto levam ao `aggilizador`, como no site antigo. Os dois links ficam em `site.quote`.
- **WhatsApp:** botão flutuante com link `wa.me`, sem plugin.
- **Analytics:** GA4 `G-NBTT6G2GRS`, a mesma propriedade do site antigo. O site dispara o evento `generate_lead` quando alguém envia o formulário.

## O que mudou em relação ao site antigo

- Os links para `www2.hscorretora.com.br`, domínio que não existe mais e quebrava o header e o footer no mobile e no tablet, foram removidos
- Cada página tem um `<h1>`, e todas as imagens com conteúdo têm `alt`
- Não há mais blocos duplicados para desktop, tablet e mobile: um único HTML responsivo
- Breadcrumbs, JSON-LD (`InsuranceAgency`, `Service`, `BlogPosting`, `BreadcrumbList`) e sitemap automático
- O formulário de cotação com upload de documentos foi substituído por uma página de opções (cotação online, WhatsApp e telefone). Os anexos (CNH, comprovante) precisam de backend e de cuidado com a LGPD
- A newsletter da home, que estava oculta no site antigo, foi removida

## Pendências (decisão do negócio)

1. **Destino único de cotação:** hoje são dois (`seucorretor.digital` e `aggilizador`). Para unificar, basta editar `src/config/site.ts`.
2. **Formulário de cotação com anexos:** volta? Se sim, onde os arquivos ficam armazenados?
3. **Páginas fora das listagens:** `nautico`, `nautico-empresas` e `garantia-estendida` têm página, mas `listed: false`. Publicar nas listagens ou remover (com 301)?
4. **Produtos duplicados:** `garantia-de-aluguel` e `fianca-locaticia` são o mesmo produto. Vale fundir?
5. **Hospedagem e DNS:** o `public/_redirects` funciona no Netlify e no Cloudflare Pages. Em outro host, os 301 precisam ser traduzidos para a configuração dele.
6. **Vídeo da home:** `C0012_1-2.mp4` tem 13,8 MB para 2 segundos. Vale recomprimir ou trocar por uma imagem.

## Reimportar do WordPress

`npm run import:wp` busca as páginas e os posts pela REST API do site antigo e reescreve `src/content/` e os JSON de `src/data/`. O `empresas-grupo.json` é curado à mão e não é sobrescrito. Use isso só enquanto o WordPress estiver no ar: depois da migração, o conteúdo é mantido direto nos arquivos `.md` e `.json`.
