export const REPOSITORY_URL = 'https://github.com/Lumina-Finance/lumina-finance';
const REPOSITORY_API_URL = 'https://api.github.com/repos/Lumina-Finance/lumina-finance';

const REQUEST_TIMEOUT_MS = 8000;
const CACHE_KEY = 'lumina-docs:github-stars';
// Keeps visits well within GitHub's limit for anonymous requests
const CACHE_MAX_AGE_MS = 6 * 60 * 60 * 1000;
let starCountRequest = null;

/** A count saved by an earlier visit, while it's recent enough to reuse */
function readCachedStars() {
  try {
    const cached = JSON.parse(window.localStorage.getItem(CACHE_KEY));
    const age = Date.now() - cached?.savedAt;
    if (!(age >= 0 && age < CACHE_MAX_AGE_MS)) return null;
    return Number.isSafeInteger(cached.count) && cached.count >= 0 ? cached.count : null;
  } catch {
    // Storage can be unavailable or hold something unreadable; asking GitHub still works
    return null;
  }
}

function saveStars(count) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify({savedAt: Date.now(), count}));
  } catch {
    // Not saving only means the next visit asks GitHub again
  }
}

/** Fetch at most once per page load and every 6 hours, sharing the result between desktop and mobile navigation */
export function getGitHubStars() {
  if (starCountRequest) return starCountRequest;

  const cachedCount = readCachedStars();
  if (cachedCount !== null) {
    starCountRequest = Promise.resolve(cachedCount);
    return starCountRequest;
  }

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
      saveStars(count);
      return count;
    })
    .catch(() => {
      // Keep an unavailable count distinct from a repository with zero stars
      return null;
    });

  return starCountRequest;
}
