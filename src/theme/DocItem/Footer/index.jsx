import React from 'react';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import OriginalFooter from '@theme-original/DocItem/Footer';
import SpecialThanks from '@site/src/components/special-thanks/SpecialThanks';

/** Keep the existing footer metadata after the page's contributor acknowledgements */
export default function DocItemFooter(props) {
  const {metadata, frontMatter} = useDoc();
  const {siteConfig: {customFields}} = useDocusaurusContext();
  const source = metadata.source.replace(/^@site\//, '');
  const contributors = customFields.pageContributors[source] || [];
  return (
    <>
      <SpecialThanks contributors={contributors} thanks={frontMatter.thanks} />
      <OriginalFooter {...props} />
    </>
  );
}
