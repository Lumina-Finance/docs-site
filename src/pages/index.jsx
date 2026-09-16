import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import ThemedImage from '@theme/ThemedImage';
import LastUpdated from '@theme/LastUpdated';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

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
          <p>
            Lumina Finance is modern, self-hostable personal finance software designed to make
            managing your money and understanding your spending behaviour easy and intuitive.
          </p>
          <p>
            This is the documentation site for LF. Here, you can find tutorials and explanations
            on self-hosting Lumina Finance, from getting an instance running to configuring
            email, encryption keys, and single sign-on.
          </p>
          <p>
            Thank you for choosing Lumina Finance for your personal finances!
          </p>
        </header>

        <figure className="docs-home-hero">
          <ThemedImage
            sources={heroSources}
            alt="Lumina Finance shown on desktop, tablet, and mobile"
            width={3200}
            height={1800}
          />
          <figcaption className="docs-home-hero-note">
            <em>*Psst. Change the doc site to dark mode to see the hero image in dark mode!</em>
          </figcaption>
        </figure>


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
