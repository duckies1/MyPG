export function PageLoadingFallback() {
  return (
    <div className="card" style={{textAlign: 'center', padding: 60}}>
      <div style={{fontSize: 48, marginBottom: 16}}>⏳</div>
      <p style={{fontSize: 16, color: '#718096'}}>Loading...</p>
    </div>
  );
}

export function TableLoadingFallback() {
  return (
    <div className="card" style={{padding: 0, overflow: 'hidden'}}>
      <div style={{overflowX: 'auto'}}>
        <table>
          <thead>
            <tr>
              <th>Loading...</th>
              <th>...</th>
              <th>...</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map(i => (
              <tr key={i}>
                <td style={{color: '#cbd5e1'}}>—</td>
                <td style={{color: '#cbd5e1'}}>—</td>
                <td style={{color: '#cbd5e1'}}>—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
