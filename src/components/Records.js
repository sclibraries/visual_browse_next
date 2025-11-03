import  {useState, useEffect} from 'react'
import { shallow } from 'zustand/shallow'
import { useStore } from '../store/store'
import { GET_RECORD } from '../lib/api'
import RecordsDisplay from './RecordsDisplay'
import { useQuery } from '@apollo/client'
import {ModalHeader, ModalBody, ModalFooter, Button} from 'reactstrap'
import { useRouter } from 'next/router'

function Records(){

    const router = useRouter();
    const [previousUrl, setPreviousUrl] = useState('');

    useEffect(() => {
        // Store the current URL when the component mounts
        setPreviousUrl(router.asPath);
    }, [router.asPath]);

    const [an, dbid, setRecordData, setRecordModal] = useStore(state => [
        state.an,
        state.dbid,
        state.setRecordData,
        state.setRecordModal
    ], shallow)

    const handleOnComplete = (data) => {
        setRecordData(data?.record?.records)
    }

    const handleToggle = () => {
        setRecordModal(false);

        // Check if previousUrl contains 'an' or 'dbid'
        const urlContainsAnOrDbid = previousUrl.includes('an=') || previousUrl.includes('dbid=');
      
        if (urlContainsAnOrDbid) {
          // If it does, redirect to the homepage
          router.push('/', undefined, { shallow: true });
        } else {
          // Otherwise, go to the previousUrl
          router.push(previousUrl, undefined, { shallow: true });
        }
    };

    const { loading } = useQuery(GET_RECORD, {
        variables: {
            an: an,
            dbid: dbid
        }, 
        onCompleted: data => { handleOnComplete(data) }
    })

    if (loading) return <p>Loading...</p>


    return(
        <div style={{marginTop: "50px"}}>
            <ModalHeader toggle={() => handleToggle()}></ModalHeader>
                <ModalBody style={{ 
                    maxHeight: 'calc(100vh - 150px)',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    position: 'relative',
                    padding: window.innerWidth < 768 ? '10px' : '15px'
                }}>
                    <RecordsDisplay />
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => handleToggle()}>Close</Button>
                </ModalFooter>
        </div>
    )
}

export default Records