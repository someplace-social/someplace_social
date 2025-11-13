const footerStyles: React.CSSProperties = {
  textAlign: 'center',
  padding: '2rem',
  marginTop: '4rem',
  borderTop: '1px solid #ddd',
};

export default function Footer() {
  return (
    <footer style={footerStyles}>
      <p>"What should young people do with their lives today? Many things, obviously. But the most daring thing is to create stable communities in which the terrible disease of loneliness can be cured." – Kurt Vonnegut</p>
      <div>
        {/* Placeholder for social icons */}
        <span>IG</span> | <span>EM</span>
      </div>
      <p>©2024. All rights reserved.</p>
    </footer>
  );
}