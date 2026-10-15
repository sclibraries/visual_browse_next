function joinParts(value) {
  const parts = Array.isArray(value) ? value : [value];

  return parts
    .filter(part => typeof part === 'string')
    .map(part => part.trim())
    .filter(Boolean)
    .join(' ');
}

function formatCallNumber(callNumber, volume) {
  const formattedCallNumber = joinParts(callNumber);
  const formattedVolume = joinParts(volume);

  if (!formattedVolume) return formattedCallNumber;
  if (!formattedCallNumber) return formattedVolume;
  if (formattedCallNumber.endsWith(formattedVolume)) return formattedCallNumber;

  return `${formattedCallNumber} ${formattedVolume}`;
}

module.exports = { formatCallNumber };
