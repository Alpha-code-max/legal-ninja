# 🎮 GAME UI - QUICK REFERENCE CARD
## Copy-paste ready components and utilities

---

## COLORS

### Primary Colors
```
Cyan:      #00F0FF  (Info, secondary CTAs)
Purple:    #C026D3  (Premium, secondary)
Gold:      #FFD700  (Rewards, highlights)
Orange:    #FF9500  (Primary CTAs, action)
Green:     #22FF88  (Success, progress)
Red:       #FF0055  (Danger, errors)
Pink:      #FF00FF  (Premium, vibrant)
```

### Backgrounds
```
Primary:   #0F0F1A  (Main background)
Secondary: #1A1428  (Cards, sections)
Overlay:   rgba(15, 15, 26, 0.95)
Card:      rgba(26, 20, 40, 0.6)  (Semi-transparent with blur)
```

---

## QUICK BUTTON COPY-PASTE

### Primary Button (Sign Up, Launch, etc.)
```tsx
<button className="px-6 py-3 rounded-lg font-bold text-white
  bg-gradient-to-r from-[#FF9500] to-[#FFD700]
  shadow-[0_10px_25px_-5px_rgba(255,149,0,0.4)]
  hover:shadow-[0_15px_35px_-8px_rgba(255,149,0,0.5)]
  hover:scale-105 transition-all duration-200
  active:translate-y-1">
  Click Me
</button>
```

### Secondary Button (Info, Help)
```tsx
<button className="px-6 py-3 rounded-lg font-bold text-white
  bg-gradient-to-r from-[#00F0FF] to-[#C026D3]
  shadow-[0_10px_25px_-5px_rgba(0,240,255,0.2)]
  hover:shadow-[0_15px_35px_-8px_rgba(0,240,255,0.3)]
  hover:scale-105 transition-all duration-200">
  Secondary
</button>
```

### Danger Button (Delete, Cancel)
```tsx
<button className="px-6 py-3 rounded-lg font-bold text-white
  bg-gradient-to-r from-[#FF0055] to-[#FF9500]
  shadow-[0_10px_25px_-5px_rgba(255,0,85,0.4)]
  hover:shadow-[0_15px_35px_-8px_rgba(255,0,85,0.5)]
  hover:scale-105 transition-all duration-200">
  Delete
</button>
```

### Ghost Button (Outline)
```tsx
<button className="px-6 py-3 rounded-lg font-bold text-white
  border-2 border-[#00F0FF]
  hover:bg-[rgba(0,240,255,0.1)]
  hover:shadow-[0_0_20px_rgba(0,240,255,0.2)]
  transition-all duration-200">
  Ghost Button
</button>
```

---

## QUICK CARD COPY-PASTE

### Base Card
```tsx
<div className="rounded-xl bg-[rgba(26,20,40,0.6)]
  backdrop-blur-md
  border border-[rgba(0,240,255,0.1)]
  shadow-[0_20px_40px_-10px_rgba(0,240,255,0.25),0_8px_16px_-4px_rgba(0,0,0,0.6)]
  p-6 transition-all duration-300">
  Card Content
</div>
```

### Elevated Card (Interactive)
```tsx
<div className="rounded-xl bg-[rgba(26,20,40,0.6)]
  backdrop-blur-md
  border border-[rgba(0,240,255,0.15)]
  shadow-[0_32px_64px_-16px_rgba(0,240,255,0.3),0_12px_24px_-6px_rgba(0,0,0,0.8)]
  p-8 transition-all duration-300
  hover:shadow-[0_40px_80px_-20px_rgba(0,240,255,0.4),0_16px_32px_-8px_rgba(0,0,0,0.9)]
  hover:scale-105">
  Content
</div>
```

### Premium Card (Gold border)
```tsx
<div className="rounded-xl bg-[rgba(26,20,40,0.6)]
  backdrop-blur-md
  border-2 border-[#FFD700]
  shadow-[0_0_20px_rgba(255,215,0,0.3),0_20px_40px_-10px_rgba(255,215,0,0.2),0_8px_16px_-4px_rgba(0,0,0,0.6)]
  p-8 transition-all duration-300
  hover:shadow-[0_0_30px_rgba(255,215,0,0.4),0_32px_64px_-16px_rgba(255,215,0,0.3),0_12px_24px_-6px_rgba(0,0,0,0.8)]">
  Premium Content
</div>
```

---

## QUICK BADGE COPY-PASTE

### Standard Badge
```tsx
<span className="inline-flex items-center gap-1
  px-3 py-1.5 rounded-full
  bg-[rgba(0,240,255,0.2)]
  border border-[rgba(0,240,255,0.4)]
  text-[#00F0FF]
  text-xs font-bold uppercase tracking-wider
  shadow-[0_0_10px_rgba(0,240,255,0.2)]">
  ⚡ ACTIVE
</span>
```

### XP/Earned Badge (Animated)
```tsx
<div className="inline-flex items-center gap-1.5
  px-4 py-2 rounded-lg
  bg-gradient-to-r from-[#22FF88] to-[#00F0FF]
  shadow-[0_0_15px_rgba(34,255,136,0.4),0_4px_12px_rgba(34,255,136,0.2)]
  text-[#0F0F1A] font-bold
  animate-bounce">
  +100 XP
</div>
```

### Level Badge (Circular)
```tsx
<div className="inline-flex items-center justify-center
  w-12 h-12 rounded-full
  bg-gradient-to-br from-[#FFD700] to-[#FF9500]
  border-2 border-[#FFED4E]
  text-[#0F0F1A] font-black text-lg
  shadow-[0_0_20px_rgba(255,215,0,0.4),0_8px_20px_rgba(255,215,0,0.2)]">
  42
</div>
```

---

## QUICK PROGRESS BAR

### Progress Bar Container
```tsx
<div className="w-full h-6 rounded-full
  bg-[rgba(255,255,255,0.1)]
  border border-[rgba(0,240,255,0.2)]
  overflow-hidden
  shadow-[inset_0_4px_8px_rgba(0,0,0,0.4)]">
  {/* Fill goes inside */}
</div>
```

### Progress Bar Fill (Cyan)
```tsx
<div className="h-full rounded-full
  bg-gradient-to-r from-[#00F0FF] to-[#C026D3]
  shadow-[inset_0_0_20px_rgba(0,240,255,0.2),0_0_20px_rgba(0,240,255,0.4)]
  transition-all duration-300
  animate-pulse"
  style={{ width: `${percentage}%` }}>
</div>
```

### Progress Bar Fill (Green - Success)
```tsx
<div className="h-full rounded-full
  bg-gradient-to-r from-[#22FF88] to-[#00F0FF]
  shadow-[inset_0_0_20px_rgba(34,255,136,0.2),0_0_20px_rgba(34,255,136,0.4)]
  transition-all duration-300"
  style={{ width: `${percentage}%` }}>
</div>
```

---

## QUICK INPUT COPY-PASTE

### Input with Cyan Glow on Focus
```tsx
<input
  className="w-full h-11 px-4 rounded-lg
  bg-[rgba(26,20,40,0.4)]
  border border-[rgba(0,240,255,0.2)]
  text-white placeholder-[rgba(255,255,255,0.3)]
  transition-all duration-200
  focus:outline-none
  focus:border-[rgba(0,240,255,0.6)]
  focus:shadow-[0_0_20px_rgba(0,240,255,0.3),inset_0_0_20px_rgba(0,240,255,0.1)]
  focus:bg-[rgba(26,20,40,0.6)]"
  placeholder="Type something..."
/>
```

### Input Error State
```tsx
<input
  className="w-full h-11 px-4 rounded-lg
  bg-[rgba(26,20,40,0.4)]
  border-2 border-[#FF0055]
  text-white placeholder-[rgba(255,255,255,0.3)]
  transition-all duration-200
  focus:outline-none
  focus:shadow-[0_0_20px_rgba(255,0,85,0.3)]"
/>
<p className="text-xs text-[#FF0055] mt-1 font-bold">
  Error message
</p>
```

---

## QUICK TEXT STYLES

### Heading 1 (Big, Bold)
```tsx
<h1 className="text-6xl font-black leading-tight tracking-tighter text-white">
  Master the Law
</h1>
```

### Heading 2
```tsx
<h2 className="text-5xl font-bold leading-snug tracking-tight text-white">
  Choose Your Path
</h2>
```

### Heading 3
```tsx
<h3 className="text-4xl font-bold leading-snug tracking-tight text-white">
  Daily Quest
</h3>
```

### Body Text
```tsx
<p className="text-base font-medium leading-relaxed text-white">
  Regular body text
</p>
```

### Muted/Secondary Text
```tsx
<p className="text-sm font-regular text-[rgba(255,255,255,0.5)]">
  Secondary information
</p>
```

### Gradient Text
```tsx
<h2 className="text-4xl font-black
  bg-gradient-to-r from-[#00F0FF] via-[#C026D3] to-[#FF00FF]
  bg-clip-text text-transparent">
  Gradient Heading
</h2>
```

### Accent/Uppercase
```tsx
<p className="text-white font-bold uppercase tracking-widest
  drop-shadow-[0_0_10px_rgba(0,240,255,0.3)]">
  LIMITED TIME
</p>
```

---

## QUICK ANIMATIONS

### Pop Animation (Entrance)
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}>
  Content
</motion.div>
```

### Slide Up (Entrance)
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}>
  Content
</motion.div>
```

### Hover Scale
```tsx
<motion.div
  whileHover={{ scale: 1.05 }}
  transition={{ duration: 0.2 }}>
  Hover me
</motion.div>
```

### Button Click Effect
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95, y: 2 }}
  transition={{ duration: 0.2 }}>
  Click
</motion.button>
```

### Floating Animation
```tsx
<motion.div
  animate={{ y: [-20, 20, -20] }}
  transition={{ duration: 3, repeat: Infinity }}
  className="animate-bounce">
  Floating element
</motion.div>
```

### Achievement Unlock
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0 }}
  animate={{ opacity: 1, scale: 1 }}
  className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
  🏆 Achievement!
</motion.div>
```

---

## QUICK GRADIENTS

### Orange to Gold
```
bg-gradient-to-r from-[#FF9500] to-[#FFD700]
```

### Cyan to Purple
```
bg-gradient-to-r from-[#00F0FF] to-[#C026D3]
```

### Green to Cyan
```
bg-gradient-to-r from-[#22FF88] to-[#00F0FF]
```

### Red to Orange
```
bg-gradient-to-r from-[#FF0055] to-[#FF9500]
```

### Gold to Orange
```
bg-gradient-to-br from-[#FFD700] to-[#FF9500]
```

### Neon Rainbow
```
bg-gradient-to-r from-[#00F0FF] via-[#C026D3] to-[#FF00FF]
```

---

## QUICK SHADOWS

### Card Glow (Cyan)
```
shadow-[0_20px_40px_-10px_rgba(0,240,255,0.25),0_8px_16px_-4px_rgba(0,0,0,0.6)]
```

### Button Glow (Orange)
```
shadow-[0_10px_25px_-5px_rgba(255,149,0,0.4)]
```

### Glow on Hover
```
hover:shadow-[0_0_30px_rgba(0,240,255,0.5)]
```

### Premium Card (Gold)
```
shadow-[0_0_20px_rgba(255,215,0,0.3),0_20px_40px_-10px_rgba(255,215,0,0.2),0_8px_16px_-4px_rgba(0,0,0,0.6)]
```

---

## COMMON PATTERNS

### Stats Container
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {stats.map((stat) => (
    <div key={stat.id}
      className="rounded-xl bg-[rgba(26,20,40,0.6)]
      backdrop-blur-md border border-[rgba(0,240,255,0.1)]
      shadow-[0_20px_40px_-10px_rgba(0,240,255,0.25),0_8px_16px_-4px_rgba(0,0,0,0.6)]
      p-6 text-center
      hover:border-[rgba(0,240,255,0.3)]
      hover:shadow-[0_0_20px_rgba(0,240,255,0.4),0_20px_40px_-10px_rgba(0,240,255,0.3),0_8px_16px_-4px_rgba(0,0,0,0.6)]
      transition-all duration-300">
      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
        {stat.label}
      </p>
      <p className="text-4xl font-black text-white mt-3">
        {stat.value}
      </p>
    </div>
  ))}
</div>
```

### Feature Block (Left-Right)
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
  <div>
    <h3 className="text-4xl font-bold text-white mb-4">Feature Title</h3>
    <p className="text-base font-medium text-[rgba(255,255,255,0.7)] mb-6">
      Feature description
    </p>
    <button className="px-6 py-3 rounded-lg font-bold text-white
      bg-gradient-to-r from-[#FF9500] to-[#FFD700]
      shadow-[0_10px_25px_-5px_rgba(255,149,0,0.4)]
      hover:scale-105 transition-all duration-200">
      Learn More
    </button>
  </div>
  <div className="rounded-xl bg-[rgba(26,20,40,0.6)] backdrop-blur-md
    border border-[rgba(0,240,255,0.1)]
    shadow-[0_20px_40px_-10px_rgba(0,240,255,0.25),0_8px_16px_-4px_rgba(0,0,0,0.6)]
    p-8 h-96 flex-center">
    [Screenshot/Image Here]
  </div>
</div>
```

---

## PERFORMANCE TIPS

✅ **Use `transform` and `opacity`** for animations (GPU accelerated)  
✅ **Use CSS shadows** for static effects (free performance)  
✅ **Lazy load images** with `next/image`  
✅ **Batch animations** with Framer Motion's `AnimatePresence`  
✅ **Limit glowing elements** on screen at once  
✅ **Use `will-change` sparingly**: `will-change: transform, opacity`  

---

## ACCESSIBILITY CHECKLIST

- ✅ Color contrast 4.5:1+ (WCAG AA)
- ✅ Visible focus states on buttons
- ✅ Keyboard navigation (Tab + Enter)
- ✅ ARIA labels on icons
- ✅ Semantic HTML
- ✅ Test with screen readers

---

## COMMON MISTAKES TO AVOID

❌ **Don't**: Use color alone to convey meaning → **Do**: Add icons/text  
❌ **Don't**: Animate everything constantly → **Do**: Use micro-animations  
❌ **Don't**: Forget focus states → **Do**: Add visible focus rings  
❌ **Don't**: Use inline shadows for everything → **Do**: Use gradients + blur  
❌ **Don't**: Animate `box-shadow` heavily → **Do**: Use CSS animations  

---

## FILE STRUCTURE

```
lib/design/
├── design-tokens.ts          ← All design values
├── component-specs.tsx       ← Ready-to-copy classes
└── [your-components]         ← Import and use

globals.css
└── @keyframes and CSS variables

tailwind.config.ts
└── Extended config with all utilities
```

---

**Last Updated**: 2026-05-03  
**Version**: 1.0  
**Status**: Production Ready  
