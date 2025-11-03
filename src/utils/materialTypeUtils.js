// utils/materialTypeUtils.js

import {
    faBook,
    faTabletAlt,
    faFilm,
    faHeadphones,
    faFileAlt,
    faMap,
    faMusic,
    faImage,
    faObjectGroup,
    faDesktop,
    faFile
  } from '@fortawesome/free-solid-svg-icons';
  
  /**
   * Determines the material type icon and label based on the record data.
   *
   * @param {Object} record - The record object, which can be of different structures.
   * @returns {Object} - An object with 'icon' and 'label' properties.
   */
  export function getMaterialType(record) {
    // Check for 'materialType' property used in 'poLine' records
    if (record.materialType) {
      const materialType = record.materialType.toLowerCase();
  
      switch (materialType) {
        case 'book':
          return { icon: faBook, label: 'Book' };
        case 'ebook':
          return { icon: faTabletAlt, label: 'eBook' };
        case 'video':
          return { icon: faFilm, label: 'Video' };
        case 'audio':
          return { icon: faHeadphones, label: 'Audio' };
        case 'map':
          return { icon: faMap, label: 'Map' };
        case 'music score':
        case 'score':
          return { icon: faMusic, label: 'Music Score' };
        case 'image':
          return { icon: faImage, label: 'Image' };
        case 'kit/object':
          return { icon: faObjectGroup, label: 'Kit/Object' };
        case 'computer file':
          return { icon: faDesktop, label: 'Computer File' };
        case 'serial':
        case 'periodical':
          return { icon: faFileAlt, label: 'Serial' };
        default:
          return { icon: faFile, label: materialType };
      }
    }
  
    // Fallback to the original data structure
    const pubType = record.pubType || '';
    const subjectItem = record.items?.find((item) => item.label === 'Subject Terms');
    const subjectTerms = subjectItem?.data?.map((term) => term.toLowerCase()) || [];
  
    // Check for streaming videos
    if (
      pubType === 'Electronic Resource' &&
      subjectTerms.some((term) => term.includes('streaming video'))
    ) {
      return { icon: faFilm, label: 'Streaming Video' };
    }
  
    switch (pubType) {
      case 'Book':
        return { icon: faBook, label: 'Book' };
      case 'eBook':
        return { icon: faTabletAlt, label: 'eBook' };
      case 'Audiobook':
        return { icon: faHeadphones, label: 'Audiobook' };
      case 'Video Recording':
      case 'Video':
        return { icon: faFilm, label: 'Video' };
      case 'Audio':
        return { icon: faHeadphones, label: 'Audio' };
      case 'Music Score':
      case 'Score':
        return { icon: faMusic, label: 'Music Score' };
      case 'Map':
        return { icon: faMap, label: 'Map' };
      case 'Image':
        return { icon: faImage, label: 'Image' };
      case 'Kit/Object':
        return { icon: faObjectGroup, label: 'Kit/Object' };
      case 'Computer File':
        return { icon: faDesktop, label: 'Computer File' };
      case 'Serial':
      case 'Periodical':
        return { icon: faFileAlt, label: 'Serial' };
      case 'Electronic Resource':
        return { icon: faDesktop, label: 'Electronic Resource' };
      default:
        return { icon: faFile, label: pubType };
    }
  }
  