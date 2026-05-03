/**
 * TAILWIND CONFIG EXTENSIONS FOR GAME-LIKE UI
 * Add these theme extensions to your existing tailwind.config.ts
 */

import type { Config } from 'tailwindcss'

// This is a reference file showing what to ADD to your tailwind.config.ts
// Copy the contents into your existing config

const extendedConfig: Partial<Config> = {
  theme: {
    extend: {
      // ====================================================================
      // COLORS
      // ====================================================================
      colors: {
        // Neon palette
        neon: {
          cyan: '#00F0FF',
          purple: '#C026D3',
          pink: '#FF00FF',
          gold: '#FFD700',
          orange: '#FF9500',
          green: '#22FF88',
          red: '#FF0055',
        },
        // Dark backgrounds
        dark: {
          primary: '#0F0F1A',
          secondary: '#1A1428',
          card: 'rgba(26, 20, 40, 0.6)',
        },
      },

      // ====================================================================
      // SPACING (8px base grid)
      // ====================================================================
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        '9': '36px',
        '10': '40px',
        '12': '48px',
        '14': '56px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
      },

      // ====================================================================
      // BORDER RADIUS (Game-like, chunky)
      // ====================================================================
      borderRadius: {
        sm: '8px',
        base: '12px',
        md: '16px',
        lg: '20px',
        xl: '24px',
        '2xl': '32px',
      },

      // ====================================================================
      // BOX SHADOWS (Critical for game feel)
      // ====================================================================
      boxShadow: {
        // Card shadows
        'card-sm': '0 8px 16px -4px rgba(0, 0, 0, 0.6)',
        'card-base':
          '0 20px 40px -10px rgba(0, 240, 255, 0.25), 0 8px 16px -4px rgba(0, 0, 0, 0.6)',
        'card-lg':
          '0 32px 64px -16px rgba(0, 240, 255, 0.3), 0 12px 24px -6px rgba(0, 0, 0, 0.8)',

        // Button shadows
        'btn-base': '0 10px 25px -5px rgba(255, 149, 0, 0.4)',
        'btn-hover': '0 15px 35px -8px rgba(255, 149, 0, 0.5)',
        'btn-active': '0 5px 15px -3px rgba(255, 149, 0, 0.3)',

        // Glow effects
        'glow-cyan': '0 0 20px rgba(0, 240, 255, 0.4), 0 0 40px rgba(0, 240, 255, 0.2)',
        'glow-cyan-lg': '0 0 30px rgba(0, 240, 255, 0.5), 0 0 60px rgba(0, 240, 255, 0.3)',
        'glow-purple': '0 0 20px rgba(192, 38, 211, 0.4), 0 0 40px rgba(192, 38, 211, 0.2)',
        'glow-gold': '0 0 20px rgba(255, 215, 0, 0.4), 0 0 40px rgba(255, 215, 0, 0.2)',
        'glow-green': '0 0 20px rgba(34, 255, 136, 0.4), 0 0 40px rgba(34, 255, 136, 0.2)',
        'glow-orange': '0 0 20px rgba(255, 149, 0, 0.4), 0 0 40px rgba(255, 149, 0, 0.2)',
        'glow-red': '0 0 20px rgba(255, 0, 85, 0.4), 0 0 40px rgba(255, 0, 85, 0.2)',

        // Inset glows
        'inset-glow-cyan': 'inset 0 0 20px rgba(0, 240, 255, 0.2)',
        'inset-glow-purple': 'inset 0 0 20px rgba(192, 38, 211, 0.2)',

        // Elevation levels
        'elevation-1': '0 4px 8px rgba(0, 0, 0, 0.4)',
        'elevation-2': '0 8px 16px rgba(0, 0, 0, 0.5)',
        'elevation-3': '0 12px 24px rgba(0, 0, 0, 0.6)',
        'elevation-4': '0 16px 32px rgba(0, 0, 0, 0.7)',
      },

      // ====================================================================
      // FILTERS (for backdrop blur)
      // ====================================================================
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        base: '10px',
        md: '12px',
        lg: '16px',
      },

      // ====================================================================
      // ANIMATIONS & TRANSITIONS
      // ====================================================================
      animation: {
        // Glow/pulse
        'glow-pulse': 'glow 2s ease-in-out infinite',

        // Bounce variants
        'bounce': 'bounce 1s infinite',
        'bounce-sm': 'bounce-sm 1s infinite',

        // Pop animation (scale + fade entrance)
        'pop': 'pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pop-lg': 'pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',

        // Slide animations
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'slide-left': 'slideLeft 0.5s ease-out',
        'slide-right': 'slideRight 0.5s ease-out',

        // Spin (loading)
        'spin': 'spin 1s linear infinite',
        'spin-slow': 'spin 3s linear infinite',

        // Shimmer (skeleton loading)
        'shimmer': 'shimmer 2s infinite',

        // Pulse (subtle breathing effect)
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-lg': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',

        // Float (gentle up-down)
        'float': 'float 3s ease-in-out infinite',

        // Ping (expanding ring)
        'ping': 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
      },

      // ====================================================================
      // KEYFRAMES
      // ====================================================================
      keyframes: {
        // Glow pulse
        glow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },

        // Bounce variants
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'bounce-sm': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },

        // Pop animation
        pop: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },

        // Slide animations
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          from: { transform: 'translateY(-20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          from: { transform: 'translateX(20px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          from: { transform: 'translateX(-20px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },

        // Spin (already in base Tailwind)
        // spin: { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },

        // Shimmer effect
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },

        // Pulse (already in base Tailwind, but here's the definition)
        // pulse: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '.5' } },

        // Float animation
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },

        // Ping (already in base Tailwind)
        // ping: { '75%, 100%': { transform: 'scale(2)', opacity: '0' } },
      },

      // ====================================================================
      // TRANSITION DURATIONS
      // ====================================================================
      transitionDuration: {
        '0': '0ms',
        '50': '50ms',
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
        '600': '600ms',
        '700': '700ms',
        '800': '800ms',
        '900': '900ms',
        '1000': '1000ms',
      },

      // ====================================================================
      // Z-INDEX SCALE
      // ====================================================================
      zIndex: {
        hide: '-1',
        base: '0',
        dropdown: '10',
        sticky: '20',
        fixed: '30',
        modal: '40',
        popover: '50',
        tooltip: '60',
      },

      // ====================================================================
      // FONT FAMILIES (Game aesthetic)
      // ====================================================================
      fontFamily: {
        display: ['Exo 2', 'Poppins', 'Rajdhani', 'sans-serif'],
        body: ['Inter', 'Poppins', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },

      // ====================================================================
      // FONT SIZES (with line heights)
      // ====================================================================
      fontSize: {
        xs: ['12px', { lineHeight: '1.3', letterSpacing: '0.5px' }],
        sm: ['14px', { lineHeight: '1.4' }],
        base: ['16px', { lineHeight: '1.5' }],
        lg: ['18px', { lineHeight: '1.6' }],
        xl: ['20px', { lineHeight: '1.6' }],
        '2xl': ['24px', { lineHeight: '1.7' }],
        '3xl': ['28px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        '4xl': ['36px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        '5xl': ['48px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        '6xl': ['64px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
      },

      // ====================================================================
      // OPACITY SCALE (for fine-grained control)
      // ====================================================================
      opacity: {
        '0': '0',
        '5': '0.05',
        '10': '0.1',
        '20': '0.2',
        '25': '0.25',
        '30': '0.3',
        '40': '0.4',
        '45': '0.45',
        '50': '0.5',
        '60': '0.6',
        '70': '0.7',
        '75': '0.75',
        '80': '0.8',
        '90': '0.9',
        '95': '0.95',
        '100': '1',
      },
    },
  },

  // ========================================================================
  // PLUGINS
  // ========================================================================
  plugins: [],
}

export default extendedConfig

/**
 * HOW TO USE:
 *
 * 1. Copy this entire extend object into your tailwind.config.ts:
 *
 *    export default {
 *      theme: {
 *        extend: {
 *          // Paste the contents here
 *        }
 *      }
 *    }
 *
 * 2. Update your globals.css with:
 *
 *    @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap');
 *
 *    @layer base {
 *      :root {
 *        --color-neon-cyan: #00F0FF;
 *        --color-neon-purple: #C026D3;
 *      }
 *    }
 *
 * 3. Use in components:
 *
 *    <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-neon-orange to-neon-gold
 *                       shadow-btn-base hover:shadow-btn-hover hover:scale-105
 *                       transition-all duration-200 active:translate-y-1">
 *      Click Me
 *    </button>
 *
 *    <div className="rounded-xl bg-dark-card backdrop-blur-md border border-neon-cyan/10
 *                    shadow-card-base hover:shadow-card-lg transition-all duration-300">
 *      Content
 *    </div>
 */
