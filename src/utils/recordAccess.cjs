const { isFolioAn, folioIdFromAn } = require('../lib/folioId.cjs');

const RIGHTS_ITEM = /rights|copyright/i;
const OPEN_ACCESS_EVIDENCE = /creativecommons\.org|creative commons|\bCC[ -]?(BY|0)\b|attribution(-[a-z]+)* \d|public domain|open access/i;
const OPEN_ACCESS_SERIES = /open access/i;

function cleanUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') return '';

  const urlMatch = urlString.match(/^(https?:\/\/[^\s]+)/);
  return urlMatch ? urlMatch[1] : urlString.trim();
}

function httpUrl(value) {
  const url = cleanUrl(value);
  return /^https?:\/\//i.test(url) ? url : '';
}

function firstUsableLink(links, getUrl) {
  if (!Array.isArray(links)) return null;

  for (const link of links) {
    const url = httpUrl(getUrl(link));
    if (url) return { link, url };
  }

  return null;
}

function recordItems(record) {
  return [
    ...(Array.isArray(record?.items) ? record.items : []),
    ...(Array.isArray(record?.itemsRaw) ? record.itemsRaw : []),
  ];
}

function itemDataMatches(item, pattern) {
  const data = Array.isArray(item?.data) ? item.data : [item?.data];
  return data.some(value => typeof value === 'string' && pattern.test(value));
}

function isRightsItem(item) {
  return [item?.name, item?.label].some(value =>
    typeof value === 'string' && RIGHTS_ITEM.test(value)
  );
}

function isOpenAccess(record) {
  return recordItems(record).some(item => (
    item?.name === 'SeriesInfo' && itemDataMatches(item, OPEN_ACCESS_SERIES)
  ) || (
    isRightsItem(item) && itemDataMatches(item, OPEN_ACCESS_EVIDENCE)
  ));
}

function getRecordAccess({ an, record } = {}) {
  const openAccess = isOpenAccess(record);

  if (isFolioAn(an)) {
    return { type: 'holdings', folioId: folioIdFromAn(an), openAccess };
  }

  const customLink = firstUsableLink(record?.fullText?.CustomLinks, link => link?.Url);
  if (customLink) {
    const label = typeof customLink.link.Name === 'string' && customLink.link.Name.trim()
      ? customLink.link.Name.trim()
      : 'Access online';

    return { type: 'online', url: customLink.url, label, openAccess };
  }

  const fullTextLink = firstUsableLink(record?.fullText?.Links, link => link?.Url);
  if (fullTextLink) {
    return { type: 'online', url: fullTextLink.url, label: 'Access online', openAccess };
  }

  const urlItem = firstUsableLink(record?.urlItem, url => url);
  if (urlItem) {
    return { type: 'online', url: urlItem.url, label: 'Access online', openAccess };
  }

  const discoveryUrl = httpUrl(record?.pLink);
  if (discoveryUrl) {
    return { type: 'discovery', url: discoveryUrl, openAccess };
  }

  return { type: 'none', openAccess };
}

module.exports = { cleanUrl, getRecordAccess, isOpenAccess };
