const BASE_URL = 'http://localhost:5005';

export async function registerUser(email, password, name) {
  const response = await fetch(`${BASE_URL}/admin/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'register failed');
  return data.token;
}

export async function loginUser(email, password) {
  const response = await fetch(`${BASE_URL}/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'login failed');
  return data.token;
}
