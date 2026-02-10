'use client';

export default function WaitScreen() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '40px',
        maxWidth: '600px'
      }}>
        <div style={{
          fontSize: '64px',
          marginBottom: '24px'
        }}>
          ⏳
        </div>
        <h1 style={{
          fontSize: '28px',
          marginBottom: '16px',
          color: '#333'
        }}>
          Please Wait for Website Access
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#666',
          lineHeight: '1.6',
          marginBottom: '24px'
        }}>
          Your account is pending activation. You will gain access once:
        </p>
        <div style={{
          backgroundColor: '#fff',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'left'
        }}>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0
          }}>
            <li style={{
              padding: '12px 0',
              borderBottom: '1px solid #eee',
              display: 'flex',
              alignItems: 'start'
            }}>
              <span style={{ marginRight: '12px', fontSize: '20px' }}>🏠</span>
              <div>
                <strong>A PG admin assigns you a bed</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>
                  You'll be able to view tenant information from your PG
                </p>
              </div>
            </li>
            <li style={{
              padding: '12px 0',
              display: 'flex',
              alignItems: 'start'
            }}>
              <span style={{ marginRight: '12px', fontSize: '20px' }}>👑</span>
              <div>
                <strong>The super admin promotes you to admin</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>
                  You'll be able to manage your own PGs
                </p>
              </div>
            </li>
          </ul>
        </div>
        <p style={{
          marginTop: '24px',
          fontSize: '14px',
          color: '#999'
        }}>
          Please contact your administrator for more information
        </p>
      </div>
    </div>
  );
}
