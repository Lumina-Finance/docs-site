import React from 'react';

/** Mark where a planned screenshot or demo belongs in a guide */
export function MediaPlaceholder({kind = 'screenshot', title, children}) {
  const label = kind === 'demo' ? 'Demo placeholder' : 'Screenshot placeholder';

  return (
    <figure className="guide-media-placeholder">
      <span className="guide-media-placeholder__icon" aria-hidden="true">
        {kind === 'demo' ? 'D' : 'S'}
      </span>
      <figcaption>
        <span className="guide-media-placeholder__label">{label}</span>
        {title && <strong className="guide-media-placeholder__title">{title}</strong>}
        <div className="guide-media-placeholder__description">{children}</div>
      </figcaption>
    </figure>
  );
}
