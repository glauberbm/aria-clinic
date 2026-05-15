# EPIC-006: Treatment Protocols & Procedures

**Phase:** Core Business (Week 3) | **Owner:** @pm

## Business Objective
Create master data for all treatment types (Botox, Fillers, etc.) with pricing, duration, materials, and contraindications. Standardize treatment offering and pricing.

## Acceptance Criteria
- [ ] Treatment/Protocol master data (name, description, duration)
- [ ] Pricing rules (base price, adjustments)
- [ ] Materials/products required per treatment
- [ ] Doctor specialization mapping
- [ ] Pre-treatment requirements (anamnese, etc.)
- [ ] Contraindications and warnings
- [ ] Treatment package/combo management
- [ ] Pricing intelligence/suggestions
- [ ] Treatment statistics and popularity

## User Stories (from @sm)
1. PROTOCOL-001: Treatment Master Data Management
2. PROTOCOL-002: Pricing Rules & Adjustments
3. PROTOCOL-003: Materials/Products Association
4. PROTOCOL-004: Doctor Specialization Mapping
5. PROTOCOL-005: Combo/Package Treatments
6. PROTOCOL-006: Pricing Intelligence Engine
7. PROTOCOL-007: Treatment Analytics

## Technical Requirements
- **Database Schema:**
  ```
  treatments table: id, name, description, base_price, duration_minutes, materials_json
  treatment_categories table: id, name (Botox, Preenchimento, Limpeza, etc.)
  treatment_pricing_rules table: id, treatment_id, rule_type, value
  treatment_requirements table: id, treatment_id, requirement_type
  doctor_treatments table: doctor_id, treatment_id (mapping)
  ```
- **Pricing Engine:** Support tier pricing, volume discounts
- **Analytics:** Usage statistics, margin analysis
- **UI:** Master data admin interface with bulk operations

## Dependencies
- EPIC-001 (requires authentication)
- EPIC-004 (used when scheduling appointments)
- EPIC-005 (used when creating budgets)

## Related Epics
- EPIC-002 (Dashboard shows protocol stats)
- EPIC-006 (Pricing rules feed financial module)

## Notes
- Pre-populate with Brazilian aesthetic treatment standards
- Support custom protocols per clinic
- Allow A/B testing of pricing
- Integrate with B.I. for treatment performance analysis
