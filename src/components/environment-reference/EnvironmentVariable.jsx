import React from 'react';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import styles from './styles.module.css';

/** Present a variable's requirements, description, defaults, and example in a reference card */
export default function EnvironmentVariable({name, type, defaultValue, values, usedWith, required, dependsOn, conditionLabel, example, children}) {
  const id = name.toLowerCase();
  const brokenLinks = useBrokenLinks();
  brokenLinks.collectAnchor(id);
  const conditional = Boolean(required) && required !== 'Always';
  const requirement = conditional ? 'Conditional' : required ? 'Required' : 'Optional';

  // Break long identifiers between words without changing their copied text
  const variableName = name.split('_').map((part, index, parts) => (
    <React.Fragment key={index}>{part}{index < parts.length - 1 && <>_<wbr /></>}</React.Fragment>
  ));

  return (
    <div className={styles.entry}>
      <dt id={id} className={styles.name}>
        <code>{variableName}</code>
        <span className={`${styles.badge} ${conditional ? styles.conditional : required ? styles.required : ''}`}>
          {requirement}
          {conditional && (dependsOn || conditionLabel) && <>
            <span aria-hidden="true"> → </span>
            {dependsOn ? <a href={`#${dependsOn.toLowerCase()}`}><code>{dependsOn}</code></a> : <span>{conditionLabel}</span>}
          </>}
        </span>
      </dt>
      <dd className={styles.details}>
        <div className={styles.content}>
          <div className={styles.description}>{children}</div>
          {example !== undefined && (
            <div className={styles.example}>
              <span>Example</span>
              <code>{variableName}={example}</code>
            </div>
          )}
        </div>
        <dl className={styles.metadata}>
          <div><dt>Value type</dt><dd>{type}</dd></div>
          <div><dt>Default</dt><dd>{defaultValue}</dd></div>
          <div><dt>Requirement</dt><dd>{conditional ? required : required ? 'Required' : 'Optional'}</dd></div>
          {values && <div><dt>Accepted values</dt><dd>{values}</dd></div>}
          {usedWith && <div><dt>Used with</dt><dd>{usedWith}</dd></div>}
        </dl>
      </dd>
    </div>
  );
}
