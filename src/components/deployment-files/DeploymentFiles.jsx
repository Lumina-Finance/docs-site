import React, {useEffect, useState} from 'react';
import CodeBlock from '@theme/CodeBlock';
import styles from './styles.module.css';

import {loadDeploymentFiles} from './deployment-files';

const REQUEST_TIMEOUT_MS = 8000;
// Matches the loading overlay's fade in styles.module.css
const FADE_MS = 300;
// Keeps the loading state up long enough to read as intentional rather than a flicker
const MIN_LOADING_MS = 800;

/** Load both files from GitHub each time the guide opens */
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

    const minimumWait = new Promise((resolve) => setTimeout(resolve, MIN_LOADING_MS));
    Promise.all([loadDeploymentFiles(controller.signal), minimumWait])
      .then(([result]) => {
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

  return (
    <>
      <FilePanel
        name="compose.yml"
        label="Docker Compose file"
        language="yaml"
        languageLabel="YAML"
        placeholderLines={32}
        content={files?.compose ?? null}
      />
      <p>Then, copy the example env file below into a file named <code>.env</code> in the same directory:</p>
      <FilePanel
        name=".env.example"
        label="Example environment file"
        language="ini"
        languageLabel="ENV"
        placeholderLines={47}
        content={files?.environment ?? null}
      />
    </>
  );
}

/**
 * Render one of the repository's deployment files after retrieving it in the reader's browser, holding about
 * its length while it loads. placeholderLines is the file's usual line count
 */
function FilePanel({name, label, language, languageLabel, placeholderLines, content}) {
  const loaded = content !== null;
  const [showLoading, setShowLoading] = useState(!loaded);

  useEffect(() => {
    if (!loaded) {
      setShowLoading(true);
      return undefined;
    }
    const timer = setTimeout(() => setShowLoading(false), FADE_MS);
    return () => clearTimeout(timer);
  }, [loaded]);

  return (
    <div
      className={styles.file}
      role="region"
      aria-label={label}
      aria-busy={!loaded}
      style={{'--placeholder-lines': placeholderLines}}>
      <div className={styles.fileHeader}>
        <span>{name}</span>
        <span className={styles.language}>{languageLabel}</span>
      </div>
      <div className={styles.fileBody}>
        {loaded && (
          <CodeBlock language={language} showLineNumbers className={`${styles.fileBlock} ${styles.reveal} docs-persistent-wrap`}>{content}</CodeBlock>
        )}
        {showLoading && (
          <div className={styles.loading} data-state={loaded ? 'fading' : 'shown'} role="status">
            <Spinner />
            <span>Loading from GitHub…</span>
          </div>
        )}
      </div>
    </div>
  );
}

const Spinner = () => (
  <svg className={styles.spinner} viewBox="0 0 48 48" aria-hidden="true">
    <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="2.5" />
    <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="36 96" />
  </svg>
);
