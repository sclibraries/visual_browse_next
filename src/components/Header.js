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
import { shallow } from 'zustand/shallow';
import { useRouter } from 'next/router';

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [loggedIn, accountReset, setLoggedIn, setAuthChecked, setUser] = useStore((state) => [
    state.loggedIn, 
    state.accountReset, 
    state.setLoggedIn, 
    state.setAuthChecked, 
    state.setUser
  ], shallow);
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
    const queryString = new URLSearchParams(currentQuery).toString();
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
    console.log('handleLogout called - starting logout process');
    
    // Clear local storage first
    console.log('Clearing local storage and cookies...');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('refreshToken');
    
    console.log('Resetting Zustand store...');
    // Reset Zustand store state
    setLoggedIn(false);
    setUser(null);
    setAuthChecked(false);
    accountReset();
    
    // Build the return URL - where to come back after SSO logout
    const returnUrl = typeof window !== 'undefined' 
      ? window.location.origin + (router.basePath || '') + '/'
      : 'https://libtools2.smith.edu/visual-browse/';
    
    console.log('Redirecting to SSO logout with return URL:', returnUrl);
    
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
            <Link  className="nav-link" href={generateLink('/movies/')}>Movies</Link>
          </NavItem>
            <NavItem>
            <Link  className="nav-link" href={generateLink('/books/')}>Books</Link>
          </NavItem>
            <NavItem>
              <Link className="nav-link" href="/collections/">Shared Collections</Link>
            </NavItem>
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>
                Local Collections
              </DropdownToggle>
              <DropdownMenu end>
                <DropdownItem>
                  <Link href="/local-collections/collections/fiction-nonfiction/">Fiction Non-Fiction</Link>
                </DropdownItem>
                <DropdownItem>
                  <Link href="/local-collections/collections/swank/">Swank Streaming Videos</Link>
                </DropdownItem>
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
