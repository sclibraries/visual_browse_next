import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../store/store'
import { GET_RECORD } from '../lib/api'
import RecordsDisplay from './RecordsDisplay'
import { useQuery } from '@apollo/client'
import {ModalHeader, ModalBody, ModalFooter, Button} from 'reactstrap'
import { useRouter } from 'next/router'

function Records(){

    const router = useRouter();

    const [an, dbid, setRecordData, setRecordModal, setRecordImageOverride] = useStore(useShallow(state => [
        state.an,
        state.dbid,
        state.setRecordData,
        state.setRecordModal,
        state.setRecordImageOverride,
    ]))

    const handleOnComplete = (data) => {
        setRecordData(data?.record?.records)
    }

    const handleToggle = () => {
        setRecordModal(false);
        setRecordImageOverride('');

        // Remove 'an' and 'dbid' query parameters from the current URL
        const currentUrl = new URL(router.asPath, window.location.origin);
        const searchParams = new URLSearchParams(currentUrl.search);
        searchParams.delete('an');
        searchParams.delete('dbid');
        searchParams.delete('img');
        
        // Construct the URL without the record query params
        const cleanPath = currentUrl.pathname + (searchParams.toString() ? '?' + searchParams.toString() : '');
        
        // Navigate to the clean URL
        router.push(cleanPath, undefined, { shallow: true });
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