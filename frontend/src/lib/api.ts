export function authHeader() {
  const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function apiGet<T>(path: string): Promise<T> {
  const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    headers: { ...authHeader() },
  });
  if (!r.ok) throw new Error(`GET ${path} failed`);
  return r.json();
}

export async function apiPost<T>(path: string, body: any): Promise<T> {
  const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`POST ${path} failed`);
  return r.json();
}

export async function apiPatch<T>(path: string, body: any): Promise<T> {
  const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`PATCH ${path} failed`);
  return r.json();
}

export async function apiDelete<T>(path: string): Promise<T> {
  const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    method: 'DELETE',
    headers: { ...authHeader() },
  });
  if (!r.ok) throw new Error(`DELETE ${path} failed`);
  return r.json();
}
