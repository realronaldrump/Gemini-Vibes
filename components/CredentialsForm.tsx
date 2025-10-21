
import React, { useState, useMemo } from 'react';

interface CredentialsFormProps {
  error?: string | null;
}

const CredentialsForm: React.FC<CredentialsFormProps> = ({ error }) => {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [copied, setCopied] = useState(false);
  const [authUrl, setAuthUrl] = useState<string | null>(null);

  const redirectUri = useMemo(() => {
    // In some sandboxed environments, window.location.href can be a blob URL.
    // window.location.origin provides the stable, real origin which Bouncie needs
    // for an exact match.
    return window.location.origin;
  }, []);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(redirectUri).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clientId.trim() && clientSecret.trim()) {
      const state = Math.random().toString(36).substring(2);
      
      localStorage.setItem('bouncieClientId', clientId.trim());
      localStorage.setItem('bouncieClientSecret', clientSecret.trim());
      localStorage.setItem('bouncieOauthState', state);

      const params = new URLSearchParams({
        client_id: clientId.trim(),
        response_type: 'code',
        redirect_uri: redirectUri,
        state: state
      });
      
      const url = `https://auth.bouncie.com/dialog/authorize?${params.toString()}`;
      setAuthUrl(url);
    }
  };

  if (authUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
        <div className="w-full max-w-lg p-8 space-y-8 bg-gray-800 rounded-2xl shadow-2xl text-center">
          <h2 className="text-2xl font-bold text-cyan-400">Redirecting to Bouncie...</h2>
          <p className="mt-2 text-gray-400">
            Please click the button below to complete the authorization.
          </p>
          <a
            href={authUrl}
            target="_top"
            className="mt-6 inline-block w-full text-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500"
          >
            Authorize with Bouncie
          </a>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="w-full max-w-lg p-8 space-y-8 bg-gray-800 rounded-2xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-cyan-400">Bouncie Neon Trails</h1>
          <p className="mt-2 text-gray-400">First, let's connect to your Bouncie account.</p>
        </div>
        {error && (
            <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded-lg relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}
        <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
          {/* Step 1 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-200">Step 1: Bouncie App Credentials</h2>
            <p className="text-sm text-gray-400 mt-1">
              You'll need a Client ID and Secret from the{' '}
              <a href="https://www.bouncie.dev/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                Bouncie Developer Portal
              </a>.
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="client-id" className="sr-only">Client ID</label>
                <input
                  id="client-id"
                  name="clientId"
                  type="text"
                  required
                  autoComplete="off"
                  className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-700 bg-gray-900 placeholder-gray-500 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                  placeholder="Enter Client ID"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="client-secret" className="sr-only">Client Secret</label>
                <input
                  id="client-secret"
                  name="clientSecret"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-700 bg-gray-900 placeholder-gray-500 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                  placeholder="Enter Client Secret"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {/* Step 2 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-200">Step 2: Configure Redirect URI</h2>
            <p className="text-sm text-gray-400 mt-1">
                In your Bouncie app settings, add this exact URL to your list of Redirect URIs.
            </p>
            <div className="mt-4 relative flex items-center">
                <input type="text" readOnly value={redirectUri} className="w-full pl-3 pr-20 py-2 text-sm border-gray-600 bg-gray-700 text-gray-300 rounded-md focus:outline-none" />
                <button type="button" onClick={handleCopy} className="absolute inset-y-0 right-0 flex items-center px-4 text-sm font-medium text-cyan-400 hover:text-cyan-200 bg-gray-600 rounded-r-md">
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
          </div>

          {/* Step 3 */}
          <div>
            <button
              type="submit"
              disabled={!clientId || !clientSecret}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              Connect with Bouncie
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CredentialsForm;
