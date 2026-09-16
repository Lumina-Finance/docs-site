import React, {useEffect, useRef} from 'react';
import TOCItems from '@theme/TOCItems';
import {useLocation} from '@docusaurus/router';
import styles from './styles.module.css';

export default function TOC(props) {
  const {pathname} = useLocation();
  return <ViewportTOC key={pathname} {...props} />;
}

function ViewportTOC({className, ...props}) {
  const container = useRef(null);
  const rail = useRef(null);
  const indicator = useRef(null);

  useEffect(() => {
    const root = container.current;
    const content = document.querySelector('.theme-doc-markdown');
    if (!root || !content) return undefined;

    const headings = Array.from(content.querySelectorAll('h2[id], h3[id], h4[id], h5[id], h6[id]'));
    const links = Array.from(root.querySelectorAll('a[href^="#"]'));
    const sections = links.map(link => {
      const id = decodeURIComponent(link.getAttribute('href').slice(1));
      const index = headings.findIndex(heading => heading.id === id);
      if (index < 0) return null;
      const heading = headings[index];
      const end = headings.slice(index + 1).find(next => next.tagName <= heading.tagName);
      return {link, heading, end};
    }).filter(Boolean);
    let frame = 0;
    let revealFrame = 0;
    let ready = false;
    let disposed = false;

    const update = () => {
      frame = 0;
      const currentRail = rail.current;
      const marker = indicator.current;
      if (disposed || !root.isConnected || !currentRail || !marker) return;
      const top = Math.max(0, document.querySelector('.navbar')?.getBoundingClientRect().bottom ?? 0);
      const bottom = window.innerHeight;
      const active = [];
      for (const section of sections) {
        const start = section.heading.getBoundingClientRect().top;
        const end = (section.end ?? content).getBoundingClientRect();
        const endY = section.end ? end.top : end.bottom;
        const visible = start < bottom && endY > top;
        section.link.toggleAttribute('data-in-view', visible);
        if (visible) active.push(section.link);
      }
      const railBounds = currentRail.getBoundingClientRect();
      const origin = railBounds.top;
      const firstLink = sections[0]?.link.getBoundingClientRect();
      const lastLink = sections[sections.length - 1]?.link.getBoundingClientRect();

      // Match the rail to the same link bounds used by the highlight
      currentRail.style.setProperty('--toc-rail-top', `${firstLink ? firstLink.top - origin : railBounds.height}px`);
      currentRail.style.setProperty('--toc-rail-bottom', `${lastLink ? railBounds.bottom - lastLink.bottom : 0}px`);
      if (!active.length) {
        marker.style.opacity = '0';
        return;
      }
      const first = active[0].getBoundingClientRect().top - origin;
      const last = active[active.length - 1].getBoundingClientRect().bottom - origin;
      marker.style.top = `${first}px`;
      marker.style.bottom = `${railBounds.height - last}px`;
      marker.style.opacity = '1';
      if (!ready) {
        ready = true;
        // Commit the initial bounds without animating from an empty or old TOC.
        revealFrame = requestAnimationFrame(() => {
          if (!disposed) root.setAttribute('data-ready', '');
        });
      }
    };
    const schedule = () => {
      if (!disposed && !frame) frame = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(content);
    observer.observe(root);
    window.addEventListener('scroll', schedule, {passive: true});
    window.addEventListener('resize', schedule);
    document.fonts.ready.then(schedule);
    schedule();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(revealFrame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [props.toc]);

  return (
    <div ref={container} className={`${styles.container} thin-scrollbar ${className ?? ''}`}>
      <div ref={rail} className={styles.rail}>
        <span ref={indicator} className={styles.indicator} aria-hidden="true" />
        <TOCItems {...props} linkClassName="table-of-contents__link" />
      </div>
    </div>
  );
}
