type ApiError = { message: string; code?: string; details?: unknown };
type ApiResult<T = any> = { data: T; error: ApiError | null };
type Filter = { field: string; operator: string; value: any };

function csrfToken(): string {
  const cookie = document.cookie.split('; ').find((part) => part.startsWith('XSRF-TOKEN='));
  if (cookie) return decodeURIComponent(cookie.slice('XSRF-TOKEN='.length));
  return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '';
}

async function request<T = any>(url: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  headers.set('X-Requested-With', 'XMLHttpRequest');
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (init.method && !['GET', 'HEAD'].includes(init.method.toUpperCase())) {
    const token = csrfToken();
    if (token) headers.set('X-XSRF-TOKEN', token);
  }

  try {
    const response = await fetch(url, { ...init, headers, credentials: 'same-origin' });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const validation = body.errors ? Object.values(body.errors).flat().join(' ') : '';
      return { data: null as T, error: { message: validation || body.message || 'The request failed.', code: String(response.status), details: body } };
    }
    return { data: body as T, error: null };
  } catch (error) {
    return { data: null as T, error: { message: error instanceof Error ? error.message : 'Network request failed.' } };
  }
}

const listeners = new Set<(event: string, session: any) => void>();
function publishAuth(event: string, user: any) {
  const session = user ? { user } : null;
  listeners.forEach((listener) => listener(event, session));
}

class DataQuery implements PromiseLike<ApiResult<any>> {
  private action = 'select';
  private columns = '*';
  private filters: Filter[] = [];
  private orFilters: string[] = [];
  private orders: Array<{ field: string; ascending: boolean }> = [];
  private limitValue = 500;
  private offsetValue = 0;
  private values: any = [];
  private returning = false;
  private cardinality: 'many' | 'single' | 'maybeSingle' = 'many';

  constructor(private table: string) {}

  select(columns = '*'): this { this.columns = columns; if (this.action !== 'select') this.returning = true; return this; }
  insert(values: any): this { this.action = 'insert'; this.values = values; return this; }
  upsert(values: any): this { this.action = 'upsert'; this.values = values; return this; }
  update(values: any): this { this.action = 'update'; this.values = values; return this; }
  delete(): this { this.action = 'delete'; return this; }
  eq(field: string, value: any): this { return this.addFilter(field, 'eq', value); }
  neq(field: string, value: any): this { return this.addFilter(field, 'neq', value); }
  gt(field: string, value: any): this { return this.addFilter(field, 'gt', value); }
  gte(field: string, value: any): this { return this.addFilter(field, 'gte', value); }
  lt(field: string, value: any): this { return this.addFilter(field, 'lt', value); }
  lte(field: string, value: any): this { return this.addFilter(field, 'lte', value); }
  is(field: string, value: any): this { return this.addFilter(field, 'is', value); }
  in(field: string, value: any[]): this { return this.addFilter(field, 'in', value); }
  like(field: string, value: string): this { return this.addFilter(field, 'like', value); }
  ilike(field: string, value: string): this { return this.addFilter(field, 'ilike', value); }
  contains(field: string, value: any): this { return this.addFilter(field, 'contains', value); }
  not(field: string, operator: string, value: any): this {
    const inverse: Record<string, string> = { eq: 'neq', is: 'neq', in: 'not_in', like: 'not_like', ilike: 'not_ilike' };
    return this.addFilter(field, inverse[operator] || 'neq', value);
  }
  filter(field: string, operator: string, value: any): this { return this.addFilter(field, operator, value); }
  match(values: Record<string, any>): this { Object.entries(values).forEach(([field, value]) => this.eq(field, value)); return this; }
  or(expression: string): this { this.orFilters.push(expression); return this; }
  order(field: string, options: { ascending?: boolean } = {}): this { this.orders.push({ field, ascending: options.ascending !== false }); return this; }
  limit(value: number): this { this.limitValue = value; return this; }
  range(from: number, to: number): this { this.offsetValue = from; this.limitValue = Math.max(0, to - from + 1); return this; }
  single(): this { this.cardinality = 'single'; return this; }
  maybeSingle(): this { this.cardinality = 'maybeSingle'; return this; }
  private addFilter(field: string, operator: string, value: any): this { this.filters.push({ field, operator, value }); return this; }

  private async execute(): Promise<ApiResult<any>> {
    const result = await request<{ data: any; error: ApiError | null }>('/api/data/' + encodeURIComponent(this.table), {
      method: 'POST',
      body: JSON.stringify({
        action: this.action,
        columns: this.columns,
        filters: this.filters,
        or: this.orFilters,
        orders: this.orders,
        limit: this.limitValue,
        offset: this.offsetValue,
        values: this.values,
        returning: this.returning,
      }),
    });
    if (result.error) return result;
    const rows = result.data?.data;
    if (this.cardinality === 'many' || rows === null || rows === undefined) return { data: rows, error: result.data?.error || null };
    const values = Array.isArray(rows) ? rows : [rows];
    if (values.length === 0 && this.cardinality === 'maybeSingle') return { data: null, error: null };
    if (values.length !== 1) return { data: null, error: { message: values.length ? 'Expected a single row, but multiple rows were returned.' : 'No rows found.', code: 'PGRST116' } };
    return { data: values[0], error: null };
  }

  then<TResult1 = ApiResult<any>, TResult2 = never>(
    onfulfilled?: ((value: ApiResult<any>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled || undefined, onrejected || undefined);
  }
}

const auth = {
  async getSession() {
    const result = await request<{ user: any }>('/api/auth/me');
    const session = result.data?.user ? { user: result.data.user } : null;
    return { data: { session }, error: result.error };
  },
  async getUser() {
    const result = await request<{ user: any }>('/api/auth/me');
    return { data: { user: result.data?.user || null }, error: result.error };
  },
  async signUp({ email, password, options }: { email: string; password: string; options?: { data?: { full_name?: string } } }) {
    const result = await request<{ user: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name: options?.data?.full_name || email.split('@')[0] }),
    });
    if (result.data?.user) publishAuth('SIGNED_IN', result.data.user);
    return { data: { user: result.data?.user || null, session: result.data?.user ? { user: result.data.user } : null }, error: result.error };
  },
  async signInWithPassword({ email, password }: { email: string; password: string }) {
    const result = await request<{ user: any }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    if (result.data?.user) publishAuth('SIGNED_IN', result.data.user);
    return { data: { user: result.data?.user || null, session: result.data?.user ? { user: result.data.user } : null }, error: result.error };
  },
  async signOut() {
    const result = await request('/api/auth/logout', { method: 'POST', body: '{}' });
    publishAuth('SIGNED_OUT', null);
    return { error: result.error };
  },
  async updateUser(attributes: { email?: string; password?: string; data?: { full_name?: string; name?: string } }) {
    const result = await request<{ user: any }>('/api/auth/user', {
      method: 'PATCH',
      body: JSON.stringify({ ...attributes, name: attributes.data?.full_name || attributes.data?.name }),
    });
    if (result.data?.user) publishAuth('USER_UPDATED', result.data.user);
    return { data: { user: result.data?.user || null }, error: result.error };
  },
  onAuthStateChange(callback: (event: string, session: any) => void) {
    listeners.add(callback);
    void auth.getSession().then(({ data }) => callback('INITIAL_SESSION', data.session));
    return { data: { subscription: { unsubscribe: () => listeners.delete(callback) } } };
  },
};

const storage = {
  from(bucket: string) {
    return {
      async upload(path: string, file: File, _options?: any) {
        const form = new FormData();
        form.append('bucket', bucket);
        form.append('path', path);
        form.append('file', file);
        return request<{ path: string; fullPath: string }>('/api/storage/upload', { method: 'POST', body: form });
      },
      getPublicUrl(path: string) {
        return { data: { publicUrl: '/storage/' + path.split('/').map(encodeURIComponent).join('/') } };
      },
      async remove(paths: string[]) {
        return request('/api/storage/remove', { method: 'DELETE', body: JSON.stringify({ bucket, paths }) });
      },
    };
  },
  async listBuckets() {
    return request<{ buckets: Array<{ name: string }> }>('/api/storage/buckets');
  },
};

export const supabase = {
  from: (table: string) => new DataQuery(table),
  auth,
  storage,
  functions: {
    async invoke(name: string, options: { body?: any } = {}) {
      return request('/api/functions/' + encodeURIComponent(name), { method: 'POST', body: JSON.stringify(options.body || {}) });
    },
  },
};

export type Database = Record<string, never>;