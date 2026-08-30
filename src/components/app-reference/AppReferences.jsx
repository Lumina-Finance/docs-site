import React from 'react';
import styles from './styles.module.css';

/** Render decorative icons without adding them to the reference's spoken label */
function ReferenceIcon({kind}) {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true" focusable="false">
      {kind === 'element' && <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /></>}
      {kind === 'path' && <><circle cx="6" cy="18" r="3" /><circle cx="18" cy="6" r="3" /><path d="M6 15V6a3 3 0 0 1 3-3h6M18 9v9a3 3 0 0 1-3 3H9" /></>}
      {kind === 'separator' && <path d="m9 6 6 6-6 6" />}
    </svg>
  );
}

/** Identify an in-app label without presenting an interactive control */
export function UiElement({children}) {
  return (
    <span className={styles.reference}>
      <span className={styles.element}>
        <ReferenceIcon kind="element" />
        <span className={styles.label}>{children}</span>
      </span>
    </span>
  );
}

/** Render plain-text steps separated by → as a wrapping in-app path */
export function UiPath({children}) {
  const steps = children.split(/\s*→\s*/);

  return (
    <span className={styles.reference}>
      <span className={styles.path}>
        {steps.map((step, index) => (
          <span className={styles.step} key={`${index}-${step}`}>
            {index > 0 && <span className={styles.separatorText}> → </span>}
            <ReferenceIcon kind={index === 0 ? 'path' : 'separator'} />
            <span className={styles.label}>{step}</span>
          </span>
        ))}
      </span>
    </span>
  );
}
