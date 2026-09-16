import React, {useEffect, useState} from 'react';
import Link from '@docusaurus/Link';
import DockerIcon from '@site/static/img/docker.svg';
import {getDockerPulls, REPOSITORY_URL} from './docker-pulls';

/** Show Docker Hub pulls in the footer without delaying the repository link */
export default function DockerPulls() {
  const [count, setCount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getDockerPulls().then((nextCount) => {
      if (isMounted) {
        setCount(nextCount);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const countLabel = count !== null
    ? `${count.toLocaleString('en-CA')} ${count === 1 ? 'pull' : 'pulls'} on Docker Hub`
    : isLoading ? 'Loading Docker Hub pull count' : 'Docker Hub pull count unavailable';

  return (
    <Link className="footer__link-item footer__docker" href={REPOSITORY_URL}
      target="_blank" rel="noopener noreferrer" title={countLabel}
      aria-label={`Lumina Finance on Docker Hub. ${countLabel} (opens in a new tab)`}>
      <DockerIcon fill="currentColor" aria-hidden="true" focusable="false" />
      <span className="footer__docker-count" aria-hidden="true">
        <span>{count !== null ? count.toLocaleString('en-CA') : (isLoading ? '…' : 'N/A')} {count === 1 ? 'pull' : 'pulls'}</span>
      </span>
    </Link>
  );
}
