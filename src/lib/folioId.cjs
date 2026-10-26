const FOLIO_AN_MARKER = 'fs00001006.';

function isFolioAn(an) {
  return typeof an === 'string' && an.includes(FOLIO_AN_MARKER);
}

function folioIdFromAn(an) {
  if (!isFolioAn(an)) return '';

  const idStart = an.indexOf(FOLIO_AN_MARKER) + FOLIO_AN_MARKER.length;
  return an.slice(idStart).replace(/\./g, '-');
}

module.exports = { isFolioAn, folioIdFromAn };
