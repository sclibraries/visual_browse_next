import React, {Fragment, useState} from 'react'
import { useStore } from '../store/store'
import { shallow } from 'zustand/shallow'
import { decode } from 'html-entities'
import { Accordion, AccordionItem, AccordionHeader,AccordionBody, Modal, ModalHeader, ModalBody} from 'reactstrap'
import RecordAvailability from './RecordAvailability'
import FullCast from './FullCast'
import RecommendationDisplay from './Recommendations'
import axios from 'axios';
import { useFavorite } from '@/hooks/useFavorite';
import { useCollections } from '@/hooks/useCollections';
import { useToggleFavorite } from '@/hooks/useToggleFavorite';
import { useCurrentCollections } from '@/hooks/useCurrentCollections';
import { useAddToCollection } from '@/hooks/useAddToCollection'
import { useRemoveFromCollection } from '@/hooks/useRemoveFromCollection'
import { getImage, getTitleString  } from '../lib/functions';
import NewCollectionForm from './NewCollectionForm'
function RecordsDisplay(){

    const [recordData, baseImage, an, loggedIn, currentCollections, collections] = useStore(state => [
        state.recordData,
        state.baseImage,
        state.an,
        state.loggedIn,
        state.currentCollections,
        state.collections
    ], shallow)

    const [open, setOpen] = useState("1");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFavorite, setIsFavorite] = useFavorite(an);
    useCollections();
    useCurrentCollections(an);
    const refreshCurrentCollections = useCurrentCollections(an);
    const toggleFavorite = useToggleFavorite(an, isFavorite, setIsFavorite);
    const addToCollection = useAddToCollection(refreshCurrentCollections);
    const removeFromCollection = useRemoveFromCollection(refreshCurrentCollections);
    const isInCollection = currentCollections && currentCollections.length > 0;


    // Update the removeFromCollection function call
    const handleRemoveFromCollection = (collection_records_id) => {
        removeFromCollection(collection_records_id);
    };


    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const toggle = (id) => {
        if (open === id) {
          setOpen();
        } else {
          setOpen(id);
        }
      };

            
   const image = getImage(recordData, baseImage);
   const titleStringDisplay = getTitleString(recordData);

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
                                        <div class="d-flex flex-nowrap" style={{marginTop: "20px"}}>
                                            <div className="order-1 p-2">
                                                <a target="_blank" className="btn btn-primary btn-lg" href={recordData.pLink}>Place Hold</a>{ ' ' }
                                            </div>
                                            {loggedIn && (
                                            <Fragment>
                                                <div className="order-2 p-2">
                                                <button className="btn btn-danger btn-lg" onClick={toggleFavorite}>
                                                    {isFavorite ? 'Remove from Favorites' : 'Save to Favorites'}
                                                </button>
                                                </div>
                                                <div className="order-3 p-2 ms-auto">
                                                    <div className="d-flex mb-3">
                                                        <div className="p-2">
                                                            <select
                                                                className="form-select-lg mb-3"
                                                                onChange={(e) => addToCollection(e.target.value, an)}
                                                            >
                                                                <option value="">Add to collection</option>
                                                                {collections.map((collection, index) => (
                                                                <option key={index} value={collection.collection_id}>
                                                                    {collection.name}
                                                                </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                            <div className="p-2">
                                                                <button className="btn btn-primary btn-lg" onClick={toggleModal}>Create New Collection</button>
                                                                <Modal isOpen={isModalOpen} toggle={toggleModal}>
                                                                    <ModalHeader toggle={toggleModal}>Create New Collection</ModalHeader>
                                                                    <ModalBody>
                                                                        <NewCollectionForm />
                                                                    </ModalBody>
                                                                </Modal>
                                                            </div>
                                                    </div>
                                                </div>
                                            </Fragment>
                                            )}
                                        </div>
                                        {loggedIn && isInCollection && (
                                        <div className="d-flex flex-wrap mb-3">
                                                    {currentCollections.map((collection, index) => (
                                                    <div className="btn btn-outline-secondary" key={index} onClick={() => handleRemoveFromCollection(collection.collection_records_id)}>
                                                        {collection.collectionName.name}{' '}
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16">
                                                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
                                                        </svg>
                                                    </div>
                                                    ))}
                                                </div>      
                                        )}      
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