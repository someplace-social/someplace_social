import Link from 'next/link';
import styles from './Banner.module.css';

export default function Banner() {
  return (
    <div className={styles.banner}>
      Some of these listings may be out of date. If you have interest in gathering up to date information for the community,{' '}
      <Link href="/contact" className={styles.link}>
        please reach out
      </Link>
      .
    </div>
  );
}