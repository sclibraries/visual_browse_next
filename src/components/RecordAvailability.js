import React from 'react';
import { useQuery } from '@apollo/client';
import { FOLIORTAC } from '../lib/api'

function RecordAvailability(props) {

        const cleanId = props.id.split('fs00001006.')[1]
    
        const { loading, error, data } = useQuery(FOLIORTAC, {
            variables: {
                id: cleanId.replace(/\./g,'-')
                }
            }
        )
    
        const holdings = data?.foliortac?.holding || []
        return (
            <table className="table">
                <thead className="table-light">
                    <tr>
                        <th scope="col">Status</th>
                        <th scope="col">Call Number</th>
                        <th scope="col">Location</th>
                    </tr>
                </thead>
                <tbody>
                {holdings.length > 0 ? holdings.map((holding,index) => {
                    return(
                        <tr key={index}>
                            <td>{holding.status}</td>
                            <td>{holding.callNumber}</td>
                            <td>{holding.location}</td>
                        </tr>
                    )
                }): ''}
                </tbody>
            </table>
        );
    }

    export default RecordAvailability;