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
          padding: '40px 32px 32px',
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
          <div style={{ flex: '1 1 500px', maxWidth: '580px' }}>
            <blockquote
              style={{
                margin: 0,
                fontFamily: 'var(--font-karla), system-ui, sans-serif',
                fontWeight: 500,
                fontSize: '13px',
                lineHeight: 1.5,
                color: '#1f1b16',
              }}
            >
              “What should young people do with their lives today? Many things,
              obviously. But the most daring thing is to create stable
              communities in which the terrible disease of loneliness can be
              cured.”
            </blockquote>
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#6f675c' }}>
              - Kurt Vonnegut
            </div>
            <div style={{ marginTop: '18px', fontSize: '11px', color: '#8c8275' }}>
              © 2026 Someplace Social. All rights reserved.
            </div>
          </div>

          <div style={{ flex: '0 0 auto', paddingTop: '2px' }}>
            <p
              style={{
                margin: 0,
                fontSize: '13.5px',
                lineHeight: 1.4,
                color: '#4f483e',
              }}
            >
              Free for everyone, no ads.{' '}
              <a
                href="https://buymeacoffee.com/someplacesocial"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#1f1b16',
                  fontWeight: 700,
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                }}
              >
                Buy me a drink
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}