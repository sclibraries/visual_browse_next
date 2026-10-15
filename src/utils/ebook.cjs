function values(value) {
  return (Array.isArray(value) ? value : [value]).filter(item => typeof item === 'string');
}

function isEbook(record) {
  if (!record) return false;
  const items = Array.isArray(record.items) ? record.items : [];
  const types = [record.materialType, record.pubType, record.pubTypeId]
    .concat(values(record.pubTypeItem))
    .concat(items.filter(item => ['TypePub', 'TypeDocument'].includes(item.name)).flatMap(item => values(item.data)))
    .filter(value => typeof value === 'string')
    .flatMap(value => value.split(/[;,]/));
  if (types.some(type => /^(e[ -]?books?|electronic books?|online books?)$/i.test(type.trim()))) return true;

  // Electronic access alone also describes articles and videos. Require book
  // metadata before interpreting catalog descriptions as ebook evidence.
  const book = types.some(type => /^books?$/i.test(type.trim()));
  const electronicResource = types.some(type => /^electronic resource$/i.test(type.trim()));
  return items.some(item => {
    if (book && (item.name === 'PhysDesc' || item.label === 'Physical Description')) {
      return values(item.data).some(value => /\bonline resource\b/i.test(value));
    }
    if ((book || electronicResource) && item.name === 'Subject') {
      return values(item.data).some(value => /^electronic books\.?$/i.test(value.trim()));
    }
    return false;
  });
}

module.exports = { isEbook };
