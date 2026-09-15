import React from 'react';
import {normalizeRedditUsername} from './credits.mjs';
import CreditPill from './CreditPill';

/** Render a Reddit profile and optional note without fetching an avatar */
export default function RedditUser({username, note}) {
  const handle = normalizeRedditUsername(username);
  return <CreditPill kind="reddit" name={`u/${handle}`} url={`https://www.reddit.com/user/${handle}/`} note={note} />;
}
