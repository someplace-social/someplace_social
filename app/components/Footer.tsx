import Link from 'next/link';
import type { CityConfig } from '../lib/cities';
import styles from './Footer.module.css';

interface FooterProps {
  city?: CityConfig;
}

export default function Footer({ city }: FooterProps) {
  const contactHref = city ? `/${city.slug}/contact` : '/contact';

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerContent}>
          <div className={styles.footerSupportText}>
            Free for all, no ads.{' '}
            <a
              href="https://buymeacoffee.com/someplacesocial"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.buyDrinkLink}
            >
              Buy me a drink.
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
          <div className={styles.footerBottom}>
            <div className={styles.footerSocialLinks}>
              <a
                href="https://www.instagram.com/someplace.social/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerIconLink}
                aria-label="Instagram"
                title="Instagram"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <Link
                href={contactHref}
                className={styles.footerIconLink}
                aria-label="Contact us"
                title="Contact us"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </Link>
            </div>
            <div className={styles.footerCopyright}>
              © 2026 Someplace Social.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}