import {themes} from 'prism-react-renderer';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import path from 'node:path';
import pageHistory from './.page-history/last-updated.json';
import pageContributors from './.page-history/contributors.json';

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
  customFields: {homeLastUpdatedAt: pageHistory['src/pages/index.jsx'], pageContributors},
  future: {
    experimental_vcs: {
      initialize: (_params) => {},
      getFileCreationInfo: async (_filePath) => null,
      getFileLastUpdateInfo: async (filePath) => {
        const timestamp = pageHistory[path.relative(__dirname, filePath)];
        return timestamp ? {timestamp, author: ''} : null;
      },
    },
  },
  presets: [['classic', {
    docs: {
      routeBasePath: '/',
      sidebarPath: './sidebars.js',
      showLastUpdateTime: true,
      admonitions: {keywords: ['example'], extendDefaults: true},

      // Keep dollar amounts in financial examples as ordinary text
      remarkPlugins: [[remarkMath, {singleDollarTextMath: false}]],
      rehypePlugins: [rehypeKatex],
    },
    blog: false,
    theme: {customCss: ['./src/css/custom.css', './src/css/math.css']},
  }]],
  themes: [['@easyops-cn/docusaurus-search-local', {
    hashed: true,
    indexBlog: false,
    indexPages: true,
    docsRouteBasePath: '/',
    highlightSearchTermsOnTargetPage: true,
    searchBarShortcutHint: false,
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
        {label: 'Buy me a coffee', href: 'https://www.buymeacoffee.com/lumina.finance', className: 'footer__coffee'},
        {label: 'GitHub stars', href: 'https://github.com/Lumina-Finance/lumina-finance', className: 'footer__github'},
      ],
      copyright: `© ${new Date().getFullYear()} Lumina Software Inc.`,
    },
    prism: {theme: themes.github, darkTheme: themes.vsDark, additionalLanguages: ['bash', 'docker', 'ini', 'yaml']},
    tableOfContents: {minHeadingLevel: 2, maxHeadingLevel: 3},
  },
};

export default config;
