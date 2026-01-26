import Link from 'next/link';
import { TenantApi } from '../../lib/api';

async function getTenants() {
  try { return await TenantApi.list(); } catch { return []; }
}

export default async function TenantsPage() {
  const tenants = await getTenants();
  return (
    <div>
      <div className="card" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h2>Tenants</h2>
        <Link className="button" href="/tenants/create">Add Tenant</Link>
      </div>
      <div className="list">
        {tenants.map(t => (
          <div key={t.id} className="card">
            <div>Tenant #{t.id}</div>
            <div>User ID: {t.user_id} | Bed ID: {t.bed_id}</div>
            <div>Move-in: {new Date(t.move_in_date).toLocaleDateString()}</div>
          </div>
        ))}
        {tenants.length === 0 && <div className="card">No tenants yet.</div>}
      </div>
    </div>
  );
}