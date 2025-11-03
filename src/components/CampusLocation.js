import { useQuery } from '@apollo/client';
import { FOLIORTAC } from '../lib/api';

function CampusLocation(props){

    const cleanId = props.id.split('fs00001006.')[1]

    const { data } = useQuery(FOLIORTAC, {
        variables: {
            id: cleanId.replace(/\./g,'-')
            }
        }
    )

    const holdings = data?.foliortac?.holding || []
    const location = holdings.map(item => item.location[0].toLowerCase())

    let displayName = ''
    let displayColor = '#eee'

    if(location[0].includes('amherst college')){
        displayName = 'Amherst'
        displayColor = '#5d3c85'
    } else if(location[0].includes('five colleges')){
        displayName = 'Five Colleges'
        displayColor = '#5d3c85'
    } else if(location[0].includes('smith')){
        displayName = 'Smith'
        displayColor = '#207cb1'
    } else if(location[0].includes('mount holyoke')){
        displayName = 'Mount Holyoke'
        displayColor = '#83C2EC'
    } else if(location[0].includes('hampshire')){
        displayName = 'Hampshire'
        displayColor = '#009b9e'
    } else if(location[0].includes('umass amherst')){
        displayName = 'UMass'
        displayColor = '#881c1c'
    } else {
        displayName = 'Other'
        displayColor = '#eee'
    }
    
    return(
        <div>
            {holdings.map((items,index) => {
                return(
                    <span style={{marginRight: "5px"}} key={index}>
                        <span style={{backgroundColor: displayColor}} className="badge">{displayName}</span>
                    </span>
                )
            })}
        </div>
    )
}

export default CampusLocation