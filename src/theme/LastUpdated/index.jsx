import React from 'react';
import styles from './styles.module.css';

// Use the project's time zone so server rendering and every reader show the same day
const dateFormat = new Intl.DateTimeFormat('en-CA', {
  dateStyle: 'long',
  timeZone: 'America/Toronto',
});

/** Display the page's committed date in production and the live preview */
export default function LastUpdated({lastUpdatedAt}) {
  if (!lastUpdatedAt) return null;
  const date = new Date(lastUpdatedAt);

  return (
    <span className={`theme-last-updated ${styles.date}`}>
      Last updated on <time dateTime={date.toISOString()} itemProp="dateModified">{dateFormat.format(date)}</time>
    </span>
  );
}
