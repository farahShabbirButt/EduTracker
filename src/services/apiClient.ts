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

class ApiClient {
  private baseUrl: string;
  private onUnauthorized: (() => void) | null = null;

  constructor() {
    this.baseUrl = ENV.API_BASE_URL;
  }

  // Registered once from main.tsx. A callback rather than a store import, because
  // importing the store here would create apiClient -> store -> slice -> apiClient.
  setOnUnauthorized(handler: () => void) {
    this.onUnauthorized = handler;
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

    // Required for the httpOnly auth cookie to be sent cross-origin. Without this
    // every protected call 401s regardless of a valid session.
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

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
