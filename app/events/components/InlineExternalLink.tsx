'use client';
import { ExternalLinkIcon } from './EventIcons';
import styles from './InlineExternalLink.module.css';

interface InlineExternalLinkProps {
  href?: string;
  children: string;
  className?: string;
}

export default function InlineExternalLink({
  href,
  children,
  className,
}: InlineExternalLinkProps) {
  if (!href) {
    return <span className={className}>{children}</span>;
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${styles.link} ${className || ''}`}
    >
      <span>{children}</span>
      <ExternalLinkIcon className={styles.icon} />
    </a>
  );
}