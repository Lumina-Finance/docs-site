import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import LastUpdated from '@theme/LastUpdated';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {HeroImage} from '@site/src/components/hero-image/HeroImage';
import {TourVideo} from '@site/src/components/tour-video/TourVideo';

// The same demo the main repository's README shows, served from GitHub rather than bundled here
const DEMO_VIDEO_URL = 'https://github.com/user-attachments/assets/0674ffa8-a16e-4460-a82a-fc039aba6d30';

/** Give readers a direct starting point for using or operating the app */
export default function Home() {
  const {siteConfig: {customFields}} = useDocusaurusContext();
  const heroSources = {
    light: useBaseUrl('/img/hero_light.png'),
    dark: useBaseUrl('/img/hero_dark.png'),
  };

  return (
    <Layout
      title="Documentation"
      description="Guides for self-hosting Lumina Finance."
    >
      <main className="docs-home">
        <header className="docs-home-intro">
          <p className="docs-eyebrow">Documentation</p>
          <h1><span aria-hidden="true">👋🏻 </span>Welcome to Lumina Finance</h1>
        </header>

        <p>
          Lumina Finance is modern and easy to use personal finance software designed to make managing your money and understanding your spending behaviour easy and intuitive.
        </p>

        <figure className="docs-home-hero">
          <HeroImage
            sources={heroSources}
            alt="Lumina Finance shown on desktop, tablet, and mobile"
            width={3200}
            height={1800}
          />
          <figcaption className="docs-home-hero-note">
            <em>*Psst. Change the doc site to dark mode to see the hero image in dark mode!</em>
          </figcaption>
        </figure>

        <p>
          This is the documentation site for Lumina Finance. Here, you will find some helpful articles and write-ups on using the application and self-hosting it at home. We hope you will enjoy using Lumina Finance!
        </p>

        <section className="docs-home-tour">
          <TourVideo src={DEMO_VIDEO_URL} title="Take a quick tour" duration={97} label="A tour of Lumina Finance's main pages" />
        </section>

        <div className="docs-paths">
          <Link className="docs-path" to="/self-hosting/getting-started/">
            <h2>Self-hosting</h2>
            <p>Instructions and tutorials on how to self host Lumina Finance at home</p>
            <span className="docs-path-action">
              Read more <span aria-hidden="true">→</span>
            </span>
          </Link>
          <section className="docs-path">
            <h2>User guide</h2>
            <p>User guide is coming!</p>
          </section>
        </div>
        <footer className="margin-top--lg">
          <LastUpdated lastUpdatedAt={customFields.homeLastUpdatedAt} />
        </footer>
      </main>
    </Layout>
  );
}
