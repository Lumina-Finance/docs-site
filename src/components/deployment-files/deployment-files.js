const TAGS_URL = 'https://api.github.com/repos/Lumina-Finance/lumina-finance/tags?per_page=1';
const RAW_REPOSITORY_URL = 'https://raw.githubusercontent.com/Lumina-Finance/lumina-finance';

/** Read GitHub without credentials or a cached response hiding a newer tag */
async function fetchGitHub(url, signal) {
  const response = await fetch(url, {
    cache: 'no-cache',
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
    signal,
  });
  if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
  return response;
}

/** Resolve the latest tag once so both deployment files use the same version */
export async function loadDeploymentFiles(signal) {
  const response = await fetchGitHub(TAGS_URL, signal);
  const tags = await response.json();
  const tag = tags?.[0]?.name;
  if (typeof tag !== 'string' || !tag.trim()) throw new Error('No release tag is available');

  const directory = `${RAW_REPOSITORY_URL}/refs/tags/${encodeURIComponent(tag)}/docker`;
  const [compose, environment] = await Promise.all([
    fetchGitHub(`${directory}/compose.yml`, signal).then((file) => file.text()),
    fetchGitHub(`${directory}/.env.example`, signal).then((file) => file.blob()),
  ]);
  if (!compose.trim() || !environment.size) throw new Error('A deployment file is empty');
  return {compose, environment};
}
