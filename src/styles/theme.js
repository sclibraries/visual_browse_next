// Custom theme configuration for consistent styling

export const theme = {
  colors: {
    primary: '#3a6ea5',
    secondary: '#6c757d',
    accent: '#ff6b6b',
    lightAccent: '#ffe66d',
    background: '#f8f9fa',
    surface: '#ffffff',
    text: '#212529',
    muted: '#6c757d',
    border: '#dee2e6',
    success: '#52b788',
    danger: '#e63946',
    warning: '#ffb700',
    info: '#4cc9f0'
  },
  shadows: {
    small: '0 2px 5px rgba(0,0,0,0.1)',
    medium: '0 4px 8px rgba(0,0,0,0.12)',
    large: '0 8px 16px rgba(0,0,0,0.15)',
    hover: '0 8px 15px rgba(0,0,0,0.2)',
  },
  transitions: {
    default: 'all 0.3s ease',
    fast: 'all 0.15s ease',
    slow: 'all 0.45s ease'
  },
  borderRadius: {
    small: '4px',
    default: '8px',
    large: '16px',
    pill: '50px'
  }
};

// Component-specific styling functions
export const buttonStyles = (variant = 'primary', size = 'default') => {
  const variants = {
    primary: {
      background: theme.colors.primary,
      color: '#fff',
      hover: {
        background: '#2c5282',
      }
    },
    secondary: {
      background: theme.colors.surface,
      color: theme.colors.primary,
      border: `1px solid ${theme.colors.primary}`,
      hover: {
        background: '#f0f4f8',
      }
    },
    danger: {
      background: theme.colors.danger,
      color: '#fff',
      hover: {
        background: '#c11d28',
      }
    },
    accent: {
      background: theme.colors.accent,
      color: '#fff',
      hover: {
        background: '#e34646',
      }
    }
  };
  
  const sizes = {
    small: {
      padding: '6px 12px',
      fontSize: '0.875rem'
    },
    default: {
      padding: '10px 20px',
      fontSize: '1rem'
    },
    large: {
      padding: '14px 28px',
      fontSize: '1.125rem'
    }
  };
  
  return {
    ...variants[variant],
    ...sizes[size],
    borderRadius: theme.borderRadius.default,
    boxShadow: theme.shadows.small,
    transition: theme.transitions.fast,
    '&:hover': {
      ...variants[variant].hover,
      boxShadow: theme.shadows.hover,
      transform: 'translateY(-2px)'
    },
    '&:active': {
      transform: 'translateY(0)'
    }
  };
};

export const tableStyles = {
  container: {
    borderRadius: theme.borderRadius.default,
    overflow: 'hidden',
    boxShadow: theme.shadows.small,
    border: `1px solid ${theme.colors.border}`,
  },
  header: {
    backgroundColor: theme.colors.primary,
    color: '#fff',
    padding: '12px 16px',
    fontWeight: 500,
    fontSize: '0.9rem',
  },
  row: {
    borderBottom: `1px solid ${theme.colors.border}`,
    transition: theme.transitions.default,
    '&:last-child': {
      borderBottom: 'none',
    },
    '&:hover': {
      backgroundColor: 'rgba(58, 110, 165, 0.03)',
    },
  },
  cell: {
    padding: '12px 16px',
    fontSize: '0.9rem',
    color: theme.colors.text,
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: theme.borderRadius.pill,
    fontSize: '0.75rem',
    fontWeight: 500,
    backgroundColor: theme.colors.success,
    color: '#fff',
  }
};

// New custom pill style that's not Bootstrap-like
export const customPill = {
  container: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 12px',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: '500',
    letterSpacing: '0.3px',
    textTransform: 'uppercase',
    boxShadow: 'none',
    border: '1px solid transparent'
  },
  book: {
    backgroundColor: 'rgba(128, 90, 213, 0.1)',
    color: '#805ad5',
    borderColor: 'rgba(128, 90, 213, 0.3)',
  },
  video: {
    backgroundColor: 'rgba(237, 100, 166, 0.1)',
    color: '#ed64a6',
    borderColor: 'rgba(237, 100, 166, 0.3)',
  },
  ebook: {
    backgroundColor: 'rgba(56, 161, 105, 0.1)',
    color: '#38a169',
    borderColor: 'rgba(56, 161, 105, 0.3)',
  },
  audio: {
    backgroundColor: 'rgba(246, 173, 85, 0.1)',
    color: '#f6ad55',
    borderColor: 'rgba(246, 173, 85, 0.3)',
  },
  default: {
    backgroundColor: 'rgba(76, 201, 240, 0.1)',
    color: '#4cc9f0',
    borderColor: 'rgba(76, 201, 240, 0.3)',
  }
};
