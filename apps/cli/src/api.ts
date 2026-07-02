export class VaultifyApi {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.token = token;
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.token}`,
    };

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      let message = `HTTP ${res.status} ${res.statusText}`;
      try {
        const errBody = (await res.json()) as { message?: string; error?: string };
        message = errBody.message || errBody.error || message;
      } catch {
        // ignore parse failure
      }
      throw new Error(message);
    }

    if (res.status === 204) {
      return undefined as T;
    }

    return res.json() as Promise<T>;
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', path, body);
  }

  async del<T>(path: string): Promise<T> {
    return this.request<T>('DELETE', path);
  }

  async getText(path: string): Promise<string> {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!res.ok) {
      let message = `HTTP ${res.status} ${res.statusText}`;
      try {
        const errBody = (await res.json()) as { message?: string; error?: string };
        message = errBody.message || errBody.error || message;
      } catch {
        // ignore
      }
      throw new Error(message);
    }

    return res.text();
  }
}

/** Make an unauthenticated POST (used for login). */
export async function apiPost<T>(baseUrl: string, path: string, body: unknown): Promise<T> {
  const url = `${baseUrl.replace(/\/+$/, '')}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let message = `HTTP ${res.status} ${res.statusText}`;
    try {
      const errBody = (await res.json()) as { message?: string; error?: string };
      message = errBody.message || errBody.error || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}
