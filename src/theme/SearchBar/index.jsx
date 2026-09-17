import React from 'react';
import SearchBar from '@theme-original/SearchBar';

/** Open touch search without asking the browser to scroll the page to the input */
function focusWithoutScrolling(event) {
  const input = event.target;
  if (
    event.pointerType !== 'touch' ||
    !input.matches?.('.navbar__search-input') ||
    input.ownerDocument.activeElement === input
  ) return;

  event.preventDefault();
  input.focus({preventScroll: true});
}

/** Preserve the search plugin while controlling its initial touch focus */
export default function SearchBarWithStableFocus(props) {
  return (
    <div style={{display: 'contents'}} onPointerDownCapture={focusWithoutScrolling}>
      <SearchBar {...props} />
    </div>
  );
}
