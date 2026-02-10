# 🧇 Batterella Design System

## Brand Colors

### Primary Palette
- **Sage Green**: `#B6CBBD` - Primary actions, borders, highlights
- **Rich Brown**: `#754E1A` - Text, dark elements, gingerbread theme
- **Golden Yellow**: `#CBA35C` - Secondary actions, waffle theme, accents
- **Cream Beige**: `#F8E1B7` - Backgrounds, light surfaces

### Usage Guidelines
- **Sage Green** for primary buttons, borders, and key interactions
- **Rich Brown** for text, icons, and brand elements (gingerbread)
- **Golden Yellow** for waffle-related items, secondary buttons, highlights
- **Cream Beige** for backgrounds, cards, and subtle surfaces

## Typography
- **Primary Font**: Inter (clean, modern)
- **Accent Font**: Crimson Text (elegant, for taglines)

## Icons
All icons are custom SVG components with waffle/gingerbread theming:
- `WaffleIcon` - Grid pattern with brand colors
- `GingerbreadIcon` - Person-shaped with decorative details
- `DeliveryTruckIcon` - Truck with waffle pattern
- `CheckCircleIcon`, `ClockIcon`, `PhoneIcon`, `MapPinIcon`, `ShoppingBagIcon`, `StarIcon`, `HeartIcon`

## Components

### Logo
- **Current**: Sample SVG logo (`/public/sample-logo.svg`)
- **Future**: Replace with `logo.png` using the `BatterellaLogo` component
- **Usage**: `import { BatterellaLogo } from '@/components/Logo'`

### Buttons
- **Primary**: Sage green gradient with white text
- **Secondary**: Golden yellow gradient with brown text
- **Accent**: Cream background with colored border

### Cards & Surfaces
- **Background**: Warm cream gradient
- **Cards**: White background with sage green border
- **Shadows**: Soft brown shadows for depth

## Design Principles

1. **Warm & Inviting**: Cream and sage green create a cozy feeling
2. **Food-Focused**: Waffle and gingerbread themed icons and colors
3. **Professional**: Clean typography and structured layouts
4. **Accessible**: High contrast between text and backgrounds
5. **Consistent**: Unified color palette across all components

## File Structure
```
src/
├── styles/
│   └── brand-colors.css     # CSS custom properties
├── components/
│   ├── Icons.tsx           # Custom SVG icons
│   └── Logo.tsx            # Logo component
└── app/
    ├── globals.css         # Global styles with brand imports
    └── */                  # Page-specific styles
```

## Quick Start
1. Import brand colors: `@import '../styles/brand-colors.css'`
2. Use CSS variables: `var(--primary)`, `var(--secondary)`, etc.
3. Import icons: `import { WaffleIcon } from '@/components/Icons'`
4. Replace logo: Update `BatterellaLogo` component to use `logo.png`

## Color Reference
```css
:root {
  --sage-green: #B6CBBD;
  --rich-brown: #754E1A;
  --golden-yellow: #CBA35C;
  --cream-beige: #F8E1B7;
  
  /* Semantic mappings */
  --primary: var(--sage-green);
  --secondary: var(--golden-yellow);
  --accent: var(--rich-brown);
  --background: var(--cream-beige);
  --text-primary: var(--rich-brown);
}
```

---

*Replace the sample logo with your final `logo.png` when ready! 🎨*
