import {themes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Lumina Finance Docs',
  favicon: 'img/favicon.ico',
  url: 'https://docs.luminafinance.co',
  baseUrl: '/',
  trailingSlash: true,
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  markdown: {hooks: {onBrokenMarkdownLinks: 'throw', onBrokenMarkdownImages: 'throw'}},
  i18n: {defaultLocale: 'en', locales: ['en'], localeConfigs: {en: {htmlLang: 'en-CA', label: 'English (Canada)'}}},
  presets: [['classic', {
    docs: {
      routeBasePath: '/',
      sidebarPath: './sidebars.js',

    },
    blog: false,
    theme: {customCss: ['./src/css/custom.css']},
  }]],
  themeConfig: {
    colorMode: {defaultMode: 'light', respectPrefersColorScheme: true},
    navbar: {
      title: 'Lumina Finance',
      logo: {alt: '', src: 'img/logo.png'},
      items: [
        {type: 'doc', docId: 'self-hosting/getting-started', label: 'Self-hosting', position: 'left'},
      ],
    },
    footer: {
      style: 'light',
      links: [
        {label: 'Self-hosting', to: '/self-hosting/getting-started/'},
      ],
      copyright: `© ${new Date().getFullYear()} Lumina Software Inc.`,
    },
    prism: {theme: themes.github, darkTheme: themes.vsDark, additionalLanguages: ['bash', 'docker', 'ini', 'yaml']},
    tableOfContents: {minHeadingLevel: 2, maxHeadingLevel: 3},
  },
};

export default config;
