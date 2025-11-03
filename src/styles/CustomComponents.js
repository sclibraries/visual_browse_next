import styled from 'styled-components';
import { theme } from './theme';

// Custom styled button
export const StyledButton = styled.button`
  background: ${props => props.variant === 'primary' ? theme.colors.primary : 
              props.variant === 'danger' ? theme.colors.danger :
              props.variant === 'outline' ? 'transparent' : theme.colors.secondary};
  color: ${props => props.variant === 'outline' ? theme.colors.primary : '#fff'};
  border: ${props => props.variant === 'outline' ? `2px solid ${theme.colors.primary}` : 'none'};
  border-radius: ${theme.borderRadius.default};
  padding: ${props => props.size === 'small' ? '6px 12px' : '10px 20px'};
  font-size: ${props => props.size === 'small' ? '0.875rem' : '1rem'};
  font-weight: 500;
  cursor: pointer;
  transition: ${theme.transitions.fast};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${theme.shadows.small};
  margin: 0 0.5rem 0.5rem 0;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.medium};
    background: ${props => props.variant === 'primary' ? '#2c5282' :
                props.variant === 'danger' ? '#c11d28' :
                props.variant === 'outline' ? theme.colors.primary : '#5a6268'};
    color: ${props => props.variant === 'outline' ? '#fff' : '#fff'};
  }

  &:active {
    transform: translateY(0);
    box-shadow: ${theme.shadows.small};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(58, 110, 165, 0.3);
  }

  & > svg, & > i {
    margin-right: ${props => props.iconOnly ? '0' : '0.5rem'};
  }
`;

// Custom Badge component
export const StyledBadge = styled.span`
  display: inline-block;
  padding: 0.35em 0.65em;
  font-size: 0.75em;
  font-weight: 600;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: ${theme.borderRadius.pill};
  color: ${props => props.color === 'primary' ? '#fff' : 
           props.color === 'info' ? '#fff' : '#212529'};
  background-color: ${props => props.color === 'primary' ? theme.colors.primary :
                    props.color === 'info' ? theme.colors.info : 
                    props.color === 'warning' ? theme.colors.warning :
                    props.color === 'success' ? theme.colors.success :
                    props.color === 'danger' ? theme.colors.danger : '#e9ecef'};
  margin-right: 0.5rem;
`;

// Styled Card component for media items
export const MediaCard = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.default};
  overflow: hidden;
  box-shadow: ${theme.shadows.small};
  transition: ${theme.transitions.default};
  cursor: pointer;
  height: 100%;
  
  &:hover {
    box-shadow: ${theme.shadows.medium};
    transform: translateY(-5px);
  }
  
  .media-image-container {
    position: relative;
    width: 100%;
    padding-top: 150%; /* 2:3 aspect ratio */
    overflow: hidden;
  }
  
  .media-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .media-placeholder {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f0f0f0;
    color: ${theme.colors.muted};
  }
  
  .media-content {
    padding: 1rem;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }
  
  .media-title {
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  
  .media-subtitle {
    font-size: 0.8rem;
    color: ${theme.colors.muted};
    margin-top: auto;
  }
`;

// Styled Accordion components
export const StyledAccordion = styled.div`
  margin-bottom: 1.5rem;
`;

export const StyledAccordionItem = styled.div`
  border-radius: ${theme.borderRadius.default};
  margin-bottom: 1rem;
  overflow: hidden;
  box-shadow: ${theme.shadows.small};
  background: ${theme.colors.surface};
`;

export const StyledAccordionHeader = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem;
  font-weight: 600;
  color: ${theme.colors.text};
  background-color: ${props => props.isOpen ? 'rgba(58, 110, 165, 0.1)' : theme.colors.surface};
  border: none;
  text-align: left;
  cursor: pointer;
  transition: ${theme.transitions.default};
  
  &:hover {
    background-color: rgba(58, 110, 165, 0.05);
  }
  
  .accordion-icon {
    margin-right: 0.75rem;
    color: ${theme.colors.primary};
  }
  
  .toggle-icon {
    transition: transform 0.3s ease;
    transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0)'};
  }
`;

export const StyledAccordionBody = styled.div`
  padding: ${props => props.isOpen ? '1.25rem' : '0 1.25rem'};
  max-height: ${props => props.isOpen ? '2000px' : '0'};
  opacity: ${props => props.isOpen ? '1' : '0'};
  overflow: hidden;
  transition: all 0.5s ease;
`;

// Styled carousel
export const StyledCarousel = styled.div`
  .slick-arrow {
    z-index: 10;
    width: 40px;
    height: 40px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    display: flex !important;
    align-items: center;
    justify-content: center;
    
    &:before {
      font-size: 20px;
    }
    
    &:hover {
      background: rgba(0, 0, 0, 0.7);
    }
  }
  
  .slick-track {
    display: flex;
    align-items: stretch;
    
    .slick-slide {
      height: auto;
      
      & > div {
        height: 100%;
      }
    }
  }
  
  .slick-dots {
    bottom: -30px;
    
    li button:before {
      font-size: 10px;
      color: ${theme.colors.primary};
    }
    
    li.slick-active button:before {
      color: ${theme.colors.primary};
    }
  }
`;

// Custom material type pill styles
export const materialTypePill = (type) => {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '600',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    marginBottom: '1rem',
    border: '1px solid transparent'
  };

  // Different styles based on material type
  switch(type?.toLowerCase()) {
    case 'book':
      return {
        ...baseStyle,
        backgroundColor: 'rgba(82, 183, 136, 0.1)',
        color: '#52b788',
        borderColor: 'rgba(82, 183, 136, 0.3)'
      };
    case 'ebook':
      return {
        ...baseStyle,
        backgroundColor: 'rgba(76, 201, 240, 0.1)',
        color: '#4cc9f0',
        borderColor: 'rgba(76, 201, 240, 0.3)'
      };
    case 'video recording':
      return {
        ...baseStyle,
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        color: '#ff6b6b',
        borderColor: 'rgba(255, 107, 107, 0.3)'
      };
    case 'audio recording':
      return {
        ...baseStyle,
        backgroundColor: 'rgba(255, 183, 0, 0.1)',
        color: '#ffb700',
        borderColor: 'rgba(255, 183, 0, 0.3)'
      };
    default:
      return {
        ...baseStyle,
        backgroundColor: 'rgba(108, 117, 125, 0.1)',
        color: '#6c757d',
        borderColor: 'rgba(108, 117, 125, 0.3)'
      };
  }
};

// Custom availability table styles
export const availabilityTableStyle = {
  container: {
    borderRadius: theme.borderRadius.default,
    overflow: 'hidden',
    boxShadow: theme.shadows.small,
    border: `1px solid ${theme.colors.border}`,
    marginBottom: '1.5rem'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  header: {
    backgroundColor: theme.colors.primary,
    color: '#fff',
    fontSize: '0.9rem',
    fontWeight: '500',
    textAlign: 'left'
  },
  headerCell: {
    padding: '12px 16px'
  },
  row: {
    borderBottom: `1px solid ${theme.colors.border}`
  },
  cell: {
    padding: '12px 16px',
    fontSize: '0.9rem'
  },
  statusBadge: (status) => ({
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '500',
    backgroundColor: (status && typeof status === 'string' && status.toLowerCase() === 'available')
      ? theme.colors.success 
      : theme.colors.secondary,
    color: '#fff'
  })
};

// Custom button styles
export const buttonStyle = (variant) => {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 16px',
    borderRadius: theme.borderRadius.default,
    fontWeight: '500',
    fontSize: '0.9rem',
    border: 'none',
    cursor: 'pointer',
    transition: theme.transitions.fast,
    boxShadow: theme.shadows.small
  };

  switch(variant) {
    case 'primary':
      return {
        ...baseStyle,
        backgroundColor: theme.colors.primary,
        color: '#fff'
      };
    case 'secondary':
      return {
        ...baseStyle,
        backgroundColor: theme.colors.secondary,
        color: '#fff'
      };
    case 'danger':
      return {
        ...baseStyle,
        backgroundColor: theme.colors.danger,
        color: '#fff'
      };
    case 'outline':
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        color: theme.colors.primary,
        border: `1px solid ${theme.colors.primary}`
      };
    default:
      return {
        ...baseStyle,
        backgroundColor: theme.colors.surface,
        color: theme.colors.text,
        border: `1px solid ${theme.colors.border}`
      };
  }
};

// Custom accordion styles
export const accordionStyles = {
  container: {
    marginBottom: '2rem'
  },
  item: {
    marginBottom: '1rem',
    borderRadius: theme.borderRadius.default,
    overflow: 'visible', // Change from 'hidden' to 'visible'
    boxShadow: theme.shadows.small
  },
  header: {
    padding: '1rem 1.25rem',
    backgroundColor: theme.colors.surface,
    borderBottom: `1px solid ${theme.colors.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer'
  },
  headerText: {
    margin: 0,
    fontWeight: '600',
    fontSize: '1rem',
    color: theme.colors.text
  },
  icon: {
    transition: 'transform 0.3s ease'
  },
  body: {
    padding: '1.25rem',
    backgroundColor: theme.colors.surface,
    overflow: 'visible', // Ensure content can expand outside
    height: 'auto',      // Allow height to adjust to content
    maxHeight: 'none'    // Remove any height restrictions
  }
};
