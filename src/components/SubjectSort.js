import Select from 'react-select';
import { useQuery } from '@apollo/client';
import { useStore } from '../store/store';
import { FOLIO_FINANCE } from '../lib/api';
import { useRouter } from 'next/router';

const customStyles = {
    control: (provided) => ({
      ...provided,
      width: 300, // Fixed width
      minHeight: '38px', // Mimic Bootstrap height
      borderRadius: '4px',
      borderColor: '#ccc',
    }),
    option: (provided) => ({
      ...provided,
      padding: '10px',
    }),
    // Add other custom styles here
  }


function SubjectSort() {

  const router = useRouter();
  const setSubject = useStore(state => state.setSubject);
  const subject = useStore(state => state.subject);
  const [location ] = useStore(state => [state.location]);

  let locationFilter = ''
  switch(location){
    case '155e37bb-c5ae-4179-8a24-a6b625ff96f7':
        locationFilter = 'Amherst'
    break;
    case 'c9607f4b-2c99-4a41-941a-34b8624a80e1':
        locationFilter = 'Hampshire'
    break;
    case '32a2bcc6-0c65-437d-a7d7-17bf8785ec4d':
        locationFilter = 'Mount Holyoke'
    break;
    case 'b17b9e6b-82bb-4f97-b3e7-757e4e5aeb61':
        locationFilter = 'Smith'
    break;
    case '7e8d460a-93dc-40b4-a1b7-f4a85a0a0dba':
        locationFilter = 'UMass'
    break;
    default:
        locationFilter = ''
    break;
  }  

  const { loading, error, data } = useQuery(FOLIO_FINANCE, {
    variables: { location: locationFilter } // add this only if you want to filter by location
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const options = data.foliofinance.expenseClasses.map((item) => ({
    value: item.id,
    label: item.name,
  }));

  const handleChange = (selectedOption) => {
    // When the clear button is clicked, selectedOption will be null
    if (selectedOption) {
      setSubject(selectedOption.value);
      const currentQuery = { ...router.query, subject: selectedOption.value };
      router.push({ pathname: router.pathname, query: currentQuery }, undefined, { shallow: true });
    } else {
      setSubject(''); // Reset subject if the selection is cleared
      const {  ...rest } = router.query; // Destructure subject out of the query params
      router.push({ pathname: router.pathname, query: rest }, undefined, { shallow: true });
    }
  };

    // Find the option that matches the subject value from the store
    const selectedOption = options.find(option => option.value === subject) || null;

  return (
    <Select
        placeholder="Filter by subject"
        styles={customStyles}
        options={options}
        onChange={handleChange}
        value={selectedOption} // Set the value to the selected option
        isClearable={true} // Allow the select to be cleared
    />
  );
}

export default SubjectSort;
