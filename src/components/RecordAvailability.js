import { useQuery } from '@apollo/client';
import { FOLIORTAC } from '../lib/api';
import styled from 'styled-components';
const { formatCallNumber, formatVolume, hasVolumes } = require('../utils/callNumber.cjs');

// Styled Components for RecordAvailability
const TableContainer = styled.div`
  margin-top: 20px;
  overflow-x: auto; // For responsiveness on smaller screens
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: 'Arial', sans-serif; // Example font
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden; // Ensures border-radius is respected by children
`;

const StyledTr = styled.tr`
  &:nth-child(even) {
    background-color: #f8f9fe; // Light alternating row color
  }
  &:hover {
    background-color: #e9ecef; // Hover effect for tbody rows
  }
  border-bottom: 1px solid #dee2e6; // Separator line
  &:last-child {
    border-bottom: none; // No border for the last row
  }
`;

const StyledThead = styled.thead`
  background-color: #5e72e4; // Using the primary color from RecordsDisplay
  color: white;
  font-weight: bold;

  // Prevent hover effect on header row by overriding it
  // This targets StyledTr specifically within StyledThead
  ${StyledTr}:hover {
    background-color: #5e72e4; // Keep original background color
  }
`;

const StyledTh = styled.th`
  padding: 12px 15px;
  text-align: left;
  border-bottom: 2px solid #dee2e6; // Thicker border for header
`;

const StyledTd = styled.td`
  padding: 12px 15px;
  text-align: left;
  vertical-align: middle;
`;

const StatusTd = styled(StyledTd)`
  font-weight: bold;
  color: ${props => (props.isAvailable ? '#2dce89' : '#f5365c')}; // Green for Available, Red for Not Available
  // Optionally, add a background or other indicators
  // background-color: ${props => (props.isAvailable ? 'rgba(45, 206, 137, 0.1)' : 'rgba(245, 54, 92, 0.1)')};
`;


function RecordAvailability(props) {

        
    const { id } = props;

    // Transform the id to the needed format ahead of time
    let cleanId = '';
    if (id.includes('fs00001006')) {
        const suffix = id.split('fs00001006.')[1] || '';
        cleanId = suffix.replace(/\./g, '-');
    }

    // Use the `skip` option to conditionally bypass the query
    const { data, loading, error } = useQuery(FOLIORTAC, {
        skip: !id.includes('fs00001006'), // The query will be skipped if 'fs00001006' is not in the id
        variables: { id: cleanId },
    });

    // Directly return null if id does not contain 'fs00001006'
    if (!id.includes('fs00001006')) {
        return null;
    }

        // Handle loading state
        if (loading) return <p>Loading...</p>;

        // Handle error state
        if (error) return <p>Error: {error.message}</p>;
    
        // Extract holdings or provide an empty array as a fallback
        const holdings = data?.foliortac?.holding || [];
    const showVolume = hasVolumes(holdings);

    
    return (
      <TableContainer>
        <StyledTable>
          <StyledThead>
            <StyledTr> {/* This StyledTr will now correctly maintain its background on hover */}
              <StyledTh scope="col">Status</StyledTh>
              <StyledTh scope="col">Call Number</StyledTh>
              {showVolume && <StyledTh scope="col">Volume</StyledTh>}
              <StyledTh scope="col">Location</StyledTh>
            </StyledTr>
          </StyledThead>
          <tbody>
            {holdings.length > 0 ? (
              holdings.map((holding, index) => {
                let currentStatus = 'N/A';
                let isAvailable = false;

                if (Array.isArray(holding.status) && holding.status.length > 0) {
                  currentStatus = holding.status.join(', '); // Display all statuses if it's an array
                  // Check if 'Available' is one of the statuses in the array
                  isAvailable = holding.status.some(s => typeof s === 'string' && s.trim() === 'Available');
                } else if (typeof holding.status === 'string') {
                  // Fallback for if status is unexpectedly a string
                  currentStatus = holding.status;
                  isAvailable = holding.status.trim() === 'Available';
                }

                return (
                  <StyledTr key={index}>
                    <StatusTd isAvailable={isAvailable}>{currentStatus}</StatusTd>
                    <StyledTd>{formatCallNumber(holding.callNumber)}</StyledTd>
                    {showVolume && <StyledTd>{formatVolume(holding.volume)}</StyledTd>}
                    <StyledTd>{holding.location}</StyledTd>
                  </StyledTr>
                );
              })
            ) : (
              <StyledTr>
                <StyledTd colSpan={showVolume ? 4 : 3} style={{ textAlign: 'center' }}>
                  No holdings information available.
                </StyledTd>
              </StyledTr>
            )}
          </tbody>
        </StyledTable>
      </TableContainer>
    );
}

export default RecordAvailability;