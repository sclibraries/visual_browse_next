const { isFolioAn, folioIdFromAn } = require('../lib/folioId.cjs');

// Owner: confirm these database IDs before deployment.
const OPEN_ACCESS_DBIDS = ['edsoap', 'edsdoj', 'edsdob'];

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

function getRecordAccess({ an, dbid, record } = {}) {
  const openAccess = OPEN_ACCESS_DBIDS.includes(dbid);

  if (isFolioAn(an)) {
    return { type: 'holdings', folioId: folioIdFromAn(an) };
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

module.exports = { cleanUrl, getRecordAccess };
