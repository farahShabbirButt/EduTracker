import { ENV } from '../config/env';

// Preserves the backend's structured envelope instead of flattening it to a bare
// Error. The backend owns user-facing wording (see CLAUDE.md), so callers need
// userMessage and status, not just a string.
export class ApiEnvelopeError extends Error {
  status: number;
  userMessage?: string;
  envelope: unknown;

  constructor(
    message: string,
    status: number,
    envelope: unknown,
    userMessage?: string
  ) {
    super(message);
    this.name = 'ApiEnvelopeError';
    this.status = status;
    this.envelope = envelope;
    this.userMessage = userMessage;
  }
}

// Every success response carries these. For calls that only need the message.
export type ApiMessage = {
  keyName: string;
  success?: boolean;
  message?: string;
  userMessage?: string;
};

// The backend puts the payload under the key named by keyName, so `K` must match
// what the service sends, e.g. ApiResponse<'students', Student[]>.
export type ApiResponse<K extends string, T> = ApiMessage & {
  keyName: K;
} & Record<K, T>;

// Surfaces the backend's wording rather than inventing our own (CLAUDE.md).
export const messageFrom = (error: unknown, fallback: string) =>
  error instanceof ApiEnvelopeError
    ? error.userMessage || error.message
    : fallback;

// A request still waiting after this long shows the "server is starting" notice. The free
// host sleeps when idle and takes up to a minute to wake.
const SLOW_AFTER_MS = 4000;

class ApiClient {
  private baseUrl: string;
  private onUnauthorized: (() => void) | null = null;
  private slowCount = 0;
  private slowListeners = new Set<(slow: boolean) => void>();

  constructor() {
    this.baseUrl = ENV.API_BASE_URL;
  }

  // Registered once from main.tsx. A callback rather than a store import, because
  // importing the store here would create apiClient -> store -> slice -> apiClient.
  setOnUnauthorized(handler: () => void) {
    this.onUnauthorized = handler;
  }

  // Told true while any request has waited past SLOW_AFTER_MS, false when none has
  onSlowChange(listener: (slow: boolean) => void) {
    this.slowListeners.add(listener);
    listener(this.slowCount > 0);
    return () => {
      this.slowListeners.delete(listener);
    };
  }

  private markSlow(change: 1 | -1) {
    const was = this.slowCount > 0;
    this.slowCount += change;
    const now = this.slowCount > 0;
    if (was !== now) this.slowListeners.forEach((listener) => listener(now));
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Sends the httpOnly auth cookie. Needed in development, where the app (port 5173) and
    // the API (port 5000) are different origins; in production they share one address.
    let slow = false;
    const timer = setTimeout(() => {
      slow = true;
      this.markSlow(1);
    }, SLOW_AFTER_MS);
    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });
    } finally {
      clearTimeout(timer);
      if (slow) this.markSlow(-1);
    }

    if (!response.ok) {
      const envelope = await response.json().catch(() => ({}));

      // Backstop for a token expiring mid-session. The bootstrap gate in App.tsx
      // is the primary mechanism; this catches the case where it expires after boot.
      if (response.status === 401) {
        this.onUnauthorized?.();
      }

      throw new ApiEnvelopeError(
        envelope?.message || `Request failed with status ${response.status}`,
        response.status,
        envelope,
        envelope?.userMessage
      );
    }

    return response.json();
  }

  get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(
    endpoint: string,
    body: unknown,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put<T>(
    endpoint: string,
    body: unknown,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
