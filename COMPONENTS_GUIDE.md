# RAVO OS v4.0 — Components Guide 🎨

Quick reference for all new v4.0 components.

---

## 1. KPICardPremium

**Premium card with glassmorphism and glow effects**

```tsx
import { KPICardPremium } from '@/components';
import { DollarSign } from 'lucide-react';

<KPICardPremium
  title="Receita Hoje"
  value="$12,456"
  unit="USD"
  icon={<DollarSign className="w-5 h-5" />}
  trend={{ direction: 'up', percentage: 12 }}
  color="#FF6200"
/>
```

**Props:**
- `title` (string) — Card title
- `value` (string | number) — Main value display
- `unit` (string, optional) — Unit label
- `icon` (ReactNode) — Card icon
- `trend` (optional) — `{ direction: 'up' | 'down', percentage: number }`
- `color` (string, optional) — Brand color (default: #FF6200)

**Features:**
- Glassmorphic background with backdrop blur
- Glow effect on hover
- Icon background with color variant
- Trend indicators with colors (green for up, red for down)
- Smooth hover animations

---

## 2. AnimatedCard

**Wrapper for Framer Motion animations**

```tsx
import { AnimatedCard } from '@/components';

<AnimatedCard delay={0.1}>
  <div>Your content here</div>
</AnimatedCard>
```

**Props:**
- `children` (ReactNode) — Content to animate
- `delay` (number, optional) — Animation delay in seconds (default: 0)
- `style` (CSSProperties, optional) — Additional styles

**Animations:**
- Fade in + slide up on mount
- Hover elevation effect
- Perfect for staggered lists

---

## 3. TimelinePremium

**Animated timeline with connecting lines and icons**

```tsx
import { TimelinePremium } from '@/components';
import { CheckCircle2 } from 'lucide-react';

const items = [
  {
    id: '1',
    title: 'New Lead',
    description: 'Acme Corp contacted',
    timestamp: '2 minutes ago',
    icon: '👤',
    color: '#FF6200'
  },
  {
    id: '2',
    title: 'Deal Closed',
    description: '$50k contract signed',
    timestamp: '3 hours ago',
    icon: '✅',
    color: '#10B981'
  }
];

<TimelinePremium items={items} />
```

**Item Structure:**
```tsx
interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  icon?: ReactNode;
  color?: string;
}
```

**Features:**
- Vertical timeline layout
- Gradient connecting line
- Icon circles with custom colors
- Glassmorphic content cards
- Staggered animations

---

## 4. Dropdown

**Advanced select with search and descriptions**

```tsx
import { Dropdown, type DropdownOption } from '@/components';
import { Users, Building2 } from 'lucide-react';

const options: DropdownOption[] = [
  {
    id: 'leads',
    label: 'Leads',
    icon: <Users className="w-4 h-4" />,
    description: 'New prospects'
  },
  {
    id: 'accounts',
    label: 'Accounts',
    icon: <Building2 className="w-4 h-4" />,
    description: 'Active customers'
  }
];

const [selected, setSelected] = useState('leads');

<Dropdown
  options={options}
  value={selected}
  onChange={setSelected}
  label="View by"
  searchable
  placeholder="Select category"
/>
```

**Props:**
- `options` (DropdownOption[]) — Available choices
- `value` (string, optional) — Selected option ID
- `onChange` (function) — Callback with selected ID
- `label` (string, optional) — Label above dropdown
- `placeholder` (string, optional) — Placeholder text
- `searchable` (boolean, optional) — Enable search (default: false)

**Features:**
- Glassmorphic design
- Search functionality
- Icon support
- Description tooltips
- Smooth open/close animations

---

## 5. Accordion

**Expandable sections with smooth animations**

```tsx
import { Accordion, type AccordionItem } from '@/components';
import { ChevronRight } from 'lucide-react';

const items: AccordionItem[] = [
  {
    id: 'features',
    title: 'Features',
    icon: <ChevronRight className="w-4 h-4" />,
    content: 'Advanced features include...'
  },
  {
    id: 'pricing',
    title: 'Pricing',
    icon: <ChevronRight className="w-4 h-4" />,
    content: 'Pricing plans start from...'
  }
];

<Accordion items={items} allowMultiple={true} />
```

**Props:**
- `items` (AccordionItem[]) — Section items
- `allowMultiple` (boolean, optional) — Multiple open sections (default: false)

**Item Structure:**
```tsx
interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
  icon?: ReactNode;
}
```

**Features:**
- Smooth height animations
- Icon rotation on expand
- Glassmorphic design
- Support for single or multiple open items

---

## 6. ThemeSwitcher

**Color palette selector**

```tsx
import { ThemeSwitcher } from '@/components';

// Already integrated in AppLayout header
// Use directly if needed:
<ThemeSwitcher />
```

**Features:**
- 4-color palette preview
- Smooth transitions
- Backdrop blur effect
- Real-time theme switching
- LocalStorage persistence

**Available Colors:**
- 🟠 Orange `#FF6200` — Default
- 🔵 Blue `#3B82F6`
- 🟣 Purple `#A855F7`
- 🟢 Green `#10B981`

---

## 7. Tabs (Enhanced)

**Tab navigation with smooth transitions**

```tsx
import { Tabs, type Tab } from '@/components/ui/Tabs';

const tabs: Tab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'details', label: 'Details' },
  { id: 'analytics', label: 'Analytics' }
];

const [active, setActive] = useState('overview');

<Tabs tabs={tabs} active={active} onChange={setActive} />
```

**Features:**
- Smooth underline animation
- Color-customizable
- Respects theme colors
- Keyboard accessible

---

## 8. Toggle (Enhanced)

**Checkbox-style toggle with smooth animation**

```tsx
import { Toggle } from '@/components/ui/Toggle';

const [enabled, setEnabled] = useState(false);

<Toggle
  checked={enabled}
  onChange={setEnabled}
  label="Feature enabled"
/>
```

**Features:**
- Smooth on/off animation
- Theme-aware styling
- Accessible checkbox behavior

---

## 9. Progress (Enhanced)

**Progress bar with animation and variants**

```tsx
import { Progress } from '@/components/ui/Progress';

<Progress
  value={65}
  label="65%"
  color="orange"
  animated
/>
```

**Props:**
- `value` (number) — Progress percentage (0-100)
- `label` (string, optional) — Display label
- `color` (string, optional) — Variant color
- `animated` (boolean, optional) — Animation enabled

**Color Variants:**
- primary (orange)
- success (green)
- warning (yellow)
- danger (red)

---

## 10. DashboardPremium

**Complete animated dashboard**

```tsx
import DashboardPremium from '@/pages/DashboardPremium';

// Now default in Dashboard.tsx
<Dashboard /> // Routes to DashboardPremium
```

**Features:**
- Animated KPI cards
- Premium charts with glassmorphism
- Interactive timeline
- Animated alerts
- Staggered page load

---

## Theme System

### Using Custom Colors

```tsx
import { useTheme, useThemeColor } from '@/contexts/ThemeContext';

function MyComponent() {
  const { mode, color, toggleMode, setColor } = useTheme();
  const palette = useThemeColor();

  return (
    <div style={{ color: palette.primary }}>
      Current: {color} {mode} mode
      <button onClick={() => setColor('blue')}>
        Switch to Blue
      </button>
    </div>
  );
}
```

### Available Colors

Each color includes:
- `primary` — Main color
- `hover` — Darker shade
- `light` — Transparent variant

```tsx
const colors = {
  orange: { primary: '#FF6200', hover: '#FF7A33', light: 'rgba(255,98,0,0.1)' },
  blue: { primary: '#3B82F6', hover: '#2563EB', light: 'rgba(59,130,246,0.1)' },
  purple: { primary: '#A855F7', hover: '#9333EA', light: 'rgba(168,85,247,0.1)' },
  green: { primary: '#10B981', hover: '#059669', light: 'rgba(16,185,129,0.1)' },
  red: { primary: '#EF4444', hover: '#DC2626', light: 'rgba(239,68,68,0.1)' }
};
```

---

## Import Examples

```tsx
// All components
import {
  KPICardPremium,
  AnimatedCard,
  TimelinePremium,
  Dropdown,
  Accordion,
  ThemeSwitcher,
  Button,
  Input,
  Card,
  Alert,
  Badge,
  Tabs,
  Toggle,
  Progress
} from '@/components';

// Types
import { DropdownOption, AccordionItem, Tab } from '@/components';

// Context
import { useTheme, useThemeColor } from '@/contexts/ThemeContext';
```

---

## Animation Defaults

### AnimatedCard
- Duration: 0.5s
- Easing: ease-out
- Delay: configurable

### KPICardPremium
- Hover: +4px elevation
- Transition: 0.3s all
- Glow: 30px radius

### TimelinePremium
- Container delay: 0.2s
- Child stagger: 0.1s each
- Transition: 0.4s slide-in

### Dropdown/Accordion
- Open/Close: 0.2s
- Content height: 0.3s
- Opacity: instant

---

## Best Practices

### 1. Staggered Lists
```tsx
<motion.div variants={containerVariants}>
  {items.map((item, i) => (
    <AnimatedCard key={item.id} delay={i * 0.1}>
      {item.content}
    </AnimatedCard>
  ))}
</motion.div>
```

### 2. Theme Integration
```tsx
<KPICardPremium
  color={useThemeColor().primary}
  // Automatically adapts to selected theme
/>
```

### 3. Responsive Dropdowns
```tsx
<Dropdown
  searchable={isDesktop}
  // Enable search only on larger screens
/>
```

---

## Performance Tips

1. **Use AnimatedCard wrapper** — Optimizes re-renders
2. **Lazy load heavy components** — Use React.lazy()
3. **Memoize callbacks** — Prevents animation restarts
4. **Avoid backdrop-filter on slow devices** — Falls back to solid color

---

## Troubleshooting

### Animations not playing
- Check `prefers-reduced-motion` setting
- Verify Framer Motion installed
- Check browser DevTools animation settings

### Theme not switching
- Verify ThemeProvider wraps app
- Check localStorage enabled
- Inspect CSS variables in DevTools

### Glassmorphism not visible
- Ensure `backdrop-filter` supported
- Check `will-change` property
- Verify semicolon after filter

---

## Component Preview

See all components in action:
```bash
npm run dev
# Visit http://localhost:5173/dashboard
```

---

**Last Updated**: July 6, 2026 | v4.0.0
