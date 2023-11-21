import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useStore } from '../store/store';

export const HomeNavigation = props => {

    const router = useRouter();
    
    const [setSubject] = useStore(state => [state.setSubject]);
    const [setLocation] = useStore(state => [state.setLocation])

    const updateFilters = () => {
        setSubject("");
        setLocation("");
    }

    return(
        <ul className="nav nav-underline">
            <li className="nav-item">
                <Link 
                    className={`nav-link ${router.pathname === "/" ? "active" : ""}`}
                    href="/"
                    onClick = {() => updateFilters()}
                >
                    New
                </Link>
            </li>
            <li className="nav-item">
                <Link 
                    className={`nav-link ${router.query.material === "books" ? "active" : ""}`}
                    href="/new/material/books"
                    onClick = {() => updateFilters()}
                >
                    New Books
                </Link>
            </li>
            <li className="nav-item">
                <Link 
                    href="/new/material/dvd" 
                    className={`nav-link ${router.query.material === "dvd" ? "active" : ""}`}
                    onClick = {() => updateFilters()}
                >
                    New DVDs
                </Link>
            </li>
            <li className="nav-item">
                <Link
                    href="/new/material/fiction-nonfiction"
                    className={`nav-link ${router.query.material === "fiction-nonfiction" ? "active" : ""}`}
                    onClick = {() => updateFilters()}
                >
                    New Fiction & Nonfiction
                </Link>
            </li>
            <li className="nav-item">
                <Link 
                    href="/new/public-collections"
                    className={`nav-link ${router.pathname === "/new/public-collections" ? "active" : ""}`}
                    onClick = {() => updateFilters()}
                >
                    New Collections
                </Link>
            </li>
            <li className="nav-item">
                <Link
                    disabled
                    href="/other-collections"
                    className="nav-link"
                    onClick = {() => updateFilters()}
                >
                    Other Collections
                </Link>
            </li>
        </ul>
    )
}
