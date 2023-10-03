import { useState, useEffect } from 'react'
import { UncontrolledAccordion, AccordionItem, AccordionHeader, AccordionBody, ListGroup, ListGroupItem, Button, Input,Collapse } from 'reactstrap'

function Facets(props) {
      

    // State for visibility of each facet group
    const [open, setOpen] = useState({ 
        'movie-subjects': true,
        "LocationLibrary": true, 
        "active-filters": true 
    })
    // State for search text for each facet group
    const [search, setSearch] = useState({})
    // State for checkbox state
    const [checkboxState, setCheckboxState] = useState({})

        // State for visibility of each facet group
        const [visibility, setVisibility] = useState({})
    
        const toggleVisibility = (id) => {
            setVisibility(prev => ({
                ...prev,
                [id]: !prev[id]
            }))
        }

    const toggle = (id) => {
        setOpen(prev => ({
            ...prev,
            [id]: !prev[id]
        }))
    }


    const handleSearch = (e, id) => {
        setSearch(prev => ({
            ...prev,
            [id]: e.target.value
        }))
    }

    const handleCheckboxChange = (e, value) => {
        e.preventDefault()
        if (checkboxState[value.value]) {
            //if checked, remove facet action from the store
            props.handleRemoveFacetAction(e, value.action)
        } else {
            //if unchecked, add facet action to the store
            props.handleFacetAction(e, value.action)
        }
        setCheckboxState(prev => ({ ...prev, [value.value]: !prev[value.value] }))
    }

    const facets = props.facetDisplay ? Object.values(props.facetDisplay).map(facet =>
        facet && typeof facet === 'object' && {
            ...facet,
            values: Array.isArray(facet.values) ? facet.values.filter(value =>
                value.value.toLowerCase().includes((search[facet.id] || '').toLowerCase())
            ) : []
        }
    ).filter(Boolean) : []

    const activatedFacets = props.facetFiltersWithAction ? props.facetFiltersWithAction.map(facet => 
        facet.FacetValuesWithAction ? facet.FacetValuesWithAction.map(facetValue => ({
            ...facetValue,
            removeAction: facet.RemoveAction
        })) : []
    ) : []

    const handleActivatedFacetClick = (e, removeAction) => {
        e.preventDefault()
        // Call remove facet action function
        const facet = removeAction.slice(removeAction.indexOf("(") + 1, removeAction.lastIndexOf(")")).split(",")[1]

        props.handleRemoveFacetAction(e, facet)

        setCheckboxState(prevState => ({
            ...prevState,
            [facet.split(':')[1]]: false,
        }))
    }
    


    return (
        <div>
    <UncontrolledAccordion 
        defaultOpen={[
            'movie-subjects',
            'LocationLibrary',
            'active-filters'
        ]}
        stayOpen
    >
{props.appliedFacets && props.appliedFacets.length > 0 && 
    <AccordionItem>
        <AccordionHeader>Active Filters</AccordionHeader>
        <AccordionBody accordionId="active-filters">
        <div className="d-grid gap-2">
        {props.appliedFacets.map((facetFilterWithAction, index) => {
            return (
                facetFilterWithAction.FacetValuesWithAction.map((facetValueWithAction, subIndex) => {
                    const displayText = facetValueWithAction.FacetValue.Value;
                    const removeAction = facetValueWithAction.RemoveAction; // You can use this action to handle the removal
                    return (
                        <Button key={`${index}-${subIndex}`} className="btn btn-success" onClick={e => props.handleRemoveFacetAction(removeAction)}>
                            {displayText}{' '}
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                            </svg>
                        </Button>
                    )
                })
            )
        })}
        </div>
        </AccordionBody>
    </AccordionItem>
}

{
    props.genre && props.genre.length > 0 ?
        <AccordionItem key="movie-subjects">
            <AccordionHeader targetId="movie-subjects">{props.materialType} Genres</AccordionHeader>
            <AccordionBody accordionId="movie-subjects">
                <Input type="search" placeholder="Search..." value={search['movie-subjects'] || ''} onChange={e => handleSearch(e, 'movie-subjects')} className="mb-4" />
                <ListGroup flush>
                {props.genre
                    .filter(subject => subject.toLowerCase().includes((search['movie-subjects'] || '').toLowerCase())) // Filter based on search term
                    .slice(0, visibility['movie-subjects'] ? props.genre.length : 6)
                    .map((subject, index) => (
                    <ListGroupItem key={index} style={{cursor: 'pointer'}} onClick={() => props.onSelect(subject)}>
                        {subject}
                    </ListGroupItem>
                ))}
                {props.genre.length > 6 && (
                    <Button onClick={() => toggleVisibility('movie-subjects')}>
                        {visibility['movie-subjects'] ? 'Show less' : 'Show more'}
                    </Button>
                )}
                </ListGroup>
            </AccordionBody>
        </AccordionItem>
    : ''
}

    {facets && facets.map((facet) => (
        <AccordionItem key={facet.id}>
            <AccordionHeader targetId={facet.id}>{facet.label}</AccordionHeader>
                <AccordionBody accordionId={facet.id}>
                <Input type="search" placeholder="Search..." value={search[facet.id] || ''} onChange={e => handleSearch(e, facet.id)} className="mb-4" />
                            <ListGroup flush>
                            {facet.values && facet.values.slice(0, visibility[facet.id] ? facet.values.length : 6).map((value) => (
                                    <ListGroupItem key={value.value} onClick={e => props.handleFacetAction(value.action)} style={{cursor: 'pointer'}}>
                                        {value.value} ({value.count})
                                    </ListGroupItem>
                                  ))}
                                  {facet.values && facet.values.length > 6 && (
                                      <Button onClick={() => toggleVisibility(facet.id)}>
                                          {visibility[facet.id] ? 'Show less' : 'Show more'}
                                      </Button>
                                  )}
                            </ListGroup>
                        </AccordionBody>
                    </AccordionItem>
                ))}
    </UncontrolledAccordion>
</div>
    )
}

export default Facets