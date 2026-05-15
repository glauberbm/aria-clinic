# ArIA Clinic — Epic Registry

**Foundation Plan Created:** 2026-05-14 | **Owner:** @pm (Morgan) | **Orchestrator:** Orion (@aiox-master)

---

## 📋 Epic Overview

ArIA Clinic is structured in **3 phases with 9 epics**, based on the Clairis platform reference and AIOX methodology.

### Phase 1: Foundation (MVP) — Weeks 1-2

| Epic | Title | Status | Stories | Dependencies |
|------|-------|--------|---------|--------------|
| **EPIC-001** | Authentication & User Management | `pending` | 5 | None |
| **EPIC-002** | Dashboard & Core UI System | `pending` | 6 | EPIC-001 |
| **EPIC-003** | Patients Module | `pending` | 6 | EPIC-001 |
| **EPIC-004** | Scheduling/Agenda Module | `pending` | 7 | EPIC-001, EPIC-003 |

**Delivery Goal:** Functional MVP with core patient & appointment management

---

### Phase 2: Core Business Logic — Weeks 3-4

| Epic | Title | Status | Stories | Dependencies |
|------|-------|--------|---------|--------------|
| **EPIC-005** | Budget/Quote Management | `pending` | 7 | EPIC-001, EPIC-003 |
| **EPIC-006** | Treatment Protocols & Procedures | `pending` | 7 | EPIC-001 |
| **EPIC-007** | Financial Module | `pending` | 7 | EPIC-001, EPIC-005, EPIC-006 |

**Delivery Goal:** Complete clinic operations with financial tracking

---

### Phase 3: Advanced Features — Weeks 5-6

| Epic | Title | Status | Stories | Dependencies |
|------|-------|--------|---------|--------------|
| **EPIC-008** | CRM Integration & Lead Management | `pending` | 7 | EPIC-001, EPIC-003, EPIC-007 |
| **EPIC-009** | WhatsApp AI Assistant | `pending` | 8 | EPIC-001, EPIC-003, EPIC-004, EPIC-008 |

**Delivery Goal:** Advanced sales, marketing, and customer engagement

---

## 🛠️ Technical Stack

```
Frontend:        Next.js 16 + TypeScript + Tailwind CSS 4
UI Components:   shadcn/ui (pre-configured)
Charts:          Recharts 3.8
Backend:         Supabase (PostgreSQL + Auth + RLS)
Auth:            Supabase Auth (JWT)
Database:        PostgreSQL (managed by Supabase)
Messaging:       WhatsApp Business API (Phase 3)
AI:              Claude API (Phase 3)
Automation:      n8n workflows
```

---

## 📊 Dependency Graph

```
EPIC-001 (Auth)
├── EPIC-002 (Dashboard)
├── EPIC-003 (Patients)
│   ├── EPIC-004 (Scheduling)
│   ├── EPIC-005 (Budgets)
│   └── EPIC-008 (CRM)
│       └── EPIC-009 (WhatsApp AI)
├── EPIC-006 (Protocols)
└── EPIC-007 (Financial)
    └── EPIC-008 (CRM)
```

---

## 🎯 Next Steps

### For @pm (Product Manager - Morgan):
1. Review each epic for completeness
2. Create EPIC-execution files for each epic
3. Delegate to @sm (River) for story creation

### For @sm (Scrum Master - River):
1. Receive epic assignments
2. Create individual stories (USER-001, DASH-001, etc.)
3. Coordinate with @dev (Dex) for implementation

### For @dev (Developer - Dex):
1. Claim stories from @sm
2. Implement per Story Development Cycle (SDC)
3. Submit for @qa (Quinn) testing

---

## 📁 Files

- **EPIC-001-authentication.md** — Auth & user management
- **EPIC-002-dashboard.md** — Dashboard & design system
- **EPIC-003-patients.md** — Patient management
- **EPIC-004-scheduling.md** — Appointment scheduling
- **EPIC-005-budgets.md** — Treatment budgets/quotes
- **EPIC-006-protocols.md** — Treatment master data
- **EPIC-007-financial.md** — Financial tracking
- **EPIC-008-crm.md** — CRM & lead management
- **EPIC-009-whatsapp-ai.md** — WhatsApp AI assistant
- **SCHEMA.md** — Database schema for Phase 1

---

## 🔐 AIOX Process

This plan follows **Synkra AIOX** framework:

1. **Epics Created** (by @aiox-master/Orion)
2. **Stories Created** (by @sm/River from epics)
3. **Story Validation** (by @po/Pax - 10-point checklist)
4. **Implementation** (by @dev/Dex via Story Development Cycle)
5. **QA Gate** (by @qa/Quinn - 7 quality checks)
6. **Production Merge** (by @devops/Gage)

---

## 📞 Points of Contact

| Role | Agent | Responsibility |
|------|-------|-----------------|
| **Product Owner** | @po (Pax) | Story validation, backlog prioritization |
| **Product Manager** | @pm (Morgan) | Epic orchestration, requirements |
| **Scrum Master** | @sm (River) | Story creation, team coordination |
| **Lead Developer** | @dev (Dex) | Implementation, code quality |
| **QA Lead** | @qa (Quinn) | Testing, quality gates |
| **DevOps** | @devops (Gage) | Git push, CI/CD, deployment |
| **Architect** | @architect (Aria) | Technical decisions, database design |
| **Orchestrator** | @aiox-master (Orion) | Framework governance |

---

**Plan Status:** ✅ Foundation complete, ready for epic execution

**Last Updated:** 2026-05-14 22:15 UTC
