/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  selfHosting: [
    'self-hosting/getting-started',
    {
      type: 'html',
      value: '<h2>Common configurations</h2>',
      className: 'docs-sidebar-section',
      defaultStyle: false,
    },
    'self-hosting/instance-url',
    'self-hosting/email',
    'self-hosting/update-checks',
    {
      type: 'html',
      value: '<h2>Advanced configurations</h2>',
      className: 'docs-sidebar-section',
      defaultStyle: false,
    },
    'self-hosting/signing-keys',
    'self-hosting/single-sign-on',
    'self-hosting/encryption-keys',
    {
      type: 'html',
      value: '<h2>Reference</h2>',
      className: 'docs-sidebar-section',
      defaultStyle: false,
    },
    'self-hosting/environment-variables',
    'self-hosting/faq',
  ],
};

export default sidebars;
