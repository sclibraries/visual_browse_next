import { gql } from '@apollo/client'

export const FOLIO_SEARCH = gql`
  query foliosearch($query: String!, $limit: Int, $offset: Int) {
    foliosearch(query: $query, limit: $limit, offset: $offset) {
      totalRecords
      instances{
        id
        title
      }
    }
  }
`


export const GET_ORDERS = gql`
  query folioorders($material: String, $start: String!, $end: String!, $fundDistribution: String, $locations: String, $limit: Int, $offset: Int) {
    folioorders(material: $material, start: $start, end: $end, fundDistribution: $fundDistribution, locations: $locations, limit: $limit, offset: $offset) {
      totalRecords
      poLines {
        id
        receiptDate
        instanceId
        titleOrPackage
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
    googleImages{
      thumbnail_url
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