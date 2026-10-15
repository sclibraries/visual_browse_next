import { useState, useEffect } from 'react';
import Slider from '@mui/material/Slider';
import moment from 'moment';
import { useStore } from '../store/store';
import { useShallow } from 'zustand/react/shallow';

function DateSlider() {
  const currentYear = moment().year();
  const [dateRange, setDateRange] = useState([1600, currentYear]);

  const [
    setBookFacetAction, 
    setMovieFacetAction,
    setAllFacetAction,
    setShouldRefetch
] = useStore(useShallow((state) => [
    state.setBookFacetAction, 
    state.setMovieFacetAction,
    state.setAllFacetAction,
    state.setShouldRefetch]));

  useEffect(() => {
    setBookFacetAction(`addLimiter(DT1%3A${dateRange[0]}-01/${dateRange[1]}-12)`);
    setMovieFacetAction(`addLimiter(DT1%3A${dateRange[0]}-01/${dateRange[1]}-12)`);
    setAllFacetAction(`addLimiter(DT1%3A${dateRange[0]}-01/${dateRange[1]}-12)`);
  }, [dateRange]);

  const handleSliderChange = (event, newValue) => {
    setDateRange(newValue);
  };

  const handleSliderChangeCommitted = () => {
    setShouldRefetch(true);
  };

  const handlePreset = (yearsAgo) => {
    const newRange = [moment().subtract(yearsAgo, 'years').year(), currentYear];
    setDateRange(newRange);
    setBookFacetAction(`addLimiter(DT1%3A${newRange[0]}-01/${newRange[1]}-12)`);
    setMovieFacetAction(`addLimiter(DT1%3A${newRange[0]}-01/${newRange[1]}-12)`);
    setAllFacetAction(`addLimiter(DT1%3A${newRange[0]}-01/${newRange[1]}-12)`);
    setShouldRefetch(true);
  };

  const handleCustomInput = (event, bound) => {
    const newRange = [...dateRange];
    newRange[bound === 'low' ? 0 : 1] = event.target.value;
    setDateRange(newRange);
  };

  const handleCustomRangeSet = () => {
    setShouldRefetch(true);
  };

  const handleReset = () => {
    setDateRange([1600, currentYear]);
    setMovieFacetAction(`addLimiter(DT1%3A1600-01/${currentYear}-12)`);
    setAllFacetAction(`addLimiter(DT1%3A1600-01/${currentYear}-12)`);
    setBookFacetAction(`addLimiter(DT1%3A1600-01/${currentYear}-12)`);
    setShouldRefetch(true);
  };

  return (
    <div className="container" style={{maxWidth: "70%"}}>
      <Slider
        min={1600}
        max={currentYear}
        value={dateRange}
        onChange={handleSliderChange}
        onChangeCommitted={handleSliderChangeCommitted}
        valueLabelDisplay="auto"
      />
      <div style={{ marginTop: '10px', textAlign: 'center' }}>
        Selected Range: {dateRange[0]} - {dateRange[1]}
      </div>
      <div style={{ marginTop: '10px', textAlign: 'center' }}>
        <button className="btn btn-primary" onClick={() => handlePreset(1)}>Last Year</button>{' '}
        <button className="btn btn-primary" onClick={() => handlePreset(5)}>5 Years Ago</button>{' '}
        <button className="btn btn-primary" onClick={() => handlePreset(10)}>10 Years Ago</button>{' '}
        <button className="btn btn-warning" onClick={handleReset}>Reset</button>
      </div>
      <div style={{ marginTop: '10px', textAlign: 'center' }}>
        Custom Range: 
        <input type="number" value={dateRange[0]} onChange={(e) => handleCustomInput(e, 'low')} />
        -
        <input type="number" value={dateRange[1]} onChange={(e) => handleCustomInput(e, 'high')} />
        <button className="btn btn-light" onClick={handleCustomRangeSet}>Set Range</button>
      </div>
    </div>
  );
}

export default DateSlider;
