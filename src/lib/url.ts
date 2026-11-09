// Base path helpers. On the production domain BASE_URL is "/"; on the GitHub Pages
// preview it is "/hs-corretora/".
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

// A build served from a sub-path is a preview: no analytics, no indexing
export const isPreview = base !== '';

// Page path without the base, e.g. "/hs-corretora/contato/" -> "/contato/"
export const stripBase = (pathname: string) => (base && pathname.startsWith(base) ? pathname.slice(base.length) || '/' : pathname);
