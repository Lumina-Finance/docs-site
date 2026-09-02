import React, {useEffect, useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import {getGitHubStars, REPOSITORY_URL} from './github-stars';
import styles from './styles.module.css';

const countFormatter = new Intl.NumberFormat('en-CA', {useGrouping: false});

/** Show the repository's current star count without delaying the navigation link */
export default function GitHubStars({mobile = false, compact = false, sidebar = false, onClick}) {
  const [count, setCount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shortened, setShortened] = useState(false);
  const badgeRef = useRef(null);
  const groupRef = useRef(null);
  const numberRef = useRef(null);

  useEffect(() => {
    const badge = badgeRef.current;
    const group = groupRef.current;
    const number = numberRef.current;
    if (!badge || !group || !number || count === null) return undefined;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return undefined;
    let frame = 0;
    let disposed = false;
    const px = value => Number.parseFloat(value) || 0;
    const horizontalSpace = element => {
      const style = getComputedStyle(element);
      return px(style.paddingLeft) + px(style.paddingRight) + px(style.borderLeftWidth) + px(style.borderRightWidth);
    };
    const update = () => {
      frame = 0;
      if (disposed || !badge.isConnected) return;
      context.font = getComputedStyle(number).font;
      const fullWidth = context.measureText(String(count)).width;
      let available = badge.getBoundingClientRect().width;
      if (compact) {
        // The footer badges size to their content; measure the whole available row,
        // rather than the shortened badge, so the full count can return on resize.
        const row = badge.closest('.footer__links');
        const footer = row?.parentElement;
        if (row && footer) {
          available = footer.clientWidth - horizontalSpace(footer);
          if (getComputedStyle(footer).flexDirection === 'row') {
            const others = Array.from(footer.children).filter(child => child !== row);
            available -= others.reduce((sum, child) => sum + child.getBoundingClientRect().width, 0);
            available -= px(getComputedStyle(footer).columnGap) * others.length;
          }
          const others = Array.from(row.querySelectorAll('a')).filter(link => link !== badge);
          available -= others.reduce((sum, link) => sum + link.getBoundingClientRect().width, 0);
          available -= px(getComputedStyle(row).columnGap) * others.length;
        }
      }
      const siblings = Array.from(badge.children).filter(child => child !== group);
      available -= horizontalSpace(badge) + siblings.reduce((sum, child) => sum + child.getBoundingClientRect().width, 0);
      available -= px(getComputedStyle(badge).columnGap) * siblings.length;
      const groupSiblings = Array.from(group.children).filter(child => child !== number);
      available -= horizontalSpace(group) + groupSiblings.reduce((sum, child) => sum + child.getBoundingClientRect().width, 0);
      available -= px(getComputedStyle(group).columnGap) * groupSiblings.length;
      setShortened(count >= 1000 && fullWidth > available - 1);
    };
    const schedule = () => {
      if (!disposed && !frame) frame = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(badge);
    observer.observe(badge.parentElement);
    if (compact && badge.closest('.footer > .container')) observer.observe(badge.closest('.footer > .container'));
    window.addEventListener('resize', schedule);
    document.fonts.ready.then(schedule);
    schedule();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', schedule);
    };
  }, [count, compact]);

  useEffect(() => {
    let isMounted = true;

    getGitHubStars().then((nextCount) => {
      if (isMounted) {
        setCount(nextCount);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const formattedCount = count === null ? null : countFormatter.format(count);
  const displayedCount = count !== null && shortened ? `${Number((count / 1000).toFixed(1))}k` : formattedCount;
  const countLabel = formattedCount !== null
    ? `${formattedCount} ${count === 1 ? 'star' : 'stars'}`
    : isLoading ? 'Loading GitHub star count' : 'GitHub star count unavailable';

  const pill = (
    <Link
      ref={badgeRef}
      href={REPOSITORY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={compact ? 'footer__link-item footer__github' : `${mobile || sidebar ? '' : 'navbar__item '}${styles.pill}`}
      aria-label={`Star it on GitHub. Lumina Finance. ${countLabel} (opens in a new tab)`}
      onClick={onClick}
    >
      <svg className={styles.githubIcon} viewBox="0 0 16 16" aria-hidden="true">
        <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38l-.01-1.49c-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.2c0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
      </svg>
      {compact ? <>
        <span ref={groupRef} className="footer__github-count" title={countLabel}>
        <span ref={numberRef}>{displayedCount ?? (isLoading ? '…' : 'N/A')}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" aria-hidden="true">
          <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z" />
        </svg>
        </span>
      </> : <>
      <span>Star it on GitHub</span>
      <span ref={groupRef} className={styles.count} title={countLabel} aria-hidden="true">
        <span ref={numberRef}>{displayedCount ?? (isLoading ? '…' : 'N/A')}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
          <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z" />
        </svg>
      </span>
      </>}
    </Link>
  );

  return mobile ? <li className={styles.mobileItem}>{pill}</li> : pill;
}
