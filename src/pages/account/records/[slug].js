import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useStore } from '../../../store/store';
import { DisplayImage } from '../../../components/DisplayImage';
import { useShallow } from 'zustand/react/shallow';
import { DisplayLoadingSkeleton } from '../../../components/Loading';

function CollectionRecords() {
    const [loading, setLoading] = useState(true);
    const [records, setRecords] = useState([]);
    const [folioRecords, setFolioRecords] = useState([]);

    const router = useRouter();
    const id = router.query.collection_id

    const [setAn,setDbid,setRecordModal] = useStore(useShallow(state => [
        state.setAn,
        state.setDbid,
        state.setRecordModal
      ]))

    useEffect(() => {
        if(id){
            getRecords();
        }
    }, [id])

    useEffect(() => {
        if(records && records.items && records.items.length > 0){
            getFolioRecords();
        }
    }, [records])

    const getRecords = async () => {
        const response = await fetch(`https://libtools2.smith.edu/visual_browse/backend/web/collection-records/collection-records-by-id?id=${id}`)
        const data = await response.json();
        setRecords(data);
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
                if(items.record.length <= 10){
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
    }

    return(
        <div className="container">
            <div className="jumbotron">
            
            </div>
            <div className="hide-scrollbar flex-1 h-100 container">
                <div className="row row-cols-* g-4" style={{marginTop: "30px"}}>
                    {loading ? <DisplayLoadingSkeleton /> : folioRecords.length > 0 ? folioRecords.map((item, index) => {
                        const oclc = item?.identifiers?.filter(id => id?.identifierTypeId?.includes('439bfbae-75bc-4f74-9fc7-b2a2d47ce3ef'))
                        const isbn = item?.identifiers?.filter(id => id?.identifierTypeId?.includes('8261054f-be78-422d-bd51-4ed9f33c3422'))
                        return(
                        <div className="col" key={index}>
                            <div
                            className="card"
                            style={{ width: "14em" }}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleRecord(item.id)}
                            onKeyDown={e => {
                                if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleRecord(item.id);
                                }
                            }}
                            aria-label={`View record ${item.id}`}
                            >                        <DisplayImage 
                            an={item?.id}
                            title={item?.title}
                            material={'book'}
                            year={item?.publication[0]?.dateOfPublication}
                            oclc={oclc && oclc.length > 0 ? oclc[0].value.replace(/[^0-9]/g, '') : ''}
                            isbn={isbn && isbn.length > 0 ? isbn[0].value.replace(/[^0-9]/g, ''): ''}
                            data={item}
                        />
                        <div className="card-body">
                            <h5 className="card-title">
                                {item?.indexTitle}
                            </h5>
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