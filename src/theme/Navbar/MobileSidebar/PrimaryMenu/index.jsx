import React from 'react';
import PrimaryMenu from '@theme-original/Navbar/MobileSidebar/PrimaryMenu';
import CoffeeBadge from '@site/src/components/coffee-badge/CoffeeBadge';
import GitHubStars from '@site/src/components/github-stars/GitHubStars';

export default function MobilePrimaryMenu(props) {
  return (
    <div className="docs-mobile-primary-menu">
      <PrimaryMenu {...props} />
      <div className="docs-sidebar-stars">
        <GitHubStars sidebar />
        <div className="docs-sidebar-coffee"><CoffeeBadge /></div>
      </div>
    </div>
  );
}
