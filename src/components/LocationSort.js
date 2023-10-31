import React from 'react'
import { useStore } from '../store/store';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

function LocationSort(){
    const [setLocation] = useStore(state => [
        state.setLocation
    ])

    return(
        <select className="form-select" ariaLabel="Default select example" onChange={e => setLocation(e.target.value)}>
            <option value="">All Campuses</option>
            <option value="155e37bb-c5ae-4179-8a24-a6b625ff96f7">Amherst College</option>
            <option value="c9607f4b-2c99-4a41-941a-34b8624a80e1">Hampshire College</option>
            <option value="32a2bcc6-0c65-437d-a7d7-17bf8785ec4d">Mount Holyoke College</option>
            <option value="b17b9e6b-82bb-4f97-b3e7-757e4e5aeb61">Smith College</option>
            <option value="7e8d460a-93dc-40b4-a1b7-f4a85a0a0dba">University of Massachusetts Amherst</option>
        </select>
    )
}

export default LocationSort
