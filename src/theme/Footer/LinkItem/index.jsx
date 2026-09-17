import React from 'react';
import Link from '@docusaurus/Link';
import CreditIcon from '@site/src/components/special-thanks/CreditIcon';
import FooterLinkItem from '@theme-original/Footer/LinkItem';
import CoffeeBadge from '@site/src/components/coffee-badge/CoffeeBadge';
import GitHubStars from '@site/src/components/github-stars/GitHubStars';
import DockerPulls from '@site/src/components/docker-pulls/DockerPulls';

export default function FooterLink({item, ...props}) {
  if (item.className === 'footer__reddit') {
    return (
      <Link className="footer__link-item footer__reddit" href={item.href}
        target="_blank" rel="noopener noreferrer" title={item.label}
        aria-label={`${item.label} (opens in a new tab)`}>
        <CreditIcon kind="reddit" />
        <span>{item.label}</span>
      </Link>
    );
  }
  if (item.className === 'footer__github') return <GitHubStars compact />;
  if (item.className === 'footer__docker') return <DockerPulls />;
  if (item.className !== 'footer__coffee') {
    return <FooterLinkItem item={item} {...props} />;
  }

  return <CoffeeBadge href={item.href} label={item.label} />;
}
