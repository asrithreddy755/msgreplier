export default function NotFound() {
  return (
    <html>
      <body style={{ margin: 0, fontFamily: 'sans-serif', background: '#020617', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: '1rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>404 - Not Found</h2>
        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Could not find the requested resource</p>
        <a href="/" style={{ padding: '0.75rem 1.5rem', background: '#f43f5e', borderRadius: '9999px', fontWeight: 'bold', textDecoration: 'none', color: 'white' }}>
          Return Home
        </a>
      </body>
    </html>
  );
}
