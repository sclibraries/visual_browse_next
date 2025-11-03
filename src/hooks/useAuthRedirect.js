// src/hooks/useAuthRedirect.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useStore } from '../store/store';

// Simple auth guard hook used by account/admin pages
// Contract:
// - Returns an object { ready, authorized }
// - While !ready, page can show a centered spinner
// - When ready && !authorized, the hook has initiated a redirect; page can render a placeholder
export function useAuthRedirect() {
  const router = useRouter();
  const { loggedIn, authChecked, baseUrl } = useStore((s) => ({
    loggedIn: s.loggedIn,
    authChecked: s.authChecked,
    baseUrl: s.baseUrl,
  }));

  useEffect(() => {
    if (!authChecked) return; // wait until auth check completes
    if (loggedIn === false) {
      const currentPath = router.asPath || window.location.pathname;
      // Send user to backend login; after login backend will redirect back to this app
      window.location.assign(`${baseUrl}/login?redirectTo=${encodeURIComponent(currentPath)}`);
    }
  }, [authChecked, loggedIn, baseUrl, router]);

  return {
    ready: Boolean(authChecked),
    authorized: Boolean(authChecked && loggedIn),
  };
}
