import React from 'react';
import DocSidebarItems from '@theme-original/DocSidebarItems';
import CoffeeBadge from '@site/src/components/coffee-badge/CoffeeBadge';
import GitHubStars from '@site/src/components/github-stars/GitHubStars';

export default function SidebarItems(props) {
  return (
    <>
      <DocSidebarItems {...props} />
      {props.level === 1 && (
        <li className="docs-sidebar-stars">
          <GitHubStars sidebar />
          <div className="docs-sidebar-coffee"><CoffeeBadge /></div>
        </li>
      )}
    </>
  );
}
