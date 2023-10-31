import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/store';
import { DisplayImage } from '@/components/DisplayImage';
import { shallow } from 'zustand/shallow';
import { DisplayLoadingSkeleton } from '@/components/Loading';
import { useRouter } from 'next/router';
import axios from 'axios';
function CollectionRecords(){
    const [loading, setLoading] = useState(true);;
    const [records, setRecords] = useState([]);
    const [folioRecords, setFolioRecords] = useState([]);
    const [mergedRecords, setMergedRecords] = useState([]);

    const router = useRouter();

    const [setAn,setDbid,setRecordModal, collectionRecordId] = useStore(state => [
        state.setAn,
        state.setDbid,
        state.setRecordModal,
        state.collectionRecordId
      ], shallow)

    useEffect(() => {
        if(collectionRecordId){
            getRecords();
        }
    }, [collectionRecordId])

    useEffect(() => {
        if(records && records.items && records.items.length > 0){
            getFolioRecords();
        }
    }, [records])

    const getRecords = async () => {
        setLoading(true);
        try {
          const response = await fetch(`https://libtools2.smith.edu/visual_browse/backend/web/collection-records/collection-records-by-id?id=${collectionRecordId}`);
          const data = await response.json();
      
          const promises = data.items.map(async (item) => {
            if(item.folio_id !== null){
                const folioVariable = item.folio_id.replace(/\./g, '-');
                console.log(item.folio_id)
                const folioData = await folioIDSearch(folioVariable);
                if (folioData.message === "success") {
                    return { ...item, folioRecord: folioData.data.instances[0] };
                }
            } else if (item.record !== null && item.record.length <= 10) {
              const folioData = await alephToFolio(item.record);
              if (folioData.message === "success") {
                return { ...item, folioRecord: folioData.data.instances[0] };
              }
            }
            return item;
          });
          
          const merged = await Promise.all(promises);
          setMergedRecords(merged);
        } catch (error) {
          console.error("Error fetching records:", error);
        }
        setLoading(false);
      };

    const folioIDSearch = async (folio_id) => {

        const response = await fetch(`https://libtools2.smith.edu/folio/web/search/search-inventory?query=(id="${folio_id}")`)
        const data = await response.json()
        return data
    }  

    const alephToFolio = async id => {
        const response = await fetch(`https://libtools2.smith.edu/folio/web/search/search-inventory?query=(identifiers.value="${id}")`)
        const data = await response.json()
        return data
    }

    const getFolioRecords = () => {
        if(records && records.items.length > 0){
            const results = records?.items || []
            results.map(items => {
                if(items.record !== null && items.record.length <= 10){
                    alephToFolio(items.record).then(data => {
                        if(data.message === "success"){
                            setFolioRecords(folioRecords => [...folioRecords, data.data.instances[0]])
                            setLoading(false)
                        } else {
                            setLoading(false)
                        }
                    })
                } else {
                    setLoading(false)
                }
            })
        } else {
            setLoading(false)
        }
    }

    const handleRecord = (an) => {
        const params = { an: `scf.oai.edge.fivecolleges.folio.ebsco.com.fs00001006.${an.replace(/-/g, ".")}` , db: 'cat09206a' }
        setAn(params.an)
        setDbid(params.db)
        setRecordModal(true)
        router.push(`${router.pathname}?an=${params.an}&dbid=${params.db}`, undefined, { shallow: true });
    }

    const handleDeleteRecord = async (recordId) => {
        try {
          const response = await axios.delete(`https://libtools2.smith.edu:4000/collection_records/delete/${recordId}`, { withCredentials: true });
          if (response.data.success) {
            // Remove the deleted record from the local state
            setFolioRecords(folioRecords.filter(item => item.id !== recordId));
          }
        } catch (error) {
          console.error("Error deleting record:", error);
        }
      };


    return(
        <div className="container">
            <div className="hide-scrollbar flex-1 h-100 container">
                <div className="row row-cols-* g-4" style={{marginTop: "30px"}}>
                    {loading ? <DisplayLoadingSkeleton /> : mergedRecords.length > 0 ? mergedRecords.map((item, index) => {
                        const oclc = item?.folioRecord?.identifiers?.filter(id => id?.identifierTypeId?.includes('439bfbae-75bc-4f74-9fc7-b2a2d47ce3ef'))
                        const isbn = item?.folioRecord?.identifiers?.filter(id => id?.identifierTypeId?.includes('8261054f-be78-422d-bd51-4ed9f33c3422'))
                        return(
                        <div className="col" key={index}>
                        <div className="card" style={{width: "14em"}}>
                            {item?.folioRecord?.id && item?.folioRecord?.id.length > 0 ? 
                            <span onClick={() => handleRecord(item?.folioRecord.id)}>
                        <DisplayImage 
                            an={item?.folioRecord.id}
                            title={item?.folioRecord.title}
                            material={'book'}
                            year={item?.folioRecord.publication[0]?.dateOfPublication}
                            oclc={oclc && oclc.length > 0 ? oclc[0].value.replace(/[^0-9]/g, '') : ''}
                            isbn={isbn && isbn.length > 0 ? isbn[0].value.replace(/[^0-9]/g, ''): ''}
                            data={item}
                            
                        />
                        </span>
                        : <svg 
                        className="bd-placeholder-img card-img-top" 
                        width="100%" 
                        height="248" 
                        xmlns="http://www.w3.org/2000/svg" 
                        role="img" 
                        preserveAspectRatio="xMidYMid slice" 
                        focusable="false"
                        onClick={() => handleRecord(item.id)}
                      >
                        <title> {item?.indexTitle}</title>
                        <rect width="100%" height="100%" fill="#d6d6d6"></rect>
                      </svg>
                    }
                        <div className="card-body">
                            <h5 className="card-title">
                                {item?.folioRecord?.indexTitle}
                            </h5>
                        </div>
                        <div className="card-footer">
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteRecord(item.collection_records_id)}>Delete</button>
                        </div>
                    </div>    
                    </div>
                    )
                    }): ''}      
                </div>
            </div>
        </div>
    )
}


export default CollectionRecords;