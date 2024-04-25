import Cookies from 'js-cookie';

export const TOKEN_KEY = 'TOKEN__';

export function getToken() {
  const token = Cookies.get(TOKEN_KEY);
  return token ? `Bearer ${token}` : '';
}

export function setToken(token: string) {
  if (typeof token !== 'string') {
    return;
  }
  return Cookies.set(TOKEN_KEY, token, {
    expires: 14,
  });
}

export function removeToken() {
  return Cookies.remove(TOKEN_KEY);
}
