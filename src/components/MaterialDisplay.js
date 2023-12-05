import React, { useState, useEffect} from 'react'
import { Container, Collapse} from 'reactstrap'
import Facets from './Facets'
import Image from 'next/image'
import { shallow } from 'zustand/shallow'
import { useStore } from '../store/store'
import { useRouter } from 'next/router'
import CampusLocation from './CampusLocation'
import { DisplayLoadingSkeleton } from './Loading'
import DateSlider from './DateSlider'

function MaterialDisplay(props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [setButtonRef] = useState(null);
    const [modal, setModal] = useState(false);
    const router = useRouter();
    const [isDateSliderOpen, setIsDateSliderOpen] = useState(false);

    const [setAn,setDbid, setMaterial, recordModal, setRecordModal, loading] = useStore(state => [
      state.setAn,
      state.setDbid,
      state.setMaterial,
      state.recordModal,
      state.setRecordModal,
      state.loading
    ], shallow)

    const toggleModal = () => setModal(!modal);

    const toggleNavbar = () => {
      setIsCollapsed(!isCollapsed);
    };
  
    useEffect(() => {
    const handleResize = () => {
        if (window.innerWidth <= 768) {
        document.body.classList.add('small-screen');
        setIsCollapsed(true);
        } else {
        document.body.classList.remove('small-screen');
        setIsCollapsed(false);
        }
    };

    // Attach the event listener
    window.addEventListener('resize', handleResize);

    // Call it once initially
    handleResize();

    // Cleanup the event listener on component unmount
    return () => {
        window.removeEventListener('resize', handleResize);
    };
    }, []);
    

    const handleRecord = (an, dbid, e) => {
      e.preventDefault()
      setAn(an)
      setDbid(dbid)
      setMaterial(props.material)
      setRecordModal(!recordModal)
      router.push(`${router.pathname}?an=${an}&dbid=${dbid}`, undefined, { shallow: true });
    }


    const toggleDateSlider = () => {
      setIsDateSliderOpen(!isDateSliderOpen);
    };

    const records = props.records

    console.log(records)
    console.log(props.page, props.totalPages)

    return (
        <Container fluid>
          {/* <Row> */}
            {/* Sidebar */}
            {/* <Collapse isOpen={!isCollapsed}>
            <Col md="3" className="fixed-left">
              <Facets
                activatedFacets={props.activatedFacet}
                facetDisplay={props.facetDisplay}
                handleFacetAction={props.handleFacetAction}
                handleRemoveFacetAction={props.handleRemoveFacetAction}
                genre={props.genre}
                subjectHeadings={props.subjectHeadings}
                onSelect={props.onSelect}
                appliedFacets={props.appliedFacets}
                materialType={props.materialType}
              />
            </Col>
            </Collapse> */}
      
            {/* Main Content */}
            {/* <Col sm="12" md="9" className="scrollable-middle"> */}
              <div className="container">
              <Facets
                activatedFacets={props.activatedFacet}
                facetDisplay={props.facetDisplay}
                handleFacetAction={props.handleFacetAction}
                handleRemoveFacetAction={props.handleRemoveFacetAction}
                genre={props.genre}
                subjectHeadings={props.subjectHeadings}
                onSelect={props.onSelect}
                appliedFacets={props.appliedFacets}
                materialType={props.materialType}
              />
        <div className="hide-scrollbar flex-1 h-100 container">
          <div className="d-flex mb-3">
            <div className="p-2">
              <p className="text-dark font-weight-medium">Your search resulted in {props.hits} hits </p>
            </div>
            <div className="ms-auto p-2">
            <button className="btn btn-secondary" onClick={toggleDateSlider}>
              {isDateSliderOpen ? 'Hide Publication Date Filter' : 'Show Publication Date Filter'}
             </button>
            </div>  
          </div>
          <Collapse isOpen={isDateSliderOpen}>
            <DateSlider />
          </Collapse>
        <div className="row row-cols-* g-4" style={{marginTop: "30px"}}>
               {loading ? <DisplayLoadingSkeleton /> : records && records.length > 0  ? Object.keys(records).map((key,index) => {
                    let image = ''
                    if(records[key].imageItem){
                        image = records[key].imageItem
                    } else if( records[key].tmdbSearch && records[key].tmdbSearch.results && records[key].tmdbSearch.results.poster_path && records[key].tmdbSearch.results.poster_path.length > 0 ){
                        image = `https://image.tmdb.org/t/p/w500${records[key].tmdbSearch.results.poster_path}`
                    } else if (records[key].googleImages && records[key].googleImages.thumbnail_url && records[key].googleImages.thumbnail_url.length > 0){
                        image = records[key].googleImages.thumbnail_url
                    }

                  const titleString = records[key].titleItem?.toString() || records[key].items?.map(items => ( items.label === "Title" ? items.data : '' )) || ''
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
                          titleStringDisplay = records[key].titles[0]?.TitleFull
                      }
                  return(
                    <div className="col" key={index}>
                    <div className="card h-100 shadow-sm p-3 mb-5 bg-body rounded" style={{width: "13em"}} id={'eds-' + index} onClick={e => handleRecord(records[key].an, records[key].dbid, e)}>
                        {image == '' ? 
                            <svg 
                                  className="rounded card-img-top"
                                  width="100%" 
                                  height="248" 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  role="img" 
                                  preserveAspectRatio="xMidYMid slice" 
                                  focusable="false"
                            >
                                <title>{titleString}</title>
                                <rect width="100%" height="100%" fill="#d6d6d6"></rect>
                            </svg>
                        :
                        <Image
                          src={image}
                          alt={titleStringDisplay}
                          layout="responsive"
                          width={500}
                          height={300}
                          className="rounded card-img-top"
                          objectFit="cover" // Cover instead of contain to fill the container
                        />
                      }
                       <div className="card-body">
                                    <h5 className="product-title fs-sm mb-2">{titleStringDisplay}</h5>
                                    {/* <CampusLocation 
                                      id={records[key].an}
                                    /> */}
                                    {/* <p className="card-text">{records[key].abstractItem}</p> */}
                                </div>
                    </div>
                </div>
                )}) : ''}
                  </div>
                  {props.page < props.totalPages ?
                    <div className="d-grid gap-2 list" style={{paddingTop: "20px", paddingBottom: "50px"}}>
                    <button
                          className={props.loadMore ? "btn btn-info disabled" : "btn btn-primary"}
                          ref={setButtonRef}
                          id="buttonLoadMore"
                          onClick={() =>
                            props.handleLazyLoad()
                          }
                        >
                        {props.loadMore ? "Loading..." : "Load more"}
                      </button>
                      </div>
                    : <div className="d-grid gap-2 list" style={{paddingTop: "20px", paddingBottom: "50px"}}><button className="btn btn-primary" disabled>End of results</button></div>}
                </div>
              </div>
            </Container>
    )
}

export default MaterialDisplay