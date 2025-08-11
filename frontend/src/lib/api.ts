// Tipos JSON simples para corpo de requests
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

// Sempre retorna um Record<string,string> (evita union estranho no fetch)
function authHeader(): Record<string, string> {
  const t =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const h: Record<string, string> = {};
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

// Função base para requests
async function request<T>(
  path: string,
  init?: RequestInit & { headers?: Record<string, string> }
): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const headers: Record<string, string> = {
    ...authHeader(),
    ...(init?.headers ?? {}),
  };

  const res = await fetch(`${base}${path}`, { ...init, headers });
  if (!res.ok) {
    // tente extrair mensagem do backend, senão caia numa default
    let reason = `${init?.method ?? 'GET'} ${path} failed`;
    try {
      const data = await res.json();
      if (typeof data?.message === 'string') reason = data.message;
    } catch {}
    throw new Error(reason);
  }
  return res.json();
}

// Helpers públicos
export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path);
}

export function apiPost<T>(path: string, body: Json): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export function apiPatch<T>(path: string, body: Json): Promise<T> {
  return request<T>(path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export function apiDelete<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
}
