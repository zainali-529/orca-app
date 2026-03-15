const { hairlineWidth } = require('nativewind/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        // ─────────────────────────────────────────────────────────────
        // Brand — FIXED, never flips in dark/light mode.
        // Change here → updates everywhere in the app.
        // ─────────────────────────────────────────────────────────────
        brand: {
          // Primary deep navy
          DEFAULT:      '#0D2C40',   // main header bg, nav, dark surfaces
          dark:         '#091F2E',   // pressed states, depth
          light:        '#143550',   // hover states

          // Secondary steel blue
          blue:         '#2272A6',   // CTA buttons, highlights, links
          'blue-dark':  '#1A5A88',   // blue pressed
          'blue-light': '#2E87C0',   // blue hover

          // Text on brand backgrounds
          fg:           '#F0F8FF',   // primary text on dark bg
          'fg-muted':   '#7AAEC8',   // muted text on dark bg

          // SVG vector accent (matches steel blue)
          glow:         '#2272A6',   // vector strokes
          'glow-dim':   '#1A5A8860', // translucent for rings/fills
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
       fontFamily: {
        sans:     ['Poppins', 'Poppins_400Regular', 'sans-serif'],
        medium:   ['Poppins-Medium', 'Poppins_500Medium', 'sans-serif'],
        semibold: ['Poppins-SemiBold', 'Poppins_600SemiBold', 'sans-serif'],
        bold:     ['Poppins-Bold', 'Poppins_700Bold', 'sans-serif'],
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [require('tailwindcss-animate')],
};