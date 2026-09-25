import React, {useEffect, useRef, useState} from 'react';
import ThemedImage from '@theme/ThemedImage';
import styles from './styles.module.css';

// Matches the fades in styles.module.css
const FADE_MS = 300;

/** Hold the image's space with a spinner until it loads, then fade it in */
export function HeroImage({sources, alt, width, height}) {
  const frame = useRef(null);
  // Unknown until the page is interactive, so the image stays visible if scripts never run
  const [state, setState] = useState(null);

  useEffect(() => {
    const image = [...frame.current.querySelectorAll('img')].find((element) => element.offsetParent !== null);
    // An image that loaded before the page became interactive shows without the animation
    setState((current) => current ?? (image?.complete && image.naturalWidth > 0 ? 'loaded' : 'loading'));
  }, []);

  useEffect(() => {
    if (state !== 'revealing') return undefined;
    const timer = setTimeout(() => setState('loaded'), FADE_MS);
    return () => clearTimeout(timer);
  }, [state]);

  return (
    <div ref={frame} className={styles.frame} style={{aspectRatio: `${width} / ${height}`}} data-state={state ?? undefined}>
      <ThemedImage
        sources={sources}
        alt={alt}
        width={width}
        height={height}
        className={styles.image}
        onLoad={() => setState((current) => (current === 'loading' ? 'revealing' : 'loaded'))}
      />
      {(state === 'loading' || state === 'revealing') && (
        <div className={styles.loading} role="status" aria-label="Loading image">
          <svg className={styles.spinner} viewBox="0 0 48 48" aria-hidden="true">
            <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="2.5" />
            <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="36 96" />
          </svg>
        </div>
      )}
    </div>
  );
}
