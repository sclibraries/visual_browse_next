const FOLIO_AN_MARKER = 'fs00001006.';
const FOLIO_ID_PATTERN = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;

function isFolioAn(an) {
  return typeof an === 'string' && an.includes(FOLIO_AN_MARKER);
}

function folioIdFromAn(an) {
  if (!isFolioAn(an)) {
    return typeof an === 'string' && FOLIO_ID_PATTERN.test(an) ? an : '';
  }

  const idStart = an.indexOf(FOLIO_AN_MARKER) + FOLIO_AN_MARKER.length;
  return an.slice(idStart).replace(/\./g, '-');
}

module.exports = { isFolioAn, folioIdFromAn };
