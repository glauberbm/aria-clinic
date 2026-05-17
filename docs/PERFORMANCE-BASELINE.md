# MVP Performance Baseline

**Established:** 2026-05-15
**Environment:** Development (local)
**Targets:** P50, P95 response times

---

## API Endpoint Baselines

### Patient Insurance Routes

#### GET /api/patient/insurance
**Purpose:** Retrieve current patient's insurance information
**Query Pattern:**
```sql
SELECT * FROM insurance_info WHERE patient_id = $1 ORDER BY created_at DESC
```
**Target Response Time:**
- **P50:** <200ms (median)
- **P95:** <300ms (95th percentile)
- **Max acceptable:** 500ms

**Indexes in place:**
- idx_patients_user_id (patient lookup)
- Implicit index on insurance_info.patient_id (FK)

**Monitoring:**
- [ ] Verify query plan uses index (EXPLAIN ANALYZE)
- [ ] Load test with 100 concurrent users
- [ ] Check database CPU during peak

---

#### POST /api/patient/insurance
**Purpose:** Create insurance information for current patient
**Operations:**
1. Token validation (auth.getUser) — ~50ms
2. Patient lookup (SELECT id FROM patients WHERE email = $1) — ~50ms
3. Schema validation (Zod parse) — ~5ms
4. Insert to insurance_info — ~50ms
5. Return response — ~10ms

**Target Response Time:**
- **P50:** <200ms
- **P95:** <400ms
- **Max acceptable:** 1000ms

**Known risks:**
- N+1: Patient lookup every time (OK, small table)
- No batch inserts (single record, acceptable)

**Monitoring:**
- [ ] Verify patient lookup is fast (indexed by email)
- [ ] Profile Zod validation overhead
- [ ] Check insert trigger performance (patient_audit_logs)

---

### Medical History Routes

#### GET /api/patient/medical-history
**Purpose:** Retrieve current patient's medical history, grouped by type
**Query Pattern:**
```sql
SELECT * FROM medical_history
WHERE patient_id = $1 AND is_active = true
ORDER BY date_recorded DESC
```
**Target Response Time:**
- **P50:** <200ms
- **P95:** <300ms
- **Max acceptable:** 500ms

**Indexes in place:**
- idx_patient_medical_history_patient_id
- Implicit index on medical_history(is_active)

**Risk:** Client-side grouping in JavaScript (lines 82-86) — O(n) loop, acceptable for <1000 records

---

#### POST /api/patient/medical-history
**Purpose:** Create medical history entry for current patient
**Operations:**
1. Token validation — ~50ms
2. Patient lookup — ~50ms
3. Schema validation — ~5ms
4. Insert to medical_history — ~50ms
5. Trigger: log_patient_audit() — ~30ms
6. Return response — ~10ms

**Target Response Time:**
- **P50:** <250ms (includes audit trigger)
- **P95:** <400ms
- **Max acceptable:** 1000ms

**Known risks:**
- Audit trigger (log_patient_audit) inserts to patient_audit_logs on every change
- Multiple row_to_json() conversions in trigger

---

## Database Query Optimization Checklist

| Query | Index | Status | Notes |
|-------|-------|--------|-------|
| patients by user_id | idx_patients_user_id | ✅ | Primary lookup |
| insurance_info by patient_id | FK implicit index | ✅ | Tested |
| medical_history by patient_id | idx_patient_medical_history_patient_id | ✅ | Tested |
| medical_history is_active filter | Composite? | ⏳ | May need covering index |
| patient_medications by patient_id | idx_patient_medications_patient_id | ✅ | Verified |

---

## Load Test Targets

**Scenario:** 10 concurrent users, 10 requests each over 60 seconds

```
Total Requests: 100
Expected throughput: ~1.7 req/sec

P50 latency: <200ms → ✅ Should handle
P95 latency: <400ms → ✅ Should handle
P99 latency: <1000ms → ✅ Should handle
Error rate: <0.1% → ✅ Should handle
```

**Tools:**
- Apache JMeter (open-source)
- OR: Artillery (Node.js-based)
- OR: curl loops (simple, for quick test)

---

## Monitoring during Development

### Code Review Checklist (@dev)

When reviewing commits, check for:

- [ ] **N+1 Queries:** Are there loops with queries inside?
- [ ] **Missing LIMIT:** SELECT * without LIMIT = potential memory leak
- [ ] **Expensive Joins:** How many tables being joined?
- [ ] **Unindexed Filters:** WHERE clauses on unindexed columns?
- [ ] **Trigger Performance:** New triggers adding >50ms per operation?

### Baseline Re-check

After major changes, re-verify:
```bash
# In Supabase SQL Editor:
EXPLAIN ANALYZE SELECT * FROM insurance_info WHERE patient_id = 'UUID' ORDER BY created_at DESC;
EXPLAIN ANALYZE SELECT * FROM medical_history WHERE patient_id = 'UUID' AND is_active = true;
```

---

## Performance Anomaly Thresholds

| Threshold | Action |
|-----------|--------|
| API endpoint >500ms P50 | Flag for optimization |
| API endpoint >1000ms P95 | Escalate to @architect |
| Database query >100ms | Analyze query plan |
| Error rate >0.5% | Immediate investigation |
| CPU >80% sustained | Capacity assessment needed |

---

## Next Steps (Post-MVP)

- [ ] Implement real-time APM (DataDog, Sentry, or New Relic)
- [ ] Set up database slow-query log (Supabase)
- [ ] Create performance dashboard (Grafana/Metabase)
- [ ] Load test with 100+ concurrent users
- [ ] Profile frontend rendering (web vitals)
- [ ] Cache strategy (Redis for hot data)

---

**Baseline Status:** ✅ ESTABLISHED
**Last Updated:** 2026-05-15
**Next Review:** After EPIC-004 Phase 1
