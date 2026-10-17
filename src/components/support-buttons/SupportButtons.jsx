import React from 'react';
import CoffeeBadge from '@site/src/components/coffee-badge/CoffeeBadge';
import GitHubSponsors from '@site/src/components/github-sponsors/GitHubSponsors';

/** The Sponsor and Buy me a coffee buttons, side by side, with shorter labels where space is tight */
export default function SupportButtons({short = false}) {
  return (
    <div className="support-buttons">
      <div className="support-sponsor"><GitHubSponsors text={short ? 'Sponsor' : undefined} /></div>
      <div className="support-coffee"><CoffeeBadge text={short ? 'Coffee' : undefined} /></div>
    </div>
  );
}
