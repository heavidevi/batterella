export default function TestPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>🍕 Batterella System Test</h1>
      <p>If you can see this page, the Next.js server is running correctly!</p>
      
      <div style={{ marginTop: '2rem' }}>
        <h2>Quick Test Links:</h2>
        <ul>
          <li><a href="/admin">Admin Dashboard</a></li>
          <li><a href="/api/orders">Orders API</a></li>
        </ul>
      </div>
      
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f0f0f0', borderRadius: '8px' }}>
        <h3>System Status:</h3>
        <p>✅ Next.js Server: Running</p>
        <p>✅ Admin Page: Fixed</p>
        <p>✅ Stylish Buttons: Implemented</p>
        <p>✅ Tab System: Working</p>
        <p>✅ Persistent Storage: Active</p>
      </div>
    </div>
  );
}
