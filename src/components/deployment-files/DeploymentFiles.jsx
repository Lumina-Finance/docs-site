import React, {useEffect, useState} from 'react';
import CodeBlock from '@theme/CodeBlock';
import styles from './styles.module.css';

import {loadDeploymentFiles} from './deployment-files';

const REQUEST_TIMEOUT_MS = 8000;

/** Load a matching pair from the latest tag each time the guide opens */
export function DeploymentFiles() {
  const [files, setFiles] = useState(null);
  const [hasError, setHasError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    setFiles(null);
    setHasError(false);

    loadDeploymentFiles(controller.signal)
      .then((result) => {
        if (isMounted) setFiles(result);
      })
      .catch(() => {
        if (isMounted) setHasError(true);
      })
      .finally(() => {
        clearTimeout(timeout);
        controller.abort();
      });

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt]);

  if (hasError) {
    return (
      <div className={styles.status} role="alert">
        <p>The deployment files could not be loaded from GitHub.</p>
        <button type="button" className="button button--secondary button--sm" onClick={() => setAttempt((value) => value + 1)}>Retry</button>
      </div>
    );
  }

  if (files === null) {
    return <p className={styles.status} role="status">Loading deployment files from GitHub…</p>;
  }

  return (
    <>
      <ComposeFile content={files.compose} />
      <EnvironmentDownload content={files.environment} />
    </>
  );
}

/** Render the release's Compose file after retrieving it in the reader's browser */
function ComposeFile({content}) {
  return (
    <div className={styles.composeFile} role="region" aria-label="Docker Compose file">
      <div className={styles.fileHeader}>
        <span>compose.yml</span>
        <span className={styles.language}>YAML</span>
      </div>
      <CodeBlock language="yaml" showLineNumbers className={`${styles.composeBlock} docs-persistent-wrap`}>{content}</CodeBlock>
    </div>
  );
}

/** Prepare a same-origin download so a real link click saves GitHub's unchanged bytes */
function EnvironmentDownload({content}) {
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
