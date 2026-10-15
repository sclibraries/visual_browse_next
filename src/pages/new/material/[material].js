import { useState, useEffect } from 'react'
import { GET_COLLECTION_SEARCH_V2, GET_ORDERS } from '../../../lib/api'
import { useQuery } from '@apollo/client'
import moment from 'moment';
import { useRouter } from 'next/router';
import { useStore } from '../../../store/store';
import { useShallow } from 'zustand/react/shallow'
import NewMaterialDisplay from '../../../components/NewMaterialDisplay';

const V2_NEW_MATERIAL_SLUG = 'new-material';

const toLegacyPoLineShape = (record) => {
    const folioInstanceUuid = record?.folioInstanceUuid || record?.instanceId || record?.id || '';
    const contributors = (record?.contributors || []).map((contributor) => ({
        name: contributor?.name || '',
        primary: Boolean(contributor?.primary),
    }));
    const identifiers = (record?.identifiers || []).map((identifier) => ({
        value: identifier?.value || '',
        identifierTypeId: identifier?.type || '',
    }));
    const publication = {
        publisher: record?.publisher || '',
        dateOfPublication: record?.publicationYear ? String(record.publicationYear) : '',
    };
    const materialTypeName = record?.materialType || '';

    return {
        id: record?.id || folioInstanceUuid,
        instanceId: folioInstanceUuid,
        folioInstanceUuid,
        uriImage: record?.uriImage || record?.coverImageUrl || '',
        coverImageUrl: record?.coverImageUrl || record?.uriImage || '',
        titleOrPackage: record?.title || 'No Title',
        retrieveorderitems: {
            instances: [
                {
                    id: folioInstanceUuid,
                    title: record?.title || 'No Title',
                    items: [
                        {
                            materialTypeId: materialTypeName,
                            retrievemattype: [{
                                id: materialTypeName,
                                name: materialTypeName,
                            }],
                        },
                    ],
                    contributors,
                    publication,
                    electronicAccess: record?.streamingUrl ? [{
                        uri: record.streamingUrl,
                        linkText: 'Streaming Access',
                    }] : [],
                    identifiers,
                },
            ],
        },
    };
};

const appendUniquePoLines = (existingPoLines, incomingPoLines) => {
    const seen = {};
    const merged = [];

    for (const line of existingPoLines || []) {
        const key = line?.instanceId || line?.id;
        if (key && !seen[key]) {
            seen[key] = true;
            merged.push(line);
        }
    }

    for (const line of incomingPoLines || []) {
        const key = line?.instanceId || line?.id;
        if (key && !seen[key]) {
            seen[key] = true;
            merged.push(line);
        }
    }

    return merged;
};

function NewMaterial() {
    const router = useRouter();
    const useV2NewMaterial =
        process.env.NEXT_PUBLIC_USE_COLLECTIONS_V2_NEW_MATERIAL === 'true' ||
        process.env.NEXT_PUBLIC_USE_COLLECTIONS_V2_NAV === 'true';
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

    const [setAn,setDbid, setRecordModal, setRecordImageOverride, location, subject, date, setLocation, setSubject, setDate] = useStore(useShallow(state => [
        state.setAn,
        state.setDbid,
        state.setRecordModal,
        state.setRecordImageOverride,
        state.location,
        state.subject,
        state.date,
        state.setLocation,
        state.setSubject,
        state.setDate,
    ]))

    const today = new Date();
    const oneDay = new Date(new Date().setDate(today.getDate() - 2));
    const thirtyDays = new Date(new Date().setDate(today.getDate() - date)); 
    const dateStart = moment(thirtyDays).format('YYYY-MM-DD');
    const dateEnd = moment(oneDay).format('YYYY-MM-DD');

    const v2Filters = [];
    if (location) {
        v2Filters.push({ field: 'acquisitionsUnit', operator: 'EQ', values: [String(location)] });
    }
    if ((material === 'books' || material === 'dvd') && subject) {
        v2Filters.push({ field: 'fundDistribution', operator: 'EQ', values: [String(subject)] });
    }
    if (material) {
        v2Filters.push({ field: 'material', operator: 'EQ', values: [String(material)] });
    }


    const handleRecord = (an, imageUrl) => {
        const selectedLine = (poLines || []).find((line) => line?.instanceId === an || line?.id === an);
        const anSource = selectedLine?.folioInstanceUuid || an;
        const coverImage = imageUrl || selectedLine?.uriImage || selectedLine?.coverImageUrl || '';
        const params = { an: `scf.oai.edge.fivecolleges.folio.ebsco.com.fs00001006.${anSource.replace(/-/g, ".")}` , db: 'cat09206a' }
        setRecordImageOverride(coverImage)
        setAn(params.an)
        setDbid(params.db)
        setRecordModal(true)
        const imageQuery = coverImage ? `&img=${encodeURIComponent(coverImage)}` : '';
        router.push(`/new/material/${material}?an=${params.an}&dbid=${params.db}${imageQuery}`, undefined, { shallow: true });
    }

        const { loading: loadingLegacy, fetchMore: fetchMoreLegacy, refetch: refetchLegacy } = useQuery(GET_ORDERS, {
        variables: {
            offset: 0,
            limit: limit,
            material: material,
            fundDistribution: material == 'books' || material == 'dvd' ? subject : fundDistribution,
            acquisitionsUnit: location,
                        start: dateStart,
                        end: dateEnd
        },
                skip: useV2NewMaterial,
        onCompleted: setRecord,
        fetchPolicy: "network-only", // Ensures data is always fetched from the server
      });

            const { loading: loadingV2, fetchMore: fetchMoreV2, refetch: refetchV2 } = useQuery(GET_COLLECTION_SEARCH_V2, {
                variables: {
                        input: {
                                slug: V2_NEW_MATERIAL_SLUG,
                                page: 1,
                                limit,
                                dateFrom: dateStart,
                                dateTo: dateEnd,
                                filters: v2Filters,
                        },
                },
                skip: !useV2NewMaterial,
                fetchPolicy: 'network-only',
                onCompleted: (data) => {
                        const payload = data?.collectionSearchV2;
                        const poLines = (payload?.records || []).map(toLegacyPoLineShape);
                        setRecord({
                                folioorders: {
                                        poLines,
                                        totalRecords: payload?.total || 0,
                                },
                        });
                        setPage(1);
                        setOffset(0);
                },
            });
      
      useEffect(() => {
        if (router.isReady) {
                    if (useV2NewMaterial) {
                        refetchV2({
                                input: {
                                        slug: V2_NEW_MATERIAL_SLUG,
                                        page: 1,
                                        limit,
                                        dateFrom: dateStart,
                                        dateTo: dateEnd,
                                        filters: v2Filters,
                                },
                        });
                    } else {
                        refetchLegacy({
                                offset: 0,
                                limit,
                                material,
                                fundDistribution: material === 'books' || material === 'dvd' ? subject : fundDistribution,
                                acquisitionsUnit: location,
                                start: dateStart,
                                end: dateEnd,
                        });
                    }
        }
            }, [dateEnd, dateStart, limit, location, material, refetchLegacy, refetchV2, router.isReady, subject, useV2NewMaterial]);

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
    const loading = useV2NewMaterial ? loadingV2 : loadingLegacy;

    const handleLazyLoad = () => {
        setLoadMore(true)
        handleFetchMore()
    }

    const handleFetchMore = async () => {
        const nextPage = page + 1;
        const newOffset = offset + limit;
        setLoadMore(true);

        try {
            if (useV2NewMaterial) {
                const { data } = await fetchMoreV2({
                    variables: {
                        input: {
                            slug: V2_NEW_MATERIAL_SLUG,
                            page: nextPage,
                            limit,
                            dateFrom: dateStart,
                            dateTo: dateEnd,
                            filters: v2Filters,
                        },
                    },
                });

                const payload = data?.collectionSearchV2;
                const incomingPoLines = (payload?.records || []).map(toLegacyPoLineShape);

                setRecord(prevState => ({
                    folioorders: {
                        ...prevState.folioorders,
                        poLines: appendUniquePoLines(prevState?.folioorders?.poLines, incomingPoLines),
                        totalRecords: payload?.total ?? prevState?.folioorders?.totalRecords ?? 0,
                    },
                }));
            } else {
                const { data } = await fetchMoreLegacy({
                    variables: {
                        offset: newOffset,
                        limit: limit,
                        material: material,
                        fundDistribution: fundDistribution,
                        start: dateStart,
                        end: dateEnd,
                    },
                });

                if (data.folioorders && data.folioorders.poLines) {
                    setRecord(prevState => ({
                        folioorders: {
                            ...prevState.folioorders,
                            poLines: [...prevState.folioorders.poLines, ...data.folioorders.poLines],
                            totalRecords: data.folioorders.totalRecords,
                        },
                    }));
                }
            }

            setPage(nextPage);
            setOffset(newOffset);
        } catch (error) {
            console.error('Error fetching more data:', error);
        } finally {
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