import React, {useEffect, useRef, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import ThemedImage from '@theme/ThemedImage';
import styles from './styles.module.css';

const FADE_MS = 500;

const formatTime = (seconds) => {
  const whole = Math.max(0, Math.floor(seconds || 0));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
};

/** Show a themed thumbnail until the reader asks for the video, then play it with our own controls

The video is only requested on that first click, so the page never downloads it for readers who
don't watch
*/
export function TourVideo({src, title, duration, label}) {
  const frame = useRef(null);
  const video = useRef(null);
  const [started, setStarted] = useState(false);
  // The thumbnail stays up until the video is actually playing, fades, then leaves the page
  const [poster, setPoster] = useState('shown');
  const [playing, setPlaying] = useState(false);
  // Set while playback waits for data, such as after a seek or on a slow connection
  const [buffering, setBuffering] = useState(false);
  const [current, setCurrent] = useState(0);
  const [length, setLength] = useState(duration);
  const posters = {
    light: useBaseUrl('/img/tour-poster-light.jpg'),
    dark: useBaseUrl('/img/tour-poster-dark.jpg'),
  };

  useEffect(() => {
    if (started) video.current?.play().catch(() => setPlaying(false));
  }, [started]);

  // Transitions don't fire when reduced motion turns them off, so the fade also ends on a timer
  useEffect(() => {
    if (poster !== 'fading') return undefined;
    const timer = setTimeout(() => setPoster('gone'), FADE_MS + 100);
    return () => clearTimeout(timer);
  }, [poster]);

  const toggle = () => {
    const element = video.current;
    if (!element) return;
    if (element.paused || element.ended) element.play().catch(() => setPlaying(false));
    else element.pause();
  };

  const seek = (event) => {
    const element = video.current;
    if (!element) return;
    element.currentTime = Number(event.target.value);
    setCurrent(element.currentTime);
  };

  const fullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (frame.current?.requestFullscreen) frame.current.requestFullscreen();
    // Safari on iPhone can't put an element in full screen, only the video itself, which then
    // plays in the system player and leaves full screen from its own controls
    else video.current?.webkitEnterFullscreen?.();
  };

  const progress = length ? (current / length) * 100 : 0;

  return (
    <div ref={frame} className={styles.frame} data-playing={playing}>
      {started && (
        <>
          <video
            ref={video}
            className={styles.video}
            src={src}
            playsInline
            muted
            preload="auto"
            aria-label={label}
            onClick={toggle}
            onPlay={() => setPlaying(true)}
            onPlaying={() => {
              setBuffering(false);
              setPoster((state) => (state === 'shown' ? 'fading' : state));
            }}
            onWaiting={() => setBuffering(true)}
            onSeeked={() => setBuffering(false)}
            onPause={() => setPlaying(false)}
            onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
            onLoadedMetadata={(event) => setLength(event.currentTarget.duration)}
          />
          <div className={styles.buffering} data-visible={buffering && poster === 'gone'} aria-hidden="true">
            <span className={styles.disc}>
              <Spinner />
            </span>
          </div>
          <div className={styles.controls}>
            <button type="button" className={styles.control} onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
              {playing ? <PauseIcon /> : <PlayIcon />}
            </button>
            <input
              type="range"
              className={styles.seek}
              min={0}
              max={length || 0}
              step={0.1}
              value={current}
              onChange={seek}
              aria-label="Seek"
              aria-valuetext={`${formatTime(current)} of ${formatTime(length)}`}
              style={{'--progress': `${progress}%`}}
            />
            <span className={styles.time}>
              {formatTime(current)} / {formatTime(length)}
            </span>
            <button type="button" className={styles.control} onClick={fullscreen} aria-label="Full screen">
              <FullscreenIcon />
            </button>
          </div>
        </>
      )}
      {poster !== 'gone' && (
        <button
          type="button"
          className={styles.poster}
          data-state={started ? poster : 'idle'}
          onClick={() => setStarted(true)}
          onTransitionEnd={(event) => {
            if (event.target === event.currentTarget && poster === 'fading') setPoster('gone');
          }}
          disabled={started}
          aria-label={`Play video: ${label}`}
          style={{'--fade': `${FADE_MS}ms`}}
        >
          <ThemedImage sources={posters} alt="" width={1600} height={961} className={styles.posterImage} />
          <span className={styles.shade} aria-hidden="true" />
          <span className={styles.posterContent} aria-hidden="true">
            <span className={styles.bigPlay}>
              <PlayIcon />
              <Spinner />
            </span>
            <span className={styles.posterTitle}>{title}</span>
            <span className={styles.posterLength}>{formatTime(duration)} · no sound</span>
          </span>
        </button>
      )}
    </div>
  );
}

const Spinner = () => (
  <svg className={styles.spinner} viewBox="0 0 48 48" aria-hidden="true">
    <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="2.5" />
    <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="36 96" />
  </svg>
);

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L8.5 4.64A1 1 0 0 0 7 5.5Z" fill="currentColor" />
  </svg>
);

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="6.5" y="5" width="4" height="14" rx="1.2" fill="currentColor" />
    <rect x="13.5" y="5" width="4" height="14" rx="1.2" fill="currentColor" />
  </svg>
);

const FullscreenIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
