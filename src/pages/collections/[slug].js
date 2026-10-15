import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLazyQuery, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { useShallow } from 'zustand/react/shallow';
import { Collapse } from 'reactstrap';
import Select from 'react-select';
import Slider from '@mui/material/Slider';
import LocalCollectionDisplay from '../../components/LocalCollectionDisplay';
import { GET_COLLECTION_CONFIG_V2, GET_COLLECTION_FACET_VALUES_V2, GET_COLLECTION_SEARCH_V2 } from '../../lib/api';
import { useStore } from '../../store/store';

const { getCollectionDisplayName } = require('../../lib/collectionDisplayNames.cjs');
const {
  buildFacetOptions,
  getAppliedFilterOptions,
  getFacetValueCount,
  isDeferredFacet,
  mergeFacetOptions,
  mergeFacetValuePages,
  orderCollectionFacets,
  splitFacetControls,
} = require('../../utils/collectionFacets.cjs');

const PAGE_SIZE = 15;
const FACET_OPTIONS_LIMIT = 250;
const FACET_REMOTE_SEARCH_DEBOUNCE_MS = 250;
const FACET_VALUE_PAGE_LIMIT = 25;
const MIN_YEAR = 1600;

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

const toTitleFromSlug = (slug) => {
  if (!slug) {
    return 'Collection';
  }

  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const toCardInstance = (record) => {
  const instanceId = record?.folioInstanceUuid || record?.instanceId || record?.id || '';

  return {
    id: instanceId,
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

  const isLargeFacet = totalValues > FACET_OPTIONS_LIMIT;
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
    : (isLargeFacet
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

          if (!remoteFacetEnabled && isLargeFacet && !inputValue.trim()) {
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

function SqlCollectionPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [loadMore, setLoadMore] = useState(false);
  const [searchState, setSearchState] = useState({
    records: [],
    total: 0,
    facets: [],
    appliedFilters: [],
    availableSorts: [],
  });
  const [selectedSort, setSelectedSort] = useState('');
  const [selectedFacetValues, setSelectedFacetValues] = useState({});
  const [menuPortalTarget, setMenuPortalTarget] = useState(null);
  const currentYear = new Date().getFullYear();
  const defaultDateRange = useMemo(() => [MIN_YEAR, currentYear], [currentYear]);
  const [pendingDateRange, setPendingDateRange] = useState(defaultDateRange);
  const [appliedDateRange, setAppliedDateRange] = useState(defaultDateRange);
  const [isDateSliderOpen, setIsDateSliderOpen] = useState(false);
  const [isAdditionalFiltersOpen, setIsAdditionalFiltersOpen] = useState(false);
  const [customLow, setCustomLow] = useState(String(MIN_YEAR));
  const [customHigh, setCustomHigh] = useState(String(currentYear));

  const slugParam = router.query.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam || '';
  const searchParam = Array.isArray(router.query.search) ? router.query.search[0] : router.query.search;
  const collectionSearchQuery = decodeQueryValue(searchParam);

  const [setAn, setDbid, setRecordModal, setIsStreaming, setIsStreamingImageUrl, setRecordImageOverride] = useStore(useShallow((state) => [
      state.setAn,
      state.setDbid,
      state.setRecordModal,
      state.setIsStreaming,
      state.setIsStreamingImageUrl,
      state.setRecordImageOverride,
    ]));

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

  const baseSearchInput = useMemo(() => {
    if (!slug) {
      return null;
    }

    return {
      slug,
      page: 1,
      limit: PAGE_SIZE,
      q: collectionSearchQuery || undefined,
      sort: selectedSort || undefined,
      filters: filters.length > 0 ? filters : undefined,
      dateFrom: `${appliedDateRange[0]}-01-01`,
      dateTo: `${appliedDateRange[1]}-12-31`,
    };
  }, [appliedDateRange, collectionSearchQuery, filters, selectedSort, slug]);

  const facetSearchBaseInput = useMemo(() => {
    if (!slug) {
      return null;
    }

    return {
      slug,
      searchQ: baseSearchInput?.q || undefined,
      searchField: baseSearchInput?.field || undefined,
      filters: filters.length > 0 ? filters : undefined,
      dateFrom: `${appliedDateRange[0]}-01-01`,
      dateTo: `${appliedDateRange[1]}-12-31`,
    };
  }, [appliedDateRange, baseSearchInput, filters, slug]);

  const { loading, fetchMore } = useQuery(GET_COLLECTION_SEARCH_V2, {
    variables: {
      input: baseSearchInput,
    },
    skip: !baseSearchInput,
    fetchPolicy: 'network-only',
    onCompleted: (result) => {
      const payload = result?.collectionSearchV2;
      setSearchState({
        records: payload?.records || [],
        total: payload?.total || 0,
        facets: payload?.facets || [],
        appliedFilters: payload?.appliedFilters || [],
        availableSorts: payload?.availableSorts || [],
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
    setPendingDateRange(defaultDateRange);
    setAppliedDateRange(defaultDateRange);
    setCustomLow(String(defaultDateRange[0]));
    setCustomHigh(String(defaultDateRange[1]));
    setIsDateSliderOpen(false);
    setIsAdditionalFiltersOpen(false);
  }, [defaultDateRange, slug]);

  const recordLookup = useMemo(() => {
    const lookup = {};

    for (const record of searchState.records || []) {
      const keys = [record?.folioInstanceUuid, record?.instanceId, record?.id];
      for (const key of keys) {
        if (key) {
          lookup[key] = record;
        }
      }
    }

    return lookup;
  }, [searchState.records]);

  const instances = useMemo(() => {
    return (searchState.records || []).map(toCardInstance);
  }, [searchState.records]);

  const orderedFacets = useMemo(() => {
    return orderCollectionFacets(searchState.facets, configData?.collectionConfigV2?.facetConfig);
  }, [configData?.collectionConfigV2?.facetConfig, searchState.facets]);

  const visibleOrderedFacets = useMemo(() => {
    if (slug !== 'audio-cds') {
      return orderedFacets;
    }

    return orderedFacets.filter((facet) => facet?.field !== 'materialType' && !/format/i.test(facet?.label || ''));
  }, [orderedFacets, slug]);

  const { primaryFacets, additionalFacets } = useMemo(() => {
    if (slug === 'audio-cds') {
      return {
        primaryFacets: visibleOrderedFacets,
        additionalFacets: [],
      };
    }

    return splitFacetControls(visibleOrderedFacets, slug);
  }, [slug, visibleOrderedFacets]);

  const availableSorts = useMemo(() => {
    return (
      (searchState.availableSorts && searchState.availableSorts.length > 0
        ? searchState.availableSorts
        : configData?.collectionConfigV2?.sortConfig) || []
    );
  }, [configData?.collectionConfigV2?.sortConfig, searchState.availableSorts]);

  const activeFilterCount = useMemo(() => {
    return Object.values(selectedFacetValues || {}).reduce((total, values) => {
      if (!Array.isArray(values)) {
        return total;
      }

      return total + values.length;
    }, 0);
  }, [selectedFacetValues]);

  const clearAllFacets = () => {
    setSelectedFacetValues({});
  };

  const toggleDateSlider = () => {
    setIsDateSliderOpen((open) => !open);
  };

  const resetDateRange = () => {
    setPendingDateRange(defaultDateRange);
    setAppliedDateRange(defaultDateRange);
    setCustomLow(String(defaultDateRange[0]));
    setCustomHigh(String(defaultDateRange[1]));
  };

  const handlePreset = (yearsAgo) => {
    const low = currentYear - yearsAgo;
    const newRange = [low, currentYear];
    setPendingDateRange(newRange);
    setAppliedDateRange(newRange);
    setCustomLow(String(low));
    setCustomHigh(String(currentYear));
  };

  const handleCustomRangeSet = () => {
    const low = Math.max(MIN_YEAR, Math.min(parseInt(customLow, 10) || MIN_YEAR, currentYear));
    const high = Math.max(low, Math.min(parseInt(customHigh, 10) || currentYear, currentYear));
    const newRange = [low, high];
    setPendingDateRange(newRange);
    setAppliedDateRange(newRange);
  };

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

  const handleSortChange = (selectedOption) => {
    setSelectedSort(selectedOption ? selectedOption.value : '');
  };

  const handleDateRangeChange = (_event, newValue) => {
    if (Array.isArray(newValue)) {
      setPendingDateRange(newValue);
    }
  };

  const handleDateRangeCommit = (_event, newValue) => {
    if (Array.isArray(newValue)) {
      setAppliedDateRange(newValue);
    }
  };

  const handleFacetSelectChange = (field, nextSelectedOptions) => {
    const nextValues = (nextSelectedOptions || []).map((option) => option.value);

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

  const additionalFacetFields = useMemo(() => {
    const fieldLookup = {};

    for (const facet of additionalFacets) {
      fieldLookup[facet.field] = true;
    }

    return fieldLookup;
  }, [additionalFacets]);

  const hiddenActiveFilterCount = useMemo(() => {
    return Object.entries(selectedFacetValues || {}).reduce((total, [field, values]) => {
      if (!additionalFacetFields[field] || !Array.isArray(values)) {
        return total;
      }

      return total + values.length;
    }, 0);
  }, [additionalFacetFields, selectedFacetValues]);

  useEffect(() => {
    if (hiddenActiveFilterCount > 0) {
      setIsAdditionalFiltersOpen(true);
    }
  }, [hiddenActiveFilterCount]);

  const isRefining = loading && searchState.records.length > 0;

  const handleRecord = (instanceId, imageUrl) => {
    if (!instanceId) {
      return;
    }

    const selectedRecord = recordLookup[instanceId];

    if (selectedRecord?.isStreaming) {
      setIsStreaming(true);
      setIsStreamingImageUrl(
        selectedRecord.streamingUrl || imageUrl || selectedRecord.uriImage || selectedRecord.coverImageUrl || '',
      );
    } else {
      setIsStreaming(false);
      setIsStreamingImageUrl('');
    }

    const anSource = selectedRecord?.folioInstanceUuid || instanceId;
    const coverImage = imageUrl || selectedRecord?.uriImage || selectedRecord?.coverImageUrl || '';
    const params = {
      an: `scf.oai.edge.fivecolleges.folio.ebsco.com.fs00001006.${anSource.replace(/-/g, '.')}`,
      db: 'cat09206a',
    };

    setRecordImageOverride(coverImage);
    setAn(params.an);
    setDbid(params.db);
    setRecordModal(true);
    const imageQuery = coverImage ? `&img=${encodeURIComponent(coverImage)}` : '';
    router.push(`/collections/${slug}?an=${params.an}&dbid=${params.db}${imageQuery}`, undefined, { shallow: true });
  };

  const handleLazyLoad = async () => {
    const nextPage = page + 1;
    setLoadMore(true);

    try {
      const { data } = await fetchMore({
        variables: {
          input: {
            slug,
            page: nextPage,
            limit: PAGE_SIZE,
            q: collectionSearchQuery || undefined,
            sort: selectedSort || undefined,
            filters: filters.length > 0 ? filters : undefined,
            dateFrom: `${appliedDateRange[0]}-01-01`,
            dateTo: `${appliedDateRange[1]}-12-31`,
          },
        },
      });

      const nextRecords = data?.collectionSearchV2?.records || [];
      const nextTotal = data?.collectionSearchV2?.total ?? searchState.total;
      const nextFacets = data?.collectionSearchV2?.facets;
      const nextAvailableSorts = data?.collectionSearchV2?.availableSorts;

      setSearchState((previous) => {
        const seen = {};
        for (const existingRecord of previous.records) {
          const existingId = existingRecord?.folioInstanceUuid || existingRecord?.instanceId || existingRecord?.id;
          if (existingId) {
            seen[existingId] = true;
          }
        }

        const merged = [...previous.records];

        for (const record of nextRecords) {
          const recordId = record?.folioInstanceUuid || record?.instanceId || record?.id;
          if (recordId && !seen[recordId]) {
            seen[recordId] = true;
            merged.push(record);
          }
        }

        return {
          records: merged,
          total: nextTotal,
          facets: nextFacets || previous.facets,
          appliedFilters: data?.collectionSearchV2?.appliedFilters || previous.appliedFilters,
          availableSorts: nextAvailableSorts || previous.availableSorts,
        };
      });

      setPage(nextPage);
    } catch (error) {
      console.error('Error fetching more SQL-backed collection records:', error);
    } finally {
      setLoadMore(false);
    }
  };

  const headerContent = (
    <div className="card border-0 shadow-sm collections-facet-toolbar">
      <div className="card-body">

        {/* Row 1: Facet selects */}
        <div className="collections-facet-primary-row mb-3">
          {primaryFacets.map((facet) => (
            <CollectionFacetSelect
              key={facet.field}
              facet={facet}
              facetValuesInput={facetSearchBaseInput}
              selectedOptions={getAppliedFilterOptions(
                searchState.appliedFilters,
                facet.field,
                selectedFacetValues[facet.field] || [],
              )}
              onChange={(selectedOptionsForField) => handleFacetSelectChange(facet.field, selectedOptionsForField)}
              isRefining={isRefining}
              menuPortalTarget={menuPortalTarget}
            />
          ))}
        </div>

        {/* Row 2: Status info + date toggle + sort + clear (matches MaterialDisplay d-flex row) */}
        <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
          <span className="collections-facet-active-count">
            {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'} selected
          </span>
          {isRefining ? (
            <span className="collections-refining-indicator">
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" /> Updating...
            </span>
          ) : null}
          <div className="ms-auto d-flex align-items-center gap-2 flex-wrap">
            {additionalFacets.length > 0 ? (
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => setIsAdditionalFiltersOpen((open) => !open)}
              >
                {isAdditionalFiltersOpen ? 'Hide More Filters' : `Show ${additionalFacets.length} More Filters`}
                {hiddenActiveFilterCount > 0 ? ` (${hiddenActiveFilterCount} selected)` : ''}
              </button>
            ) : null}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={toggleDateSlider}
            >
              {isDateSliderOpen ? 'Hide Date Filter' : 'Show Date Filter'}
            </button>
            <div style={{ width: 220 }}>
              <Select
                inputId="collection-search-sort"
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

        <Collapse isOpen={isAdditionalFiltersOpen}>
          <div className="collections-additional-filters-grid mb-3">
            {additionalFacets.map((facet) => (
              <CollectionFacetSelect
                key={facet.field}
                facet={facet}
                facetValuesInput={facetSearchBaseInput}
                selectedOptions={getAppliedFilterOptions(
                  searchState.appliedFilters,
                  facet.field,
                  selectedFacetValues[facet.field] || [],
                )}
                onChange={(selectedOptionsForField) => handleFacetSelectChange(facet.field, selectedOptionsForField)}
                isRefining={isRefining}
                menuPortalTarget={menuPortalTarget}
              />
            ))}
          </div>
          {additionalFacets.length > 0 ? (
            <p className="collections-more-filters-note">
              Large filters wait for typing before listing matches so pages like audio-cds stay responsive.
            </p>
          ) : null}
        </Collapse>

        {/* Row 3: Collapsible date slider — same format as DateSlider / MaterialDisplay */}
        <Collapse isOpen={isDateSliderOpen}>
          <div className="collections-date-slider-panel">
            <Slider
              min={MIN_YEAR}
              max={currentYear}
              value={pendingDateRange}
              onChange={handleDateRangeChange}
              onChangeCommitted={handleDateRangeCommit}
              valueLabelDisplay="auto"
              disableSwap
            />
            <div style={{ marginTop: 8, textAlign: 'center' }}>
              Selected Range: {pendingDateRange[0]} &ndash; {pendingDateRange[1]}
            </div>
            <div style={{ marginTop: 10, textAlign: 'center' }}>
              <button type="button" className="btn btn-primary btn-sm me-1" onClick={() => handlePreset(1)}>Last Year</button>
              <button type="button" className="btn btn-primary btn-sm me-1" onClick={() => handlePreset(5)}>5 Years Ago</button>
              <button type="button" className="btn btn-primary btn-sm me-1" onClick={() => handlePreset(10)}>10 Years Ago</button>
              <button type="button" className="btn btn-warning btn-sm" onClick={resetDateRange}>Reset</button>
            </div>
            <div style={{ marginTop: 10, textAlign: 'center' }}>
              <span>Custom Range:&nbsp;</span>
              <input
                type="number"
                value={customLow}
                min={MIN_YEAR}
                max={currentYear}
                onChange={(e) => setCustomLow(e.target.value)}
                style={{ width: 72 }}
                className="form-control form-control-sm d-inline-block"
                aria-label="Start year"
              />
              <span>&nbsp;&ndash;&nbsp;</span>
              <input
                type="number"
                value={customHigh}
                min={MIN_YEAR}
                max={currentYear}
                onChange={(e) => setCustomHigh(e.target.value)}
                style={{ width: 72 }}
                className="form-control form-control-sm d-inline-block"
                aria-label="End year"
              />
              <button type="button" className="btn btn-light btn-sm ms-2" onClick={handleCustomRangeSet}>Set Range</button>
            </div>
          </div>
        </Collapse>

      </div>
    </div>
  );

  const collectionTitle = getCollectionDisplayName(
    slug,
    configData?.collectionConfigV2?.title || toTitleFromSlug(slug)
  );
  const initialLoading = loading && searchState.records.length === 0;

  return (
    <LocalCollectionDisplay
      handleRecord={handleRecord}
      handleLazyLoad={handleLazyLoad}
      instances={instances}
      collectionSlug={slug}
      totalRecords={searchState.total}
      loadMore={loadMore}
      collectionTitle={collectionTitle}
      loading={initialLoading}
      page={page}
      limit={PAGE_SIZE}
      headerContent={headerContent}
    />
  );
}

export default SqlCollectionPage;
