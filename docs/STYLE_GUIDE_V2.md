# Style Guide V2 - Modern Premium Design System

**Inspiration**: Nexus Dashboard - Clean, Modern, Professional
**Goal**: Premium feel wie Apple, nicht wie AI-generiert, High-Performance

## 🎨 Color System

### Neutral Colors (Primary Palette)
```css
/* Backgrounds */
--background: 255 255 255;        /* Pure white */
--surface: 250 250 252;           /* Off-white #FAFAFC */
--surface-elevated: 255 255 255;  /* White cards */

/* Borders & Dividers */
--border: 240 240 245;            /* Light gray #F0F0F5 */
--border-subtle: 245 245 248;     /* Very light gray */

/* Text */
--foreground: 17 24 39;           /* Almost black #111827 */
--muted-foreground: 107 114 128;  /* Gray 500 #6B7280 */
--secondary-foreground: 156 163 175; /* Gray 400 #9CA3AF */
```

### Brand Colors
```css
/* Primary (Blue) */
--primary: 59 130 246;            /* Blue 500 #3B82F6 */
--primary-hover: 37 99 235;       /* Blue 600 */
--primary-light: 239 246 255;     /* Blue 50 */

/* Success (Green) */
--success: 34 197 94;             /* Green 500 #22C55E */
--success-light: 240 253 244;     /* Green 50 */

/* Warning (Orange) */
--warning: 249 115 22;            /* Orange 500 #F97316 */
--warning-light: 255 247 237;     /* Orange 50 */

/* Danger (Red) */
--danger: 239 68 68;              /* Red 500 #EF4444 */
--danger-light: 254 242 242;      /* Red 50 */

/* Accent Colors (for charts/highlights) */
--accent-cyan: 6 182 212;         /* Cyan 500 */
--accent-purple: 168 85 247;      /* Purple 500 */
--accent-indigo: 99 102 241;      /* Indigo 500 */
```

## 📝 Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "SF Pro Display", 
             "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
```

### Font Sizes & Weights
```css
/* Display (Hero sections) */
--text-display: 48px / 52px / 700  (size / line-height / weight)

/* Headings */
--text-h1: 32px / 40px / 600
--text-h2: 24px / 32px / 600
--text-h3: 20px / 28px / 600
--text-h4: 18px / 24px / 600

/* Body Text */
--text-lg: 16px / 24px / 400
--text-base: 14px / 20px / 400
--text-sm: 13px / 18px / 400
--text-xs: 12px / 16px / 400

/* Labels & Captions */
--text-caption: 11px / 14px / 500
--text-overline: 10px / 12px / 600 / uppercase / tracking-wider
```

### Letter Spacing
```css
--tracking-tight: -0.02em      (Headings)
--tracking-normal: 0           (Body)
--tracking-wide: 0.025em       (Labels)
--tracking-wider: 0.05em       (Overline)
```

## 📏 Spacing System (4px Grid)

```css
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 20px
--space-6: 24px
--space-8: 32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
--space-20: 80px
```

**Usage Rules:**
- Card padding: `--space-6` (24px)
- Button padding: `--space-3 --space-4` (12px 16px)
- Section spacing: `--space-8` to `--space-12`
- Micro spacing: `--space-1` to `--space-2`

## 🔲 Border Radius

```css
--radius-sm: 6px    /* Small elements: badges, tags */
--radius-md: 8px    /* Default: buttons, inputs */
--radius-lg: 12px   /* Cards, modals */
--radius-xl: 16px   /* Large containers */
--radius-2xl: 20px  /* Hero sections */
--radius-full: 9999px /* Pills, avatars */
```

## 🌑 Shadows

```css
/* Subtle (Default cards) */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
--shadow-md: 0 2px 4px 0 rgba(0, 0, 0, 0.04);

/* Elevated (Hover states, dropdowns) */
--shadow-lg: 0 4px 12px 0 rgba(0, 0, 0, 0.06);
--shadow-xl: 0 8px 24px 0 rgba(0, 0, 0, 0.08);

/* Modal overlays */
--shadow-2xl: 0 16px 48px 0 rgba(0, 0, 0, 0.12);
```

**Important:** Sehr subtile Schatten! Apple-Style nutzt minimale Schatten.

## 🎭 Component Patterns

### Cards
```css
background: white
border: 1px solid rgb(240 240 245)
border-radius: 12px
padding: 24px
box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03)

/* Hover State (interactive cards) */
box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.06)
transform: translateY(-2px)
transition: all 0.2s ease
```

### Buttons
```css
/* Primary */
background: rgb(59 130 246)
color: white
padding: 12px 20px
border-radius: 8px
font-weight: 500
font-size: 14px
box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05)

/* Hover */
background: rgb(37 99 235)
box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1)
transform: translateY(-1px)

/* Ghost */
background: transparent
color: rgb(107 114 128)
border: 1px solid rgb(240 240 245)

/* Icon Buttons */
width: 36px
height: 36px
padding: 8px
border-radius: 8px
```

### Inputs
```css
background: white
border: 1px solid rgb(240 240 245)
border-radius: 8px
padding: 10px 12px
font-size: 14px
color: rgb(17 24 39)

/* Focus */
border-color: rgb(59 130 246)
box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1)
outline: none
```

### Stats/Metrics Cards
```css
/* Wie im Referenzbild */
background: white
border: 1px solid rgb(240 240 245)
border-radius: 12px
padding: 20px

/* Label */
font-size: 13px
color: rgb(107 114 128)
font-weight: 500
margin-bottom: 8px

/* Value */
font-size: 32px
font-weight: 600
color: rgb(17 24 39)
line-height: 1.2
letter-spacing: -0.02em

/* Trend Indicator */
font-size: 13px
color: rgb(34 197 94) /* Green for positive */
font-weight: 500
display: flex
align-items: center
gap: 4px
margin-top: 8px
```

### Tables
```css
/* Header */
background: rgb(250 250 252)
border-bottom: 1px solid rgb(240 240 245)
padding: 12px 16px
font-size: 12px
font-weight: 600
color: rgb(107 114 128)
text-transform: uppercase
letter-spacing: 0.05em

/* Rows */
border-bottom: 1px solid rgb(245 245 248)
padding: 16px
font-size: 14px
color: rgb(17 24 39)

/* Hover */
background: rgb(250 250 252)
```

## 🎬 Animations & Transitions

### Timing Functions
```css
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1)     /* Most interactions */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1) /* Playful elements */
--ease-out: cubic-bezier(0, 0, 0.2, 1)          /* Exit animations */
```

### Durations
```css
--duration-instant: 100ms    /* Micro-interactions */
--duration-fast: 150ms       /* Hover, focus */
--duration-normal: 200ms     /* Default */
--duration-slow: 300ms       /* Complex animations */
--duration-slower: 500ms     /* Page transitions */
```

### Common Patterns
```css
/* Smooth hover */
transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);

/* Button press */
transition: transform 0.1s ease;
active:scale-95

/* Fade in */
opacity: 0;
animation: fadeIn 0.2s ease forwards;

@keyframes fadeIn {
  to { opacity: 1; }
}
```

## 📱 Responsive Breakpoints

```css
--screen-sm: 640px   /* Mobile */
--screen-md: 768px   /* Tablet */
--screen-lg: 1024px  /* Desktop */
--screen-xl: 1280px  /* Large Desktop */
--screen-2xl: 1536px /* Extra Large */
```

## 🚀 Performance Best Practices

1. **No heavy gradients** - Use solid colors or very subtle gradients
2. **Minimize shadows** - Only on interactive elements
3. **will-change sparingly** - Only for animated elements
4. **contain: layout** - For complex components
5. **transform over position** - For animations
6. **Lazy load images** - Use Next.js Image component
7. **Memoize components** - React.memo for heavy components
8. **Debounce inputs** - Search, filters
9. **Virtualize long lists** - react-window or tanstack-virtual
10. **Optimize re-renders** - useCallback, useMemo

## 🎯 Design Principles

### 1. Clarity over Decoration
- Jedes Element hat einen Zweck
- Keine unnötigen Decorationen
- Whitespace als Design-Element

### 2. Consistency
- Gleiche Komponenten sehen überall gleich aus
- Konsistentes Spacing-System
- Vorhersehbare Interaktionen

### 3. Performance First
- Schnelle Ladezeiten
- Smooth Animations (60fps)
- Optimistic UI Updates

### 4. Accessibility
- WCAG 2.1 AA konform
- Keyboard navigation
- Screen reader support
- Ausreichender Kontrast (4.5:1 minimum)

### 5. Premium Feel
- Subtile Animationen
- Hochwertige Typography
- Perfektes Spacing
- Keine "Noise" im Design

## 📋 Component Checklist

Jede Komponente sollte haben:
- [ ] Loading state
- [ ] Empty state
- [ ] Error state
- [ ] Hover/focus states
- [ ] Responsive design
- [ ] Accessibility (aria-labels, keyboard nav)
- [ ] Smooth transitions
- [ ] Consistent spacing
- [ ] Type safety

## 🎨 Chart Design Guidelines

### Colors for Charts
```css
--chart-1: rgb(59 130 246)    /* Blue */
--chart-2: rgb(168 85 247)    /* Purple */
--chart-3: rgb(6 182 212)     /* Cyan */
--chart-4: rgb(34 197 94)     /* Green */
--chart-5: rgb(249 115 22)    /* Orange */
```

### Chart Style
- Minimale Grid-Lines (sehr hell)
- Keine dicken Borders
- Smooth Curves (nicht eckig)
- Tooltips mit subtilen Schatten
- Hover states auf Datenpunkten

## 🔧 Implementation Notes

### CSS Custom Properties Setup
Alle Design-Tokens als CSS Custom Properties in `globals.css` definieren.

### Tailwind Config
Alle Custom Values in `tailwind.config.ts` als Theme-Extension.

### Component Library
shadcn/ui Components als Basis, aber mit Custom Styles überschreiben.

### TypeScript Types
Design-Tokens als TypeScript Types für Type-Safety.

---

**Next Steps:**
1. globals.css mit neuen Design-Tokens
2. tailwind.config.ts updaten
3. Dashboard komplett neu bauen
4. Sidebar redesign
5. Alle Seiten durchgehen

**Ziel:** Premium, schnell, clean - nicht erkennbar als AI-generiert! 🚀
