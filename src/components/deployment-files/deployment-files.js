const DOCKER_DIRECTORY_URL = 'https://raw.githubusercontent.com/Lumina-Finance/lumina-finance/main/docker';

/** Read GitHub without credentials or a cached response hiding a newer file */
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

/** Load both deployment files straight from the repository */
export async function loadDeploymentFiles(signal) {
  const [compose, environment] = await Promise.all([
    fetchGitHub(`${DOCKER_DIRECTORY_URL}/compose.yml`, signal).then((file) => file.text()),
    fetchGitHub(`${DOCKER_DIRECTORY_URL}/.env.example`, signal).then((file) => file.text()),
  ]);
  if (!compose.trim() || !environment.trim()) throw new Error('A deployment file is empty');
  return {compose, environment};
}
