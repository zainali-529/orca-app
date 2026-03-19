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
          hover: 'hsl(var(--primary-hover))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          text: 'hsl(var(--secondary-text))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        divider: 'hsl(var(--divider))',
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
          'blue-bright':'#3D9DD4',   // bright accent for data callouts (unit rates)

          // Selected state — tinted dark bg for cards, chips, toggles
          selected:     '#1A3A54',

          // Text on brand backgrounds
          fg:           '#F0F8FF',   // primary text on dark bg
          'fg-muted':   '#7AAEC8',   // muted text on dark bg

          // Positive / savings indicators
          teal:         '#2DD4A0',   // savings amounts, positive badges
          green:        '#22A660',   // green energy label / toggle active

          // SVG vector accent (matches steel blue)
          glow:         '#2272A6',   // vector strokes
          'glow-dim':   '#1A5A8860', // translucent for rings/fills
        },
      },

      borderRadius: {
        lg:     'var(--radius)',
        md:     'calc(var(--radius) - 2px)',
        sm:     'calc(var(--radius) - 4px)',
        card:   '14px',   // cards, CTA buttons
        banner: '10px',   // inline error/info banners
      },

      borderWidth: {
        hairline: hairlineWidth(),
      },

      // ── Opacity fills ────────────────────────────────────────────
      // Tailwind default: 0 5 10 15 20 25 30 … these fill the gaps
      opacity: {
        '6':  '0.06',
        '7':  '0.07',
        '8':  '0.08',
        '13': '0.13',
      },

      // ── Spacing additions ────────────────────────────────────────
      spacing: {
        'xs':  '4px',
        'sm':  '8px',
        'md':  '16px',
        'lg':  '24px',
        'xl':  '32px',
        '2xl': '48px',
        '5.5': '22px',   // checkbox / toggle circle size
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
        'accordion-up':   'accordion-up 0.2s ease-out',
      },

      fontFamily: {
        sans:     ['Poppins', 'Poppins_400Regular', 'sans-serif'],
        medium:   ['Poppins-Medium', 'Poppins_500Medium', 'sans-serif'],
        semibold: ['Poppins-SemiBold', 'Poppins_600SemiBold', 'sans-serif'],
        bold:     ['Poppins-Bold', 'Poppins_700Bold', 'sans-serif'],
      },

      fontSize: {
        // ── Standard scale ──────────────────────────────────────
        'xs':   ['12px', { lineHeight: '16px' }],
        'sm':   ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg':   ['18px', { lineHeight: '28px' }],
        'xl':   ['20px', { lineHeight: '28px' }],
        '2xl':  ['24px', { lineHeight: '32px' }],
        '3xl':  ['30px', { lineHeight: '36px' }],
        '4xl':  ['36px', { lineHeight: '40px' }],
        // ── In-between / app-specific sizes ─────────────────────
        '10':   ['10px'],  // small badges, rate labels
        '11':   ['11px', { lineHeight: '14px' }],  // (optional) labels, captions
        '13':   ['13px', { lineHeight: '18px' }],  // chip text, helper text, error text
        '15':   ['15px', { lineHeight: '22px' }],  // card labels, CTA button text
        '22':   ['22px', { lineHeight: '28px' }],  // section/page headers
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [require('tailwindcss-animate')],
};