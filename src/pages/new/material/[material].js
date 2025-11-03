import { useState, useEffect } from 'react'
import { GET_ORDERS } from '../../../lib/api'
import { useQuery } from '@apollo/client'
import moment from 'moment';
import { useRouter } from 'next/router';
import { useStore } from '../../../store/store';
import { shallow } from 'zustand/shallow'
import NewMaterialDisplay from '../../../components/NewMaterialDisplay';

function NewMaterial() {
    const router = useRouter();
    const { material } = router.query;
    const [records, setRecord] = useState([]);
    const [offset, setOffset] = useState(0);
    const [page, setPage] = useState(1);
    const [limit] = useState(50);
    const [loadMore, setLoadMore] = useState(false);

    let fundDistribution = ''
    
    switch(material){
        case 'fiction-nonfiction':
            fundDistribution = '*ce7b58c5-17dd-484d-925d-49d4829357f3*'
        break;
        default:
            fundDistribution = ''
        break;
    }

    const [setAn,setDbid, setRecordModal,location, subject, date, setLocation, setSubject, setDate] = useStore(state => [
        state.setAn,
        state.setDbid,
        state.setRecordModal,
        state.location,
        state.subject,
        state.date,
        state.setLocation,
        state.setSubject,
        state.setDate,
    ], shallow)

    const today = new Date();
    const oneDay = new Date(new Date().setDate(today.getDate() - 2));
    const thirtyDays = new Date(new Date().setDate(today.getDate() - date)); 


    const handleRecord = (an) => {
        const params = { an: `scf.oai.edge.fivecolleges.folio.ebsco.com.fs00001006.${an.replace(/-/g, ".")}` , db: 'cat09206a' }
        setAn(params.an)
        setDbid(params.db)
        setRecordModal(true)
        router.push(`/new/material/${material}?an=${params.an}&dbid=${params.db}`, undefined, { shallow: true });
    }

    const { loading, fetchMore, refetch } = useQuery(GET_ORDERS, {
        variables: {
            offset: 0,
            limit: limit,
            material: material,
            fundDistribution: material == 'books' || material == 'dvd' ? subject : fundDistribution,
            acquisitionsUnit: location,
            start: moment(thirtyDays).format('YYYY-MM-DD'),
            end: moment(oneDay).format('YYYY-MM-DD')
        },
        onCompleted: setRecord,
        fetchPolicy: "network-only", // Ensures data is always fetched from the server
      });
      
      useEffect(() => {
        if (router.isReady) {
          refetch({
            offset: 0,
            limit,
            material,
            fundDistribution: material === 'books' || material === 'dvd' ? subject : fundDistribution,
            acquisitionsUnit: location,
            start: moment(thirtyDays).format('YYYY-MM-DD'),
            end: moment(oneDay).format('YYYY-MM-DD'),
          });
        }
      }, [material, location, subject, date, refetch, router.isReady]);

      useEffect(() => {
        const urlDate = router.query.date
        const urlLocation = router.query.location
        const urlSubject = router.query.subject
    
        if(urlLocation){
            setLocation(urlLocation)
        }
        if(urlSubject){
            setSubject(urlSubject)
        }
        if(urlDate){
            setDate(urlDate)
        }
      }, [router.query.date, router.query.location, router.query.subject])
      

    const { folioorders } = records || [];
    const { poLines } = folioorders || [];
    const { totalRecords }  = folioorders || 0

    const handleLazyLoad = () => {
        setPage(page + 1)
        setOffset(offset + limit)
        setLoadMore(true)
        handleFetchMore()
    }

    const handleFetchMore = async () => {
        const newOffset = offset + limit;
        setLoadMore(true);
        try {
            const { data } = await fetchMore({
                variables: {
                    offset: newOffset,
                    limit: limit,
                    material: material,
                    fundDistribution: fundDistribution,
                    start: moment(thirtyDays).format('YYYY-MM-DD'),
                    end: moment(oneDay).format('YYYY-MM-DD'),
                },
            });
    
            setLoadMore(false);
            if (data.folioorders && data.folioorders.poLines) {
                setRecord(prevState => ({
                    folioorders: {
                        ...prevState.folioorders,
                        poLines: [...prevState.folioorders.poLines, ...data.folioorders.poLines],
                        totalRecords: data.folioorders.totalRecords,
                    },
                }));
            }
        } catch (error) {
            console.error('Error fetching more data:', error);
            setLoadMore(false);
        }
    };

    

    return(
        <NewMaterialDisplay
            poLines={poLines}
            totalRecords={totalRecords}
            material={material}
            loading={loading}
            page={page}
            limit={limit}
            handleRecord={handleRecord}
            handleLazyLoad={handleLazyLoad}
            loadMore={loadMore}
        />
    )
}

export default NewMaterial