import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerContent}>
          <div className={styles.footerSupportText}>
            Free for everyone, no ads.{' '}
            <a
              href="https://buymeacoffee.com/someplacesocial"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.buyDrinkLink}
            >
              Buy me a drink
            </a>
          </div>
          <div className={styles.footerQuoteSection}>
            <blockquote className={styles.footerQuoteText}>
              “What should young people do with their lives today? Many things,
              obviously. But the most daring thing is to create stable
              communities in which the terrible disease of loneliness can be
              cured.”
            </blockquote>
            <div className={styles.footerAuthor}>- Kurt Vonnegut</div>
          </div>
          <div className={styles.footerCopyright}>
            © 2026 Someplace Social.
          </div>
        </div>
      </div>
    </footer>
  );
}