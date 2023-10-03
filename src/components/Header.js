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
  const router = useRouter();
  const currentPath = router.asPath;

  const toggle = () => setIsOpen(!isOpen);

  const args = {
    color: 'light',
    light: true,
    expand: 'md',
    container: "fluid",
    fixed: "top",
  }

  return (
    <div>
      <Navbar {...args}>
        <NavbarBrand href="/">Visual Browse</NavbarBrand>
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="me-auto" navbar>
            <NavItem>
              <Link className="nav-link" href="/">New</Link>
            </NavItem>
            <NavItem>
              <Link className="nav-link" href="/movies/">Movies</Link>
            </NavItem>
            <NavItem>
              <Link className="nav-link" href="/television/">Television</Link>
            </NavItem>
            <NavItem>
              <Link className="nav-link" href="/books/">Books</Link>
            </NavItem>
            <NavItem>
              <Link className="nav-link" href="/collections/">Collections</Link>
            </NavItem>
            <NavItem>
              {loggedIn ? (
                <Link className="nav-link" href="/account/">Account</Link>
              ) : (
                <Link className="nav-link" href={`https://libtools2.smith.edu:4000/login?redirectTo=${currentPath}`}>Login</Link>
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
