import React from 'react';
import AdmonitionLayout from '@theme/Admonition/Layout';
import styles from './example.module.css';

/** Render worked examples with a distinct label and document icon */
export default function Example({title = 'Example', icon, className, ...props}) {
  return (
    <AdmonitionLayout
      {...props}
      type="example"
      title={title}
      className={[styles.example, className].filter(Boolean).join(' ')}
      icon={icon ?? (
        <svg className={styles.icon} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
          <path d="M6 3h8l4 4v14H6zM14 3v5h4M9 12h6M9 16h6" />
        </svg>
      )}
    />
  );
}
