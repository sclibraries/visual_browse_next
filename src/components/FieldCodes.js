import { useEffect, useState } from 'react';
import Select from 'react-select';
import { useStore } from '../store/store';

const options = [
    { value: '', label: 'Keyword', description: 'Performs a keyword search of the entire record.' },
    { value: 'TX', label: 'All Text', description: 'Performs a keyword search for the keyword in the full text as well as the citation record.' },
    { value: 'AU', label: 'Author', description: 'Performs a keyword search for any authors of an article.' },
    { value: 'TI', label: 'Title', description: 'Searches keywords in a record\'s English and non-English title field.' },
    { value: 'SU', label: 'Subject Terms', description: 'Performs a keyword search of the subject headings listed in the records.' },
    { value: 'SO', label: 'Source', description: 'Performs a keyword search for the journal name of the article.' },
    { value: 'AB', label: 'Abstract', description: 'Performs a keyword search of the abstract summaries.' },
    { value: 'IS', label: 'ISSN', description: 'Performs an exact search for a publication\'s International Standard Serial Number.' },
    { value: 'IB', label: 'ISBN', description: 'Performs an exact search for an article\'s identification number in the ISBN and EISBN fields.' },
    { value: 'AR', label: 'Author Phrase', description: 'Performs a keyword search for the author\'s name in the author field.' },
    { value: 'DE', label: 'Exact Subject Heading', description: 'Performs an exact search for a subject heading.' },
  ];
  

function FieldCodes() {
  const [setFieldCode, fieldCode] = useStore(state => [state.setFieldCode, state.fieldCode]);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    const initialOption = options.find(option => option.value === fieldCode);
    setSelectedOption(initialOption);
  }, [fieldCode]); // Only re-run the effect if fieldCode changes

  const handleChange = option => {
    setFieldCode(option.value);
    setSelectedOption(option);
  };

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '42px',
      height: '42px',
      borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
      '&:hover': {
        borderColor: '#3b82f6'
      }
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: '40px',
      padding: '0 8px'
    }),
    input: (provided) => ({
      ...provided,
      margin: '0px'
    }),
    indicatorSeparator: () => ({
      display: 'none'
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: '40px'
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      maxHeight: '400px',
      minWidth: '350px'
    }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: '380px',
      padding: '4px'
    }),
    option: (provided, state) => ({
      ...provided,
      padding: '12px 16px',
      backgroundColor: state.isSelected 
        ? '#3b82f6' 
        : state.isFocused 
        ? '#f8fafc' 
        : 'white',
      color: state.isSelected ? 'white' : '#1f2937',
      fontSize: '0.875rem',
      lineHeight: '1.4',
      borderRadius: '6px',
      margin: '2px 0',
      border: state.isFocused && !state.isSelected ? '1px solid #e5e7eb' : 'none'
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#1f2937',
      fontWeight: '500'
    })
  };

  const formatOptionLabel = (option, { context }) => {
    // Show only the label in the control (when selected)
    if (context === 'value') {
      return (
        <div style={{ fontWeight: '500', color: '#1f2937' }}>
          {option.label}
        </div>
      );
    }
    
    // Show full label and description in the dropdown
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ 
          fontWeight: '600', 
          fontSize: '0.9rem',
          color: '#1f2937'
        }}>
          {option.label}
        </div>
        <div style={{ 
          fontSize: '0.8rem', 
          color: '#4b5563',
          lineHeight: '1.3',
          fontWeight: '400'
        }}>
          {option.description}
        </div>
      </div>
    );
  };

  return (
    <div>
      <Select
        value={selectedOption}
        onChange={handleChange}
        options={options}
        formatOptionLabel={formatOptionLabel}
        styles={customStyles}
        isSearchable={false}
        placeholder="Field Type"
      />
    </div>
  );
}

export default FieldCodes;
