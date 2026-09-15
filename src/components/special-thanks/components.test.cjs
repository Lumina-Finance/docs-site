const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {test, after} = require('node:test');
const {transformSync} = require('@babel/core');
const {JSDOM} = require('jsdom');

// Compile the actual components, while keeping CSS outside the DOM behaviour checks
for (const extension of ['.jsx', '.mjs']) {
  const original = require.extensions[extension];
  require.extensions[extension] = (module, filename) => {
    if (!filename.startsWith(__dirname + path.sep)) return original(module, filename);
    const {code} = transformSync(fs.readFileSync(filename, 'utf8'), {
      filename, babelrc: false, configFile: false,
      plugins: ['@babel/plugin-transform-react-jsx', '@babel/plugin-transform-modules-commonjs'],
    });
    module._compile(code, filename);
  };
}
require.extensions['.css'] = (module) => { module.exports = {}; };

const dom = new JSDOM('<!doctype html><div id="root"></div>', {url: 'https://docs.example.org'});
global.window = dom.window;
global.document = dom.window.document;
global.IS_REACT_ACT_ENVIRONMENT = true;
const React = require('react');
const {act} = React;
const {createRoot} = require('react-dom/client');
const SpecialThanks = require('./SpecialThanks.jsx').default;
const root = createRoot(document.getElementById('root'));
after(async () => { await act(() => root.unmount()); dom.window.close(); });

/** Mount the public footer component with real front matter inputs */
async function render(props) {
  await act(() => root.render(React.createElement(SpecialThanks, props)));
}

test('credits collapse by default, separate history from thanks, and omit empty groups', async () => {
  await render({contributors: ['Committer Name'], thanks: [{reddit: 'reader', note: 'Helpful feedback.'}]});
  assert.equal(document.querySelector('details').open, false);
  assert.equal(document.querySelector('li').textContent, 'Committer Name');
  assert.deepEqual([...document.querySelectorAll('h2')].map((heading) => heading.textContent), ['Contributors', 'Special thanks']);
  assert.equal(document.querySelector('a').href, 'https://www.reddit.com/user/reader/');
  assert.equal(document.querySelector('[role="tooltip"]') === null, true);
  assert.equal(document.body.textContent.includes('Helpful feedback.'), false);
  await render({thanks: [{name: 'Reader'}]});
  assert.deepEqual([...document.querySelectorAll('h2')].map((heading) => heading.textContent), ['Special thanks']);
  await render({});
  assert.equal(document.querySelector('details'), null);
});

test('focus opens a described note and Escape dismisses it without removing the pill', async () => {
  await render({thanks: [{name: 'Reader', note: 'Reviewed the examples.'}]});
  document.querySelector('details').open = true;
  const pill = document.querySelector('button');
  await act(() => pill.focus());
  const tooltip = document.querySelector('[role="tooltip"]');
  assert.equal(tooltip.textContent, 'Reviewed the examples.');
  assert.equal(pill.getAttribute('aria-describedby'), tooltip.id);
  await act(async () => {
    pill.dispatchEvent(new window.MouseEvent('mouseout', {bubbles: true, relatedTarget: document.body}));
    await new Promise((resolve) => setTimeout(resolve, 160));
  });
  assert.equal(document.querySelector('[role="tooltip"]'), tooltip);
  await act(() => document.dispatchEvent(new window.KeyboardEvent('keydown', {key: 'Escape', bubbles: true})));
  assert.equal(document.querySelector('[role="tooltip"]') === null, true);
  assert.equal(document.activeElement, pill);
  assert.equal(pill.hasAttribute('aria-describedby'), false);
});

test('hover opens a note without keyboard focus and leaving dismisses it', async () => {
  await render({thanks: [{reddit: 'reader', note: 'Suggested an example.'}]});
  document.querySelector('details').open = true;
  const pill = document.querySelector('a');
  await act(() => pill.dispatchEvent(new window.MouseEvent('mouseover', {bubbles: true})));
  assert.equal(document.querySelector('[role="tooltip"]').textContent, 'Suggested an example.');
  await act(async () => {
    pill.dispatchEvent(new window.MouseEvent('mouseout', {bubbles: true, relatedTarget: document.body}));
    await new Promise((resolve) => setTimeout(resolve, 160));
  });
  assert.equal(document.querySelector('[role="tooltip"]') === null, true);
});

test('first touch reveals a profile note before a second touch follows the link', async () => {
  await render({thanks: [{github: 'octocat', note: 'Reviewed the guide.'}]});
  document.querySelector('details').open = true;
  const pill = document.querySelector('a');
  for (const firstTap of [true, false]) {
    const down = new window.Event('pointerdown', {bubbles: true});
    Object.defineProperty(down, 'pointerType', {value: 'touch'});
    await act(() => pill.dispatchEvent(down));
    const click = new window.MouseEvent('click', {bubbles: true, cancelable: true});
    // Observe React's decision before preventing jsdom from attempting external navigation
    let intercepted;
    const observe = (event) => { intercepted = event.defaultPrevented; event.preventDefault(); };
    document.addEventListener('click', observe, {once: true});
    await act(() => pill.dispatchEvent(click));
    assert.equal(intercepted, firstTap);
    assert.equal(document.querySelector('[role="tooltip"]').textContent, 'Reviewed the guide.');
  }
});
