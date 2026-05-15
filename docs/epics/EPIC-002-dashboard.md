# EPIC-002: Dashboard & Core UI System

**Phase:** Foundation (MVP) | **Timeline:** Week 1-2 | **Owner:** @pm

## Business Objective
Create main dashboard showing clinic KPIs, scheduled patients, financial overview, and quick actions. Establish component architecture for consistent UI/UX.

## Acceptance Criteria
- [ ] Dashboard layout matching Clairis reference (metrics, charts, patient list)
- [ ] Real-time KPI metrics (Agendadas/Atendidas, Retornos, Desmarcadas, Aniversariantes)
- [ ] Protocol statistics bar chart
- [ ] Financial overview donut chart
- [ ] Upcoming patients list with status badges
- [ ] shadcn/ui component library fully integrated
- [ ] Responsive design (desktop first, mobile ready)
- [ ] CSS design system with Tailwind CSS 4

## User Stories (from @sm)
1. DASH-001: Dashboard Layout & Page Structure
2. DASH-002: KPI Metrics Cards (4 cards with real-time data)
3. DASH-003: Protocol Statistics Chart (Recharts Bar)
4. DASH-004: Financial Overview Chart (Donut/Pie)
5. DASH-005: Upcoming Patients List with Filters
6. DASH-006: Responsive Layout (Mobile, Tablet, Desktop)

## Technical Requirements
- **Components:** Sidebar, Header, Shell layout, Card, Badge, Avatar
- **UI Library:** shadcn/ui (already configured)
- **Charts:** Recharts for data visualization
- **Design System:**
  - Colors (--color-bg, --color-gold, --color-text, etc.)
  - Fonts (Cormorant Garamond for display, Inter for body)
  - Spacing, shadows, border radius
- **State Management:** React hooks (no Redux needed yet)

## Dependencies
- EPIC-001 (requires authentication)

## Related Epics
- EPIC-003 (Patients data feeds dashboard)
- EPIC-004 (Schedule data feeds dashboard)
- EPIC-005 (Budget data feeds dashboard)

## Notes
- CSS variables already defined in globals.css
- Recharts pre-installed
- shadcn components pre-generated in components/ui/
- All components use Tailwind CSS 4 (not @apply)
