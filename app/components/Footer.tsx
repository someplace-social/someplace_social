const footerStyles: React.CSSProperties = {
  textAlign: 'center',
  padding: '2rem',
  marginTop: '4rem',
  borderTop: '1px solid #ddd',
};

const iconContainerStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  gap: '1rem',
  margin: '1rem 0',
};

const iconLinkStyles: React.CSSProperties = {
  color: 'inherit', // This will make the icons match the text color
};

const iconStyles: React.CSSProperties = {
  width: '24px',
  height: '24px',
};

// SVG for Instagram
const InstagramIcon = () => (
  <svg style={iconStyles} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

// SVG for Email
const EmailIcon = () => (
  <svg style={iconStyles} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);


export default function Footer() {
  return (
    <footer style={footerStyles}>
      <p>"What should young people do with their lives today? Many things, obviously. But the most daring thing is to create stable communities in which the terrible disease of loneliness can be cured." – Kurt Vonnegut</p>
      <div style={iconContainerStyles}>
        <a href="https://www.instagram.com/someplacesocial/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={iconLinkStyles}>
          <InstagramIcon />
        </a>
        <a href="mailto:someplacesocial@gmail.com" aria-label="Email" style={iconLinkStyles}>
          <EmailIcon />
        </a>
      </div>
      <p>©2024. All rights reserved.</p>
    </footer>
  );
}