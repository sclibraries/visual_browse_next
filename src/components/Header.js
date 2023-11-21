import React, { useState, useEffect } from 'react';
import { Navbar, NavbarBrand, Nav, NavItem, NavLink, Button, NavbarToggler, Collapse } from 'reactstrap';
import Link from 'next/link';
import SearchBox from './SearchBox';
import { useStore } from '../store/store';
import { shallow } from 'zustand/shallow';
import { useRouter } from 'next/router';

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [loggedIn] = useStore((state) => [state.loggedIn], shallow);
  const [setCurrentURL] = useStore((state) => [state.setCurrentURL], shallow);
  const router = useRouter();
  const currentPath = router.asPath;
  const currentQuery = router.query;

  console.log('currentPath', currentPath);

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
              <Link className="nav-link" href="/collections/">Collections</Link>
            </NavItem>
            <NavItem>
              {loggedIn ? (
                <Link className="nav-link" href="/account/">Account</Link>
              ) : (
                <Link className="nav-link" href={`https://libtools2.smith.edu:4000/login`}>Login</Link>
              )}
            </NavItem>
          </Nav>
        </Collapse>
      </Navbar>
      <SearchBox />
    </div>
  );
}

export default Header;
