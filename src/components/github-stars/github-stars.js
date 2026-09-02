export const REPOSITORY_URL = 'https://github.com/Lumina-Finance/lumina-finance';
const REPOSITORY_API_URL = 'https://api.github.com/repos/Lumina-Finance/lumina-finance';

const REQUEST_TIMEOUT_MS = 8000;
let starCountRequest = null;

/** Fetch once per page load, sharing the result between desktop and mobile navigation */
export function getGitHubStars() {
  if (starCountRequest) return starCountRequest;

  starCountRequest = fetch(REPOSITORY_API_URL, {
    headers: {Accept: 'application/vnd.github+json'},
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
    cache: 'no-cache',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
    .then(async (response) => {
      if (!response.ok) throw new Error('GitHub star count unavailable');
      const {stargazers_count: count} = await response.json();
      if (!Number.isSafeInteger(count) || count < 0) throw new Error('Invalid GitHub star count');
      return count;
    })
    .catch(() => {
      // Keep an unavailable count distinct from a repository with zero stars
      return null;
    });

  return starCountRequest;
}
