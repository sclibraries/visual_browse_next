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
      .slice(0, 5); // Limit to the first 7 items
    
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

  export const getImage = (recordData, baseImage) => {
    const imageSize = ['medium'];
    const image = recordData?.image?.find(item => imageSize.includes(item.Size))?.Target || '';
    return image;
  };


  export const getTitleString = (recordData) => {
    let titleString = recordData?.titleItem?.toString() || '';
    let titleStringDisplay = titleString || ''
    if(titleString !== '' && titleString.includes('/')){
        const titleClean = titleString.split('/')
        if(titleClean[0].includes('[')){
            titleStringDisplay = titleClean[0].split('[')[0]
        } else {
            titleStringDisplay = titleClean[0]
        }
    } else if(titleString !== '' && titleString.includes('[')){
            titleStringDisplay = titleString.split('[')[0]
    } else {
        titleStringDisplay = recordData?.titles ? recordData.titles[0]?.TitleFull : ''
    }
    return titleString;
  };
  