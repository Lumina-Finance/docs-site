const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const {test, after} = require('node:test');
const {transformSync} = require('@babel/core');
const {JSDOM} = require('jsdom');

const siteRoot = path.resolve(__dirname, '../../..');
const componentsDir = path.resolve(__dirname, '..');

// Compile the real components, and stand in for the Docusaurus link, site alias and asset imports
for (const extension of ['.jsx', '.mjs']) {
  const original = require.extensions[extension];
  require.extensions[extension] = (module, filename) => {
    if (!filename.startsWith(componentsDir + path.sep)) return original(module, filename);
    const {code} = transformSync(fs.readFileSync(filename, 'utf8'), {
      filename, babelrc: false, configFile: false,
      plugins: ['@babel/plugin-transform-react-jsx', '@babel/plugin-transform-modules-commonjs'],
    });
    module._compile(code, filename);
  };
}
require.extensions['.css'] = (module) => { module.exports = {}; };
require.extensions['.svg'] = (module) => { module.exports = () => null; };

const resolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request === '@docusaurus/Link') return path.join(__dirname, 'link-stub.cjs');
  if (request.startsWith('@site/')) request = path.join(siteRoot, request.slice('@site/'.length));
  return resolveFilename.call(this, request, ...rest);
};
require.cache[path.join(__dirname, 'link-stub.cjs')] = {
  id: 'link-stub', filename: path.join(__dirname, 'link-stub.cjs'), loaded: true,
  exports: {__esModule: true, default: ({children, ...props}) => require('react').createElement('a', props, children)},
};

const dom = new JSDOM('<!doctype html><div id="root"></div>', {url: 'https://docs.example.org'});
global.window = dom.window;
global.document = dom.window.document;
global.IS_REACT_ACT_ENVIRONMENT = true;
const React = require('react');
const {act} = React;
const {createRoot} = require('react-dom/client');
const SupportButtons = require('./SupportButtons.jsx').default;
const root = createRoot(document.getElementById('root'));
after(async () => {
  await act(() => root.unmount());
  dom.window.close();
});

const labels = () => [...document.querySelectorAll('.support-buttons a')].map((link) => link.textContent);

test('shows the Sponsor button before the coffee button, each opening safely in a new tab', async () => {
  await act(() => root.render(React.createElement(SupportButtons)));
  assert.deepEqual(labels(), ['Sponsor on GitHub', 'Buy me a coffee']);
  const [sponsor, coffee] = document.querySelectorAll('.support-buttons a');
  assert.equal(sponsor.href, 'https://github.com/sponsors/Lumina-Finance');
  assert.equal(coffee.href, 'https://www.buymeacoffee.com/lumina.finance');
  for (const link of [sponsor, coffee]) {
    assert.equal(link.target, '_blank');
    assert.equal(link.rel, 'noopener noreferrer');
    assert.match(link.getAttribute('aria-label'), /\(opens in a new tab\)$/);
  }
});

test('short labels shrink the visible text but keep the full accessible names', async () => {
  await act(() => root.render(React.createElement(SupportButtons, {short: true})));
  assert.deepEqual(labels(), ['Sponsor', 'Coffee']);
  assert.deepEqual(
    [...document.querySelectorAll('.support-buttons a')].map((link) => link.getAttribute('aria-label')),
    ['Sponsor on GitHub (opens in a new tab)', 'Buy me a coffee (opens in a new tab)'],
  );
});
