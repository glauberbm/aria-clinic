# EPIC-007: Financial Module

**Phase:** Core Business (Week 4) | **Owner:** @pm

## Business Objective
Comprehensive financial management with revenue tracking, expense management, profit margin analysis, and business intelligence dashboards.

## Acceptance Criteria
- [ ] Revenue tracking (completed treatments, approved budgets)
- [ ] Expense management (staff salaries, materials, utilities)
- [ ] Profit margin analysis by treatment/doctor
- [ ] Monthly/periodic financial reports
- [ ] Cash flow forecasting
- [ ] Payment method tracking (cash, card, installments)
- [ ] Invoice/receipt generation
- [ ] Tax-ready financial statements
- [ ] B.I. dashboards (revenue, costs, margins)

## User Stories (from @sm)
1. FIN-001: Revenue Dashboard
2. FIN-002: Expense Tracking & Management
3. FIN-003: Profit Margin Analysis
4. FIN-004: Financial Reports (Monthly, Annual)
5. FIN-005: Payment Method Tracking
6. FIN-006: Invoice Generation
7. FIN-007: Business Intelligence Dashboard

## Technical Requirements
- **Database Schema:**
  ```
  revenues table: id, appointment_id, treatment_id, amount, date, payment_method
  expenses table: id, category, description, amount, date, responsible
  financial_summaries table: id, period, revenue, costs, profit_margin
  payment_methods table: id, name, fee_percentage
  invoices table: id, patient_id, items_json, total, issue_date
  ```
- **Calculations:** Real-time financial metrics
- **Charts:** Recharts for financial dashboards
- **Export:** PDF/Excel financial statements
- **Integration:** Supabase for data aggregation

## Dependencies
- EPIC-001 (requires authentication)
- EPIC-005 (Budget data feeds revenue)
- EPIC-006 (Treatment pricing feeds costs)
- EPIC-004 (Appointment completion triggers revenue)

## Related Epics
- EPIC-002 (Dashboard shows financial KPIs)
- EPIC-008 (CRM tracks customer value)

## Notes
- Brazil-specific tax considerations
- Support multiple currencies if needed
- Monthly close-out workflows
- Integration with accounting software (future)
- Staff commission tracking capability
