import type { Vehicle, Trip } from '../types';

// Use the new API proxy path
const API_BASE_URL = '/api/bouncie-api/v1';

async function handleResponse<T,>(response: Response): Promise<T> {
  if (response.status === 401) {
    throw new Error('Unauthorized: Invalid or expired access token.');
  }
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ errors: 'Request failed with status ' + response.status }));
    throw new Error(errorData.errors || 'An unknown API error occurred.');
  }
  return response.json() as Promise<T>;
}

export async function fetchVehicles(accessToken: string): Promise<Vehicle[]> {
  const response = await fetch(`${API_BASE_URL}/vehicles`, {
    headers: {
      // The Authorization header now includes the "Bearer " prefix
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  return handleResponse<Vehicle[]>(response);
}

export async function fetchTrips(
  accessToken: string,
  imei: string,
  startsAfter: string,
  endsBefore: string
): Promise<Trip[]> {
  const params = new URLSearchParams({
    imei,
    'starts-after': startsAfter,
    'ends-before': endsBefore,
    'gps-format': 'geojson',
  });

  const response = await fetch(`${API_BASE_URL}/trips?${params.toString()}`, {
    headers: {
      // The Authorization header now includes the "Bearer " prefix
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  return handleResponse<Trip[]>(response);
}

export async function exchangeCodeForToken(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string
): Promise<string> {
    // This URL points to our local Vite proxy for auth
    const response = await fetch('/api/bouncie-auth/oauth/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error_description: 'Token exchange failed with status ' + response.status }));
        throw new Error(errorData.error_description || 'An unknown error occurred during token exchange.');
    }

    const tokenData = await response.json();
    if (!tokenData.access_token) {
        throw new Error('Access token not found in response.');
    }
    return tokenData.access_token;
}

