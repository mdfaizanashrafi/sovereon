import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const { setToken, setUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get token from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const email = urlParams.get('email');
    const name = urlParams.get('name');
    const errorParam = urlParams.get('error');

    if (errorParam === 'true') {
      setError('Authentication failed. Please try again.');
      setTimeout(() => navigate('/auth/login'), 3000);
      return;
    }

    if (token && email) {
      // Store token
      setToken(token);
      localStorage.setItem('token', token);

      // Fetch user from backend to get proper user data
      const fetchUser = async () => {
        try {
          const response = await fetch(`${API_URL}/users/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            const user = data.data || data;
            setUser(user);
          } else {
            // If profile fetch fails, store minimal user data
            setUser({
              email,
              name: name || email.split('@')[0],
              id: 'oauth-user',
            });
          }

          // Redirect to dashboard
          setTimeout(() => navigate('/portal/dashboard'), 500);
        } catch (err) {
          console.error('Error fetching user profile:', err);
          // Still set minimal user data and navigate
          setUser({
            email,
            name: name || email.split('@')[0],
            id: 'oauth-user',
          });
          setTimeout(() => navigate('/portal/dashboard'), 500);
        }
      };

      fetchUser();
    } else {
      setError('Unable to complete authentication. Please try again.');
      setTimeout(() => navigate('/auth/login'), 3000);
    }
  }, [navigate, setToken, setUser]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Authentication Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground mt-4">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-foreground">Completing sign in...</h2>
        <p className="text-muted-foreground mt-2">Please wait...</p>
      </div>
    </div>
  );
}
