'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for token in both cookie and localStorage
    const checkAuth = () => {
      // Check localStorage first (our backup)
      const localToken = localStorage.getItem('access_token');
      
      // Check cookie
      let cookieToken = null;
      const cookieMatch = document.cookie.match(/access_token=([^;]+)/);
      if (cookieMatch) {
        cookieToken = cookieMatch[1];
      }

      const hasToken = localToken || cookieToken;
      
      console.log('ProtectedRoute - Token check:', { 
        hasToken, 
        hasLocalToken: !!localToken, 
        hasCookieToken: !!cookieToken 
      });

      if (hasToken) {
        setIsAuthorized(true);
      } else {
        // No token found - redirect to auth
        console.log('ProtectedRoute - No token, redirecting to /auth');
        router.push('/auth?redirect=' + encodeURIComponent(window.location.pathname));
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

