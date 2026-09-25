import React from 'react';
import {useCodeBlockContext} from '@docusaurus/theme-common/internal';
import OriginalWordWrapButton from '@theme-original/CodeBlock/Buttons/WordWrapButton';
import Button from '@theme/CodeBlock/Buttons/Button';
import IconWordWrap from '@theme/Icon/WordWrap';
import styles from './styles.module.css';

/** Keep an opted-in file panel's wrap action available regardless of line width */
export default function WordWrapButton(props) {
  const {metadata, wordWrap} = useCodeBlockContext();
  const isFilePanel = metadata.className.split(/\s+/).includes('docs-persistent-wrap');

  if (!isFilePanel) {
    return <OriginalWordWrapButton {...props} />;
  }

  return (
    <Button
      {...props}
      onClick={wordWrap.toggle}
      aria-label="Toggle word wrap"
      aria-pressed={wordWrap.isEnabled}
      title="Toggle word wrap">
      <IconWordWrap className={styles.icon} aria-hidden="true" />
    </Button>
  );
}
