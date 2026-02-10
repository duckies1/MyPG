export type ApiError = { status: number; message: string };

const dispatchLoading = (delta: number) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('mypg-loading', { detail: { delta } }));
};

// Request deduplication: store in-flight promises to avoid duplicate requests
const inFlightRequests = new Map<string, Promise<any>>();

async function apiFetch<T>(path: string, init?: RequestInit & { silent?: boolean }): Promise<T> {
  const method = init?.method || 'GET';
  const isGetRequest = method === 'GET';
  const isSilent = init?.silent === true; // Don't show loading indicator for background prefetch
  
  // For GET requests, check if we already have an in-flight request
  if (isGetRequest) {
    const cacheKey = path;
    if (inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey)!;
    }
  }

  if (!isSilent) {
    dispatchLoading(1);
  }
  
  const requestPromise = (async () => {
    const res = await fetch(`/api${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {})
      },
      credentials: 'include',
      // Use better caching strategy: 
      // - GET requests: cache for 60 seconds in browser
      // - POST/DELETE: no cache (these modify data)
      cache: isGetRequest ? 'default' : 'no-store',
      next: isGetRequest ? { revalidate: 60 } : undefined // Cache for 60 seconds on server
    });
    
    if (!res.ok) {
      let msg = 'Request failed';
      try { msg = (await res.json()).detail || msg; } catch {}
      throw { status: res.status, message: msg } as ApiError;
    }
    
    try { return await res.json(); } catch { return undefined as T; }
  })().finally(() => {
    if (!isSilent) {
      dispatchLoading(-1);
    }
    // Clean up in-flight request after completion
    if (isGetRequest) {
      inFlightRequests.delete(path);
    }
  });

  if (isGetRequest) {
    inFlightRequests.set(path, requestPromise);
  }

  return requestPromise;
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
  list: (options?: { silent?: boolean }) => apiFetch<Array<{ id: number; name: string; address: string; admin_id: number }>>('/pg/get', options),
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
  available: (options?: { silent?: boolean }) => apiFetch<Array<{ bed_id: number; rent: number; room_id: number; room_number: number; pg_id: number; pg_name: string; pg_address: string }>>('/beds/available', options),
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
  list: (page: number = 1, pageSize: number = 50, options?: { silent?: boolean }) => apiFetch<{ items: Array<{ id: number; user_id: number; bed_id: number; move_in_date: string; user_name: string; user_email: string; room_number: number; pg_name: string }>; total: number; page: number; page_size: number }>(`/tenants?page=${page}&page_size=${pageSize}`, options),
  unassigned: (options?: { silent?: boolean }) => apiFetch<Array<{ id: number; name: string; email: string; role: string }>>('/tenants/unassigned', options),
  create: (userId: number, bedId: number, moveInDate: string) =>
    apiFetch<{ id: number; user_id: number; bed_id: number; move_in_date: string; user_name: string; user_email: string; room_number: number; pg_name: string }>(`/tenants/create`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, bed_id: bedId, move_in_date: moveInDate })
    })
};
