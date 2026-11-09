// Prefixes root-relative URLs in the built HTML with Astro's `base` (e.g. /hs-corretora).
// Needed only when the site is served from a sub-path, like a GitHub Pages project site.
// Components, data files and Markdown keep plain "/..." paths; on the production domain
// (base "/") this integration does nothing.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

async function* htmlFiles(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(full);
    else if (entry.name.endsWith('.html')) yield full;
  }
}

export default function basePath() {
  let base = '';
  return {
    name: 'base-path-rewrite',
    hooks: {
      'astro:config:done': ({ config }) => {
        base = config.base.replace(/\/$/, '');
      },
      'astro:build:done': async ({ dir, logger }) => {
        if (!base) return;
        const escaped = base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // href="/x", src="/x", poster="/x" and action="/x", skipping protocol-relative
        // URLs (//host) and paths that already carry the base
        const attr = new RegExp(`(\\s(?:href|src|poster|action)=["'])/(?!/)(?!${escaped.slice(1)}(?:/|["']))`, 'g');
        let count = 0;
        for await (const file of htmlFiles(fileURLToPath(dir))) {
          const html = await fs.readFile(file, 'utf8');
          const out = html.replace(attr, (m, prefix) => {
            count++;
            return `${prefix}${base}/`;
          });
          if (out !== html) await fs.writeFile(file, out);
        }
        logger.info(`prefixed ${count} URLs with ${base}`);
      },
    },
  };
}
