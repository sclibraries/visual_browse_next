import React, { useState, useEffect } from 'react';
import { useStore } from '../store/store';
import { useRouter } from 'next/router';

function Sort() {
    const router = useRouter();
    const [currentValue, setCurrentValue] = useState('');
    const [
        setMovieSort, 
        setBookSort, 
        setAllSort, 
        movieSort, 
        bookSort, 
        allSort,
        setShouldRefetch
    ] = useStore(state => [
        state.setMovieSort, 
        state.setBookSort, 
        state.setAllSort, 
        state.movieSort, 
        state.bookSort, 
        state.allSort,
        state.setShouldRefetch
    ]);

    useEffect(() => {
        switch (router.pathname) {
            case '/movies':
                setCurrentValue(movieSort);
                setShouldRefetch(true);
                break;
            case '/books':
                setCurrentValue(bookSort);
                setShouldRefetch(true);
                break;
            case '/all':
                setCurrentValue(allSort);
                setShouldRefetch(true);

                break;
            default:
                // Handle default case if necessary
        }
    }, [router.pathname, movieSort, bookSort, allSort]);

    const handleUpdate = (e) => {
        const newValue = e.target.value;
        switch (router.pathname) {
            case '/movies':
                setMovieSort(newValue);
                setShouldRefetch(true);
                break;
            case '/books':
                setBookSort(newValue);
                setShouldRefetch(true);

                break;
            case '/all':
                setAllSort(newValue);
                setShouldRefetch(true);
                break;
            default:
                // Handle default case if necessary
        }
    }

    return (
        <div>
            <select value={currentValue} className="form-control" id="sort" onChange={handleUpdate}>
                <option value="">Sort</option>
                <option value="relevance">Relevance</option>
                <option value="date">Newest</option>
                <option value="date2">Oldest</option>
            </select>
        </div>
    );
}

export default Sort;
