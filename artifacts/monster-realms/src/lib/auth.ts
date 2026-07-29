import { setAuthTokenGetter } from '@workspace/api-client-react';

const TOKEN_KEY = 'mro_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Configure the API client to use our token.
// custom-fetch prepends "Bearer " automatically — return the raw token only.
setAuthTokenGetter(() => getToken());
