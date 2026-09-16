import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

/** Introduces Bagel when a requested documentation page is missing */
export default function NotFoundContent({className}) {
  return (
    <main className={clsx('container', styles.content, className)}>
      <Heading as="h1">We couldn’t find that page.</Heading>
      <p>While you’re here, we’d like you to meet Daniel’s cat, Bagel.</p>
      <img
        className={styles.photo}
        src={useBaseUrl('/img/bagel.jpeg')}
        alt="Bagel, a black-and-white cat, sleeping on a grey sofa."
        width="2160"
        height="3840"
      />
      <Link className={styles.link} to="/">Back to the docs</Link>
    </main>
  );
}
