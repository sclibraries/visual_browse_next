import { useState, useEffect, Fragment, useCallback } from 'react';
import { 
  Navbar, 
  NavbarBrand, 
  Nav, 
  NavItem, 
  NavbarToggler, 
  Collapse,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import Link from 'next/link';
import SearchBox from './SearchBox';
import { useStore } from '../store/store';
import { useShallow } from 'zustand/react/shallow';
import { useRouter } from 'next/router';
import { LOCAL_COLLECTIONS_CONFIG } from '../lib/localCollectionConfigs';

const { getCollectionDisplayName } = require('../lib/collectionDisplayNames.cjs');

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const useV2CollectionsNav = process.env.NEXT_PUBLIC_USE_COLLECTIONS_V2_NAV === 'true';
  const [loggedIn, accountReset, setLoggedIn, setAuthChecked, setUser] = useStore(useShallow((state) => [
    state.loggedIn, 
    state.accountReset, 
    state.setLoggedIn, 
    state.setAuthChecked, 
    state.setUser
  ]));
  const router = useRouter();
  const currentQuery = router.query;
  const [returnParam, setReturnParam] = useState('');
  const [isDevEnvironment, setIsDevEnvironment] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  const args = {
    light: false,
    dark: true,
    expand: 'md',
    container: "fluid",
    fixed: "top",
  }

  const generateLink = (path) => {
    const blockedQueryParams = new Set(['slug', 'collections', 'material', 'an', 'dbid', 'img']);
    const queryString = new URLSearchParams(
      Object.entries(currentQuery).reduce((acc, [key, value]) => {
        if (blockedQueryParams.has(key) || value == null) {
          return acc;
        }

        if (Array.isArray(value)) {
          value.forEach((item) => acc.append(key, String(item)));
          return acc;
        }

        acc.append(key, String(value));
        return acc;
      }, new URLSearchParams())
    ).toString();

    return `${path}${queryString ? `?${queryString}` : ''}`;
  };

  // Build return URL for SSO links based on the current page and detect dev environment
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if we're in development environment
      const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      setIsDevEnvironment(isDev);
      
      // href includes basePath (e.g., /visual-browse)
      setReturnParam(encodeURIComponent(window.location.href));
    } else {
      const origin = '';
      const currentUrl = `${origin}${(router.basePath || '')}${router.asPath || '/'}`;
      setReturnParam(encodeURIComponent(currentUrl));
    }
  }, [router.asPath, router.basePath]);

  const handleLogout = useCallback(async () => {
    
    // Clear local storage first
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('refreshToken');
    
    // Reset Zustand store state
    setLoggedIn(false);
    setUser(null);
    setAuthChecked(false);
    accountReset();
    
    // Build the return URL - where to come back after SSO logout
    const returnUrl = typeof window !== 'undefined' 
      ? window.location.origin + (router.basePath || '') + '/'
      : 'https://libtools2.smith.edu/visual-browse/';
    
    
    // Redirect to PHP SSO logout endpoint
    // This will clear the token cookie and redirect to Shibboleth logout
    window.location.href = `https://libtools2.smith.edu/sso/logout.php?return=${encodeURIComponent(returnUrl)}`;
  }, [router, setLoggedIn, setUser, setAuthChecked, accountReset]);


  return (
    <div>
      <Navbar style={{backgroundColor: "#2D3340"}} {...args}>
      <NavbarBrand className="main-header" href="/visual-browse">
          <img style={{height: "40px"}} src="/visual-browse/image/visual_browse_logo.png" alt="Visual Browse Logo" className="logo" />
        </NavbarBrand>
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="me-auto" navbar>
            <NavItem>
              <Link className="nav-link" href="/">New</Link>
            </NavItem>
            <NavItem>
              <Link className="nav-link" href={generateLink('/movies/')}>Movies</Link>
            </NavItem>
            <NavItem>
              <Link className="nav-link" href={generateLink('/books/')}>Books</Link>
            </NavItem>
            <NavItem>
              <Link className="nav-link" href="/collections/audio-cds">{getCollectionDisplayName('audio-cds', 'Music CDs')}</Link>
            </NavItem>
            <NavItem className="d-none d-md-flex align-items-center text-white-50 px-1">|</NavItem>
            <NavItem>
              <Link className="nav-link" href="/collections/">Shared Collections</Link>
            </NavItem>
            <NavItem className="d-none d-md-flex align-items-center text-white-50 px-1">|</NavItem>
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>
                Local Collections
              </DropdownToggle>
              <DropdownMenu end>
                {LOCAL_COLLECTIONS_CONFIG.map((collection) => (
                  <DropdownItem key={collection.key}>
                    <Link href={useV2CollectionsNav ? collection.v2Path : collection.legacyPath}>
                      {useV2CollectionsNav ? collection.v2Label : collection.legacyLabel}
                    </Link>
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </UncontrolledDropdown>
          </Nav>
          <Nav navbar>
              {loggedIn ? (
                <Fragment>
                <button className="nav-link btn btn-link p-0 border-0" onClick={handleLogout}>Log out</button>
                <Link className="nav-link" href="/account/">Account</Link>
              </Fragment>
              ) : (
                // Use dev login for localhost, regular SSO for production
                <a
                  className="nav-link"
                  href={isDevEnvironment 
                    ? `https://libtools2.smith.edu/sso/login.php?dev=1&return=${returnParam || encodeURIComponent((typeof window !== 'undefined' ? window.location.origin : '') + (router.asPath || '/'))}`
                    : `https://libtools2.smith.edu/sso/login.php?return=${returnParam || encodeURIComponent((typeof window !== 'undefined' ? window.location.origin : '') + (router.asPath || '/'))}`
                  }
                >
                  Login {isDevEnvironment && '(Dev)'}
                </a>
              )}
              <Link className="nav-link" href="https://libraries.smith.edu/ask-us">Ask Us</Link>
            </Nav>
        </Collapse>
      </Navbar>
      <SearchBox />
    </div>
  );
}

export default Header;
