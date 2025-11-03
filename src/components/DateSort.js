import Select from 'react-select';
import { useStore } from '../store/store';
import { useRouter } from 'next/router';


//Date sort for FOLIO records
const DateSort = () => {
    const setDate = useStore(state => state.setDate);
    const date = useStore(state => state.date);
    const router = useRouter();

    const options = [
        { value: '3', label: 'Yesterday' },
        { value: '10', label: 'Last 10 Days' },
        { value: '30', label: 'Last 30 Days' },
        { value: '60', label: 'Last 60 Days' },
        { value: '90', label: 'Last 90 Days' },
        { value: '120', label: 'Last 120 Days' },
    ];

    const handleChange = (selectedOption) => {
        setDate(selectedOption ? selectedOption.value : '');
        const currentQuery = { ...router.query, date: selectedOption ? selectedOption.value : undefined };
        router.push({ pathname: router.pathname, query: currentQuery }, undefined, { shallow: true });
    };

    // Find the option that matches the date value from the store
    const selectedOption = options.find(option => option.value === date) || options.find(option => option.value === '30');

    return (
        <Select
            placeholder="Select a date range"
            options={options}
            onChange={handleChange}
            value={selectedOption}
            isClearable={false}
            className="basic-single"
            classNamePrefix="select"
        />
    );
};

export default DateSort;
