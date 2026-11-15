'use client';
import {
  CheckIcon,
  ExternalLinkIcon,
  PenIcon,
  RepeatIcon,
} from './EventIcons';
import styles from './EventFacts.module.css';

interface EventFactsProps {
  recurrenceText: string;
  preRegistrationText: string;
  registrationUrl: string;
  needsSignupIcon: boolean;
  className?: string;
}

export default function EventFacts({
  recurrenceText,
  preRegistrationText,
  registrationUrl,
  needsSignupIcon,
  className,
}: EventFactsProps) {
  if (!recurrenceText && !preRegistrationText) {
    return null;
  }
  const signupIcon = needsSignupIcon ? (
    <PenIcon className={styles.factIcon} />
  ) : (
    <CheckIcon className={styles.factIcon} />
  );
  return (
    <div className={`${styles.facts} ${className || ''}`}>
      {recurrenceText && (
        <span className={styles.fact}>
          <RepeatIcon className={styles.factIcon} />
          <span>{recurrenceText}</span>
        </span>
      )}
      {preRegistrationText &&
        (registrationUrl ? (
          <a
            href={registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.fact} ${styles.factLink}`}
          >
            {signupIcon}
            <span className={styles.factLinkText}>{preRegistrationText}</span>
            <ExternalLinkIcon className={styles.factExternalIcon} />
          </a>
        ) : (
          <span className={styles.fact}>
            {signupIcon}
            <span>{preRegistrationText}</span>
          </span>
        ))}
    </div>
  );
}