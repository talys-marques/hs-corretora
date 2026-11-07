# Análise para reconstrução — hervalcorretora.com.br

Levantamento feito em 07/11/2026 a partir do HTML público, sitemaps, REST API do WordPress e navegação no site.

## 1. Stack atual

| Camada | O que roda hoje |
|---|---|
| Hospedagem | Hostinger (LiteSpeed, PHP 8.5) |
| CMS | WordPress 7.1.4 |
| Tema | Astra 4.14 (só serve de "casca"; layout é todo Elementor) |
| Page builder | Elementor 4.3.6 + **Elementor Pro** 4.2.3 (header/footer via Theme Builder, formulários, slides, carrosséis, cards de posts) |
| Cache/otimização | Hummingbird (concatena CSS/JS em `/uploads/hummingbird-assets/`) |
| SEO | Yoast SEO (sitemaps, OG, schema JSON-LD) |
| Analytics | MonsterInsights → GA4 `G-NBTT6G2GRS` |
| WhatsApp | Joinchat (botão flutuante, nº 55 51 99994-8452, msg "Olá, gostaria de fazer uma cotação") |
| CRM/e-mail | **SAP Emarsys** (`link.hervalcorretora.com.br` é CNAME de `suite46-cf.emarsys.net`) |
| Cotação externa | `hervalcorretora.seucorretor.digital` e `hervalcorretora.aggilizador.com.br` |
| Vagas | Gupy (`hervalcorretora.gupy.io`) |

Peso da home: ~96 requisições, ~1000 nós de DOM, jQuery + jQuery UI + Swiper + SmartMenus + Font Awesome (3 folhas) + eicons. Tudo isso para um site essencialmente institucional e estático.

## 2. Inventário de conteúdo

**36 páginas + 24 posts + 13 categorias** (dados de `page-sitemap.xml` / `post-sitemap.xml`).

### Páginas institucionais
`/` · `/para-voce/` · `/para-empresas/` · `/sobre-nos/` · `/contato/` · `/ajuda/` · `/cotacao/` · `/blog/`

### Páginas de produto (27) — todas usam o mesmo template
**Para você (15):** acidentes-pessoais, automovel, bicicleta, capitalizacao, carta-verde, equipamentos, garantia-de-aluguel, odontologico, previdencia-privada, residencial, viagem, vida, scooter, fianca-locaticia, celular

**Para empresas (12):** agricola, condominio, empresarial, equipamentos, frota, garantia, vida-em-grupos, responsabilidade-civil, riscos-diversos, saude, transporte, viagem

**Órfãs (no sitemap, sem link em nenhuma listagem):** `garantia-estendida`, `nautico`, `nautico-empresas`

> `equipamentos` e `viagem` aparecem nas duas listas (mesma URL). `garantia-de-aluguel` e `fianca-locaticia` são praticamente o mesmo produto — vale decidir se fundem.

### Blog
24 posts mensais (fev/2023 → dez/2025), URL `/AAAA/MM/DD/slug/`. Categorias em `/category/general/<slug>/`. Último post em dez/2025.

## 3. Estrutura das páginas (blocos para componentizar)

### Header (global)
Fundo navy `#1E1A34`, logo à esquerda, menu: Para Você · Para Empresas · Sobre Nós · Contato · Ajuda · Blog · Trabalhe Conosco (Gupy) · botão vermelho **COTAR AGORA** → seucorretor.digital. Header transparente sobre o hero.

### Home
1. Hero com imagem de fundo + overlay escuro, título "Herval Corretora de Seguros", subtítulo, botão "Saiba mais" (widget *slides* com 1 slide só)
2. 3 cards sobrepostos ao hero (ícone vermelho + título): Avaliação personalizada · Atendimento diferenciado · Variedade de opções
3. "Nossos serviços" + 2 banners lado a lado (Para você / Para sua empresa) com foto, overlay e botão outline
4. Sobre nós: vídeo MP4 (2s, institucional) + texto + botão
5. "Empresas do grupo": grade 6×2 de logos com links UTM para as outras marcas do Grupo Herval
6. "Seguradoras parceiras": carrossel de ~28 logos com setas
7. Formulário de newsletter (e-mail) — **existe no HTML, mas está oculto**

### Listagens (`/para-voce/`, `/para-empresas/`)
Hero + título/subtítulo + divisor com título de seção + grade 3 colunas de cards com foto, overlay, nome do seguro e botão "Saiba mais".

### Produto (template único)
Hero com foto e nome do produto → H2 + parágrafos + lista de coberturas (bullets) → texto de fechamento → botão "Solicite aqui sua cotação" (→ aggilizador). **Ideal para virar um template alimentado por dados (Markdown/JSON).**

### Ajuda
Hero + accordion com 3 itens: Em caso de sinistro · Seguradoras (lista de ~20 seguradoras com WhatsApp, 0800 e site) · Links úteis.

### Contato
Formulário custom (HTML colado num widget) + Google Maps embed + blocos de telefone.

### Sobre nós
Texto institucional, bloco "O Grupo Herval" (fundado em 1959 em Dois Irmãos, 27 marcas, 20+ países), vídeos.

### Footer (global)
Navy, logo, colunas: A Herval Corretora (links) · Fale conosco (3 telefones com horários) · Redes sociais (Facebook, Instagram, LinkedIn, YouTube).

## 4. Design tokens extraídos

| Token | Valor | Uso |
|---|---|---|
| Vermelho primário | `#D9212E` | botões, ícones, divisores |
| Vermelho hover/escuro | `#A80511`, `#C91719`, `#A80F19` | hover e variações |
| Navy | `#1E1A34` | header e footer |
| Cinza fundo | `#F4F4F4` | seção "Empresas do grupo" |
| Texto | `#7A7A7A` / `#54595F` | corpo |
| Branco | `#FFFFFF` | fundo, texto sobre imagens |

- **Fonte:** Open Sans (Google Fonts) em tudo. Roboto / Roboto Slab aparecem no kit do Elementor mas não são usadas.
- **Breakpoints:** 1024px (tablet) e 767px (mobile).
- **Container:** ~1140px centralizado.
- **Cards:** cantos arredondados (~12px), sombra leve `rgba(0,0,0,.1)`.
- O "kit" global do Elementor ainda tem as cores padrão (`#6EC1E4`, `#61CE70`…) — não são da marca; ignorar.

## 5. Formulários e integrações (ponto crítico num site estático)

| Formulário | Hoje | Na reconstrução |
|---|---|---|
| **Contato** (`/contato/`) | HTML próprio, `fetch` POST para Emarsys `link.hervalcorretora.com.br/u/register.php` (CID 883837853, form `f=665`). Campos: `inp_1` nome, `inp_2` sobrenome, `inp_37` celular (prefixado com 55), `inp_3` e-mail, `inp_14702` mensagem, `optin` | **Funciona sem backend** — copiar como está. Só corrigir o tratamento de erro (ver §6). |
| **Cotação** (`/cotacao/`) | Elementor Pro Form (POST para `admin-ajax.php`), nome/telefone/e-mail/tipo de seguro (25 opções)/mensagem + **3 uploads** (apólice, CNH, comprovante). Há 2 instâncias do form na página (desktop/mobile). | Depende do WordPress. Opções: (a) aposentar e mandar tudo para o aggilizador/seucorretor, (b) serverless (Azure Function / Lambda) com storage para os anexos, (c) serviço de formulário (Formspree, Basin…). Os anexos com CNH e comprovante são **dados pessoais sensíveis (LGPD)** — não mandar por e-mail aberto. |
| **Newsletter** (home) | Elementor Form, só e-mail, oculto | Remover ou ligar no Emarsys como o de contato. |

Outras integrações que migram como estão: GA4 (gtag direto, sem MonsterInsights), botão WhatsApp (link `wa.me` + CSS próprio, sem plugin), Google Maps (iframe), vídeo YouTube (`youtube-nocookie` com lite-embed).

## 6. Problemas encontrados no site atual

1. **Links quebrados no mobile e tablet.** As variantes de header/footer para mobile e tablet apontam para `www2.hscorretora.com.br`, domínio que **não resolve DNS**. No celular, o logo e o botão "COTAR AGORA" levam a erro. (11 links por página.)
2. **Três destinos diferentes de cotação:** header → seucorretor.digital; páginas de produto → aggilizador; footer → `/cotacao/` interno; mobile → www2 (quebrado). Precisa de uma decisão única.
3. **Form de contato sempre mostra "sucesso"**: usa `.finally()`, então exibe a mensagem mesmo se o POST falhar.
4. **HTML aninhado:** o widget de contato tem um documento inteiro (`<!DOCTYPE html><html><head>…`) colado dentro da página.
5. **Sem `<h1>`** na home; 32 de 32 imagens da home com `alt=""` (logos das marcas e seguradoras sem texto alternativo).
6. **Conteúdo duplicado para responsividade:** blocos repetidos com `elementor-hidden-*` (ex.: "Sobre nós" 3× no HTML, form de cotação 2×). Ruim para SEO e manutenção.
7. 3 páginas órfãs (§2) e produtos duplicados (garantia de aluguel × fiança locatícia).
8. Blog parado desde dez/2025.
9. Peso desnecessário (jQuery, Font Awesome completo, 3 bibliotecas de ícones) para conteúdo estático.

## 7. Recomendação de reconstrução

### Abordagem
Site estático gerado (SSG), com produtos e posts como dados:

- **Astro** (recomendado): HTML puro por padrão, zero JS onde não precisa, coleções de conteúdo em Markdown para os 27 produtos e 24 posts, componentes `.astro` para os blocos do §3. Alternativa mais simples: **Eleventy (11ty)**.
- CSS próprio com variáveis do §4 (ou Tailwind). Sem jQuery; carrossel de logos em CSS puro (scroll-snap ou marquee) e accordion com `<details>`.
- Ícones: SVG inline só dos ~10 usados.

### Estrutura sugerida
```
src/
  components/  Header, Footer, Hero, FeatureCard, ProductCard, ProductGrid,
               LogoGrid, LogoCarousel, Accordion, ContactForm, WhatsAppButton
  layouts/     Base, Product, Post
  content/
    produtos/  automovel.md … (frontmatter: titulo, publico: [pf|pj], imagem, coberturas[], ordem)
    blog/      2025-12-12-fim-de-ano….md
  data/        seguradoras.json (nome, logo, whatsapp, 0800, site)
               empresas-grupo.json (nome, logo, url)
               contatos.json (telefones e horários)
  pages/       index, para-voce, para-empresas, sobre-nos, contato, ajuda, cotacao,
               [produto].astro, blog/index, [ano]/[mes]/[dia]/[slug].astro
public/        imagens otimizadas (webp/avif), favicon
```
`/para-voce/` e `/para-empresas/` viram filtros da mesma coleção por `publico`.

### Migração de conteúdo
- **A REST API está aberta** (`/wp-json/wp/v2/posts` e `/pages`, `X-WP-Total: 24`) → script exporta posts para Markdown (título, data, slug, categorias, imagem destacada, HTML → MD).
- Produtos: o conteúdo é curto e padronizado; extrair por script do HTML ou reescrever direto em Markdown.
- Imagens: baixar de `/wp-content/uploads/` só as originais (ignorar as variantes `-300x…`, `-768x…`) e gerar responsivas no build.

### SEO — não perder ranqueamento
- **Manter exatamente as mesmas URLs** (inclusive `/AAAA/MM/DD/slug/` dos posts e a barra final).
- Gerar `sitemap.xml`, `robots.txt`, canonical, OG e JSON-LD (`Organization` + `InsuranceAgency`, `BreadcrumbList`, `Article` nos posts).
- Redirects 301 para: `/category/…`, `/author/…`, `/feed/` (ou gerar RSS), páginas órfãs que forem removidas.
- Um `<h1>` por página e `alt` em todas as imagens.

### Decisões que precisam do negócio antes de começar
1. Qual é **o** destino de "Cotar agora"? (seucorretor, aggilizador ou formulário próprio)
2. O formulário de cotação com upload de documentos continua? Se sim, onde os dados ficam (LGPD)?
3. O blog continua? Quem publica? (define se precisa de um CMS headless — Decap CMS, por exemplo — ou se Markdown no Git basta)
4. Páginas órfãs (náutico, garantia estendida): publicar nas listagens ou remover?
5. Onde hospedar (Azure Static Web Apps / Netlify / Cloudflare Pages / mesmo esquema do statics.iplace) e quem controla o DNS.

### Estimativa de esforço (1 dev)
| Etapa | Esforço |
|---|---|
| Setup + design tokens + layout base (header/footer) | 1 dia |
| Componentes e páginas institucionais (home, listagens, sobre, ajuda, contato) | 2–3 dias |
| Template de produto + 30 produtos em Markdown | 1–2 dias |
| Migração do blog (script) + templates de post/listagem | 1 dia |
| Formulários, WhatsApp, GA4, SEO, redirects | 1–2 dias |
| QA responsivo, acessibilidade, Lighthouse | 1 dia |
| **Total** | **~7–10 dias** (sem contar o form de cotação com upload, se mantido) |
