
import React, { useState, useEffect, useCallback } from 'react';
import type { Vehicle, Trip } from './types';
import { fetchVehicles, fetchTrips, exchangeCodeForToken } from './services/bouncieService';
import CredentialsForm from './components/CredentialsForm';
import Controls from './components/Controls';
import TripMap from './components/TripMap';
import Spinner from './components/Spinner';

const App: React.FC = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedImei, setSelectedImei] = useState<string>('');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // One-time effect to handle OAuth redirect and initial token load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const storedToken = localStorage.getItem('bouncieAccessToken');

    if (code) {
      setIsLoading(true);
      setAuthError(null);
      const clientId = localStorage.getItem('bouncieClientId');
      const clientSecret = localStorage.getItem('bouncieClientSecret');
      const storedState = localStorage.getItem('bouncieOauthState');

      if (state !== storedState) {
        setAuthError('OAuth state mismatch. Please try connecting again.');
        setIsLoading(false);
        localStorage.removeItem('bouncieOauthState');
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }
      localStorage.removeItem('bouncieOauthState');
      
      if (clientId && clientSecret) {
        // This MUST exactly match the redirect_uri sent to the authorize endpoint.
        // Using window.location.origin is the most robust way to get a stable
        // URL in sandboxed/iframe environments.
        const redirectUri = window.location.origin;

        exchangeCodeForToken(code, clientId, clientSecret, redirectUri)
          .then(token => {
            localStorage.setItem('bouncieAccessToken', token);
            setAccessToken(token);
            window.history.replaceState({}, document.title, window.location.pathname);
            localStorage.removeItem('bouncieClientSecret'); // For security
          })
          .catch(err => {
            setAuthError(err.message || 'Failed to get access token.');
            localStorage.removeItem('bouncieClientId');
            localStorage.removeItem('bouncieClientSecret');
            window.history.replaceState({}, document.title, window.location.pathname);
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        setAuthError('Client credentials not found. Please try connecting again.');
        setIsLoading(false);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } else if (storedToken) {
      setAccessToken(storedToken);
      // Loading state will be handled by the vehicle fetch effect
    } else {
      setIsLoading(false); // Ready to show login form
    }
  }, []);

  // Effect to fetch vehicles when we get an access token
  useEffect(() => {
    if (!accessToken) {
      setVehicles([]);
      setTrips([]);
      setSelectedImei('');
      if (!window.location.search.includes('code')) {
        setIsLoading(false); // No token, and not in auth flow, so stop loading
      }
      return;
    };

    const getVehicles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedVehicles = await fetchVehicles(accessToken);
        setVehicles(fetchedVehicles);
        if (fetchedVehicles.length > 0) {
          setSelectedImei(fetchedVehicles[0].imei);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while fetching vehicles.';
        setError(errorMessage);
        if (errorMessage.includes('Unauthorized')) {
          handleLogout();
          setAuthError('Your access token is invalid or has expired. Please connect again.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    getVehicles();
  }, [accessToken]);

  const handleLogout = () => {
    localStorage.removeItem('bouncieAccessToken');
    localStorage.removeItem('bouncieClientId');
    localStorage.removeItem('bouncieClientSecret');
    localStorage.removeItem('bouncieOauthState');
    setAccessToken(null);
  }

  const handleFetchTrips = useCallback(async (imei: string, startDate: string, endDate: string) => {
    if (!accessToken) {
      setError("No access token provided.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setTrips([]); // Clear previous trips
    try {
      const fetchedTrips = await fetchTrips(accessToken, imei, startDate, endDate);
      setTrips(fetchedTrips);
       if (fetchedTrips.length === 0) {
        setError("No trips found for the selected date range.");
      } else {
        setError(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while fetching trips.';
      setError(errorMessage);
      if (errorMessage.includes('Unauthorized')) {
        handleLogout();
        setAuthError('Your access token is invalid or has expired. Please connect again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);


  if (isLoading) {
      return (
          <div className="flex items-center justify-center h-screen bg-gray-900">
              <Spinner />
          </div>
      )
  }

  if (!accessToken) {
    return <CredentialsForm error={authError} />;
  }

  return (
    <div className="relative h-screen w-screen flex text-white bg-gray-900">
      <Controls 
        vehicles={vehicles}
        selectedImei={selectedImei}
        setSelectedImei={setSelectedImei}
        onFetchTrips={handleFetchTrips}
        isLoading={isLoading}
        onLogout={handleLogout}
      />
      <main className="flex-1 h-full relative">
        <TripMap trips={trips} />
        {isLoading && (
            <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-[1001]">
                <Spinner />
            </div>
        )}
        {error && (
            <div 
              className={`absolute top-4 left-1/2 -translate-x-1/2 p-3 rounded-lg shadow-lg z-[1001] cursor-pointer ${error.includes('No trips found') ? 'bg-yellow-600 bg-opacity-90' : 'bg-red-500'}`}
              onClick={() => setError(null)}
            >
                {error}
            </div>
        )}
      </main>
    </div>
  );
};

export default App;
