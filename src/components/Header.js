import React, { useState, useEffect, Fragment } from 'react';
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
  const [loggedIn] = useStore((state) => [state.loggedIn], shallow);
  const [setCurrentURL] = useStore((state) => [state.setCurrentURL], shallow);
  const [accountReset] = useStore((state) => [state.accountReset], shallow);
  const router = useRouter();
  const currentPath = router.asPath;
  const currentQuery = router.query;

  const toggle = () => setIsOpen(!isOpen);

  const args = {
    color: '#2D3340',
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

  const handleLogout = () => {
    // Clear the JWT token from cookies
    accountReset()
    document.cookie = 'token=; Max-Age=-99999999;';
  
    // Redirect to server logout endpoint
    window.location.href = "https://libtools2.smith.edu:4000/logout";
  };


  return (
    <div>
      <Navbar {...args}>
      <NavbarBrand className="main-header" href="/">
          <img style={{height: "40px"}} src="/image/visual_browse_logo.png" alt="Visual Browse Logo" className="logo" />
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
              <DropdownMenu right>
                <DropdownItem>
                  <Link href="/local-collections/collections/fiction-nonfiction/">Fiction Non-Fiction</Link>
                </DropdownItem>
                <DropdownItem>
                <Link href="/local-collections/collections/swank/">Swank Streaming Videos</Link>
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </Nav>
          <Nav>
              {loggedIn ? (
                <Fragment>
                <a className="nav-link" href="#" onClick={handleLogout}>Log out</a>
                <Link className="nav-link" href="/account/">Account</Link>
              </Fragment>
              ) : (
                <Link className="nav-link" href={`https://libtools2.smith.edu:4000/login`}>Login</Link>
              )}
            </Nav>
        </Collapse>
      </Navbar>
      <SearchBox />
    </div>
  );
}

export default Header;
