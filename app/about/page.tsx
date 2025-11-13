import Image from 'next/image';

// Reusing styles for consistency
const pageStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '2rem',
  maxWidth: '1000px',
  margin: '0 auto',
};

const heroSectionStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '2rem',
  width: '100%',
  marginBottom: '4rem',
};

const heroTextStyles: React.CSSProperties = {
  flex: 1,
  maxWidth: '500px',
};

const illustrationContainerStyles: React.CSSProperties = {
  flex: 1,
  maxWidth: '400px',
};

const contentBoxStyles: React.CSSProperties = {
  backgroundColor: '#fdf8e1',
  border: '1px solid #eee',
  borderRadius: '8px',
  padding: '2rem',
  width: '100%',
};

const buttonStyles: React.CSSProperties = {
  backgroundColor: '#272626',
  color: 'white',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  textDecoration: 'none',
  display: 'inline-block',
  marginTop: '1rem',
};

export default function AboutPage() {
  return (
    <main style={pageStyles}>
      <section style={heroSectionStyles}>
        <div style={heroTextStyles}>
          <h1 style={{ fontSize: '3em', marginBottom: '1rem' }}>About</h1>
          <p style={{ fontSize: '1.2em', lineHeight: 1.6 }}>
            Why Someplace Social? Someplace Social (formerly TheFlyer.info) was born out of frustration that a quick easy list of weekly activities in Medellin didn't exist. I ended up spending too much time making my own lists and decided to make a website out of it so I could help other people.
          </p>
        </div>
        <div style={illustrationContainerStyles}>
          <Image src="/images/hero-about.png" alt="Illustration of a person relaxing in a hammock" width={400} height={300} style={{ width: '100%', height: 'auto' }} />
        </div>
      </section>

      <section style={contentBoxStyles}>
        <h2 style={{ fontSize: '2em', marginBottom: '1rem' }}>About</h2>
        <h3>Problem</h3>
        <p>We are inherently social creatures, relying on each other for survival and support for hundreds of thousands of years. However, technological advancements have disrupted these direct connections, leading to increased isolation. This isolation fosters loneliness, which negatively impacts both our mental and physical health. Despite being more globally connected than ever, social media algorithms and the lack of face-to-face interactions have created echo chambers which amplify personal and political biases, further polarizing and dividing us.</p>
        <h3 style={{marginTop: '2rem'}}>Solution</h3>
        <p>Luckily, the solution to isolation is actually super fun: More clubs, classes, art, and parties. We can leverage technology by using it to find existing communities, encourage new spaces, and go someplace social.</p>
        <hr style={{margin: '2rem 0'}} />
        <p style={{textAlign: 'center', fontStyle: 'italic'}}>"What should young people do with their lives today? Many things, obviously. But the most daring thing is to create stable communities in which the terrible disease of loneliness can be cured." – Kurt Vonnegut</p>
        <div style={{textAlign: 'center'}}>
          <a href="https://buymeacoffee.com/someplacesocial" target="_blank" rel="noopener noreferrer" style={buttonStyles}>
            Donate
          </a>
        </div>
      </section>
    </main>
  );
}