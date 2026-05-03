/**
 * LEGAL NINJA - PREMIUM GAME-LIKE UI DESIGN TOKENS
 * Based on: Genshin Impact, Clash Royale, Duolingo style
 * Vibe: Bold, vibrant, slightly dark/neon with high contrast
 */

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const colors = {
  // Primary Neon Colors
  neon: {
    cyan: '#00F0FF',
    purple: '#C026D3',
    pink: '#FF00FF',
    gold: '#FFD700',
    orange: '#FF9500',
    green: '#22FF88',
    red: '#FF0055',
  },

  // Backgrounds
  background: {
    primary: '#0F0F1A', // Deep dark
    secondary: '#1A1428', // Slightly lighter
    card: 'rgba(26, 20, 40, 0.6)', // Semi-transparent
    overlay: 'rgba(15, 15, 26, 0.95)',
    gradient: 'linear-gradient(135deg, #0F0F1A 0%, #1A1428 100%)',
  },

  // Text
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.7)',
    muted: 'rgba(255, 255, 255, 0.45)',
    inverted: '#0F0F1A',
  },

  // Semantic
  success: '#22FF88',
  warning: '#FFD700',
  error: '#FF0055',
  info: '#00F0FF',
};

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  fontFamily: {
    display: '"Cabinet Grotesk", "Bricolage Grotesque", sans-serif', // Playful, geometric headings
    body: '"Bricolage Grotesque", "Inter", sans-serif', // Smooth, readable body text
    mono: '"Space Mono", monospace',
  },

  // Font weights
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  // Font sizes with line heights
  fontSize: {
    // Headings
    h1: {
      size: '64px',
      lineHeight: '1.1',
      letterSpacing: '-0.02em',
      fontWeight: 800,
    },
    h2: {
      size: '48px',
      lineHeight: '1.2',
      letterSpacing: '-0.02em',
      fontWeight: 700,
    },
    h3: {
      size: '36px',
      lineHeight: '1.2',
      letterSpacing: '-0.02em',
      fontWeight: 700,
    },
    h4: {
      size: '28px',
      lineHeight: '1.3',
      letterSpacing: '-0.01em',
      fontWeight: 700,
    },

    // Body
    body: {
      size: '16px',
      lineHeight: '1.5',
      letterSpacing: '0',
      fontWeight: 500,
    },
    bodySmall: {
      size: '14px',
      lineHeight: '1.4',
      letterSpacing: '0',
      fontWeight: 400,
    },

    // Labels & badges
    label: {
      size: '12px',
      lineHeight: '1.3',
      letterSpacing: '0.5px',
      fontWeight: 600,
      textTransform: 'uppercase',
    },
  },
};

// ============================================================================
// SPACING (8px base grid)
// ============================================================================

export const spacing = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
};

// ============================================================================
// BORDER RADIUS (Game-like, chunky feel)
// ============================================================================

export const borderRadius = {
  sm: '8px',
  base: '12px',
  md: '16px',
  lg: '20px',
  xl: '24px',
  full: '9999px',
};

// ============================================================================
// SHADOWS (Critical for game feel - layered, glowing)
// ============================================================================

export const shadows = {
  // Card shadows
  card: {
    sm: '0 8px 16px -4px rgba(0, 0, 0, 0.6)',
    base: '0 20px 40px -10px rgba(0, 240, 255, 0.25), 0 8px 16px -4px rgba(0, 0, 0, 0.6)',
    lg: '0 32px 64px -16px rgba(0, 240, 255, 0.3), 0 12px 24px -6px rgba(0, 0, 0, 0.8)',
  },

  // Button shadows
  button: {
    base: '0 10px 25px -5px rgba(255, 149, 0, 0.4)',
    hover: '0 15px 35px -8px rgba(255, 149, 0, 0.5)',
    active: '0 5px 15px -3px rgba(255, 149, 0, 0.3)',
  },

  // Glow effects
  glow: {
    cyan: '0 0 20px rgba(0, 240, 255, 0.4), 0 0 40px rgba(0, 240, 255, 0.2)',
    purple: '0 0 20px rgba(192, 38, 211, 0.4), 0 0 40px rgba(192, 38, 211, 0.2)',
    gold: '0 0 20px rgba(255, 215, 0, 0.4), 0 0 40px rgba(255, 215, 0, 0.2)',
    orange: '0 0 20px rgba(255, 149, 0, 0.4), 0 0 40px rgba(255, 149, 0, 0.2)',
  },

  // Inset glow for active elements
  insetGlow: {
    cyan: 'inset 0 0 20px rgba(0, 240, 255, 0.2)',
    purple: 'inset 0 0 20px rgba(192, 38, 211, 0.2)',
  },

  // Elevation
  elevation: {
    1: '0 4px 8px rgba(0, 0, 0, 0.4)',
    2: '0 8px 16px rgba(0, 0, 0, 0.5)',
    3: '0 12px 24px rgba(0, 0, 0, 0.6)',
    4: '0 16px 32px rgba(0, 0, 0, 0.7)',
  },
};

// ============================================================================
// ANIMATIONS & TRANSITIONS
// ============================================================================

export const animation = {
  // Timing functions
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },

  // Standard durations (in ms)
  duration: {
    fastest: 100,
    faster: 150,
    fast: 200,
    base: 300,
    slow: 400,
    slower: 500,
    slowest: 700,
  },

  // Keyframe animations
  keyframes: {
    // Pulse/glow
    glow: `
      @keyframes glow {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
    `,

    // Bounce
    bounce: `
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
    `,

    // Pop/scale
    pop: `
      @keyframes pop {
        0% { transform: scale(0.95); opacity: 0; }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); opacity: 1; }
      }
    `,

    // Slide up
    slideUp: `
      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `,

    // Rotate
    spin: `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `,

    // Shimmer
    shimmer: `
      @keyframes shimmer {
        0% { background-position: -1000px 0; }
        100% { background-position: 1000px 0; }
      }
    `,

    // Pulse (for progress bars)
    pulseFill: `
      @keyframes pulseFill {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
      }
    `,
  },
};

// ============================================================================
// COMPONENT SIZES
// ============================================================================

export const component = {
  // Button sizes
  button: {
    sm: {
      height: '32px',
      padding: '0 12px',
      fontSize: '12px',
    },
    md: {
      height: '44px',
      padding: '0 16px',
      fontSize: '14px',
    },
    lg: {
      height: '56px',
      padding: '0 24px',
      fontSize: '16px',
    },
    xl: {
      height: '64px',
      padding: '0 32px',
      fontSize: '18px',
    },
  },

  // Input sizes
  input: {
    height: '44px',
    padding: '0 12px',
    borderRadius: borderRadius.base,
  },

  // Card padding
  card: {
    sm: spacing[4],
    md: spacing[6],
    lg: spacing[8],
  },

  // Icon sizes
  icon: {
    xs: '16px',
    sm: '20px',
    md: '24px',
    lg: '32px',
    xl: '48px',
    '2xl': '64px',
  },
};

// ============================================================================
// Z-INDEX SCALE
// ============================================================================

export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modal: 40,
  popover: 50,
  tooltip: 60,
};

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px',
  ultrawide: '1920px',
};
