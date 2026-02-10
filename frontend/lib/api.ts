export type ApiError = { status: number; message: string };

const dispatchLoading = (delta: number) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('mypg-loading', { detail: { delta } }));
};

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  dispatchLoading(1);
  const res = await fetch(`/api${path}`, {  // ← Must use /api prefix
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    },
    credentials: 'include',
    cache: 'no-store' // included so that fetch always gets fresh data and doesn't resolve to rsc (react server component) cache. That may cause Next.js to resolve it to rsc and never actually send backend.
  }).finally(() => dispatchLoading(-1));
  
  if (!res.ok) {
    let msg = 'Request failed';
    try { msg = (await res.json()).detail || msg; } catch {}
    throw { status: res.status, message: msg } as ApiError;
  }
  
  try { return await res.json(); } catch { return undefined as T; }
}

export const AuthApi = {
  signup: (name: string, email: string, password: string, inviteCode?: string) =>
    apiFetch<{ access_token: string }>(`/auth/signup`, {
      method: 'POST',
      body: JSON.stringify({ name, email, password, invite_code: inviteCode })
    }),
  login: (email: string, password: string) =>
    apiFetch<{ access_token: string; token_type: string }>(`/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
  logout: () =>
    apiFetch<{ message: string }>(`/auth/logout`, {
      method: 'POST'
    }),
  getMe: () =>
    apiFetch<{ id: number; name: string; email: string; role: string }>(`/auth/me`),
  getStatus: () =>
    apiFetch<{ role: string; has_access: boolean; has_bed?: boolean; status: string; message?: string }>(`/auth/status`),
  generateInvite: (pgId: number) =>
    apiFetch<{ invite_code: string; pg_name: string }>('/auth/invite/generate', {
      method: 'POST',
      body: JSON.stringify({ pg_id: pgId })
    })
};

export const PgApi = {
  list: () => apiFetch<Array<{ id: number; name: string; address: string; admin_id: number }>>('/pg/get'),
  create: (name: string, address: string) =>
    apiFetch<{ id: number; name: string; address: string; admin_id: number }>(`/pg/create`, {
      method: 'POST',
      body: JSON.stringify({ name, address })
    })
};

export const RoomApi = {
  list: (pgId: number) => apiFetch<Array<{ id: number; pg_id: number; room_number: number }>>(`/rooms/${pgId}`),
  create: (pgId: number, roomNumber: number) =>
    apiFetch<{ id: number; pg_id: number; room_number: number }>(`/rooms/create`, {
      method: 'POST',
      body: JSON.stringify({ pg_id: pgId, room_number: roomNumber })
    }),
  delete: (roomId: number) =>
    apiFetch<{ message: string }>(`/rooms/${roomId}`, {
      method: 'DELETE'
    })
};

export const BedApi = {
  list: (roomId: number) => apiFetch<Array<{ id: number; room_id: number; rent: number; is_occupied: boolean }>>(`/beds/${roomId}`),
  available: () => apiFetch<Array<{ bed_id: number; rent: number; room_id: number; room_number: number; pg_id: number; pg_name: string; pg_address: string }>>('/beds/available'),
  create: (roomId: number, rent: number) =>
    apiFetch<{ id: number; room_id: number; rent: number; is_occupied: boolean }>(`/beds/create`, {
      method: 'POST',
      body: JSON.stringify({ room_id: roomId, rent })
    }),
  delete: (bedId: number) =>
    apiFetch<{ message: string }>(`/beds/${bedId}`, {
      method: 'DELETE'
    })
};

export const TenantApi = {
  list: () => apiFetch<Array<{ id: number; user_id: number; bed_id: number; move_in_date: string; user_name: string; user_email: string; room_number: number; pg_name: string }>>('/tenants'),
  unassigned: () => apiFetch<Array<{ id: number; name: string; email: string; role: string }>>('/tenants/unassigned'),
  create: (userId: number, bedId: number, moveInDate: string) =>
    apiFetch<{ id: number; user_id: number; bed_id: number; move_in_date: string; user_name: string; user_email: string; room_number: number; pg_name: string }>(`/tenants/create`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, bed_id: bedId, move_in_date: moveInDate })
    })
};
