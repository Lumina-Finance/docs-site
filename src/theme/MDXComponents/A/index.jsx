import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import MDXA from '@theme-original/MDXComponents/A';
import styles from './styles.module.css';

/** Mark links to other websites while preserving the default link behaviour */
export default function DocumentationLink({children, ...props}) {
  const {siteConfig} = useDocusaurusContext();
  const destination = props.to || props.href;
  const webUrl = typeof destination === 'string' && /^(?:https?:)?\/\//i.test(destination)
    ? new URL(destination, siteConfig.url)
    : null;
  const external = webUrl && webUrl.origin !== new URL(siteConfig.url).origin;

  return (
    <MDXA {...props}>
      {children}
      {external && (
        <svg className={styles.externalArrow} viewBox="2 2 20 20" fill="none"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
          strokeLinejoin="round" aria-hidden="true" focusable="false">
          <path d="M15 3h6v6M10 14 21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
        </svg>
      )}
    </MDXA>
  );
}
