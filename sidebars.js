/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  selfHosting: [
    'self-hosting/getting-started',
    {
      type: 'category',
      label: 'Common configurations',
      collapsed: false,
      link: {type: 'doc', id: 'self-hosting/common-configurations'},
      items: ['self-hosting/instance-url', 'self-hosting/email', 'self-hosting/version-settings'],
    },
    {
      type: 'category',
      label: 'Advanced configurations',
      link: {type: 'doc', id: 'self-hosting/advanced-configurations'},
      items: ['self-hosting/signing-keys', 'self-hosting/single-sign-on', 'self-hosting/encryption-keys'],
    },
    'self-hosting/environment-variables',
  ],
};

export default sidebars;
