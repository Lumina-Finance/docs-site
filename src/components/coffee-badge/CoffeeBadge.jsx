import React from 'react';
import Link from '@docusaurus/Link';
import CoffeeCup from '@site/static/img/buy-me-a-coffee.svg';

/** Render the shared, theme-aware support badge */
export default function CoffeeBadge({
  href = 'https://www.buymeacoffee.com/lumina.finance',
  label = 'Buy me a coffee',
}) {
  return (
    <Link className="footer__link-item footer__coffee" href={href}
      target="_blank" rel="noopener noreferrer" aria-label={`${label} (opens in a new tab)`}>
      <CoffeeCup aria-hidden="true" focusable="false" />
      <span>{label}</span>
    </Link>
  );
}
