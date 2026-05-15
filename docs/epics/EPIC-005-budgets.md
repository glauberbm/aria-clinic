# EPIC-005: Budget/Quote Management

**Phase:** Core Business (Week 3) | **Owner:** @pm

## Business Objective
Enable creation, management, and tracking of treatment budgets/quotes. Support multi-session treatments, product costs, and approval workflows.

## Acceptance Criteria
- [ ] Budget creation with treatments and costs
- [ ] Multi-session treatment support (e.g., 10 sessions of botox)
- [ ] Product/materials pricing
- [ ] Budget status workflow (draft, pending approval, approved, completed)
- [ ] Patient signature for budget approval
- [ ] Budget history and revisions
- [ ] Budget-to-appointment linking
- [ ] Financial forecasting (open budgets value)
- [ ] Budget reports and analytics

## User Stories (from @sm)
1. BUDGET-001: Create Budget Form
2. BUDGET-002: Add Treatments & Products
3. BUDGET-003: Multi-Session Treatment Pricing
4. BUDGET-004: Budget Approval Workflow
5. BUDGET-005: Patient Signature Capture
6. BUDGET-006: Budget Status Tracking
7. BUDGET-007: Budget Reports & Exports

## Technical Requirements
- **Database Schema:**
  ```
  budgets table: id, patient_id, doctor_id, total_value, status, created_at, approved_at
  budget_items table: id, budget_id, treatment_id, quantity, unit_price, subtotal
  budget_approvals table: id, budget_id, signed_at, signature_data
  budget_products table: id, budget_id, product_id, quantity, cost
  ```
- **Form Builder:** Dynamic treatment/product selection
- **Signature:** Canvas-based digital signature capture
- **Export:** PDF generation with clinic branding
- **Calculation:** Real-time total updates, tax handling (if applicable)

## Dependencies
- EPIC-001 (requires authentication)
- EPIC-003 (requires patient data)
- EPIC-004 (optional: link budget to appointment)

## Related Epics
- EPIC-006 (Linked to financial module)
- EPIC-002 (Dashboard shows open budgets)

## Notes
- Budget approval critical for financial tracking
- Support multiple budgets per patient
- Revision history for compliance
- Patient signature on device (tablet/phone)
- Integration with financial module for revenue recognition
