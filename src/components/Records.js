import React from 'react'
import { shallow } from 'zustand/shallow'
import { useStore } from '../store/store'
import { GET_RECORD } from '../lib/api'
import RecordsDisplay from './RecordsDisplay'
import { useQuery } from '@apollo/client'
import {ModalHeader, ModalBody, ModalFooter, Button} from 'reactstrap'
import { useRouter } from 'next/router'

function Records(){

    const router = useRouter();
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
        setRecordModal(false)
        let value = ''
        if(router.query.material){
            value = router.query.material
        }

        if(router.query.collection_id){
            value = router.query.collection_id
        }

        if (value) {
          
          const newPath = router.pathname.replace(router.query.material ? '[material]' : '[collection_id]', value);
          router.push(newPath, undefined, { shallow: true });
        } else {
          router.push(router.pathname, undefined, { shallow: true });
        }
    }

    const { loading, error, data } = useQuery(GET_RECORD, {
        variables: {
            an: an,
            dbid: dbid
        }, 
        onCompleted: data => { handleOnComplete(data) }
    })

    if (loading) return <p>Loading...</p>
    if (error) return <p>Error: {error.message}</p>


    return(
        <div style={{marginTop: "50px"}}>
            <ModalHeader toggle={e => handleToggle()}></ModalHeader>
                <ModalBody>
                    <RecordsDisplay />
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={e => handleToggle()}>Close</Button>
                </ModalFooter>
        </div>
    )
}

export default Records