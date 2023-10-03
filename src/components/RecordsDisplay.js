import React, {Fragment, useState} from 'react'
import { useStore } from '../store/store'
import { shallow } from 'zustand/shallow'
import { decode } from 'html-entities'
import { Accordion, AccordionItem, AccordionHeader,AccordionBody } from 'reactstrap'
import RecordAvailability from './RecordAvailability'
import FullCast from './FullCast'
import RecommendationDisplay from './Recommendations'

function RecordsDisplay(){

    const [open, setOpen] = useState("1");

    const [recordData, baseImage, an] = useStore(state => [
        state.recordData,
        state.baseImage,
        state.an
    ], shallow)


    const toggle = (id) => {
        if (open === id) {
          setOpen();
        } else {
          setOpen(id);
        }
      };

    let image = baseImage
    if(recordData.image){
        recordData.image.map(items => {
            if(items.Size === "medium"){
                image = items.Target
            } else if(items.Size === "thumb"){
                image = items.Target
            }
        })
    }

    const titleString = recordData?.titleItem?.toString() || recordData?.items?.map(items => ( items.label === "Title" ? items.data : '' )) || ''
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

    let imdb = ''
    if(recordData?.urlItem?.length > 0){
        recordData.urlItem.map(items => {
            if(items.includes("imdb")){
                let list = items.match(/tt\d+/g)
                imdb = list[0]
            }
        })
    }

    let subjectTerm = ''

    if(recordData?.itemsRaw?.length > 0){
        recordData.itemsRaw.map(items => {
            if(items.name === "Subject"){
                console.log(items.data)
            }
        })
    }

    return(
        <div className="layout">
                <aside >
                    <div className="d-flex flex-column h-100 position-relative">
                        <div className="hide-scrollbar">
                            <div className="container py-8">
                                <img style={{width: '100%', maxWidth: '300px', paddingTop: '20px'}}  src={image} /> 
                            </div>
                        </div>
                    </div>
                </aside>
                <div className="main">
                    <div className="container-fluid h-100">
                        <div className="d-flex flex-column h-100 position-relative">
                            {recordData && Object.keys(recordData).map(items => items).length > 0 ? 
                                <div className="hide-scrollbar flex-1 h-100">
                                    <div className="container-fluid">
                                    <h1 className="display-6">{titleStringDisplay}</h1> 
                                        <div class="d-flex justify-content-between mb-3" style={{marginTop: "20px"}}>
                                            <div className="p-2">
                                                <a target="_blank" className="btn btn-primary btn-lg" href={recordData.pLink}>Place Hold</a>{ ' ' }
                                                <button className="btn btn-danger btn-lg">Save to Favorites</button>
                                            </div>
                                            <div className="p-2">
                                            {/* {collections && collections.length > 0 ?
                                                <select className="form-select" aria-label="Default select example" onChange={e => addToCollection(e.target.value)}>
                                                    <option selected>Add to a collection</option>
                                                    {Object.keys(collections).map(items => (                                        
                                                        <option value={collections[items].collection_id}>{collections[items].name}</option>
                                                    ))}
                                                </select>
                                            : ''} */}
                                            </div>
                                        </div>
                            {recordData.items ? 
                                recordData.items.map((items,index) => (
                                    <div key={index}>
                                    {items.label === "Abstract" ? <p className="lead">{items.data}</p> : ''}
                                    {items.label === "Series" ? 
                                        <p className="lead">{items.data.map((items,key) =>  
                                            <button key={key} style={{margin: "0 5px 5px 0"}} className="btn btn-light btn-lg">{items}</button>)}</p> 
                                            : 
                                        ''}
                                    </div>
                                ))    
                            : ''}
                        </div>
                        <div style={{padding: "10px"}}>
                            <RecordAvailability
                                id={an}
                            />
                        </div>
                        {/* {currentCollection.length > 0 ?
                        <div style={{padding: "10px"}}>
                            <div className="h4 pb-2 mb-4 text-danger border-bottom border-danger">Found in the following collections</div>
                            <div className="border-bottom border-danger">
                                <div className="d-flex" style={{margin: "10px 5px 10px 0"}}>    
                                    {currentCollection.map(items => (
                                        <UncontrolledDropdown className="me-2">
                                            <DropdownToggle caret size="lg" color="light">{items.name}</DropdownToggle>
                                            <DropdownMenu>
                                                <DropdownItem onClick={e => handleCollection(items.collection_records_id)}>View Collection</DropdownItem>
                                                <DropdownItem onClick={e => removeFromCollection(items.collection_records_id)}>Remove from Collection</DropdownItem>
                                            </DropdownMenu>
                                        </UncontrolledDropdown>
                                    ))}
                                </div>
                            </div>
                        </div>
                        : ''} */}
                        <br />
                        <div className="container-fluid" style={{height: "100vh"}}>
                          <Accordion open={open} toggle={toggle}>
                           {recordData.pubTypeItem && recordData.pubTypeItem[0] === 'Video' ?
                          <AccordionItem>
                            <AccordionHeader targetId="1">Cast</AccordionHeader>
                            <AccordionBody accordionId="1">
                                <FullCast 
                                    imdb={imdb} 
                                    title={titleStringDisplay}
                                />
                            </AccordionBody>
                            </AccordionItem>
                            : ''}
                          <AccordionItem>
                            <AccordionHeader targetId={recordData.pubTypeItem && recordData.pubTypeItem[0] === 'Video' ? "2" : "1"}>Recommendations</AccordionHeader>
                            <AccordionBody accordionId={recordData.pubTypeItem && recordData.pubTypeItem[0] === 'Video' ? "2" : "1"}>
                                <RecommendationDisplay 
                                    data={recordData} 
                                    type={recordData.pubTypeItem && recordData.pubTypeItem[0] === 'Video' ? "Video" : "Book"}
                                />
                            </AccordionBody>
                            </AccordionItem>
                            <AccordionItem>
                                <AccordionHeader targetId="3">Full Record</AccordionHeader>
                                <AccordionBody accordionId="3">
                                <div style={{paddingBottom: '200px'}}>
                                    <dl className="row">   
                                    {recordData.itemsRaw.map((items,index) => {
                                            return(
                                                <Fragment key={index}>
                                                <dt className="col-sm-3">{items.label}</dt>
                                                    <dd className="col-sm-9">
                                                    <div dangerouslySetInnerHTML={{__html: decode(items.data, {level: 'html5'})}} />
                                                    </dd>
                                                </Fragment>
                                            )
                                    })}
                                </dl>
                                </div>
                                </AccordionBody>
                            </AccordionItem>
                        </Accordion>
                        </div>
                    </div>
                    : ''}
                </div>
            </div>
           </div> 
    </div>
    )
}

export default RecordsDisplay