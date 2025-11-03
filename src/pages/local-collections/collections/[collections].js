import { useState, useEffect} from 'react'
import { FOLIO_SEARCH } from '../../../lib/api'
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { useStore } from '../../../store/store';
import { localCollections } from '../../../lib/endpoints';
import LocalCollectionDisplay from '../../../components/LocalCollectionDisplay';


function FolioLocationsMaterial(){
    const router = useRouter();
    const [endpoint, setEndpoint] = useState('');
    const { collections } = router.query;
    const [offset, setOffset] = useState(0);
    const [page, setPage] = useState(1);
    const [limit] = useState(15);
    const [loadMore, setLoadMore] = useState(false);
    //test
    const [records, setRecords] = useState({ instances: [], totalRecords: 0 });

    const [setAn,setDbid, setRecordModal, setIsStreaming, setIsStreamingImageUrl] = useStore(state => [
        state.setAn,
        state.setDbid,
        state.setRecordModal,
        state.setIsStreaming,
        state.setIsStreamingImageUrl
    ])

    console.log(records)

    useEffect(() => {
        if(collections){
            setEndpoint(localCollections[collections]['endpoint'])
        }
    }, [collections])

    const collectionTitle = collections ? localCollections[collections]['title'] : ''


    const { loading, fetchMore, refetch } = useQuery(FOLIO_SEARCH, {
        variables: {
            offset: 0,
            limit: limit,
            query: endpoint,
        },
        fetchPolicy: 'network-only', // This should be outside `variables`
        onCompleted: data => {
            setRecords({
                instances: data.foliosearch.instances,
                totalRecords: data.foliosearch.totalRecords
            });
        }        
    });
    
    useEffect(() => {
      if(endpoint) {
        refetch({
          offset: 0,
          limit,
          query: endpoint,
        });
      }
    }, [endpoint, refetch, limit]);

    // const { foliosearch } =  records || [];
    // const { instances } = foliosearch || [];
    // const { totalRecords }  = foliosearch || 0


    const handleLazyLoad = () => {
        setPage(page + 1)
        setOffset(offset + limit)
        setLoadMore(true)
        handleFetchMore()
    }

    const handleRecord = (an, imageUrl) => {
        if(collections === 'swank'){
            setIsStreaming(true)
            setIsStreamingImageUrl(imageUrl)
        }
        const params = { an: `scf.oai.edge.fivecolleges.folio.ebsco.com.fs00001006.${an.replace(/-/g, ".")}` , db: 'cat09206a' }
        setAn(params.an)
        setDbid(params.db)
        setRecordModal(true)
        router.push(`/local-collections/collections/${collections}?an=${params.an}&dbid=${params.db}`, undefined, { shallow: true });
    }


    const handleFetchMore = async () => {
        const newOffset = offset + limit;
        console.log(`Fetching more data: offset=${newOffset}, limit=${limit}`);
        setLoadMore(true);
        try {
            const { data } = await fetchMore({
                variables: { offset: newOffset, limit, query: endpoint },
            });
            console.log("Fetched data:", data);
            setLoadMore(false);
    
            if (data.foliosearch && data.foliosearch.instances.length > 0) {
                setRecords(prevState => {
                    const updatedInstances = [...prevState.instances, ...data.foliosearch.instances];
                    const updatedTotalRecords = data.foliosearch.totalRecords;
                    console.log("Previous state:", prevState);
                    const newState = {
                        instances: updatedInstances,
                        totalRecords: updatedTotalRecords,
                    };
                    setRecords(newState)
                    console.log("New state:", newState);
                    return newState;
                });
            }
        } catch (error) {
            console.error('Error fetching more data:', error);
            setLoadMore(false);
        }
    };
    

console.log(records)


return(
    <LocalCollectionDisplay 
        handleRecord={handleRecord}
        handleLazyLoad={handleLazyLoad}
        instances={records.instances}
        poLines={records.instances} // Add this for favorites functionality
        totalRecords={records.totalRecords}
        loadMore={loadMore}
        collectionTitle={collectionTitle}
        loading={loading}
        page={page}   
        limit={limit}             
    />
);
}


export default FolioLocationsMaterial