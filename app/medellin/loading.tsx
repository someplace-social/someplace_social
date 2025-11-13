import styles from '../Page.module.css';

export default function Loading() {
  return (
    <main className={styles.page}>
      <h1>Medellin Weekly Events & Activity Guide</h1>
      <p>Loading listings...</p>
    </main>
  );
}