import assert from 'node:assert/strict';
import test from 'node:test';
import {normalizeRedditUsername, normalizeGitHubUsername, normalizeThanks} from './credits.mjs';

test('page front matter accepts Reddit and named acknowledgements with their notes', () => {
  const credits = normalizeThanks([
    {reddit: 'u/example_user', note: 'Explained the statement format.'},
    {name: 'Example contributor', url: 'https://example.org', note: 'Reviewed the examples.'},
    {name: 'Another contributor'},
  ]);
  assert.deepEqual(credits[0], {id: 'reddit:example_user', kind: 'reddit', username: 'example_user', note: 'Explained the statement format.'});
  assert.equal(credits[1].url, 'https://example.org/');
  assert.equal(credits[2].name, 'Another contributor');
  assert.deepEqual(normalizeThanks(), []);
  assert.deepEqual(normalizeThanks([]), []);
});

test('invalid handles cannot introduce another path, query, or markup', () => {
  assert.equal(normalizeRedditUsername(' U/Example-User_1 '), 'Example-User_1');
  for (const value of ['', '../user', 'name?x=1', '<script>', 'https://reddit.com/u/test', 10]) {
    assert.throws(() => normalizeRedditUsername(value));
  }
});

test('invalid manual credits produce actionable errors instead of silently disappearing', () => {
  for (const value of [null, {}, ['name'], [{}], [{reddit: 'test', name: 'Test'}], [{name: 'Test', note: 3}], [{name: 'Test', typo: 'x'}]]) {
    assert.throws(() => normalizeThanks(value));
  }
  assert.throws(() => normalizeThanks([{reddit: 'u/Test'}, {reddit: 'test'}]), /Duplicate/);
  assert.throws(() => normalizeThanks([{name: 'Name'}, {name: 'name'}]), /Duplicate/);
});

test('profile links reject executable schemes and embedded credentials', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,test', 'file:///tmp/test', '/relative', 'https://user:password@example.org']) {
    assert.throws(() => normalizeThanks([{name: 'Name', url}]));
  }
});

test('manual GitHub credits normalize handles and reject ambiguous identities and duplicate profiles', () => {
  assert.deepEqual(normalizeThanks([{github: '@Octocat', note: 'Reviewed the examples.'}]), [
    {id: 'github:octocat', kind: 'github', username: 'Octocat', note: 'Reviewed the examples.'},
  ]);
  assert.equal(normalizeGitHubUsername('  @example-user '), 'example-user');
  for (const value of ['', '-name', 'name-', 'two--hyphens', 'name/path', 'name?x=1', 'a'.repeat(40)]) {
    assert.throws(() => normalizeGitHubUsername(value));
  }
  for (const value of [
    [{github: 'test', reddit: 'test'}], [{github: 'test', name: 'Name'}],
    [{github: 'test', url: 'https://example.org'}], [{github: 'Test'}, {github: '@test'}],
  ]) assert.throws(() => normalizeThanks(value));
});
