export default function HomePage() {
  return (
    <div style={{ fontFamily: 'system-ui', padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#0f172a', marginBottom: '20px' }}>
        GameJamCrew
      </h1>
      <p style={{ fontSize: '18px', color: '#475569', marginBottom: '30px' }}>
        Find your perfect game jam squad. Connect with developers, artists, and composers who share your vision.
      </p>
      <button style={{
        backgroundColor: '#14b8a6',
        color: 'white',
        padding: '12px 24px',
        fontSize: '16px',
        fontWeight: 'bold',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer'
      }}>
        Find your Squad
      </button>
    </div>
  )
}
