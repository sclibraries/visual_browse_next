import { gql } from '@apollo/client'

export const FOLIO_SEARCH = gql`
  query foliosearch($query: String!, $limit: Int, $offset: Int) {
    foliosearch(query: $query, limit: $limit, offset: $offset) {
      totalRecords
      instances{
        id
        title
        uriImage
      }
    }
  }
`

export const FOLIO_FINANCE = gql`
  query foliofinance($limit: Int, $offset: Int, $location: String) {
    foliofinance(limit: $limit, offset: $offset, location: $location) {
      expenseClasses {
        id
        code
        name
        metadata {
          createdDate
          createdByUserId
          updatedDate
          updatedByUserId
        }
      }
    }
  }
`;



export const GET_ORDERS = gql`
  query folioorders($material: String, $start: String!, $end: String!, $fundDistribution: String, $acquisitionsUnit: String, $locations: String, $limit: Int, $offset: Int) {
    folioorders(material: $material, start: $start, end: $end, fundDistribution: $fundDistribution, acquisitionsUnit: $acquisitionsUnit, locations: $locations, limit: $limit, offset: $offset) {
      totalRecords
      poLines {
        id
        receiptDate
        instanceId
        titleOrPackage
        retrieveorderitems {
          instances {
            id
            title
            items {
              materialTypeId
              retrievemattype {
                id
                name
              }
            }
            contributors {
              name
              primary
            }
            publication {
              publisher
              dateOfPublication
            }
            electronicAccess {
              uri
              linkText
            }
            identifiers {
              value
              identifierTypeId
            }
          }
        }
      }
    }
  }
`

export const GET_IMAGES = gql`
  query imagesSearch($id: String, $title: String!, $material: String!, $year: String, $oclc: String, $isbn: String) {
    imagesSearch(id: $id, title: $title, material: $material, year: $year, oclc: $oclc, isbn: $isbn)
  }
`

export const GET_BROWSE = gql`
query search(
    $query: String!, 
    $action: String, 
    $refine: String, 
    $sort: String, 
    $includefacets: String,
    $searchmode: String,
    $autosuggest: String,
    $autocorrect: String,
    $view: String,
    $resultsperpage: Int, 
    $pagenumber: Int,
    $highlight: String,
    $includeimagequickview: String,
    $expander: String,
    $fieldcode: String, 
    $limiter: String){
  search(
    query: $query,
    action: $action,
    refine: $refine,
    sort: $sort,
    includefacets: $includefacets,
    searchmode: $searchmode,
    autosuggest: $autosuggest,
    autocorrect: $autocorrect,
    view: $view,
    resultsperpage: $resultsperpage,
    pagenumber: $pagenumber,
    highlight: $highlight,
    includeimagequickview: $includeimagequickview,
    expander: $expander,
    fieldcode: $fieldcode,
    limiter: $limiter
  ) {
    queryString
    autoSuggestedTerms
    limtersWithAction {
      Id
      RemoveAction
      LimiterValuesWithAction {
        Value
      }
    }
    queryWithAction{
      Query{
        BooleanOperator
        FieldCode
        Term
      }
      RemoveAction
    }
    expandersWithAction{
        Id
        RemoveAction
      }
    facetFiltersWithAction {
      RemoveAction
      FacetValuesWithAction {
        FacetValue {
          Id
          Value
        }
        RemoveAction
      }
    }
    statistics {
      hits
      time
    }
    records {
      titleItem
      titles{
        TitleFull
      }
      an
      dbid
      pLink
      pubType
      pubTypeId
      imageItem
      coverImage { url source }
      abstractItem
      items{
        name
        label
        data
     }
     itemsRaw{
        name
        label
        data
     }
      image{
        Target
        Size
    }

  tmdbSearch{
      results{
        title
        poster_path
      }
    }
  }
    facets  {
      location{
        id
        label  
        values {
          value
          action
          count
          label
        }
      }
      publisher {
        id
        label  
        values {
          value
          action
          count
          label
        }
      }
      subject {
        id
        label  
        values {
          value
          action
          count
          label
        }
      }
      language {
        id
        label  
        values {
          value
          action
          count
          label
        }
      }
      sourceType {
        id
        label
        values {
          value
          action
          count
          label
        }
      }
    }
  }
}  
`

export const GET_BROWSE_COMBINED = gql`
query combinedSearch(
    $query: String!,
    $action: String,
    $refine: String,
    $sort: String,
    $includefacets: String,
    $searchmode: String,
    $autosuggest: String,
    $autocorrect: String,
    $view: String = "detailed",
    $resultsperpage: Int,
    $pagenumber: Int,
    $highlight: String,
    $includeimagequickview: String,
    $expander: String,
    $fieldcode: String,
    $limiter: String,
    $collectionLimit: Int = 5,
    $localOnly: String
) {
  combinedSearch(
    query: $query,
    action: $action,
    refine: $refine,
    sort: $sort,
    includefacets: $includefacets,
    searchmode: $searchmode,
    autosuggest: $autosuggest,
    autocorrect: $autocorrect,
    view: $view,
    resultsperpage: $resultsperpage,
    pagenumber: $pagenumber,
    highlight: $highlight,
    includeimagequickview: $includeimagequickview,
    expander: $expander,
    fieldcode: $fieldcode,
    limiter: $limiter,
    collectionLimit: $collectionLimit,
    localOnly: $localOnly
  ) {
    searchTerm
    totalEdsResults
    totalCollectionResults
    hasMoreEds
    hasMoreCollections
    edsResults {
      queryString
      autoSuggestedTerms
      limtersWithAction {
        Id
        RemoveAction
        LimiterValuesWithAction {
          Value
        }
      }
      queryWithAction{
        Query{
          BooleanOperator
          FieldCode
          Term
        }
        RemoveAction
      }
      expandersWithAction{
          Id
          RemoveAction
        }
      facetFiltersWithAction {
        RemoveAction
        FacetValuesWithAction {
          FacetValue {
            Id
            Value
          }
          RemoveAction
        }
      }
      statistics {
        hits
        time
      }
      records {
        titleItem
        titles{
          TitleFull
        }
        an
        dbid
        pLink
        pubType
        pubTypeId
        imageItem
        coverImage { url source }
        abstractItem
        items{
          name
          label
          data
       }
       itemsRaw{
          name
          label
          data
       }
        image{
          Target
          Size
      }

    tmdbSearch{
        results{
          title
          poster_path
        }
      }
    }
      facets  {
        location{
          id
          label  
          values {
            value
            action
            count
            label
          }
        }
        publisher {
          id
          label  
          values {
            value
            action
            count
            label
          }
        }
        subject {
          id
          label  
          values {
            value
            action
            count
            label
          }
        }
        language {
          id
          label  
          values {
            value
            action
            count
            label
          }
        }
        sourceType {
          id
          label
          values {
            value
            action
            count
            label
          }
        }
      }
    }
    collectionResults {
      totalCount
      hasMore
      collections {
        collection_id
        name
        description
        relevanceScore
        matchType
        cover_image
        subjects {
          subject_id
          subject
        }
      }
    }
  }
}  
`

export const FOLIORTAC = gql`
query foliortac($id: String!){
  foliortac(id: $id) {
    holding{
      id
      status
      callNumber
      location
    }
  }
}
`

export const GET_RECORD = gql`
query record($an: String!, $dbid: String!){
    record(an: $an, dbid: $dbid) {
        records{
            titleItem
            titleFull
            titleFullRelationship
            authorItem{
              author
              term
              fieldCode
            }
            titles{
              TitleFull
            }
            abstractItem
            titleSourceItem
            urlItem
            subjectItem{
              subject
              term
              fieldCode
            }
            isbn
            pLink
            volume
            issue
            pagesItem
            issnItem
            year
            month
            day
            startPage
            an
            dbid
            pubType
            items{
                name
                label
                data
            }
            itemsRaw{
                name
                label
                data
            }
            image{
              Target
              Size
            }
            imageItem
            coverImage { url source }

            tmdbSearch{
              results{
                title
                poster_path
                fullrecordcast{
                  id
                  cast{
                    name
                    order
                    character
                    gender
                    profile_path
                  }
                  crew{
                    name
                    job
                    profile_path
                    department
                    gender
                  }
                }
              }
            }
            doiItem
            pubType
            pubTypeItem
            pdf
            otherFullText
            customLinkAvailable
            isPartOfRelationship{
              BibEntity{
                Identifiers{
                  Type
                  Value
                }
              }
            }
            fullText{
              Links{
                Url
              } 
              Text{
                 Availability
              }
              CustomLinks{
                 Name 
                 Url
              }
          }
        } 
    }
}
`

export const GET_RECOMMENDATIONS = gql`
query search($query: String!, $action: String, $refine: String){
    search(query: $query, action: $action, refine: $refine) {
        records {
            an
            dbid
            titleItem
            pubType
            titles{
                TitleFull
            }
            retrieve{
              records{
                abstractItem
              }
            }
            titleFull
            imageItem
            coverImage { url source }
            tmdbSearch{
                results{
                  title
                  poster_path
                }
            }
        }    
    }
}       
`

export const GET_TMDB = gql`
query tmdbSearch($query: String!, $year: String){
    tmdbSearch(query: $query, year: $year) {
        results{
            title
            release_date
            poster_path
            original_language
            id
            video
            media_type
            overview
            fullrecord{
              title
              tagline
              budget
              imdb_id
              revenue
              runtime
              status
              tagline
              video
              name
              original_title
              original_language
              adult
              backdrop_path
              poster_path
              production_companies{
                id
                name
              }
            }
            fullrecordcast{
              id
              cast{
                name
                order
                character
                gender
                profile_path
              }
              crew{
                name
                job
                profile_path
                department
                gender
              }
            }
          }
    }
}   
`

export const GET_TMDB_EXTERNAL_ID = gql`
query tmdbExternalId($query: String!){
  tmdbExternalId(query: $query) {
            fullrecordcast{
              id
              cast{
                name
                order
                character
                gender
                profile_path
              }
              crew{
                name
                job
                profile_path
                department
                gender
              }
            }
          }
    } 
`

export const GET_SHELF_BROWSE = gql`
    query foliocallnumberbrowse($query: String!, $type: String!) {
        foliocallnumberbrowse(query: $query, type: $type) {
            items{
                fullCallNumber
                shelfKey
                instance{
                  id
                  title
                  googleImages{
                    thumbnail_url
                  }
                }
              }
            }
    }
`

export const GET_TMDB_CAST = gql`
  query tmdbSearch($query: String!, $year: String) {
    tmdbSearch(query: $query, year: $year) {
      results {
        id
        title
        media_type
        fullrecordcast {
          id
          cast {
            cast_id
            character
            credit_id
            name
            gender
            id
            order
            profile_path
          }
          crew {
            credit_id
            department
            gender
            id
            job
            name
            profile_path
          }
        }
      }
    }
  }
`

export const GET_COLLECTION_CONFIGS_V2 = gql`
  query GET_COLLECTION_CONFIGS_V2($active: Boolean) {
    collectionConfigsV2(active: $active) {
      slug
      title
      description
      materialType
      recordCount
      facetConfig {
        field
        label
        type
        expanded
      }
      sortConfig {
        value
        label
      }
      searchConfig {
        fields {
          value
          label
        }
      }
      displayConfig {
        imageField
        titleField
        subtitleField
        badgeField
        streaming
      }
    }
  }
`

export const GET_COLLECTION_CONFIG_V2 = gql`
  query GET_COLLECTION_CONFIG_V2($slug: String!) {
    collectionConfigV2(slug: $slug) {
      slug
      title
      description
      materialType
      recordCount
      facetConfig {
        field
        label
        type
        expanded
      }
      sortConfig {
        value
        label
      }
      searchConfig {
        fields {
          value
          label
        }
      }
      displayConfig {
        imageField
        titleField
        subtitleField
        badgeField
        streaming
      }
    }
  }
`

export const GET_COLLECTION_SEARCH_V2 = gql`
  query GET_COLLECTION_SEARCH_V2($input: CollectionSearchInput!) {
    collectionSearchV2(input: $input) {
      total
      page
      limit
      facets {
        field
        label
        truncated
        supportsSearch
        requiresQuery
        values {
          value
          label
          count
        }
      }
      appliedFilters {
        field
        value
        label
      }
      availableSorts {
        value
        label
      }
      records {
        id
        instanceId
        folioInstanceUuid
        title
        uriImage
        coverImageUrl
        callNumber
        publicationYear
        materialType
        streamingUrl
        isStreaming
        contributors {
          name
          role
          primary
          viafId
        }
        subjects {
          heading
          headingType
          source
        }
        items {
          id
          materialType
          locationName
          locationId
          libraryName
          campusName
          callNumber
          status
        }
        identifiers {
          type
          value
        }
        notes {
          noteType
          note
        }
      }
    }
  }
`

export const GET_COLLECTION_FACET_VALUES_V2 = gql`
  query GET_COLLECTION_FACET_VALUES_V2($input: CollectionFacetValuesInput!) {
    collectionFacetValuesV2(input: $input) {
      field
      label
      page
      limit
      total
      hasMore
      supportsSearch
      requiresQuery
      values {
        value
        label
        count
      }
    }
  }
`

export const GET_COLLECTION_RECORD_V2 = gql`
  query GET_COLLECTION_RECORD_V2($slug: String!, $id: ID!) {
    collectionRecordV2(slug: $slug, id: $id) {
      id
      instanceId
      folioInstanceUuid
      title
      uriImage
      coverImageUrl
      callNumber
      publicationYear
      materialType
      streamingUrl
      isStreaming
      contributors {
        name
        role
        primary
        viafId
      }
      subjects {
        heading
        headingType
        source
      }
      items {
        id
        materialType
        locationName
        locationId
        libraryName
        campusName
        callNumber
        status
      }
      identifiers {
        type
        value
      }
      notes {
        noteType
        note
      }
    }
  }
`