function ActiveFacets({ facets, onRemove }) {
    return (
      <div className="flex flex-wrap">
        {facets.map((facet, index) => {
          const displayText = facet.split(':')[1]; // Get the text after the colon
  
          return (
            <div key={index} className="m-1 p-2 bg-blue-100 rounded-full flex items-center">
              <span className="text-sm text-gray-700">{displayText}</span>
              <button onClick={() => onRemove(facet)} className="ml-2 text-gray-600 hover:text-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x" viewBox="0 0 16 16">
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                </svg>
                </button>
            </div>
          );
        })}
      </div>
    );
  }
  
  export default ActiveFacets;
  