import Select from 'react-select';
import { Button } from 'reactstrap'
import { useRouter } from 'next/router';

function Facets({
  genre, 
  materialType,
  onSelect,
  facetDisplay,
  handleFacetAction,
  handleRemoveFacetAction,
  appliedFacets  
}) {

  const router = useRouter();

  const genreOptions = genre ? genre.map(subject => ({
    label: subject,
    value: subject 
  })) : [];


  const options = facetDisplay ? Object.values(facetDisplay).map(facet => {
    const options = facet && facet.values ? facet.values.map(value => ({
      label: `${value.value} (${value.count})`,
      value: value.action
    })) : [];

    return {
      label: facet && facet.label ? facet.label : '',
      options  
    };
  }) : [];

  const selectedOptions = appliedFacets ? appliedFacets.map(facet => 
    facet.FacetValuesWithAction.map(value => ({
      label: value.FacetValue.Value,
      action: value.RemoveAction
    }))
  ).flat() : [];  

  const handleSelectChange = (selected) => {
     handleFacetAction(selected.value);
  }   

  const handleGenereSelectChange = (selected) => {
    onSelect(selected.value);
}


  return (
    <div className="container">
    
      <div className="row bg-light border" style={{padding: "15px"}}>

        {router && router.pathname !== '/all' && (
        <div className="col">
          <div style={{paddingTop: "20px"}}>
          <Select 
            options={genreOptions}
            placeholder={`${materialType} Genres`}
            onChange={handleGenereSelectChange} 
          />
          </div>
        </div>
        )}

        {options
        .filter(option => option.label && option.options.length > 0 && option.label !== 'Source Type' && option.label !== 'Publisher')
        .map(option => (
            <div className="col" key={option.label}>
            <div style={{paddingTop: "20px"}}>
                <Select 
                key={option.label}
                options={option.options}
                placeholder={option.label}
                value={selectedOptions.find(so => so.label === option.label)}
                onChange={handleSelectChange}
                />
            </div>
            </div>
        ))
        }


      </div>
    <br />
    {
        appliedFacets && appliedFacets.length > 0 &&
        <div className="d-grid gap-2 d-md-block">
            {appliedFacets.map((facet, index) => (
            facet.FacetValuesWithAction.map(value => {
                // Determine if the current value should be disabled
                const isDisabled = ['Videos', 'Books', 'Five Colleges Catalog'].includes(value.FacetValue.Value);
                return (
                <Button
                    className={`btn ${isDisabled ? "btn-secondary" : "btn-success"}`} // Use "btn-secondary" for disabled buttons as a suggestion
                    key={`${value.FacetValue.Value}-${index}`} // Changed to use value and index to ensure key uniqueness
                    onClick={() => handleRemoveFacetAction(value.RemoveAction)}
                    style={{ marginRight: "10px" }}
                    disabled={isDisabled} // Disable button based on the condition
                >
                    {value.FacetValue.Value}{' '}
                    {!isDisabled && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-circle" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                    </svg>
                    )}
                </Button>
                );
            })
            ))}
        </div>
        }

    
    </div>
  );

}

export default Facets;