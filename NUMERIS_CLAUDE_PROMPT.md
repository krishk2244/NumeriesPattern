# NUMERIS — Claude Vibe Coding Prompt
### Luxury Numerology SaaS · Rolex-Class Design · Next.js 14

---

## 🎯 PROJECT VISION

Build **NUMERIS** — a premium numerology name-calculation SaaS with the visual sophistication of a Rolex campaign page. Every pixel should whisper timeless luxury. This is not a utility app — it is a **sacred experience** dressed in gold and midnight.

> "Not what time is it — but what the numbers reveal."

---

## 🏗️ TECH STACK

```
Framework:     Next.js 14 (App Router)
Language:      TypeScript (strict mode)
Styling:       Tailwind CSS + custom CSS variables
Animations:    Framer Motion
Fonts:         Cormorant Garamond (display) + Montserrat (UI) + JetBrains Mono (numbers)
Icons:         Lucide React
Forms:         React Hook Form
Deploy-ready:  Vercel
```

### Install command
```bash
npx create-next-app@latest numeris --typescript --tailwind --app --src-dir --import-alias "@/*"
cd numeris
npm install framer-motion lucide-react react-hook-form
```

---

## 🎨 DESIGN SYSTEM — "ROLEX NOIR"

> Source: UI UX Pro Max Skill · Style: Skeuomorphism-meets-Modern-Dark · Typography: Bold Editorial

### Color Tokens (`tailwind.config.ts`)

```ts
colors: {
  gold: {
    50:  '#FDF8EC',
    100: '#F7E9C3',
    200: '#EDD28A',
    400: '#D4AF5A',     // primary gold
    600: '#C9A036',     // hover gold
    800: '#8B6914',
    900: '#4A380A',
  },
  noir: {
    50:  '#F2F0EC',
    100: '#D4D0C8',
    200: '#9E9A90',
    500: '#3A3830',
    700: '#1A1814',     // card surface
    800: '#0F0E0B',     // page base
    900: '#07060404',   // deepest black
  },
  cream: '#F5F0E8',
  champagne: '#E8D9B5',
}
```

### CSS Variables (`globals.css`)

```css
:root {
  --gold-primary:    #D4AF5A;
  --gold-hover:      #C9A036;
  --gold-glow:       rgba(212, 175, 90, 0.18);
  --noir-base:       #0F0E0B;
  --noir-card:       #1A1814;
  --noir-elevated:   #242118;
  --noir-border:     rgba(212, 175, 90, 0.15);
  --noir-border-hov: rgba(212, 175, 90, 0.35);
  --cream:           #F5F0E8;
  --champagne:       #E8D9B5;
  --font-display:    'Cormorant Garamond', Georgia, serif;
  --font-ui:         'Montserrat', sans-serif;
  --font-mono:       'JetBrains Mono', monospace;
  --radius-sm:       6px;
  --radius-md:       12px;
  --radius-lg:       20px;
  --shadow-gold:     0 0 40px rgba(212, 175, 90, 0.08), 0 1px 0 rgba(212, 175, 90, 0.12) inset;
  --shadow-card:     0 24px 48px rgba(0,0,0,0.6), 0 1px 0 rgba(212,175,90,0.08) inset;
  --transition:      cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Typography Scale

```css
/* Cormorant Garamond — Display headings only */
.heading-hero  { font-family: var(--font-display); font-size: clamp(56px, 8vw, 96px); font-weight: 300; letter-spacing: -0.02em; color: var(--cream); }
.heading-xl    { font-family: var(--font-display); font-size: clamp(36px, 5vw, 56px); font-weight: 300; letter-spacing: -0.01em; }
.heading-lg    { font-family: var(--font-display); font-size: clamp(24px, 3vw, 36px); font-weight: 400; }

/* Montserrat — UI text, labels */
.label-gold    { font-family: var(--font-ui); font-size: 11px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold-primary); }
.body-cream    { font-family: var(--font-ui); font-size: 15px; font-weight: 400; line-height: 1.7; color: var(--champagne); opacity: 0.75; }

/* JetBrains Mono — all number outputs */
.number-display { font-family: var(--font-mono); font-size: 72px; font-weight: 400; color: var(--gold-primary); letter-spacing: -0.03em; }
.number-small   { font-family: var(--font-mono); font-size: 16px; color: var(--gold-primary); }
```

---

## 📁 PROJECT STRUCTURE

```
src/
├── app/
│   ├── layout.tsx              # Root layout, fonts, metadata
│   ├── page.tsx                # Landing + Hero + Calculator (main)
│   ├── globals.css             # Design tokens, base styles
│   ├── about/
│   │   └── page.tsx            # About Numerology page
│   └── api/
│       └── calculate/
│           └── route.ts        # (optional) server-side calc API
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx          # Fixed top nav: Logo | About | GitHub
│   │   └── Footer.tsx          # Minimal footer with tagline
│   │
│   ├── hero/
│   │   ├── HeroSection.tsx     # Full-viewport opening scene
│   │   └── GoldParticles.tsx   # Ambient floating particles (canvas)
│   │
│   ├── calculator/
│   │   ├── CalculatorCard.tsx  # Main card wrapper
│   │   ├── SystemToggle.tsx    # Pythagorean ↔ Chaldean switch
│   │   ├── NameInput.tsx       # Styled text input
│   │   ├── LetterBreakdown.tsx # Letter cards with values below
│   │   ├── ReductionSteps.tsx  # Visual step reduction display
│   │   ├── FinalNumber.tsx     # Large number reveal with meaning
│   │   └── ReferenceChart.tsx  # Collapsible reference table
│   │
│   ├── meaning/
│   │   └── NumberMeaning.tsx   # Cards showing meaning of final digit
│   │
│   └── ui/
│       ├── GoldDivider.tsx     # Decorative horizontal line with gem
│       ├── GoldButton.tsx      # Reusable CTAs
│       └── SectionLabel.tsx    # "I · THE SYSTEM" style labels
│
├── lib/
│   ├── numerology.ts           # Core calculation engine
│   ├── meanings.ts             # Number meanings data (1–9)
│   └── constants.ts            # Chart maps, system configs
│
└── types/
    └── numerology.ts           # TypeScript types
```

---

## 🔢 CORE LOGIC (`src/lib/numerology.ts`)

```typescript
export type NumerologySystem = 'pythagorean' | 'chaldean'

export const PYTHAGOREAN_MAP: Record<string, number> = {
  A:1, B:2, C:3, D:4, E:5, F:6, G:7, H:8, I:9,
  J:1, K:2, L:3, M:4, N:5, O:6, P:7, Q:8, R:9,
  S:1, T:2, U:3, V:4, W:5, X:6, Y:7, Z:8
}

export const CHALDEAN_MAP: Record<string, number> = {
  A:1, I:1, J:1, Q:1, Y:1,
  B:2, K:2, R:2,
  C:3, G:3, L:3, S:3,
  D:4, M:4, T:4,
  E:5, H:5, N:5, X:5,
  U:6, V:6, W:6,
  O:7, Z:7,
  F:8, P:8
}

export interface LetterResult {
  char: string
  value: number | null
  isSpace: boolean
}

export interface CalculationResult {
  letters: LetterResult[]
  sum: number
  reductionSteps: number[]
  finalNumber: number
  systemName: string
}

export function getMap(system: NumerologySystem) {
  return system === 'pythagorean' ? PYTHAGOREAN_MAP : CHALDEAN_MAP
}

export function reduceToPrimary(n: number): number[] {
  const steps: number[] = [n]
  while (n > 9) {
    n = String(n).split('').reduce((acc, d) => acc + parseInt(d), 0)
    steps.push(n)
  }
  return steps
}

export function calculateName(name: string, system: NumerologySystem): CalculationResult {
  const map = getMap(system)
  const upper = name.toUpperCase()
  const letters: LetterResult[] = []
  let sum = 0

  for (const char of upper) {
    if (char === ' ') {
      letters.push({ char, value: null, isSpace: true })
    } else {
      const value = map[char] ?? null
      if (value !== null) sum += value
      letters.push({ char, value, isSpace: false })
    }
  }

  const reductionSteps = reduceToPrimary(sum)

  return {
    letters,
    sum,
    reductionSteps,
    finalNumber: reductionSteps[reductionSteps.length - 1],
    systemName: system === 'pythagorean' ? 'Pythagorean' : 'Chaldean'
  }
}
```

---

## 🌟 NUMBER MEANINGS (`src/lib/meanings.ts`)

```typescript
export const NUMBER_MEANINGS: Record<number, {
  title: string
  archetype: string
  keywords: string[]
  description: string
  planet: string
  color: string
}> = {
  1: {
    title: 'The Leader',
    archetype: 'The Pioneer',
    keywords: ['Independence', 'Ambition', 'Originality'],
    description: 'A soul born to blaze new trails. Natural authority and an unshakeable will define the one who carries this number.',
    planet: 'Sun',
    color: '#FFD700'
  },
  2: {
    title: 'The Diplomat',
    archetype: 'The Harmonizer',
    keywords: ['Balance', 'Partnership', 'Intuition'],
    description: 'Gentle, perceptive, and deeply attuned to the emotions of others. The two seeks unity where others see division.',
    planet: 'Moon',
    color: '#C0C0C0'
  },
  3: {
    title: 'The Creator',
    archetype: 'The Communicator',
    keywords: ['Expression', 'Joy', 'Creativity'],
    description: 'A radiant force of artistic energy. Words, music, and art flow through the three with effortless grace.',
    planet: 'Jupiter',
    color: '#FF8C00'
  },
  4: {
    title: 'The Builder',
    archetype: 'The Foundation',
    keywords: ['Stability', 'Discipline', 'Endurance'],
    description: 'Patient, methodical, and utterly reliable. The four constructs lasting structures from the ground up.',
    planet: 'Uranus',
    color: '#4682B4'
  },
  5: {
    title: 'The Adventurer',
    archetype: 'The Free Spirit',
    keywords: ['Freedom', 'Change', 'Versatility'],
    description: 'Magnetic and restless, the five craves experience above all. Every horizon is an invitation.',
    planet: 'Mercury',
    color: '#32CD32'
  },
  6: {
    title: 'The Nurturer',
    archetype: 'The Healer',
    keywords: ['Love', 'Responsibility', 'Harmony'],
    description: 'Drawn to serve and protect, the six radiates warmth. Home and family are sacred ground.',
    planet: 'Venus',
    color: '#FF69B4'
  },
  7: {
    title: 'The Seeker',
    archetype: 'The Mystic',
    keywords: ['Wisdom', 'Introspection', 'Truth'],
    description: 'Drawn to the hidden, the seven peers beneath the surface of reality seeking eternal truths.',
    planet: 'Neptune',
    color: '#9370DB'
  },
  8: {
    title: 'The Achiever',
    archetype: 'The Powerhouse',
    keywords: ['Authority', 'Abundance', 'Mastery'],
    description: 'The eight commands material reality with rare efficiency. Power and legacy are natural companions.',
    planet: 'Saturn',
    color: '#8B4513'
  },
  9: {
    title: 'The Humanitarian',
    archetype: 'The Sage',
    keywords: ['Compassion', 'Wisdom', 'Completion'],
    description: 'The oldest soul in the room. The nine carries the wisdom of all numbers and gives it freely to the world.',
    planet: 'Mars',
    color: '#DC143C'
  }
}
```

---

## 🖥️ KEY COMPONENTS — BUILD INSTRUCTIONS

### `HeroSection.tsx`
```
- Full viewport height (100vh)
- Background: radial-gradient from #1A1814 center to #07060404 edges
- Subtle gold particle canvas (GoldParticles.tsx): 30–40 tiny golden dots floating upward slowly
- Center content:
    · SectionLabel: "SACRED NUMEROLOGY"
    · Hero heading: "Discover What Your Name Reveals" (Cormorant Garamond, 72–96px, weight 300)
    · Subtext: "Ancient mathematics. Modern precision." (Montserrat, champagne, muted)
    · Gold CTA button → scrolls to #calculator
    · Thin gold horizontal line below CTA
- Bottom fade into calculator section
```

### `SystemToggle.tsx`
```
- Two pill buttons side by side: "Pythagorean" | "Chaldean"
- Inactive: transparent bg, gold border 0.5px opacity 0.3, champagne text
- Active: gold background (#D4AF5A), noir text, subtle inner glow
- Transition: 250ms cubic-bezier(0.16, 1, 0.3, 1)
- Below toggle: small italic description of which system is active
```

### `LetterBreakdown.tsx`
```
- Flex wrap row of letter cards
- Each card:
    · Width: 52px, Height: 64px
    · Background: var(--noir-elevated)
    · Border: 0.5px solid var(--noir-border)
    · Border-radius: var(--radius-md)
    · Animate in: staggered fade + slide-up (Framer Motion, 0.04s stagger)
    · Top: letter character in Montserrat 600 18px cream
    · Bottom: number value in JetBrains Mono 13px gold
    · Space characters: invisible card
    · On hover: border glows gold (var(--noir-border-hov))
```

### `FinalNumber.tsx`
```
- Large centered number reveal
- Number: JetBrains Mono 96px, color gold
- Animate: count up from 0 → final number (Framer Motion useSpring)
- Below number: archetype title in Cormorant Garamond 28px cream
- Below that: planet + keywords as gold pills
- Below that: 3-line description in Montserrat body-cream
- Section framed by thin gold horizontal rules
```

### `ReductionSteps.tsx`
```
- Horizontal step display: 47 → 11 → 2
- Each number: JetBrains Mono 20px gold
- Arrow between steps: › in champagne muted
- Final step: circle border-gold, slightly larger
- Animate: each step reveals left-to-right with 150ms delay
```

### `ReferenceChart.tsx`
```
- Collapsible (accordion)
- Toggle label: "Reference Chart · Pythagorean" or "· Chaldean"
- Table:
    · Background: var(--noir-card)
    · Header row: number 1–9 (or 1–8) in gold mono font
    · Data rows: letters in cream Montserrat
    · Cell borders: 0.5px var(--noir-border)
    · Hover row: subtle gold background tint
- Slide open animation: Framer Motion height 0 → auto
```

---

## 📄 PAGE STRUCTURE (`app/page.tsx`)

```
Section 1: HeroSection         — Full viewport, noir + gold particles
Section 2: Calculator          — Main card centered, max-width 720px
           · SystemToggle
           · NameInput  
           · LetterBreakdown   — Appears on input
           · ReductionSteps    — Below breakdown
           · FinalNumber       — Animated reveal
           · NumberMeaning     — Slides in after final number
           · ReferenceChart    — Collapsible at bottom of card
Section 3: GoldDivider
Section 4: AboutSystems        — Two columns: Pythagorean | Chaldean info
Section 5: Footer
```

---

## 🧭 NAVBAR (`Navbar.tsx`)

```
- Fixed top, full width
- Background: rgba(15, 14, 11, 0.85) backdrop-blur 20px
- Border-bottom: 0.5px solid rgba(212, 175, 90, 0.1)
- Left: Logo — "NUMERIS" in Cormorant Garamond 22px gold + tiny Roman numeral ornament
- Right: "About" link in Montserrat 12px champagne + "GitHub" icon
- Scroll behavior: slightly more opaque after 60px scroll
```

---

## ✨ ANIMATIONS — Framer Motion Patterns

```typescript
// Stagger container for letter cards
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } }
}
const letterItem = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }
}

// Number count-up spring
const springConfig = { stiffness: 80, damping: 18 }
// use useSpring + useTransform to count from 0 → finalNumber

// Section entrance
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
}

// Gold glow pulse on final number
// use keyframe animation: box-shadow oscillates between gold-glow variants
```

---

## 🌐 METADATA & SEO (`app/layout.tsx`)

```typescript
export const metadata: Metadata = {
  title: 'NUMERIS — Luxury Name Numerology',
  description: 'Discover the sacred numbers behind your name. Pythagorean and Chaldean numerology calculators crafted with precision.',
  keywords: ['numerology', 'name calculator', 'pythagorean', 'chaldean', 'sacred numbers'],
  openGraph: {
    title: 'NUMERIS',
    description: 'What does your name reveal?',
    type: 'website',
  }
}
```

---

## 🔤 FONT LOADING (`app/layout.tsx`)

```typescript
import { Cormorant_Garamond, Montserrat, JetBrains_Mono } from 'next/font/google'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-display',
  display: 'swap'
})

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ui',
  display: 'swap'
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap'
})

// Apply all three to <html> className
```

---

## 🖋️ DESIGN RULES — MUST FOLLOW

```
✅ DO:
  · Use Cormorant Garamond ONLY for hero/display headings (never body)
  · All number outputs use JetBrains Mono — this is sacred
  · Every interactive element has a 250ms gold border-color transition
  · Background is always deep noir — never white, never gray
  · Spacing: generous. 80px+ between sections. Breathing room = luxury.
  · Gold used sparingly — accents and numbers only, not backgrounds
  · Every section has a subtle SectionLabel in Montserrat uppercase tracking-widest
  · Subtle grain texture on main background: background-image: url('/noise.png') repeat

❌ DON'T:
  · No colored backgrounds (pink, blue, purple) — this is noir luxury only
  · No rounded avatars or bubble UI — sharp and geometric
  · No gradients with multiple rainbow hues
  · No heavy box shadows on text
  · No font-weight above 500 for body text (Montserrat 400 only for body)
  · Never put white text on gold — always noir text on gold backgrounds
  · No loading spinners — use skeleton shimmer with gold tint instead
```

---

## 📦 `tailwind.config.ts` — Key Additions

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        ui:      ['var(--font-ui)', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },
      colors: {
        gold: {
          400: '#D4AF5A',
          600: '#C9A036',
        },
        noir: {
          700: '#1A1814',
          800: '#0F0E0B',
          900: '#07060404',
        },
        cream:     '#F5F0E8',
        champagne: '#E8D9B5',
      },
      animation: {
        'gold-pulse': 'goldPulse 3s ease-in-out infinite',
        'float-up':   'floatUp 8s ease-in-out infinite',
      },
      keyframes: {
        goldPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212,175,90,0.1)' },
          '50%':      { boxShadow: '0 0 40px rgba(212,175,90,0.25)' },
        },
        floatUp: {
          '0%':   { transform: 'translateY(0px)', opacity: '0' },
          '20%':  { opacity: '1' },
          '80%':  { opacity: '1' },
          '100%': { transform: 'translateY(-80px)', opacity: '0' },
        }
      }
    }
  },
  plugins: [],
}

export default config
```

---

## 🚀 LAUNCH CHECKLIST

```
□ All three fonts loading correctly via next/font
□ Dark background renders properly on all screens
□ Letter breakdown animates in with stagger on every keystroke
□ System toggle switches calculation AND reference chart simultaneously
□ Final number animates (count-up) smoothly
□ Number meaning section slides in after calculation
□ Reference chart collapses/expands cleanly
□ Mobile responsive: calculator card full-width on <768px
□ Favicon: gold "N" lettermark
□ vercel.json configured for deployment
□ README.md with screenshot + live demo link
```

---

## 💡 CLAUDE CODE TIPS

When coding this in VSCode with Claude:

1. **Start with the design system** — implement `globals.css` tokens and `tailwind.config.ts` first. Everything else depends on these.

2. **Build `numerology.ts` logic** before any UI — test the calculation functions in isolation.

3. **Component order**: Navbar → HeroSection → CalculatorCard skeleton → SystemToggle → NameInput → LetterBreakdown → ReductionSteps → FinalNumber → NumberMeaning → ReferenceChart → Footer.

4. **Tell Claude the aesthetic clearly**: Say *"Rolex landing page energy — deep noir, gold accents, Cormorant Garamond, no gradients, no color, just black and gold luxury"* in every prompt.

5. **Framer Motion last** — get the logic and layout right first, then layer in animations.

6. **Reference this file** in every Claude session: `@NUMERIS_CLAUDE_PROMPT.md` to keep context.

---

*Crafted for KRISHX · Prospera AI · Built to convert — a sacred tool worthy of its subject.*
