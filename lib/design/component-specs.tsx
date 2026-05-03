/**
 * COMPONENT SPECIFICATIONS - Premium Game-Like UI
 * Usage: Copy these patterns into your components
 */

// ============================================================================
// BUTTON COMPONENTS
// ============================================================================

export const ButtonVariants = {
  // Primary - Gradient with strong shadow, glow on hover
  primary: `
    px-6 py-3 rounded-lg font-bold text-white
    bg-gradient-to-r from-[#FF9500] to-[#FFD700]
    shadow-[0_10px_25px_-5px_rgba(255,149,0,0.4)]
    hover:shadow-[0_15px_35px_-8px_rgba(255,149,0,0.5)]
    hover:scale-105 transition-all duration-200
    active:translate-y-1 active:shadow-[0_5px_15px_-3px_rgba(255,149,0,0.3)]
    disabled:opacity-50 disabled:cursor-not-allowed
  `,

  // Secondary - Cyan/Purple gradient
  secondary: `
    px-6 py-3 rounded-lg font-bold text-white
    bg-gradient-to-r from-[#00F0FF] to-[#C026D3]
    shadow-[0_10px_25px_-5px_rgba(0,240,255,0.2)]
    hover:shadow-[0_15px_35px_-8px_rgba(0,240,255,0.3)]
    hover:scale-105 transition-all duration-200
    active:translate-y-1
  `,

  // Accent - Bright neon with inner glow
  accent: `
    px-6 py-3 rounded-lg font-bold text-[#0F0F1A]
    bg-[#00F0FF]
    shadow-[0_0_20px_rgba(0,240,255,0.4),0_10px_25px_-5px_rgba(0,240,255,0.3)]
    hover:shadow-[0_0_30px_rgba(0,240,255,0.6),0_15px_35px_-8px_rgba(0,240,255,0.4)]
    hover:scale-105 transition-all duration-200
    active:translate-y-1 inset-glow
  `,

  // Ghost - Transparent with border, fill on hover
  ghost: `
    px-6 py-3 rounded-lg font-bold text-white
    border-2 border-[#00F0FF]
    hover:bg-[rgba(0,240,255,0.1)]
    hover:shadow-[0_0_20px_rgba(0,240,255,0.2)]
    transition-all duration-200
    active:bg-[rgba(0,240,255,0.2)]
  `,

  // Danger - Red/pink for destructive actions
  danger: `
    px-6 py-3 rounded-lg font-bold text-white
    bg-gradient-to-r from-[#FF0055] to-[#FF9500]
    shadow-[0_10px_25px_-5px_rgba(255,0,85,0.4)]
    hover:shadow-[0_15px_35px_-8px_rgba(255,0,85,0.5)]
    hover:scale-105 transition-all duration-200
  `,

  // Success - Green glow
  success: `
    px-6 py-3 rounded-lg font-bold text-[#0F0F1A]
    bg-[#22FF88]
    shadow-[0_0_20px_rgba(34,255,136,0.4),0_10px_25px_-5px_rgba(34,255,136,0.3)]
    hover:scale-105 transition-all duration-200
  `,
};

// ============================================================================
// CARD COMPONENTS
// ============================================================================

export const CardVariants = {
  // Base card with semi-transparent dark background
  base: `
    rounded-xl bg-[rgba(26,20,40,0.6)]
    backdrop-blur-md
    border border-[rgba(0,240,255,0.1)]
    shadow-[0_20px_40px_-10px_rgba(0,240,255,0.25),0_8px_16px_-4px_rgba(0,0,0,0.6)]
    p-6 transition-all duration-300
  `,

  // Elevated card with stronger shadow
  elevated: `
    rounded-xl bg-[rgba(26,20,40,0.6)]
    backdrop-blur-md
    border border-[rgba(0,240,255,0.15)]
    shadow-[0_32px_64px_-16px_rgba(0,240,255,0.3),0_12px_24px_-6px_rgba(0,0,0,0.8)]
    p-8 transition-all duration-300
    hover:shadow-[0_40px_80px_-20px_rgba(0,240,255,0.4),0_16px_32px_-8px_rgba(0,0,0,0.9)]
  `,

  // Interactive card with glow on hover
  interactive: `
    rounded-xl bg-[rgba(26,20,40,0.6)]
    backdrop-blur-md
    border border-[rgba(0,240,255,0.1)]
    shadow-[0_20px_40px_-10px_rgba(0,240,255,0.25),0_8px_16px_-4px_rgba(0,0,0,0.6)]
    p-6 cursor-pointer
    hover:border-[rgba(0,240,255,0.3)]
    hover:shadow-[0_0_20px_rgba(0,240,255,0.4),0_20px_40px_-10px_rgba(0,240,255,0.3),0_8px_16px_-4px_rgba(0,0,0,0.6)]
    hover:scale-105
    transition-all duration-300
    active:translate-y-1
  `,

  // Premium card with gold accent
  premium: `
    rounded-xl bg-[rgba(26,20,40,0.6)]
    backdrop-blur-md
    border-2 border-[#FFD700]
    shadow-[0_0_20px_rgba(255,215,0,0.3),0_20px_40px_-10px_rgba(255,215,0,0.2),0_8px_16px_-4px_rgba(0,0,0,0.6)]
    p-8 transition-all duration-300
    hover:shadow-[0_0_30px_rgba(255,215,0,0.4),0_32px_64px_-16px_rgba(255,215,0,0.3),0_12px_24px_-6px_rgba(0,0,0,0.8)]
  `,

  // Damage/highlight card with red accent
  highlight: `
    rounded-xl bg-[rgba(26,20,40,0.6)]
    backdrop-blur-md
    border-2 border-[#FF0055]
    shadow-[0_0_20px_rgba(255,0,85,0.3),0_20px_40px_-10px_rgba(255,0,85,0.2),0_8px_16px_-4px_rgba(0,0,0,0.6)]
    p-6 transition-all duration-300
  `,
};

// ============================================================================
// PROGRESS BAR / HEALTH BAR
// ============================================================================

export const ProgressBarVariants = {
  // Base progress bar
  container: `
    w-full h-6 rounded-full
    bg-[rgba(255,255,255,0.1)]
    border border-[rgba(0,240,255,0.2)]
    overflow-hidden
    shadow-[inset_0_4px_8px_rgba(0,0,0,0.4)]
  `,

  // Glowing fill with animation
  fill: {
    primary: `
      h-full rounded-full
      bg-gradient-to-r from-[#00F0FF] to-[#C026D3]
      shadow-[inset_0_0_20px_rgba(0,240,255,0.2),0_0_20px_rgba(0,240,255,0.4)]
      transition-all duration-300 ease-out
      animate-pulse
    `,
    success: `
      h-full rounded-full
      bg-gradient-to-r from-[#22FF88] to-[#00F0FF]
      shadow-[inset_0_0_20px_rgba(34,255,136,0.2),0_0_20px_rgba(34,255,136,0.4)]
      transition-all duration-300 ease-out
    `,
    warning: `
      h-full rounded-full
      bg-gradient-to-r from-[#FFD700] to-[#FF9500]
      shadow-[inset_0_0_20px_rgba(255,215,0,0.2),0_0_20px_rgba(255,215,0,0.4)]
      transition-all duration-300 ease-out
    `,
    danger: `
      h-full rounded-full
      bg-gradient-to-r from-[#FF0055] to-[#FF9500]
      shadow-[inset_0_0_20px_rgba(255,0,85,0.2),0_0_20px_rgba(255,0,85,0.4)]
      transition-all duration-300 ease-out
    `,
  },

  // Label for progress bar
  label: `
    flex justify-between items-center
    text-white text-sm font-bold
    mb-2
    tracking-wider
  `,
};

// ============================================================================
// BADGE / LEVEL / REWARD COMPONENTS
// ============================================================================

export const BadgeVariants = {
  // Standard badge
  base: `
    inline-flex items-center gap-1
    px-3 py-1.5 rounded-full
    bg-[rgba(0,240,255,0.2)]
    border border-[rgba(0,240,255,0.4)]
    text-[#00F0FF]
    text-xs font-bold uppercase tracking-wider
    shadow-[0_0_10px_rgba(0,240,255,0.2)]
  `,

  // XP / Earned badge
  earned: `
    inline-flex items-center gap-1.5
    px-4 py-2 rounded-lg
    bg-gradient-to-r from-[#22FF88] to-[#00F0FF]
    shadow-[0_0_15px_rgba(34,255,136,0.4),0_4px_12px_rgba(34,255,136,0.2)]
    text-[#0F0F1A] font-bold
    animate-bounce
  `,

  // Level badge - Metallic/golden effect
  level: `
    inline-flex items-center justify-center
    w-12 h-12 rounded-full
    bg-gradient-to-br from-[#FFD700] to-[#FF9500]
    border-2 border-[#FFED4E]
    text-[#0F0F1A] font-black text-lg
    shadow-[0_0_20px_rgba(255,215,0,0.4),0_8px_20px_rgba(255,215,0,0.2)]
  `,

  // Rank badge
  rank: `
    inline-flex items-center gap-2
    px-4 py-2 rounded-xl
    bg-gradient-to-r from-[#C026D3] to-[#FF00FF]
    text-white font-bold text-sm
    shadow-[0_0_15px_rgba(192,38,211,0.4),0_4px_12px_rgba(192,38,211,0.2)]
  `,

  // Special/Achievement badge
  achievement: `
    inline-flex items-center justify-center
    w-14 h-14 rounded-lg
    bg-gradient-to-br from-[#FFD700] via-[#FF9500] to-[#FF0055]
    shadow-[0_0_30px_rgba(255,215,0,0.4),0_8px_20px_rgba(255,215,0,0.3)]
    text-white font-black
    animate-bounce
  `,
};

// ============================================================================
// INPUT COMPONENTS
// ============================================================================

export const InputVariants = {
  // Base input with glow on focus
  base: `
    w-full h-11 px-4 rounded-lg
    bg-[rgba(26,20,40,0.4)]
    border border-[rgba(0,240,255,0.2)]
    text-white placeholder-[rgba(255,255,255,0.3)]
    transition-all duration-200
    focus:outline-none
    focus:border-[rgba(0,240,255,0.6)]
    focus:shadow-[0_0_20px_rgba(0,240,255,0.3),inset_0_0_20px_rgba(0,240,255,0.1)]
    focus:bg-[rgba(26,20,40,0.6)]
  `,

  // Error state
  error: `
    w-full h-11 px-4 rounded-lg
    bg-[rgba(26,20,40,0.4)]
    border-2 border-[#FF0055]
    text-white placeholder-[rgba(255,255,255,0.3)]
    transition-all duration-200
    focus:outline-none
    focus:shadow-[0_0_20px_rgba(255,0,85,0.3)]
  `,

  // Success state
  success: `
    w-full h-11 px-4 rounded-lg
    bg-[rgba(26,20,40,0.4)]
    border-2 border-[#22FF88]
    text-white placeholder-[rgba(255,255,255,0.3)]
    transition-all duration-200
    focus:outline-none
    focus:shadow-[0_0_20px_rgba(34,255,136,0.3)]
  `,
};

// ============================================================================
// GRADIENT BACKGROUNDS
// ============================================================================

export const GradientVariants = {
  // Primary gradient background for sections
  primary: `bg-gradient-to-br from-[#0F0F1A] via-[#1A1428] to-[#0F0F1A]`,

  // Neon accent gradient
  neon: `bg-gradient-to-r from-[#00F0FF] via-[#C026D3] to-[#FF00FF]`,

  // Warm gradient
  warm: `bg-gradient-to-r from-[#FFD700] via-[#FF9500] to-[#FF0055]`,

  // Success gradient
  success: `bg-gradient-to-r from-[#22FF88] to-[#00F0FF]`,

  // Animated gradient
  animated: `
    bg-gradient-to-r from-[#00F0FF] via-[#C026D3] to-[#FF00FF] bg-[length:200%_auto]
    animate-[gradient_3s_linear_infinite]
  `,
};

// ============================================================================
// TEXT STYLES
// ============================================================================

export const TextVariants = {
  // Heading 1 - Big, bold, punchy
  h1: `text-6xl font-black leading-tight tracking-tighter text-white`,
  h2: `text-5xl font-bold leading-snug tracking-tight text-white`,
  h3: `text-4xl font-bold leading-snug tracking-tight text-white`,
  h4: `text-3xl font-bold leading-normal tracking-tight text-white`,

  // Body text
  body: `text-base font-medium leading-relaxed text-white`,
  bodySm: `text-sm font-regular leading-relaxed text-[rgba(255,255,255,0.7)]`,

  // Accent text with glow
  accent: `text-white font-bold tracking-widest uppercase drop-shadow-[0_0_10px_rgba(0,240,255,0.3)]`,

  // Muted/secondary text
  muted: `text-[rgba(255,255,255,0.5)] font-regular`,

  // Gradient text
  gradient: `
    bg-gradient-to-r from-[#00F0FF] via-[#C026D3] to-[#FF00FF]
    bg-clip-text text-transparent font-black
  `,
};

// ============================================================================
// ANIMATION CLASSES
// ============================================================================

export const AnimationClasses = {
  // Bounce animation
  bounce: `animate-bounce`,

  // Glow pulse
  glowPulse: `animate-pulse shadow-[0_0_20px_rgba(0,240,255,0.4)]`,

  // Spin (for loading)
  spin: `animate-spin`,

  // Scale on hover
  hoverScale: `hover:scale-110 transition-transform duration-200`,

  // Glow on hover
  hoverGlow: `hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-shadow duration-200`,

  // Pop animation (entrance)
  pop: `animate-[pop_0.4s_cubic-bezier(0.34,1.56,0.64,1)]`,

  // Slide up (entrance)
  slideUp: `animate-[slideUp_0.5s_ease-out]`,

  // Shimmer effect for loading
  shimmer: `
    animate-[shimmer_2s_infinite]
    background-image: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%)
    background-size: 200% 100%
  `,
};

// ============================================================================
// COMPLETE COMPONENT EXAMPLES
// ============================================================================

export const ComponentExamples = {
  // Stats card with glow
  statsCard: `
    rounded-xl bg-[rgba(26,20,40,0.6)]
    backdrop-blur-md
    border border-[rgba(0,240,255,0.1)]
    shadow-[0_20px_40px_-10px_rgba(0,240,255,0.25),0_8px_16px_-4px_rgba(0,0,0,0.6)]
    p-6 text-center
    hover:border-[rgba(0,240,255,0.3)]
    hover:shadow-[0_0_20px_rgba(0,240,255,0.4),0_20px_40px_-10px_rgba(0,240,255,0.3),0_8px_16px_-4px_rgba(0,0,0,0.6)]
    transition-all duration-300
  `,

  // Score display with glow
  scoreDisplay: `
    text-6xl font-black
    bg-gradient-to-r from-[#FFD700] to-[#FF9500]
    bg-clip-text text-transparent
    drop-shadow-[0_0_20px_rgba(255,215,0,0.3)]
  `,

  // XP bar container
  xpBar: `
    w-full h-3 rounded-full
    bg-[rgba(255,255,255,0.1)]
    border border-[rgba(0,240,255,0.2)]
    overflow-hidden
    shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]
  `,

  // Achievement unlock animation
  achievementUnlock: `
    fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
    z-50
    animate-[pop_0.6s_cubic-bezier(0.34,1.56,0.64,1)]
    drop-shadow-[0_25px_50px_rgba(0,240,255,0.3)]
  `,
};
