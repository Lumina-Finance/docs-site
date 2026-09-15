import React, {useEffect, useId, useLayoutEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import CreditIcon from './CreditIcon';
import styles from './styles.module.css';

const TOOLTIP_MARGIN = 12;
const TOOLTIP_GAP = 8;
const HOVER_GRACE_MS = 120;

/** Keep notes accessible by pointer, keyboard, and touch without expanding the credit list */
export default function CreditPill({kind = 'person', name, url, note}) {
  const id = useId();
  const trigger = useRef(null);
  const tooltip = useRef(null);
  const timer = useRef(null);
  const blockTouchClick = useRef(false);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);

  /** Allow the pointer to cross the gap between a pill and its note */
  function showNote() {
    clearTimeout(timer.current);
    if (note) setOpen(true);
  }

  /** Keep a keyboard-focused note visible when the pointer leaves */
  function leaveNote() {
    clearTimeout(timer.current);
    if (document.activeElement !== trigger.current) {
      timer.current = setTimeout(() => setOpen(false), HOVER_GRACE_MS);
    }
  }

  useLayoutEffect(() => {
    if (!open) return;
    const anchor = trigger.current.getBoundingClientRect();
    const box = tooltip.current.getBoundingClientRect();
    const above = anchor.top - box.height - TOOLTIP_GAP;
    setPosition({
      left: Math.max(TOOLTIP_MARGIN, Math.min(anchor.left, window.innerWidth - box.width - TOOLTIP_MARGIN)),
      top: above >= TOOLTIP_MARGIN ? above : anchor.bottom + TOOLTIP_GAP,
    });
  }, [open, note]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const escape = (event) => { if (event.key === 'Escape') close(); };
    document.addEventListener('keydown', escape);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('keydown', escape);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [open]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const Tag = url ? 'a' : note ? 'button' : 'span';
  return (
    <span className={styles.pillWrapper} onMouseEnter={showNote} onMouseLeave={leaveNote}>
      <Tag
        ref={trigger}
        className={styles.pill}
        href={url}
        type={Tag === 'button' ? 'button' : undefined}
        aria-describedby={open ? id : undefined}
        onFocus={showNote}
        onBlur={() => setOpen(false)}
        onPointerDown={(event) => {
          blockTouchClick.current = event.pointerType === 'touch' && note && !open;
          if (event.pointerType === 'touch' && note && !open) {
            showNote();
          }
        }}
        onClick={(event) => {
          if (blockTouchClick.current) {
            event.preventDefault();
            blockTouchClick.current = false;
          }
          if (!url) showNote();
        }}>
        <CreditIcon kind={kind} />
        <span className={styles.name}>{name}</span>
      </Tag>
      {open && createPortal(
        <span id={id} ref={tooltip} role="tooltip" className={styles.tooltip}
          style={position || {visibility: 'hidden'}} onMouseEnter={showNote} onMouseLeave={leaveNote}>
          {note}
        </span>, document.body,
      )}
    </span>
  );
}
