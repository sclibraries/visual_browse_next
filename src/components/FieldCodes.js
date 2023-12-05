import React, { useEffect, useState } from 'react';
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

  return (
    <div>
      <Select
        value={selectedOption}
        onChange={handleChange}
        options={options}
        getOptionLabel={option => (
          <>
            <strong>{option.label}:</strong> {option.description}
          </>
        )}
      />
    </div>
  );
}

export default FieldCodes;
