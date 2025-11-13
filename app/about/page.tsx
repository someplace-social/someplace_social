import Image from 'next/image';
import styles from '../Page.module.css';

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <section className={styles.heroSection}>
        <div className={styles.heroText}>
          <h1 style={{ fontSize: '3em', marginBottom: '1rem' }}>About</h1>
          <p style={{ fontSize: '1.2em', lineHeight: 1.6 }}>
            Why Someplace Social? Someplace Social (formerly TheFlyer.info) was born out of frustration that a quick easy list of weekly activities in Medellin didn't exist. I ended up spending too much time making my own lists and decided to make a website out of it so I could help other people.
          </p>
        </div>
        <div className={styles.illustrationContainer}>
          <Image src="/images/hero-about.png" alt="Illustration of a person relaxing in a hammock" width={400} height={300} style={{ width: '100%', height: 'auto' }} />
        </div>
      </section>

      <section className={styles.contentBox}>
        <h2 style={{ fontSize: '2em', marginBottom: '1rem' }}>About</h2>
        <h3>Problem</h3>
        <p>We are inherently social creatures, relying on each other for survival and support for hundreds of thousands of years. However, technological advancements have disrupted these direct connections, leading to increased isolation. This isolation fosters loneliness, which negatively impacts both our mental and physical health. Despite being more globally connected than ever, social media algorithms and the lack of face-to-face interactions have created echo chambers which amplify personal and political biases, further polarizing and dividing us.</p>
        <h3 style={{marginTop: '2rem'}}>Solution</h3>
        <p>Luckily, the solution to isolation is actually super fun: More clubs, classes, art, and parties. We can leverage technology by using it to find existing communities, encourage new spaces, and go someplace social.</p>
        <hr style={{margin: '2rem 0'}} />
        <p style={{textAlign: 'center', fontStyle: 'italic'}}>"What should young people do with their lives today? Many things, obviously. But the most daring thing is to create stable communities in which the terrible disease of loneliness can be cured." – Kurt Vonnegut</p>
        <div style={{textAlign: 'center'}}>
          <a href="https://buymeacoffee.com/someplacesocial" target="_blank" rel="noopener noreferrer" className={styles.button}>
            Donate
          </a>
        </div>
      </section>
    </main>
  );
}