import React, {useEffect, useState} from 'react';
import CodeBlock from '@theme/CodeBlock';
import styles from './styles.module.css';

// Retrieve both deployment files from the same verified revision
const RELEASE_COMMIT = '1d14fe446a3ee5c96a5b6547eea9cdc0aa3ddefa';
const RAW_DIRECTORY = `https://raw.githubusercontent.com/Lumina-Finance/lumina-finance/${RELEASE_COMMIT}/docker`;
const REQUEST_TIMEOUT_MS = 8000;

/** Retrieve a release file in the browser, with cancellation and an explicit retry */
function useGitHubFile(filename, format) {
  const [content, setContent] = useState(null);
  const [hasError, setHasError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    setContent(null);
    setHasError(false);

    fetch(`${RAW_DIRECTORY}/${filename}`, {
      cache: 'no-cache',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
        return format === 'blob' ? response.blob() : response.text();
      })
      .then((file) => {
        if (!(format === 'blob' ? file.size : file.trim().length)) throw new Error('The file is empty');
        if (isMounted) setContent(file);
      })
      .catch(() => {
        if (isMounted) setHasError(true);
      })
      .finally(() => clearTimeout(timeout));

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [filename, format, attempt]);

  return {content, hasError, retry: () => setAttempt((value) => value + 1)};
}

/** Render the release's Compose file after retrieving it in the reader's browser */
export function ComposeFile() {
  const {content, hasError, retry} = useGitHubFile('compose.yml', 'text');

  if (hasError) {
    return (
      <div className={styles.status} role="alert">
        <p>The Compose file could not be loaded from GitHub.</p>
        <button type="button" className="button button--secondary button--sm" onClick={retry}>Retry</button>
      </div>
    );
  }

  if (content === null) {
    return <p className={styles.status} role="status">Loading compose.yml from GitHub…</p>;
  }

  return (
    <div className={styles.composeFile} role="region" aria-label="Docker Compose file">
      <div className={styles.fileHeader}>
        <span>compose.yml</span>
        <span className={styles.language}>YAML</span>
      </div>
      <CodeBlock language="yaml" showLineNumbers className={styles.composeBlock}>{content}</CodeBlock>
    </div>
  );
}

/** Prepare a same-origin download so a real link click saves GitHub's unchanged bytes */
export function EnvironmentDownload() {
  const {content, hasError, retry} = useGitHubFile('.env.example', 'blob');
  const [downloadUrl, setDownloadUrl] = useState(null);

  useEffect(() => {
    if (content === null) {
      setDownloadUrl(null);
      return undefined;
    }
    const objectUrl = URL.createObjectURL(content);
    setDownloadUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [content]);

  if (hasError) {
    return (
      <div className={styles.status} role="alert">
        <p>The environment example could not be loaded from GitHub.</p>
        <button type="button" className="button button--secondary button--sm" onClick={retry}>Retry</button>
      </div>
    );
  }

  if (downloadUrl === null) {
    return <p role="status">Preparing the .env.example download…</p>;
  }

  return (
    <p>
      <a href={downloadUrl} download=".env.example">Download the example env file</a>
      {' '}and rename it to <code>.env</code> in the same directory as the Docker Compose file.
    </p>
  );
}
