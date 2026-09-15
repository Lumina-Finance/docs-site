/** Normalize a Reddit handle without accepting URL paths or markup */
export function normalizeRedditUsername(value) {
  if (typeof value !== 'string') throw new Error('A Reddit acknowledgement needs a username.');
  const username = value.trim().replace(/^u\//i, '');
  if (!/^[a-z0-9_-]+$/i.test(username)) {
    throw new Error('Use a Reddit username, such as example_user, rather than a profile URL.');
  }
  return username;
}

/** Accept only GitHub handles so profile links cannot point to another route */
export function normalizeGitHubUsername(value) {
  if (typeof value !== 'string') throw new Error('A GitHub acknowledgement needs a username.');
  const username = value.trim().replace(/^@/, '');
  if (!/^[a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])?$/i.test(username) || username.includes('--')) {
    throw new Error('Use a GitHub username, such as example-user, rather than a profile URL.');
  }
  return username;
}

/** Validate optional text instead of silently discarding malformed front matter */
function optionalText(value, field) {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} must be non-empty text.`);
  return value.trim();
}

/** Permit public web profiles without allowing executable or local-file links */
function profileUrl(value) {
  const url = optionalText(value, 'An acknowledgement URL');
  if (!url) return undefined;
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('An acknowledgement URL must be an absolute HTTP or HTTPS URL.');
  }
  if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password) {
    throw new Error('An acknowledgement URL must be HTTP or HTTPS and contain no credentials.');
  }
  return parsed.href;
}

/** Read page-local credits and reject duplicates or entries that cannot be displayed */
export function normalizeThanks(value = []) {
  if (!Array.isArray(value)) throw new Error('The thanks front matter must be a list of acknowledgements.');
  const seen = new Set();
  return value.map((entry) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new Error('Each acknowledgement needs reddit, github, or name, with an optional note.');
    }
    const allowed = new Set(['reddit', 'github', 'name', 'url', 'note']);
    if (Object.keys(entry).some((key) => !allowed.has(key))) throw new Error('Unknown acknowledgement field. Use reddit, github, name, url, or note.');
    const note = optionalText(entry.note, 'An acknowledgement note');
    let credit;
    const identityFields = ['reddit', 'github', 'name'].filter((key) => entry[key] !== undefined);
    if (identityFields.length !== 1) throw new Error('An acknowledgement needs exactly one of reddit, github, or name.');
    if (entry.github !== undefined) {
      if (entry.url !== undefined) throw new Error('A GitHub acknowledgement uses github and an optional note.');
      const username = normalizeGitHubUsername(entry.github);
      credit = {id: `github:${username.toLowerCase()}`, kind: 'github', username, note};
    } else if (entry.reddit !== undefined) {
      if (entry.name !== undefined || entry.url !== undefined) throw new Error('A Reddit acknowledgement uses reddit and an optional note.');
      const username = normalizeRedditUsername(entry.reddit);
      credit = {id: `reddit:${username.toLowerCase()}`, kind: 'reddit', username, note};
    } else {
      const name = optionalText(entry.name, 'An acknowledgement name');
      if (!name) throw new Error('An acknowledgement needs reddit, github, or name.');
      const url = profileUrl(entry.url);
      credit = {id: `person:${name.toLowerCase()}`, kind: 'person', name, url, note};
    }
    if (seen.has(credit.id)) throw new Error(`Duplicate acknowledgement: ${credit.username || credit.name}.`);
    seen.add(credit.id);
    return credit;
  });
}
