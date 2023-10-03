// List of common subject terms that you want to exclude
const commonTerms = [

    // add more common terms here
  ];
  
  export function buildRecommendations(results) {
    // Check if 'results' and 'results.subjectItem' exist
    if (!results || !results.subjectItem) {
      return '';
    }
    
    // Decode terms, remove quotes, and filter out common terms
    const subjects = results.subjectItem
      .map(items => decodeURIComponent(items.term[0]).replace(/"/g, ''))
      .filter(term => !commonTerms.includes(term))
      .slice(0, 7); // Limit to the first 7 items
    
    console.log(subjects);
    
    // Build recommendations query
    const recommendations = subjects
      .map((subject, index) => {
        const key = `query-${index + 1}`;
        const encodedSubject = subject;
        return `${key}=OR,DE:${encodedSubject}`;
      })
      .join('&');
    
    return recommendations;
  }
  