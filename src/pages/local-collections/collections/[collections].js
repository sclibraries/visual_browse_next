import { useCallback, useState, useEffect, useMemo, useRef } from 'react'
import { GET_COLLECTION_CONFIG_V2, GET_COLLECTION_FACET_VALUES_V2, GET_COLLECTION_SEARCH_V2 } from '../../../lib/api'
import { useLazyQuery, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { useStore } from '../../../store/store';
import Select from 'react-select';
import { resolveLocalCollectionConfig } from '../../../lib/localCollectionConfigs';
import LocalCollectionDisplay from '../../../components/LocalCollectionDisplay';

const { getCollectionDisplayName } = require('../../../lib/collectionDisplayNames.cjs');
const {
    buildFacetOptions,
    getAppliedFilterOptions,
    getFacetValueCount,
    isDeferredFacet,
    mergeFacetOptions,
    mergeFacetValuePages,
    orderCollectionFacets,
} = require('../../../utils/collectionFacets.cjs');

const FACET_OPTIONS_LIMIT = 250;
const FACET_REMOTE_SEARCH_DEBOUNCE_MS = 250;
const FACET_VALUE_PAGE_LIMIT = 25;

const decodeQueryValue = (value) => {
    if (!value) {
        return '';
    }

    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
};

const toTitleFromSlug = (slug) => {
    if (!slug) {
        return '';
    }

    return slug
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
};

const toLegacyInstanceShape = (record) => {
    const id = record?.folioInstanceUuid || record?.instanceId || record?.id || '';

    return {
        id,
        title: record?.title || 'No Title',
        uriImage: record?.uriImage || record?.coverImageUrl || '',
        materialType: record?.materialType || '',
    };
};

const createEmptyFacetValuePage = (facet) => {
    return {
        field: facet?.field || '',
        label: facet?.label || facet?.field || '',
        page: 1,
        limit: FACET_VALUE_PAGE_LIMIT,
        total: 0,
        hasMore: false,
        values: [],
        supportsSearch: Boolean(facet?.supportsSearch),
        requiresQuery: Boolean(facet?.requiresQuery),
    };
};

const selectStyles = {
    control: (provided, state) => ({
        ...provided,
        minHeight: '40px',
        height: '40px',
        borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
        boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
        '&:hover': {
            borderColor: '#3b82f6',
        },
    }),
    valueContainer: (provided) => ({
        ...provided,
        minHeight: '38px',
        padding: '0 8px',
    }),
    indicatorsContainer: (provided) => ({
        ...provided,
        height: '38px',
    }),
    indicatorSeparator: () => ({
        display: 'none',
    }),
    menu: (provided) => ({
        ...provided,
        zIndex: 9999,
    }),
    menuPortal: (provided) => ({
        ...provided,
        zIndex: 9999,
    }),
};

function CollectionFacetSelect({
    facet,
    selectedOptions,
    facetValuesInput,
    onChange,
    isRefining,
    menuPortalTarget,
}) {
    const [inputValue, setInputValue] = useState('');
    const [debouncedInputValue, setDebouncedInputValue] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [facetValuePage, setFacetValuePage] = useState(() => createEmptyFacetValuePage(facet));
    const activeRequestRef = useRef(0);
    const [runFacetSearch, { loading: isSearchingFacet }] = useLazyQuery(GET_COLLECTION_FACET_VALUES_V2, {
        fetchPolicy: 'network-only',
    });
    const deferredFacet = isDeferredFacet(facet);
    const remoteFacetEnabled = Boolean(facetValuesInput) && (deferredFacet || facet?.truncated);
    const placeholder = facet.label || facet.field;
    const totalValues = getFacetValueCount(facet);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedInputValue(inputValue);
        }, FACET_REMOTE_SEARCH_DEBOUNCE_MS);

        return () => clearTimeout(timeoutId);
    }, [inputValue]);

    useEffect(() => {
        activeRequestRef.current += 1;
        setFacetValuePage(createEmptyFacetValuePage(facet));
        setInputValue('');
        setDebouncedInputValue('');
        setIsMenuOpen(false);
    }, [facet, facetValuesInput]);

    const trimmedInputValue = debouncedInputValue.trim();
    const canLoadFacetResults = remoteFacetEnabled && isMenuOpen;

    const loadFacetPage = useCallback(async ({ page, append, queryText }) => {
        if (!facetValuesInput) {
            return;
        }

        const requestId = activeRequestRef.current + 1;
        activeRequestRef.current = requestId;

        try {
            const { data } = await runFacetSearch({
                variables: {
                    input: {
                        ...facetValuesInput,
                        field: facet.field,
                        q: queryText || undefined,
                        page,
                        limit: FACET_VALUE_PAGE_LIMIT,
                    },
                },
            });

            if (requestId !== activeRequestRef.current) {
                return;
            }

            const payload = data?.collectionFacetValuesV2;
            if (!payload) {
                setFacetValuePage(createEmptyFacetValuePage(facet));
                return;
            }

            setFacetValuePage((previous) => ({
                ...payload,
                values: append ? mergeFacetValuePages(previous.values, payload.values || []) : (payload.values || []),
            }));
        } catch (error) {
            if (requestId === activeRequestRef.current) {
                console.error(`Error searching facet values for ${facet.field}:`, error);
                if (!append) {
                    setFacetValuePage(createEmptyFacetValuePage(facet));
                }
            }
        }
    }, [facet, facetValuesInput, runFacetSearch]);

    useEffect(() => {
        if (!remoteFacetEnabled || !isMenuOpen) {
            return;
        }

        loadFacetPage({
            page: 1,
            append: false,
            queryText: trimmedInputValue || undefined,
        });
    }, [deferredFacet, facet, isMenuOpen, loadFacetPage, remoteFacetEnabled, trimmedInputValue]);

    const visibleFacet = useMemo(() => {
        if (!remoteFacetEnabled) {
            return facet;
        }

        return {
            ...facet,
            values: facetValuePage.values,
        };
    }, [facet, facetValuePage.values, remoteFacetEnabled]);

    const facetOptions = useMemo(() => {
        const baseOptions = buildFacetOptions(visibleFacet, remoteFacetEnabled ? '' : inputValue, FACET_OPTIONS_LIMIT);
        return mergeFacetOptions(selectedOptions, baseOptions);
    }, [inputValue, remoteFacetEnabled, selectedOptions, visibleFacet]);

    const helperText = deferredFacet
        ? (isSearchingFacet
            ? 'Loading values...'
            : (facetValuePage.total > 0
                ? `Showing ${facetOptions.length} of ${facetValuePage.total} values${facetValuePage.hasMore ? '. Scroll for more.' : '.'}`
                : 'Browse values or type to search.'))
        : (remoteFacetEnabled
            ? (isSearchingFacet
                ? 'Loading values...'
                : (facetValuePage.total > 0
                    ? `Showing ${facetOptions.length} of ${facetValuePage.total} values${facetValuePage.hasMore ? '. Scroll for more.' : '.'}`
                    : 'Open to browse values.'))
        : (totalValues > FACET_OPTIONS_LIMIT
            ? (inputValue.trim()
                ? `Showing up to ${FACET_OPTIONS_LIMIT} matches`
                : `Type to narrow ${totalValues.toLocaleString()} options`)
            : ''));

    return (
        <div className="collections-inline-item collections-inline-item-facet">
            <Select
                inputId={`facet-${facet.field}`}
                options={facetOptions}
                value={selectedOptions}
                onChange={onChange}
                placeholder={placeholder}
                styles={selectStyles}
                classNamePrefix="collection-select"
                isMulti
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                noOptionsMessage={() => {
                    if (remoteFacetEnabled && isSearchingFacet) {
                        return 'Loading values...';
                    }

                    if (!remoteFacetEnabled && totalValues > FACET_OPTIONS_LIMIT && !inputValue.trim()) {
                        return `Type to search ${placeholder.toLowerCase()}`;
                    }

                    return 'No matching values';
                }}
                aria-label={placeholder}
                menuPortalTarget={menuPortalTarget}
                menuPosition="fixed"
                isDisabled={isRefining}
                filterOption={null}
                onMenuOpen={() => setIsMenuOpen(true)}
                onMenuClose={() => {
                    activeRequestRef.current += 1;
                    setIsMenuOpen(false);
                    setInputValue('');
                    setDebouncedInputValue('');
                    if (remoteFacetEnabled) {
                        setFacetValuePage(createEmptyFacetValuePage(facet));
                    }
                }}
                onMenuScrollToBottom={() => {
                    if (!remoteFacetEnabled || !facetValuePage.hasMore || isSearchingFacet || !canLoadFacetResults) {
                        return;
                    }

                    loadFacetPage({
                        page: (facetValuePage.page || 1) + 1,
                        append: true,
                        queryText: trimmedInputValue || undefined,
                    });
                }}
                inputValue={inputValue}
                onInputChange={(nextInput, actionMeta) => {
                    if (actionMeta.action === 'input-change') {
                        setInputValue(nextInput);
                    }

                    return nextInput;
                }}
            />
            {helperText ? (
                <div className="collections-facet-helper-text">
                    {helperText}
                </div>
            ) : null}
        </div>
    );
}


function FolioLocationsMaterial(){
    const router = useRouter();
    const { collections } = router.query;
    const [page, setPage] = useState(1);
    const [limit] = useState(15);
    const [loadMore, setLoadMore] = useState(false);
    const [records, setRecords] = useState({ instances: [], totalRecords: 0 });
    const [facetState, setFacetState] = useState({ facets: [], availableSorts: [], appliedFilters: [] });
    const [recordLookup, setRecordLookup] = useState({});
    const [selectedSort, setSelectedSort] = useState('');
    const [selectedFacetValues, setSelectedFacetValues] = useState({});
    const [menuPortalTarget, setMenuPortalTarget] = useState(null);
    const collectionParam = Array.isArray(collections) ? collections[0] : collections || '';
    const localCollectionConfig = useMemo(() => resolveLocalCollectionConfig(collectionParam), [collectionParam]);
    const slug = localCollectionConfig?.slug || collectionParam;
    const searchParam = Array.isArray(router.query.search) ? router.query.search[0] : router.query.search;
    const collectionSearchQuery = decodeQueryValue(searchParam);

    const [setAn,setDbid, setRecordModal, setIsStreaming, setIsStreamingImageUrl, setRecordImageOverride] = useStore(state => [
        state.setAn,
        state.setDbid,
        state.setRecordModal,
        state.setIsStreaming,
        state.setIsStreamingImageUrl,
        state.setRecordImageOverride,
    ])

    const { data: configData } = useQuery(GET_COLLECTION_CONFIG_V2, {
        variables: { slug },
        skip: !slug,
        fetchPolicy: 'network-only',
    });

    const filters = useMemo(() => {
        const entries = Object.entries(selectedFacetValues || {});
        const normalized = [];

        for (const [field, values] of entries) {
            if (Array.isArray(values) && values.length > 0) {
                normalized.push({ field, operator: 'IN', values });
            }
        }

        return normalized;
    }, [selectedFacetValues]);

    const searchInput = useMemo(() => {
        if (!slug) {
            return null;
        }

        return {
            slug,
            page: 1,
            limit,
            q: collectionSearchQuery || undefined,
            sort: selectedSort || undefined,
            filters: filters.length > 0 ? filters : undefined,
        };
    }, [collectionSearchQuery, filters, limit, selectedSort, slug]);

    const facetValuesInput = useMemo(() => {
        if (!slug) {
            return null;
        }

        return {
            slug,
            searchQ: collectionSearchQuery || undefined,
            filters: filters.length > 0 ? filters : undefined,
        };
    }, [collectionSearchQuery, filters, slug]);

    const { loading: loadingV2, fetchMore: fetchMoreV2 } = useQuery(GET_COLLECTION_SEARCH_V2, {
        variables: {
            input: searchInput,
        },
        skip: !searchInput,
        fetchPolicy: 'network-only',
        onCompleted: (data) => {
            const payload = data?.collectionSearchV2;
            const mappedInstances = (payload?.records || []).map(toLegacyInstanceShape);
            const lookup = {};

            for (const record of payload?.records || []) {
                const keys = [record?.folioInstanceUuid, record?.instanceId, record?.id];
                for (const key of keys) {
                    if (key) {
                        lookup[key] = record;
                    }
                }
            }

            setRecordLookup(lookup);
            setRecords({
                instances: mappedInstances,
                totalRecords: payload?.total || 0,
            });
            setFacetState({
                facets: payload?.facets || [],
                availableSorts: payload?.availableSorts || [],
                appliedFilters: payload?.appliedFilters || [],
            });
            setPage(1);
        },
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setMenuPortalTarget(window.document.body);
        }
    }, []);

    useEffect(() => {
        if (!slug) {
            return;
        }

        setSelectedSort('');
        setSelectedFacetValues({});
    }, [slug]);

    const orderedFacets = useMemo(() => {
        return orderCollectionFacets(facetState.facets, configData?.collectionConfigV2?.facetConfig);
    }, [configData?.collectionConfigV2?.facetConfig, facetState.facets]);

    const visibleOrderedFacets = useMemo(() => {
        return orderedFacets.filter((facet) => facet?.field !== 'materialType' && !/format/i.test(facet?.label || ''));
    }, [orderedFacets]);

    const availableSorts = useMemo(() => {
        return (
            (facetState.availableSorts && facetState.availableSorts.length > 0
                ? facetState.availableSorts
                : configData?.collectionConfigV2?.sortConfig) || []
        );
    }, [configData?.collectionConfigV2?.sortConfig, facetState.availableSorts]);

    const sortOptions = useMemo(() => {
        return [
            { value: '', label: 'Default Sort' },
            ...availableSorts.map((sortOption) => ({
                value: sortOption.value,
                label: sortOption.label || sortOption.value,
            })),
        ];
    }, [availableSorts]);

    const selectedSortOption = sortOptions.find((option) => option.value === selectedSort) || sortOptions[0];

    const activeFilterCount = useMemo(() => {
        return Object.values(selectedFacetValues || {}).reduce((total, values) => {
            if (!Array.isArray(values)) {
                return total;
            }

            return total + values.length;
        }, 0);
    }, [selectedFacetValues]);

    const handleSortChange = (selectedOption) => {
        setSelectedSort(selectedOption ? selectedOption.value : '');
    };

    const handleFacetSelectChange = (field, selectedOptions) => {
        const nextValues = (selectedOptions || []).map((option) => option.value);
        setSelectedFacetValues((previous) => {
            const next = { ...previous };
            if (nextValues.length === 0) {
                delete next[field];
            } else {
                next[field] = nextValues;
            }

            return next;
        });
    };

    const clearAllFacets = () => {
        setSelectedFacetValues({});
    };

    const isRefining = loadingV2 && records.instances.length > 0;

    const collectionTitle = getCollectionDisplayName(
        slug,
        configData?.collectionConfigV2?.title ||
        localCollectionConfig?.title ||
        toTitleFromSlug(slug)
    );


    const handleLazyLoad = () => {
        setPage(page + 1)
        setLoadMore(true)
        handleFetchMore()
    }

    const handleRecord = (an, imageUrl) => {
        const selectedRecord = recordLookup[an];
        const isStreaming = Boolean(selectedRecord?.isStreaming || localCollectionConfig?.isStreaming);

        if(isStreaming){
            setIsStreaming(true)
            setIsStreamingImageUrl(selectedRecord?.streamingUrl || imageUrl)
        } else {
            setIsStreaming(false)
            setIsStreamingImageUrl('')
        }
        const anSource = selectedRecord?.folioInstanceUuid || an;
        const coverImage = imageUrl || selectedRecord?.uriImage || selectedRecord?.coverImageUrl || '';
        const params = { an: `scf.oai.edge.fivecolleges.folio.ebsco.com.fs00001006.${anSource.replace(/-/g, ".")}` , db: 'cat09206a' }
        setRecordImageOverride(coverImage)
        setAn(params.an)
        setDbid(params.db)
        setRecordModal(true)
        const imageQuery = coverImage ? `&img=${encodeURIComponent(coverImage)}` : '';
        router.push(`/local-collections/collections/${collections}?an=${params.an}&dbid=${params.db}${imageQuery}`, undefined, { shallow: true });
    }


    const handleFetchMore = async () => {
        const nextPage = page + 1;
        setLoadMore(true);

        try {
            const { data } = await fetchMoreV2({
                variables: {
                    input: {
                        slug,
                        page: nextPage,
                        limit,
                        q: collectionSearchQuery || undefined,
                        sort: selectedSort || undefined,
                        filters: filters.length > 0 ? filters : undefined,
                    },
                },
            });

            const payload = data?.collectionSearchV2;
            const incomingRecords = payload?.records || [];

            setRecordLookup((prevLookup) => {
                const updatedLookup = { ...prevLookup };

                for (const record of incomingRecords) {
                    const keys = [record?.folioInstanceUuid, record?.instanceId, record?.id];
                    for (const key of keys) {
                        if (key) {
                            updatedLookup[key] = record;
                        }
                    }
                }

                return updatedLookup;
            });

            setRecords(prevState => {
                const seen = {};
                for (const instance of prevState.instances) {
                    if (instance?.id) {
                        seen[instance.id] = true;
                    }
                }

                const mergedInstances = [...prevState.instances];
                for (const record of incomingRecords) {
                    const normalized = toLegacyInstanceShape(record);
                    if (normalized.id && !seen[normalized.id]) {
                        seen[normalized.id] = true;
                        mergedInstances.push(normalized);
                    }
                }

                return {
                    instances: mergedInstances,
                    totalRecords: payload?.total ?? prevState.totalRecords,
                };
            });

            setFacetState((previous) => ({
                facets: payload?.facets || previous.facets,
                availableSorts: payload?.availableSorts || previous.availableSorts,
                appliedFilters: payload?.appliedFilters || previous.appliedFilters,
            }));

            setPage(nextPage);
        } catch (error) {
            console.error('Error fetching more data:', error);
        } finally {
            setLoadMore(false);
        }
    };

    const headerContent = (
        <div className="card border-0 shadow-sm collections-facet-toolbar">
            <div className="card-body">
                <div className="collections-facet-header">
                    <span className="collections-facet-active-count">
                        {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'} selected
                    </span>
                    {isRefining ? (
                        <span className="collections-refining-indicator">
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" /> Updating...
                        </span>
                    ) : null}
                </div>

                <div className="collections-facet-primary-row mb-3">
                    {visibleOrderedFacets.map((facet) => {
                        return (
                            <CollectionFacetSelect
                                key={facet.field}
                                facet={facet}
                                selectedOptions={getAppliedFilterOptions(
                                    facetState.appliedFilters,
                                    facet.field,
                                    selectedFacetValues[facet.field] || [],
                                )}
                                facetValuesInput={facetValuesInput}
                                onChange={(selectedOptionsForField) =>
                                    handleFacetSelectChange(facet.field, selectedOptionsForField)
                                }
                                isRefining={isRefining}
                                menuPortalTarget={menuPortalTarget}
                            />
                        );
                    })}
                </div>

                <div className="d-flex align-items-center gap-2 flex-wrap">
                    <div style={{ width: 220 }}>
                        <Select
                            inputId="local-collection-sort"
                            value={selectedSortOption}
                            onChange={handleSortChange}
                            options={sortOptions}
                            styles={selectStyles}
                            isSearchable={false}
                            classNamePrefix="collection-select"
                            aria-label="Sort options"
                            menuPortalTarget={menuPortalTarget}
                            menuPosition="fixed"
                            isDisabled={isRefining}
                        />
                    </div>
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={clearAllFacets}
                        disabled={activeFilterCount === 0}
                    >
                        Clear Filters
                    </button>
                </div>
            </div>
        </div>
    );


return(
    <LocalCollectionDisplay 
        handleRecord={handleRecord}
        handleLazyLoad={handleLazyLoad}
        instances={records.instances}
        collectionSlug={slug}
        poLines={records.instances} // Add this for favorites functionality
        totalRecords={records.totalRecords}
        loadMore={loadMore}
        collectionTitle={collectionTitle}
        loading={loadingV2 && records.instances.length === 0}
        page={page}   
        limit={limit}
        headerContent={headerContent}
    />
);
}


export default FolioLocationsMaterial