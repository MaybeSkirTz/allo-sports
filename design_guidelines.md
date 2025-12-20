# Design Guidelines: Allo-SportsHub - Modern Sports News Platform

## Design Approach
**Reference-Based Design** inspired by premium sports media platforms: ESPN, The Athletic, Bleacher Report, and Sports Illustrated. This approach emphasizes bold visual storytelling, dynamic layouts, and hierarchy that captures the energy of sports journalism.

## Core Design Principles
1. **Visual Impact First**: Large, compelling imagery drives engagement
2. **Information Density with Breathing Room**: Rich content without overwhelming
3. **Dynamic Energy**: Layout and spacing reflect the excitement of sports
4. **Readability at Scale**: Typography supports both scanning and deep reading

## Typography System

**Headlines & Display**
- Hero article titles: Bold, 4xl-6xl (responsive), heavy weight (700-800)
- Section headers: Bold, 2xl-3xl, weight 700
- Article card titles: Semibold, lg-xl, weight 600

**Body & Supporting**
- Article excerpt/preview: Regular, sm-base, weight 400
- Metadata (author, date, read time): Regular, xs-sm, weight 400
- Article body content: Regular, base-lg with increased line-height (1.7-1.8)

**Font Strategy**: Use 2 complementary web fonts - one bold sans-serif for headlines (e.g., Inter, Work Sans) and one readable serif for article bodies (e.g., Merriweather, Lora)

## Layout & Spacing System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24 for consistency
- Micro spacing (gaps, padding): 2, 4, 6
- Component internal spacing: 4, 6, 8
- Section spacing: 12, 16, 20, 24
- Page margins: 16, 20, 24

**Grid Systems**
- Homepage: Max-width container (7xl) with responsive grids
- Hero section: Full-width with inner max-width constraints
- Article grid: 1 column mobile, 2 columns tablet, 3 columns desktop
- Article page: Centered prose container (max-w-3xl to max-w-4xl)

## Component Library

### Header Component
**Sticky Navigation Bar**
- Glassmorphism effect with backdrop-blur and semi-transparent background
- Logo: Bold, prominent, left-aligned
- Search bar: Centered, expanded width with icon, rounded edges
- Category pills: Horizontal scroll on mobile, clean buttons with active states
- Auth controls: Right-aligned, contrasting buttons

### Hero Section (Homepage)
**Large Featured Article**
- Aspect ratio: 21:9 for cinematic impact
- Full-bleed image with dark gradient overlay (bottom-to-top)
- Content positioned at bottom with generous padding (8-12)
- Category badge: Small, contrasting, positioned above title
- Title: Extra large, white, bold (4xl-5xl)
- Excerpt: Medium, white/80 opacity, max 2 lines
- Metadata: Author avatar + name, date in single row at bottom
- Hover effect: Subtle scale on image (1.02-1.05)

### Article Cards
**Standard Grid Cards**
- Aspect ratio: 16:9 image
- Rounded corners (lg) on entire card
- Image fills top portion with object-cover
- Card content padding: 4-6
- Category badge: Small, positioned at top of content
- Title: Bold, 2-line clamp, spacing below (2-3)
- Excerpt: Muted text, 2-line clamp
- Author row: Avatar (small, 8x8) + name + read time indicator
- Hover effects: Subtle elevation (shadow increase), slight translate-y

**Visual Enhancement**
- Subtle border or shadow for card separation
- Transition all hover effects smoothly (300ms)
- Cards should feel tactile and interactive

### Article Page Layout
**Hero Image Section**
- Aspect ratio: 16:9, full-width of content container
- Rounded corners, positioned before title
- No overlay on article page hero

**Article Header**
- Category badge above title
- Title: Very large (3xl-5xl), bold, generous bottom margin (6)
- Author section: Horizontal layout with larger avatar (12x12), name, role subtitle
- Metadata row: Date, read time with icons, share button (all in single row)
- Divider line below metadata

**Article Content**
- Prose styling with optimized line-height and letter-spacing
- Paragraph spacing: 4-6 between paragraphs
- Max-width for readability (prose or 3xl)
- Generous vertical rhythm throughout

**Related Articles Section**
- 3-column grid of smaller cards (same design as homepage)
- Section title: Bold, 2xl, margin above and below (12, 6)

### Footer
**Multi-Column Layout**
- 4 columns on desktop, stack on mobile
- Column 1: Branding + tagline
- Column 2: Top categories (4-5 links)
- Column 3: Quick links (Home, Social links)
- Column 4: Call-to-action (Become Author section with description + button)
- Padding: Generous vertical (12-16), same horizontal as main container
- Background: Subtle muted background for distinction
- Copyright: Centered, small text, additional padding

## Images

**Hero Section (Homepage)**
- Large, dynamic sports action photography
- High-quality, dramatic moments (game-winning shots, celebrations, intense action)
- Position: Full-bleed background with gradient overlay

**Article Cards**
- Relevant sports imagery matching article category
- Sharp, professional photography
- Consistent aspect ratio across all cards (16:9)

**Article Page Hero**
- Featured image related to article content
- High resolution, visually striking
- No text overlay - pure visual impact

**Related Articles**
- Thumbnail images following same card pattern
- Maintain visual consistency with homepage cards

## Interactions & States

**Hover States**
- Cards: Elevate with shadow + slight upward movement (-2 to -4 translate-y)
- Buttons: Maintain default shadcn states
- Links: Subtle color shift
- Images in cards: Very subtle scale (1.02)

**Active/Focus States**
- Maintain accessibility with visible focus rings
- Cards: Additional elevation on click
- Form inputs: Clear focus indicators

**Loading States**
- Skeleton screens matching component structure
- Pulse animation for loading elements
- Maintain layout structure during loading

## Design Constraints
- No forced viewport heights except hero (80vh-100vh acceptable)
- Multi-column only where appropriate (cards grid, footer)
- Single column for article content and reading flow
- Responsive breakpoints: Mobile-first, tablet (md:), desktop (lg:)
- Maintain consistent spacing rhythm across all pages

This design creates a premium, energetic sports news experience that balances bold visual impact with excellent readability and user experience.

Set-Alias psql "C:\Program Files\PostgreSQL\16\bin\psql.exe"