import React from 'react';
import DocSidebarItems from '@theme-original/DocSidebarItems';
import GitHubStars from '@site/src/components/github-stars/GitHubStars';
import SupportButtons from '@site/src/components/support-buttons/SupportButtons';

export default function SidebarItems(props) {
  return (
    <>
      <DocSidebarItems {...props} />
      {props.level === 1 && (
        <li className="docs-sidebar-stars">
          <GitHubStars sidebar />
          <SupportButtons short />
        </li>
      )}
    </>
  );
}
