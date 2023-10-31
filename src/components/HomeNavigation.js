import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export const HomeNavigation = props => {

    const router = useRouter();

    return(
        <ul className="nav nav-underline">
            <li className="nav-item">
                <Link 
                    className={`nav-link ${router.pathname === "/" ? "active" : ""}`}
                    href="/">
                    New
                </Link>
            </li>
            <li className="nav-item">
                <Link 
                    className={`nav-link ${router.query.material === "books" ? "active" : ""}`}
                    href="/new/material/books">
                    New Books
                </Link>
            </li>
            <li className="nav-item">
                <Link 
                    href="/new/material/dvd" 
                    className={`nav-link ${router.query.material === "dvd" ? "active" : ""}`}
                >
                    New DVDs
                </Link>
            </li>
            <li className="nav-item">
                <Link
                    href="/new/material/fiction-nonfiction"
                    className={`nav-link ${router.query.material === "fiction-nonfiction" ? "active" : ""}`}
                >
                    New Fiction & Nonfiction
                </Link>
            </li>
            <li className="nav-item">
                <Link 
                    href="/new/collections"
                    className="nav-link"
                >
                    New Collections
                </Link>
            </li>
            <li className="nav-item">
                <Link
                    disabled
                    href="/other-collections"
                    className="nav-link"
                >
                    Other Collections
                </Link>
            </li>
        </ul>
    )
}
