  
  export function buildRecommendations(itemsRaw) {
    // Function to decode HTML entities
    const decodeHtml = (html) => {
      const txt = document.createElement('textarea');
      txt.innerHTML = html;
      return txt.value;
    };
  
    // Function to extract terms from the provided HTML string
    const extractTerms = (dataString) => {
      const decodedString = decodeHtml(dataString);
      const termMatches = decodedString.match(/term="([^"]+)"/g);
      return termMatches ? termMatches.map(match => decodeURIComponent(match.split('=')[1].replace(/"/g, ''))) : [];
    };
  
    // Filter 'itemsRaw' for 'Subject', extract terms, and flatten the array of terms
    const subjects = itemsRaw
      .filter(item => item.name === 'Subject')
      .flatMap(item => extractTerms(item.data))
      .filter((term, index, self) => self.indexOf(term) === index) // Remove duplicates
      .slice(0, 5); // Limit to the first 5 items
  
  
    // Join terms with 'OR' and format for recommendation query
    const recommendations = subjects.join(' OR ');
  
    return recommendations;
  }

  export const getImage = (recordData) => {
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
    if(titleStringDisplay !== '' && titleStringDisplay.includes('[')){
        titleString = titleStringDisplay.split('[')[0]
    } else {
        titleString = titleStringDisplay
    }
  };

  export const extractTitle = (fullTitle) => {
     // Example regex pattern to extract title before the first '/' or ';'
     const pattern = /^(.*?)\s*\/|;/;
     const match = fullTitle.match(pattern);
 
     if (match && match[1]) {
         return match[1].trim();
     }
     
     return fullTitle; // Return the original title if no match is found
 }   
  