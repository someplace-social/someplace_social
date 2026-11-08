import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerQuoteRow}>
          <div className={styles.footerLeftSection}>
            <blockquote className={styles.footerQuoteText}>
              “What should young people do with their lives today? Many things,
              obviously. But the most daring thing is to create stable
              communities in which the terrible disease of loneliness can be
              cured.”
            </blockquote>
            <div className={styles.footerAuthor}>- Kurt Vonnegut</div>
            <div className={styles.footerCopyright}>
              © 2026 Someplace Social. All rights reserved.
            </div>
          </div>
          <div className={styles.footerRightSection}>
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
          </div>
        </div>
      </div>
    </footer>
  );
}