// Single source of truth for contact data, links and third-party IDs.
// Changing a phone number, quote URL or social link here updates the whole site.

export const site = {
  name: 'Herval Corretora de Seguros',
  shortName: 'Herval Corretora',
  url: 'https://hervalcorretora.com.br',
  description:
    'As melhores soluções em seguros para você, seu patrimônio, sua família ou sua empresa. Seguros personalizados com a credibilidade do Grupo Herval desde 1959.',
  logo: '/uploads/2021/11/HERVAL-CORRETORA_marca-com-outline_HORIZONTAL.svg',
  ogImage: '/uploads/2021/12/Foto-aerea_2014_HMC-valendo.webp',
  email: 'seguros@herval.com.br',

  // Quote destinations. Today the old site sends the header to one platform and the
  // product pages to another; both live here so the business can unify them in one edit.
  quote: {
    primaryUrl: 'https://hervalcorretora.seucorretor.digital/#/home',
    productUrl: 'https://hervalcorretora.aggilizador.com.br/',
  },

  careersUrl: 'https://hervalcorretora.gupy.io',

  phones: [
    { label: 'Administrativo', number: '(51) 3564-8366', tel: '+555135648366', hours: 'Seg a Qui, 08h às 18h · Sex 08h às 17h' },
    { label: 'Cotações de Seguros', number: '(51) 9 9994-8452', tel: '+5551999948452', hours: 'Seg a Qui, 08h às 18h · Sex 08h às 17h' },
    { label: 'Sinistro e Assistências', number: '(51) 9 9878-8791', tel: '+5551998788791', hours: '24h, 7 dias por semana' },
  ],

  whatsapp: {
    number: '5551999948452',
    message: 'Olá, gostaria de fazer uma cotação',
  },

  social: [
    { name: 'Facebook', url: 'https://www.facebook.com/hscorretora', icon: 'facebook' },
    { name: 'Instagram', url: 'https://www.instagram.com/hscorretora/', icon: 'instagram' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/company/hs-corretora-de-segurosoficial/', icon: 'linkedin' },
    { name: 'YouTube', url: 'http://www.youtube.com/@HervalCorretora', icon: 'youtube' },
  ],

  address: {
    locality: 'Dois Irmãos',
    region: 'RS',
    country: 'BR',
    mapQuery: 'grupo herval',
  },

  // Google Analytics 4 (same property as the WordPress site)
  gaId: 'G-NBTT6G2GRS',

  // SAP Emarsys web form used by the contact page (same IDs as the old form)
  emarsys: {
    action: 'https://link.hervalcorretora.com.br/u/register.php',
    cid: '883837853',
    formId: '665',
  },
} as const;

export const nav = [
  { label: 'Para Você', href: '/para-voce/' },
  { label: 'Para Empresas', href: '/para-empresas/' },
  { label: 'Sobre Nós', href: '/sobre-nos/' },
  { label: 'Contato', href: '/contato/' },
  { label: 'Ajuda', href: '/ajuda/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Trabalhe Conosco', href: site.careersUrl, external: true },
];

export const whatsappLink = (message: string = site.whatsapp.message) =>
  `https://wa.me/${site.whatsapp.number}?text=${encodeURIComponent(message)}`;
