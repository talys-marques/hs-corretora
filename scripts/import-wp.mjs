// One-off importer: pulls content and images from the current WordPress site
// (hervalcorretora.com.br) into this Astro project.
// Usage: npm run import:wp
import fs from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';

const ORIGIN = 'https://hervalcorretora.com.br';
const ROOT = path.resolve(import.meta.dirname, '..');
const UPLOADS_RE = /https?:\/\/(?:www\.)?hervalcorretora\.com\.br\/wp-content\/uploads\/([^\s"')]+?\.(?:webp|png|jpe?g|svg|gif|pdf|mp4))/gi;
const UA = { 'User-Agent': 'Mozilla/5.0 (hs-corretora importer)' };

const INSTITUTIONAL = new Set(['', 'home', 'cotacao', 'blog', 'sobre-nos', 'para-empresas', 'para-voce', 'ajuda', 'contato']);

const assets = new Set();
const td = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-', codeBlockStyle: 'fenced' });

async function get(url, type = 'text') {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(url, { headers: UA });
    if (res.ok) return type === 'json' ? res.json() : type === 'buffer' ? Buffer.from(await res.arrayBuffer()) : res.text();
    if (res.status === 404) throw new Error(`404 ${url}`);
    await new Promise((r) => setTimeout(r, 500 * attempt));
  }
  throw new Error(`failed ${url}`);
}

// Rewrite absolute upload URLs to local /uploads/... paths and remember them for download
function localize(str) {
  return str.replace(UPLOADS_RE, (_, p) => {
    assets.add(p);
    return `/uploads/${p}`;
  });
}

function yamlValue(v) {
  if (Array.isArray(v)) return `[${v.map(yamlValue).join(', ')}]`;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (v == null) return '""';
  return JSON.stringify(String(v));
}

function frontmatter(obj) {
  return `---\n${Object.entries(obj).map(([k, v]) => `${k}: ${yamlValue(v)}`).join('\n')}\n---\n`;
}

function toMarkdown(html) {
  return td.turndown(html)
    .replace(/^-\s{2,}/gm, '- ')
    // Text glued right after a list in the source HTML must become its own paragraph
    .replace(/^(- .*)\n(?![-\s])/gm, '$1\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function cleanText(s) {
  return s.replace(/\s+/g, ' ').trim();
}

function titleCase(s) {
  const lower = s.toLocaleLowerCase('pt-BR');
  return lower.replace(/(^|\s)(\p{L})/gu, (m, sp, c) => sp + c.toLocaleUpperCase('pt-BR'))
    .replace(/\b(De|Da|Do|Em|E)\b/g, (w) => w.toLowerCase());
}

async function writeFile(rel, content) {
  const full = path.join(ROOT, rel);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, content);
}

// ---------- Listings: card image, order and audience per product ----------
async function readListing(slug, audience) {
  const $ = cheerio.load(await get(`${ORIGIN}/${slug}/`));
  const cards = [];
  $('[data-widget_type="call-to-action.default"]').each((i, el) => {
    const $el = $(el);
    const href = $el.find('a').first().attr('href') || '';
    const m = href.match(/hervalcorretora\.com\.br\/([a-z0-9-]+)\/?/);
    if (!m) return;
    const bg = ($el.find('.elementor-cta__bg').attr('style') || '').match(/url\(([^)]+)\)/);
    cards.push({
      slug: m[1],
      label: cleanText($el.find('.elementor-cta__title').text()),
      card: bg ? localize(bg[1].replace(/["']/g, '')) : '',
      audience,
      order: cards.length + 1,
    });
  });
  return cards;
}

// ---------- Products ----------
async function importProducts(pages) {
  const listings = [...(await readListing('para-voce', 'pf')), ...(await readListing('para-empresas', 'pj'))];
  const products = pages.filter((p) => !INSTITUTIONAL.has(p.slug));
  const outDir = 'src/content/produtos';
  // Images were replaced by curated stock photos (see src/data/creditos-imagens.json):
  // keep the hero/card already set in each product instead of the WordPress ones
  const keptImages = {};
  for (const f of await fs.readdir(path.join(ROOT, outDir)).catch(() => [])) {
    const s = await fs.readFile(path.join(ROOT, outDir, f), 'utf8');
    keptImages[f.replace(/\.md$/, '')] = {
      hero: (s.match(/^hero: "([^"]*)"/m) || [])[1],
      card: (s.match(/^card: "([^"]*)"/m) || [])[1],
    };
  }
  await fs.rm(path.join(ROOT, outDir), { recursive: true, force: true });

  for (const page of products) {
    const html = await get(page.link);
    const $ = cheerio.load(html);
    const main = $('[data-elementor-type^="wp-"]');
    const boxes = main.find('[data-widget_type="image-box.default"]');
    const name = cleanText(boxes.eq(0).find('.elementor-image-box-title').text()) || page.title.rendered;
    const contentBox = boxes.eq(1).find('.elementor-image-box-content');
    const heading = cleanText(contentBox.find('.elementor-image-box-title').text());
    contentBox.find('.elementor-image-box-title').remove();
    contentBox.find('p.elementor-image-box-description:empty').remove();
    const bodyHtml = localize(contentBox.html() || '');
    const body = toMarkdown(bodyHtml);

    let hero = '';
    try {
      const css = await get(`${ORIGIN}/wp-content/uploads/elementor/css/post-${page.id}.css`);
      const m = css.match(/background-image:url\("?([^")]+)"?\)/);
      if (m) hero = localize(m[1]);
    } catch { /* page without custom css */ }

    const inListings = listings.filter((l) => l.slug === page.slug);
    const firstPara = cleanText(cheerio.load(bodyHtml)('p').first().text());
    const fm = {
      title: titleCase(name),
      heading: heading || titleCase(name),
      description: firstPara.length > 155 ? firstPara.slice(0, 152).replace(/\s\S*$/, '') + '…' : firstPara,
      audience: inListings.map((l) => l.audience),
      order: inListings[0]?.order ?? 99,
      orderPj: inListings.find((l) => l.audience === 'pj')?.order ?? 99,
      listed: inListings.length > 0,
      hero: keptImages[page.slug]?.hero || hero,
      card: keptImages[page.slug]?.card || inListings[0]?.card || hero,
      updated: page.modified,
    };
    await writeFile(`${outDir}/${page.slug}.md`, frontmatter(fm) + '\n' + body + '\n');
    console.log('produto', page.slug, fm.audience.join('+') || 'orfa');
  }
}

// ---------- Blog posts ----------
async function importPosts() {
  const cats = await get(`${ORIGIN}/wp-json/wp/v2/categories?per_page=100`, 'json');
  const catName = Object.fromEntries(cats.map((c) => [c.id, { name: c.name, slug: c.slug }]));
  const posts = await get(`${ORIGIN}/wp-json/wp/v2/posts?per_page=100&_embed=1`, 'json');
  const outDir = 'src/content/blog';
  await fs.rm(path.join(ROOT, outDir), { recursive: true, force: true });

  for (const p of posts) {
    const media = p._embedded?.['wp:featuredmedia']?.[0];
    const content = localize(p.content.rendered.replace(/<!--[\s\S]*?-->/g, ''));
    let body = toMarkdown(content);
    // No featured images on the old blog: use the first inline image (original size) as cover
    let cover = media?.source_url ? localize(media.source_url) : '';
    const inline = content.match(/\/uploads\/([^"\s]+?)(-\d+x\d+)?\.(jpe?g|png|webp)/i);
    if (!cover && inline) {
      const original = `${inline[1]}.${inline[3]}`;
      assets.add(original);
      cover = `/uploads/${original}`;
      // The promoted image would otherwise show twice (cover + inline thumbnail)
      body = body.replace(/^!\[[^\]]*\]\([^)]+\)\s*\n+/m, '');
    }
    const excerpt = cleanText(cheerio.load(p.excerpt.rendered).text()).replace(/\s*\[…\]$|\s*\[&hellip;\]$/, '…');
    const slug = decodeURIComponent(p.slug);
    const fm = {
      title: cleanText(cheerio.load(p.title.rendered).text()),
      slug,
      date: p.date,
      updated: p.modified,
      description: excerpt.length > 160 ? excerpt.slice(0, 157).replace(/\s\S*$/, '') + '…' : excerpt,
      categories: p.categories.map((id) => catName[id]?.name).filter(Boolean),
      image: cover,
      imageAlt: media?.alt_text || '',
      legacyPath: new URL(p.link).pathname,
    };
    await writeFile(`${outDir}/${p.date.slice(0, 10)}-${slug.slice(0, 60)}.md`, frontmatter(fm) + '\n' + body + '\n');
    console.log('post', fm.legacyPath);
  }
}

// ---------- Home: group companies and partner insurers ----------
async function importHome() {
  const $ = cheerio.load(await get(`${ORIGIN}/`));
  const group = [];
  $('[data-widget_type="image.default"] a[href*="utm_source=site-corretora"]').each((i, a) => {
    const url = $(a).attr('href').replace(/&#038;/g, '&');
    const img = $(a).find('img').attr('src');
    if (group.some((g) => g.url === url)) return;
    const host = new URL(url).hostname.replace(/^www\./, '').split('.')[0];
    group.push({ name: host, url, logo: localize(img) });
  });

  const insurers = [];
  $('[data-widget_type="media-carousel.default"] .swiper-slide').each((i, s) => {
    const style = $(s).find('.elementor-carousel-image').attr('style') || '';
    const m = style.match(/url\(['"]?([^'")]+)/) || [null, $(s).find('img').attr('src')];
    if (!m[1]) return;
    const file = m[1].split('/').pop();
    if (insurers.some((x) => x.logo.endsWith(file))) return;
    const name = file.replace(/(-pb-home)?\.(png|webp|jpe?g)$/i, '').replace(/[-_]/g, ' ');
    insurers.push({ name: titleCase(name), logo: localize(m[1]) });
  });

  const video = $('video').attr('src');
  if (video) localize(video);

  // empresas-grupo.json is curated by hand (proper brand names); only seed it when missing
  const groupFile = path.join(ROOT, 'src/data/empresas-grupo.json');
  if (!(await fs.access(groupFile).then(() => true, () => false))) {
    await writeFile('src/data/empresas-grupo.json', JSON.stringify(group, null, 2) + '\n');
  }
  await writeFile('src/data/seguradoras-parceiras.json', JSON.stringify(insurers, null, 2) + '\n');
  console.log('grupo', group.length, 'seguradoras parceiras', insurers.length, 'video', video);
}

// ---------- Help page: insurers contact list, claims PDF, useful links ----------
async function importHelp() {
  const $ = cheerio.load(await get(`${ORIGIN}/ajuda/`));
  const acc = $('[data-widget_type="accordion.default"]').first();
  const items = acc.find('.elementor-accordion-item');
  const sinistroHtml = localize(items.eq(0).find('.elementor-tab-content').html() || '');
  const pdf = (sinistroHtml.match(/href="([^"]+\.pdf)"/) || [])[1] || '';

  const insurers = [];
  items.eq(1).find('.itemSeguradora').each((i, el) => {
    const $el = $(el);
    if ($el.hasClass('indisponivel')) return;
    const entry = { name: cleanText($el.find('h3').text()), logo: '', site: '', whatsapp: '', phone: '' };
    const img = $el.find('img').attr('src');
    if (img) entry.logo = localize(img);
    $el.find('a').each((j, a) => {
      const href = $(a).attr('href') || '';
      const text = cleanText($(a).text());
      if (/wa\.me|whatsapp/i.test(href)) entry.whatsapp = text;
      else if (href.startsWith('tel:')) entry.phone = text;
      else if (/^https?:/.test(href) && !entry.site && !/visite/i.test(text) === false) entry.site = href;
      else if (/^https?:/.test(href) && !entry.site) entry.site = href;
    });
    $el.find('p').each((j, p) => {
      const t = cleanText($(p).text());
      if (/^WhatsApp:/i.test(t) && !entry.whatsapp) entry.whatsapp = t.replace(/^WhatsApp:\s*/i, '');
      if (/^Liga[çc][ãa]o:/i.test(t) && !entry.phone) entry.phone = t.replace(/^Liga[çc][ãa]o:\s*/i, '');
    });
    insurers.push(entry);
  });

  const links = [];
  items.eq(2).find('p').each((i, p) => {
    const label = cleanText($(p).find('strong').text()).replace(/:$/, '');
    const url = $(p).find('a').attr('href');
    if (label && url) links.push({ label, url });
  });

  await writeFile('src/data/ajuda.json', JSON.stringify({ sinistroPdf: pdf, seguradoras: insurers, links }, null, 2) + '\n');
  console.log('ajuda: seguradoras', insurers.length, 'links', links.length, 'pdf', pdf);
}

// ---------- Institutional page images (heroes, banners) ----------
async function importInstitutionalImages(pages) {
  const heroes = {};
  for (const p of pages.filter((x) => INSTITUTIONAL.has(x.slug) || x.slug === 'home')) {
    try {
      const css = await get(`${ORIGIN}/wp-content/uploads/elementor/css/post-${p.id}.css`);
      heroes[p.slug || 'home'] = [...css.matchAll(/background-image:url\("?([^")]+)"?\)/g)].map((m) => localize(m[1]));
    } catch { /* ignore */ }
  }
  await writeFile('scripts/.institutional-images.json', JSON.stringify(heroes, null, 2) + '\n');
  console.log('heroes', Object.fromEntries(Object.entries(heroes).map(([k, v]) => [k, v.length])));
}

// ---------- Download every referenced asset ----------
async function downloadAssets() {
  let n = 0;
  for (const rel of assets) {
    const dest = path.join(ROOT, 'public/uploads', decodeURIComponent(rel));
    try {
      await fs.access(dest);
      continue;
    } catch { /* not downloaded yet */ }
    try {
      const buf = await get(`${ORIGIN}/wp-content/uploads/${rel}`, 'buffer');
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await fs.writeFile(dest, buf);
      n++;
    } catch (e) {
      console.warn('asset falhou', rel, e.message);
    }
  }
  console.log('assets baixados', n, 'de', assets.size);
}

const pages = await get(`${ORIGIN}/wp-json/wp/v2/pages?per_page=100&_fields=id,slug,title,link,modified`, 'json');
await importHome();
await importHelp();
await importProducts(pages);
await importPosts();
await importInstitutionalImages(pages);
['2021/11/HERVAL-CORRETORA_marca-com-outline_HORIZONTAL.svg', '2021/12/cropped-favicon-hs-192x192.png', '2021/12/cropped-favicon-hs-180x180.png', '2021/12/cropped-favicon-hs-32x32.png', '2021/12/Foto-aerea_2014_HMC-valendo.webp']
  .forEach((p) => assets.add(p));
await downloadAssets();
