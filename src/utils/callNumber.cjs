function joinParts(value) {
  const parts = Array.isArray(value) ? value : [value];

  return parts
    .filter(part => typeof part === 'string')
    .map(part => part.trim())
    .filter(Boolean)
    .join(' ');
}

function formatCallNumber(callNumber) {
  return joinParts(callNumber);
}

function formatVolume(volume) {
  const formattedVolume = joinParts(volume);
  if (!formattedVolume.startsWith('(') || !formattedVolume.endsWith(')')) {
    return formattedVolume;
  }

  let depth = 0;
  for (let index = 0; index < formattedVolume.length; index += 1) {
    if (formattedVolume[index] === '(') depth += 1;
    if (formattedVolume[index] === ')') depth -= 1;
    if (depth < 0 || (depth === 0 && index < formattedVolume.length - 1)) {
      return formattedVolume;
    }
  }

  if (depth !== 0) return formattedVolume;
  return formattedVolume.slice(1, -1).trim();
}

function hasVolumes(holdings) {
  return Array.isArray(holdings)
    && holdings.some(holding => Boolean(formatVolume(holding?.volume)));
}

module.exports = { formatCallNumber, formatVolume, hasVolumes };
