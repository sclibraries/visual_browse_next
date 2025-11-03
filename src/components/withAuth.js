// components/withAuth.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useStore } from '../store/store';

const withAuth = (WrappedComponent) => {
  const Wrapper = (props) => {
    const router = useRouter();
    const loggedIn = useStore((state) => state.loggedIn);
    const authChecked = useStore((state) => state.authChecked);
    const baseUrl = useStore((state) => state.baseUrl);

    useEffect(() => {
      if (!authChecked) return;
      if (loggedIn === false) {
        const currentPath = router.asPath;
        window.location.assign(`${baseUrl}/login?redirectTo=${encodeURIComponent(currentPath)}`);
      }
    }, [authChecked, loggedIn, router, baseUrl]);

    if (!authChecked) return null;
    if (loggedIn === false) return null;

    return <WrappedComponent {...props} />;
  };

  return Wrapper;
};

export default withAuth;
