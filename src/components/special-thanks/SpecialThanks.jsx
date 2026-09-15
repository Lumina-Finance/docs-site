import React from 'react';
import CreditPill from './CreditPill';
import {normalizeThanks} from './credits.mjs';
import styles from './styles.module.css';

/** Separate committed page history from acknowledgements specified in the article */
export default function SpecialThanks({contributors = [], thanks}) {
  const acknowledgements = normalizeThanks(thanks);
  if (!contributors.length && !acknowledgements.length) return null;

  return (
    <details className={styles.section}>
      <summary className={styles.summary}>Credits</summary>
      {contributors.length > 0 && (
        <div className={styles.group}>
          <h2 className={styles.heading}>Contributors</h2>
          <ul className={styles.credits}>
            {contributors.map((name) => (
              <li key={name}><CreditPill kind="github" name={name} /></li>
            ))}
          </ul>
        </div>
      )}
      {acknowledgements.length > 0 && (
        <div className={styles.group}>
          <h2 className={styles.heading}>Special thanks</h2>
          <ul className={styles.credits}>
            {acknowledgements.map((credit) => (
              <li key={credit.id}>
                <CreditPill kind={credit.kind} name={credit.kind === 'reddit' ? `u/${credit.username}` : credit.kind === 'github' ? `@${credit.username}` : credit.name}
                  url={credit.kind === 'reddit' ? `https://www.reddit.com/user/${credit.username}/` : credit.kind === 'github' ? `https://github.com/${credit.username}` : credit.url}
                  note={credit.note} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </details>
  );
}
