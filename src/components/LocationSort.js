import Select from 'react-select';
import { useStore } from '../store/store';
import { useRouter } from 'next/router';

function LocationSort() {
  const router = useRouter();
  const setLocation = useStore(state => state.setLocation);
  const location = useStore(state => state.location);

  const options = [
    { value: '155e37bb-c5ae-4179-8a24-a6b625ff96f7', label: 'Amherst College' },
    { value: 'c9607f4b-2c99-4a41-941a-34b8624a80e1', label: 'Hampshire College' },
    { value: '32a2bcc6-0c65-437d-a7d7-17bf8785ec4d', label: 'Mount Holyoke College' },
    { value: 'b17b9e6b-82bb-4f97-b3e7-757e4e5aeb61', label: 'Smith College' },
    { value: '7e8d460a-93dc-40b4-a1b7-f4a85a0a0dba', label: 'University of Massachusetts Amherst' },
  ];

  const handleChange = (selectedOption) => {
    // When the clear button is clicked, selectedOption will be null
    if (selectedOption) {
      setLocation(selectedOption.value);
      const currentQuery = { ...router.query, location: selectedOption.value };
      router.push({ pathname: router.pathname, query: currentQuery }, undefined, { shallow: true });
    } else {
      setLocation(''); // Reset location if the selection is cleared
      const { ...rest } = router.query; // Destructure location out of the query params
      router.push({ pathname: router.pathname, query: rest }, undefined, { shallow: true });
    }
  };

  // Find the option that matches the location value from the store
  const selectedOption = options.find(option => option.value === location) || null;

  return (
    <Select
        placeholder="Select a campus"
        options={options}
        onChange={handleChange}
        value={selectedOption}
        isClearable={true}
        isOptionDisabled={(option) => option.isClearable === false}
        className="basic-single"
        classNamePrefix="select"
    />
  );
}

export default LocationSort;
