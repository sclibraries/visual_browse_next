const PRIMARY_FACET_LIMIT = 3;
const PRIMARY_FACET_VALUE_THRESHOLD = 250;

const getFacetField = (facet) => {
  return facet?.field || facet?.Field || '';
};

const getFacetRawValues = (facet) => {
  return facet?.values || facet?.facetValues || facet?.FacetValues || [];
};

const getFacetValueCount = (facet) => {
  return getFacetRawValues(facet).length;
};

const isDeferredFacet = (facet) => {
  return Boolean(facet?.requiresQuery);
};

const normalizeFacetValue = (valueItem) => {
  const value = valueItem?.value ?? valueItem?.Value ?? valueItem?.facetValue?.value;
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const label = valueItem?.label ?? valueItem?.Label ?? String(value);
  const count = Number(valueItem?.count ?? valueItem?.Count ?? 0) || 0;

  return {
    value: String(value),
    label: String(label),
    count,
  };
};

const formatFacetOption = (facetValue) => {
  return {
    value: facetValue.value,
    label: `${facetValue.label || facetValue.value} (${facetValue.count})`,
  };
};

const facetMatches = (facet, patterns) => {
  const text = `${facet?.label || ''} ${getFacetField(facet)}`.toLowerCase();
  return patterns.some((pattern) => pattern.test(text));
};

const orderCollectionFacets = (facets = [], configFacetList = []) => {
  if (!Array.isArray(facets) || facets.length === 0) {
    return [];
  }

  const facetByField = {};
  for (const facet of facets) {
    const field = getFacetField(facet);
    if (!field) {
      continue;
    }

    facetByField[field] = {
      ...facet,
      field,
      label: facet?.label || facet?.Label || field,
      expanded: true,
    };
  }

  if (!Array.isArray(configFacetList) || configFacetList.length === 0) {
    return Object.values(facetByField);
  }

  const ordered = [];
  for (const configFacet of configFacetList) {
    const field = configFacet?.field;
    if (!field || !facetByField[field]) {
      continue;
    }

    ordered.push({
      ...facetByField[field],
      label: configFacet?.label || facetByField[field].label,
      expanded: configFacet?.expanded !== false,
    });

    delete facetByField[field];
  }

  for (const remaining of Object.values(facetByField)) {
    ordered.push(remaining);
  }

  return ordered;
};

const splitFacetControls = (
  orderedFacets = [],
  slug,
  maxVisible = PRIMARY_FACET_LIMIT,
  maxValuesForPrimary = PRIMARY_FACET_VALUE_THRESHOLD,
) => {
  const available = orderedFacets.filter((facet) => isDeferredFacet(facet) || getFacetValueCount(facet) > 0);
  const usedFields = new Set();
  const primaryFacets = [];

  const addFacet = (facet) => {
    if (!facet || usedFields.has(facet.field) || primaryFacets.length >= maxVisible) {
      return;
    }

    usedFields.add(facet.field);
    primaryFacets.push(facet);
  };

  const pickFacet = (patterns, options = {}) => {
    const matches = available.filter((facet) => !usedFields.has(facet.field) && facetMatches(facet, patterns));
    if (matches.length === 0) {
      return null;
    }

    if (options.preferNonHeavy) {
      return matches.find((facet) => getFacetValueCount(facet) <= maxValuesForPrimary) || null;
    }

    return matches[0];
  };

  addFacet(pickFacet([/genre/]));

  const personPatterns = slug === 'audio-cds'
    ? [/performer/, /contributor/, /artist/, /composer/, /author/]
    : [/author/, /contributor/];
  addFacet(pickFacet(personPatterns, { preferNonHeavy: true }));

  addFacet(pickFacet([/campus/, /location/, /library/]));

  const remaining = available.filter((facet) => !usedFields.has(facet.field));
  for (const facet of remaining) {
    if (primaryFacets.length >= maxVisible) {
      break;
    }

    if (getFacetValueCount(facet) <= maxValuesForPrimary) {
      addFacet(facet);
    }
  }

  if (primaryFacets.length < maxVisible) {
    for (const facet of remaining) {
      if (primaryFacets.length >= maxVisible) {
        break;
      }

      addFacet(facet);
    }
  }

  return {
    primaryFacets,
    additionalFacets: available.filter((facet) => !usedFields.has(facet.field)),
  };
};

const buildFacetOptions = (facet, inputValue = '', limit = PRIMARY_FACET_VALUE_THRESHOLD) => {
  const query = String(inputValue || '').trim().toLowerCase();
  const rawValues = getFacetRawValues(facet);
  const options = [];

  for (const valueItem of rawValues) {
    const normalized = normalizeFacetValue(valueItem);
    if (!normalized) {
      continue;
    }

    if (query) {
      const haystack = `${normalized.label} ${normalized.value}`.toLowerCase();
      if (!haystack.includes(query)) {
        continue;
      }
    }

    options.push(formatFacetOption(normalized));

    if (options.length >= limit) {
      break;
    }
  }

  return options;
};

const getSelectedFacetOptions = (facet, selectedValues = []) => {
  if (!Array.isArray(selectedValues) || selectedValues.length === 0) {
    return [];
  }

  const normalizedSelectedValues = selectedValues.map((value) => String(value));
  const selectedValueSet = new Set(normalizedSelectedValues);
  const matchedOptions = {};

  for (const valueItem of getFacetRawValues(facet)) {
    const normalized = normalizeFacetValue(valueItem);
    if (!normalized || !selectedValueSet.has(normalized.value)) {
      continue;
    }

    matchedOptions[normalized.value] = formatFacetOption(normalized);
    if (Object.keys(matchedOptions).length === selectedValueSet.size) {
      break;
    }
  }

  return normalizedSelectedValues.map((value) => matchedOptions[value] || { value, label: value });
};

const mergeFacetOptions = (selectedOptions = [], options = []) => {
  const merged = [];
  const seen = {};

  for (const option of [...selectedOptions, ...options]) {
    const value = option?.value;
    if (!value || seen[value]) {
      continue;
    }

    seen[value] = true;
    merged.push(option);
  }

  return merged;
};

const mergeFacetValuePages = (existingValues = [], incomingValues = []) => {
  const merged = [];
  const seen = {};

  for (const valueItem of [...existingValues, ...incomingValues]) {
    const value = valueItem?.value;
    if (!value || seen[value]) {
      continue;
    }

    seen[value] = true;
    merged.push(valueItem);
  }

  return merged;
};

const getAppliedFilterOptions = (appliedFilters = [], field, fallbackValues = []) => {
  const filterOptionsByValue = {};

  for (const filterItem of appliedFilters || []) {
    if (!filterItem || filterItem.field !== field) {
      continue;
    }

    filterOptionsByValue[String(filterItem.value)] = {
      value: String(filterItem.value),
      label: String(filterItem.label || filterItem.value),
    };
  }

  return (fallbackValues || []).map((value) => {
    const normalizedValue = String(value);
    return filterOptionsByValue[normalizedValue] || { value: normalizedValue, label: normalizedValue };
  });
};

module.exports = {
  buildFacetOptions,
  getAppliedFilterOptions,
  getFacetField,
  getFacetValueCount,
  isDeferredFacet,
  mergeFacetOptions,
  mergeFacetValuePages,
  getSelectedFacetOptions,
  orderCollectionFacets,
  splitFacetControls,
};