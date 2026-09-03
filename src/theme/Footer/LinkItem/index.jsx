import React from 'react';
import FooterLinkItem from '@theme-original/Footer/LinkItem';
import CoffeeBadge from '@site/src/components/coffee-badge/CoffeeBadge';
import GitHubStars from '@site/src/components/github-stars/GitHubStars';

export default function FooterLink({item, ...props}) {
  if (item.className === 'footer__github') return <GitHubStars compact />;
  if (item.className !== 'footer__coffee') {
    return <FooterLinkItem item={item} {...props} />;
  }

  return <CoffeeBadge href={item.href} label={item.label} />;
}
