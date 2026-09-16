export const REPOSITORY_URL = 'https://hub.docker.com/r/luminahq/lumina-finance';

// Shields exposes Docker Hub pull counts with the CORS headers required by this static site
const PULL_COUNT_URL = 'https://img.shields.io/badge/dynamic/json.json?' + new URLSearchParams({
  url: 'https://hub.docker.com/v2/namespaces/luminahq/repositories/lumina-finance',
  query: '$.pull_count',
  label: 'Docker pulls',
});
const REQUEST_TIMEOUT_MS = 8000;
let pullCountRequest = null;

/** Share the cached Docker Hub pull total across footer mounts */
export function getDockerPulls() {
  if (pullCountRequest) return pullCountRequest;

  pullCountRequest = fetch(PULL_COUNT_URL, {
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
    .then(async (response) => {
      if (!response.ok) throw new Error('Docker Hub pull count unavailable');
      const {message, isError} = await response.json();
      const count = Number(message);
      if (isError || typeof message !== 'string' || !/^\d+$/.test(message)
        || !Number.isSafeInteger(count) || count < 0) {
        throw new Error('Invalid Docker Hub pull count');
      }
      return count;
    })
    .catch(() => {
      // An unavailable count must not appear as zero pulls
      return null;
    });

  return pullCountRequest;
}
