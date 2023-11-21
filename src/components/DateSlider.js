import React, { useState, useEffect } from 'react';
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Form,
  FormGroup,
  Input,
  Button,
} from 'reactstrap';
import moment from 'moment';
import { useStore } from '../store/store';
import { shallow } from 'zustand/shallow';

//Date sort for EDS data
function DateSlider(type) {
  const currentDate = moment();
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [yearLow, setYearLow] = useState(1600);
  const [yearHigh, setYearHigh] = useState(currentDate.add(1, 'years').format('YYYY'));

  const [setDateLimiter, setShouldRefetch] = useStore((state) => [state.setDateLimiter, state.setShouldRefetch], shallow);

  useEffect(() => {
    setDateLimiter(`&limiter=DT1%3A${yearLow}-01/${yearHigh}-12`);
    setShouldRefetch(true);
  }, [yearLow, yearHigh]);

  const updateYear = (yearsAgo) => {
    const newYearLow = moment().subtract(yearsAgo, 'years').format('YYYY');
    const newYearHigh = moment().format('YYYY'); // Use the current year as the high year
  
    setYearLow(newYearLow);
    setYearHigh(newYearHigh);
  };
  

  const handleReset = () => {
    setYearLow(1600);
    setYearHigh(moment().add(1, 'years').format('YYYY'));
    setYearDropdownOpen(false);
  };

  console.log('yearLow', yearLow);
    console.log('yearHigh', yearHigh);

  return (
      <Dropdown isOpen={yearDropdownOpen} toggle={() => setYearDropdownOpen(!yearDropdownOpen)}>
        <DropdownToggle caret color="primary">
          Filter by Year
        </DropdownToggle>
        <DropdownMenu>
            <DropdownItem onClick={() => updateYear(1)}>
            Last Year
            </DropdownItem>
            <DropdownItem onClick={() => updateYear(5)}>
            5 Years Ago
            </DropdownItem>
            <DropdownItem onClick={() => updateYear(10)}>
            10 Years Ago
            </DropdownItem>
          <DropdownItem divider />
          <DropdownItem header>Manually add Dates</DropdownItem>
          <Form inline>
            <FormGroup style={{ padding: '8px' }}>
              <Input value={yearLow} onChange={(e) => setYearLow(e.target.value)} />
            </FormGroup>
            <FormGroup style={{ padding: '8px' }}>
              <Input value={yearHigh} onChange={(e) => setYearHigh(e.target.value)} />
            </FormGroup>
            <Button color="secondary" onClick={handleReset}>
              Reset
            </Button>
          </Form>
        </DropdownMenu>
      </Dropdown>
  );
}

export default DateSlider;
