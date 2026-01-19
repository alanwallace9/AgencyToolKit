import Script from 'next/script';

export default function TestWidgetPage() {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '40px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h1 style={{ marginTop: 0 }}>TrustSignal Test Page</h1>
        <p>Fill out the form to test auto-capture. Wait 10 seconds to see notifications.</p>

        <form>
          <input type="text" name="first_name" placeholder="First Name" required style={{ display: 'block', width: '100%', padding: '12px', margin: '12px 0', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
          <input type="email" name="email" placeholder="Email" required style={{ display: 'block', width: '100%', padding: '12px', margin: '12px 0', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
          <input type="text" name="company" placeholder="Company Name" style={{ display: 'block', width: '100%', padding: '12px', margin: '12px 0', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
          <button type="submit" style={{ padding: '12px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>Submit</button>
        </form>
      </div>

      <Script src="/ts.js?key=sp_7de5bc63734a10d0" strategy="afterInteractive" />
    </div>
  );
}
