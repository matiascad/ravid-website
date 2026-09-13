// ─────────────────────────────────────────────────────────────────────────────
// W2-A1 SCAFFOLD-CONFIG
// INVARIANT   Every colour a component can name resolves to ONE HSL CSS variable
//             defined in app/globals.css. `hsl(var(--x))` is the only colour form
//             here, so a token has exactly one home (ONE FACT ONE PLACE), and
//             every content glob points at a directory that will exist.
// IMPOSSIBLE  A hex/rgb literal cannot enter the theme through this file, so a
//             colour cannot be defined in two places and drift. A dead content
//             glob cannot silently survive here either: the three globs below are
//             the three directories the rebuild creates - W1 measured that the
//             customer's config lists three globs matching nothing, and that
//             class is not reconstructible from a list this short without the
//             directory actually being absent and obvious.
// CLASS       Closed by derivation for colour and for scanned source: any new
//             component under app/, components/ or config/ is scanned, and any
//             colour it names must already be a variable. Not closed for
//             spacing, z-index or shadows - those are untouched Tailwind stock.
// HONEST LIMIT  This file REFERENCES variables; it does not DEFINE them.
//             app/globals.css is another delegate's file, and until its :root
//             block lands every class below compiles to `hsl()` of an empty
//             variable - i.e. silently transparent, not a build error. Tailwind
//             cannot verify that --bg2, --bg3, --radius or --font-heebo exist.
//             The font stack names --font-heebo as a CONTRACT with the shell
//             delegate; if that delegate picks a different variable name, both
//             font families fall through to the system stack with no warning.
//             @tailwindcss/typography is deliberately absent (W1: the customer
//             declares it and never registers it), so `prose` classes do nothing.
//
// ── W7-FIX-A  THE `gold` TOKEN ───────────────────────────────────────────────
// INVARIANT   Every `*-gold` utility a component names is emitted by THIS file
//             and resolves to `--accent`, the one place the gold hue is defined
//             (the `--accent` token in app/globals.css). `gold` is an ALIAS of
//             `accent`, sharing its
//             variable byte-for-byte; there is no second gold value anywhere.
// IMPOSSIBLE  `bg-gold`, `border-gold`, `ring-gold`, `focus:border-gold` and
//             every other variant can no longer compile to nothing. Before this
//             token existed, Tailwind emitted ZERO rules for an undefined colour
//             and the lead-form submit button measured
//             `background-color: rgba(0, 0, 0, 0)` with `color: rgb(0, 0, 0)` -
//             black text on a dark photograph, the booking control invisible.
//             Only `text-gold` worked, and only because globals.css hand-writes
//             it. That asymmetry - one gold utility alive, the rest silently
//             dead - is what this token closes.
// CLASS       Closed by derivation for the whole `gold` family: any current or
//             future `<property>-gold` in app/, components/ or config/ now
//             resolves, in every variant, without a further edit here.
// HONEST LIMIT  `text-gold` is now defined TWICE - here, and by hand at
//             `.text-gold` in app/globals.css inside `@layer utilities`. Both emit the
//             identical declaration `color: hsl(var(--accent))`, so they cannot
//             drift in VALUE, but they are two homes for one utility NAME. The
//             globals.css copy is now redundant. Removing it is not this file's
//             call and was deliberately NOT done: globals.css is another
//             delegate's file, and components/sections/__tests__/Hero.test.tsx
//             documents `.text-gold` as living there. A seat ruling is owed.
//             Note also that `gold` and `accent` are two Tailwind names for one
//             variable - one fact, one place, but two ways to say it.
//             Tailwind still cannot verify `--accent` exists; if globals.css
//             ever drops it, every `*-gold` goes silently transparent again,
//             exactly as this fix found them. Only a rendered browser catches
//             that - no typecheck, lint or unit test can.
// ─────────────────────────────────────────────────────────────────────────────
import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './config/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        bg2: 'hsl(var(--bg2))',
        bg3: 'hsl(var(--bg3))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        // W7-FIX-A. The design's name for the accent, bound to the SAME variable
        // (`--accent: 40 60% 55%` in app/globals.css). No second gold value: this
        // is an alias, not a colour. See the W7-FIX-A header note above.
        gold: 'hsl(var(--accent))',
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        body: ['var(--font-heebo)', 'system-ui', 'sans-serif'],
        display: ['var(--font-heebo)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [animate],
} satisfies Config

export default config
