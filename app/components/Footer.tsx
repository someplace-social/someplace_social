import pageStyles from '../Page.module.css';

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid #eadfc8',
        backgroundColor: '#FFF9EC',
        marginTop: 'auto',
      }}
    >
      <div
        className={pageStyles.page}
        style={{
          maxWidth: '1120px',
          margin: '0 auto',
          padding: '48px 32px 32px',
          alignItems: 'stretch',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '24px 48px',
          }}
        >
          <figure style={{ margin: 0, flex: '1 1 480px', maxWidth: '700px' }}>
            <blockquote
              style={{
                margin: 0,
                fontFamily: 'var(--font-bricolage), system-ui, sans-serif',
                fontWeight: 500,
                fontSize: '22px',
                lineHeight: 1.4,
                letterSpacing: '-0.01em',
                color: '#1f1b16',
              }}
            >
              “What should young people do with their lives today? Many things,
              obviously. But the most daring thing is to create stable
              communities in which the terrible disease of loneliness can be
              cured.”
            </blockquote>
            <figcaption style={{ marginTop: '14px', fontSize: '15px', color: '#6f675c' }}>
              – Kurt Vonnegut
            </figcaption>
          </figure>
          <a
            href="https://buymeacoffee.com/someplacesocial"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '48px',
              padding: '0 24px',
              backgroundColor: '#1f1b16',
              color: '#FFF9EC',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: 700,
              textDecoration: 'none',
              alignSelf: 'flex-start',
            }}
          >
            Buy me a drink
          </a>
        </div>
        <div style={{ marginTop: '40px', fontSize: '13px', color: '#6f675c' }}>
          © 2026 Someplace Social. All rights reserved.
        </div>
      </div>
    </footer>
  );
}