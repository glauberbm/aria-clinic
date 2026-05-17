# Daily Sync & Standup Protocol — Phase 1 Execution

**Effective Date:** 2026-05-16 (starting today after Phase 2 kickoff)
**Duration:** 30 minutes
**Time:** 09:00 UTC (adjustable by @pm)
**Attendees:** @dev, @qa, @architect, @sm, @pm (required), @devops (as needed)

---

## 📌 Purpose

- **Sync** team status on Phase 1 execution
- **Identify** blockers in real-time
- **Escalate** issues immediately (don't wait 24h)
- **Adjust** daily priorities if needed
- **Celebrate** wins

---

## ⏱️ AGENDA (30 min total)

### 1. OPENING — 2 min
**@pm opens:**
- "Status as of [date/time]. Phase 1 target: 2026-05-30."
- "Priority today: [EPIC]"
- Review previous day's commitments

### 2. EPIC STATUS UPDATES — 10 min (2 min per epic)

**For each EPIC in flight (1-4):**

**@owner (dev, qa, architect, sm) reports:**

```
EPIC-### (Title)

✅ Completed since yesterday:
  - Story X: [done/reviewed/merged]
  - Story Y: [done/reviewed/merged]

🟡 In progress:
  - Story Z: [% complete, blocker if any]

⏳ Next (today/tomorrow):
  - Story A: [estimated time]
  - Story B: [estimated time]

🚨 Blockers (if any):
  - [Blocker description] → Owner [name] → ETA unblock
```

**Example:**
```
EPIC-003 (Patient Mgmt)

✅ Completed:
  - STORY-003-001: DB Schema merged ✅
  - STORY-003-002: Patient List code review complete

🟡 In progress:
  - QA gate prep: 80% complete (testing checklist)

⏳ Next:
  - STORY-003-003: Patient Detail (starts after Wave 1 QA PASS)

🚨 Blockers:
  - None (on track)
```

### 3. BLOCKERS & RISKS — 8 min

**@pm asks each owner:**
- "Any blockers or risks to surface?"
- If blocker identified: Discuss mitigation immediately
- If risk: Add to STATUS-SNAPSHOT.md, update mitigation

**Blocker resolution:**
- Owner proposes fix, estimated unblock time
- If >4h to unblock: @pm escalates immediately
- Document in WORKING-TREE-STATUS.md / STATUS-SNAPSHOT.md

### 4. DECISIONS NEEDED — 5 min

**@pm identifies decisions from updates:**
- Scope adjustments?
- Priority shifts?
- Timeline risk?

**Document decision** in STATUS-SNAPSHOT.md "Decision Points Ahead" section

### 5. CLOSING — 5 min

**@pm summarizes:**
- Priorities today (reaffirm)
- Blockers to watch
- Next standup (tomorrow 09:00 UTC)
- "Any last updates?"

---

## 📊 STATUS TEMPLATE (for each owner)

Copy/paste into Slack or meeting notes:

```markdown
## EPIC-### STATUS (2026-05-XX)

**Owner:** @name

✅ **Done since yesterday:**
- [ ] Story X: description
- [ ] Story Y: description

🟡 **In progress:**
- [%] Story Z: description (ETA: 2026-05-XX)

⏳ **Next 24h:**
- [ ] Story A: description
- [ ] Story B: description

🚨 **Blockers:**
- [ ] None
- [x] Blocker X: description → ETA unblock: 2026-05-XX HH:00

📈 **Metrics:**
- Coverage: X% (target 95%)
- CodeRabbit: Y critical issues (target 0)
- Test pass rate: Z% (target 100%)
```

---

## 🚨 ESCALATION PROTOCOL

If a blocker is identified:

| Timeframe | Action |
|-----------|--------|
| **During standup (immediately)** | Discuss fix, ETA to unblock |
| **If ETA >4h** | @pm escalates to team leads |
| **If blocks Phase 1 timeline** | @pm escalates to @ceo / @aiox-master |
| **Within 2h of escalation** | Status update required |

---

## 📝 LOGGING

Each standup is logged in `/docs/standup-logs/`:

**File:** `standup-YYYY-MM-DD.md`

**Format:**
```markdown
# Standup Log — 2026-05-16 09:00 UTC

## Attendance
- @dev (Dex) ✅
- @qa (Quinn) ✅
- @architect (Aria) ✅
- @sm (River) ✅
- @pm (Morgan) ✅ (lead)

## EPIC-001 (Auth)
**Owner:** @dev
- ✅ All 5 stories merged (complete)
- No blockers

## EPIC-002 (Dashboard)
**Owner:** @dev
- 🟡 DASH-001 (Layout) — 60% complete, on track
- ⏳ DASH-002 starts 2026-05-21
- No blockers

## EPIC-003 (Patient Mgmt)
**Owner:** @qa (for QA gate), @dev (for coding)
- ✅ STORY-003-001 merged
- 🟡 Wave 1 QA prep — 90% ready (test checklist)
- ⏳ Wave 1 QA gate scheduled 2026-05-20
- No blockers

## EPIC-004 (Scheduler)
**Owner:** @dev
- 📋 Ready to start 2026-05-24
- No blockers

## Decisions Made
- None

## Blockers Escalated
- None

## Next Standup
- 2026-05-17 09:00 UTC
```

---

## 🎯 DAILY PRIORITY CHECK

**Before standup, @pm confirms:**

- [ ] STATUS-SNAPSHOT.md updated for today?
- [ ] WORKING-TREE-STATUS.md reflects current state?
- [ ] PHASE-1-EXECUTION-TASKS.md has today's tasks?
- [ ] Any overnight escalations from team Slack?

---

## 📞 OUT-OF-BAND COMMUNICATION

**If urgent blocker outside standup window:**

1. **Notify @pm immediately** (Slack @pm, email, call)
2. **@pm convenes mini-sync** (15 min, affected owners)
3. **Document in standup log** as "out-of-band escalation"
4. **Follow up in next daily standup**

**Example:**
```
⚠️ @pm: EPIC-003 Wave 1 QA found 2 critical bugs
  → Estimated fix time: 6h
  → @dev: Can you fix 2026-05-20 morning?
  → Impact: May delay Wave 2 by 1 day
  → Document in standup log
```

---

## 🏆 METRICS TRACKED IN DAILY STANDUP

| Metric | Target | Tracked By |
|--------|--------|-----------|
| **Stories completed/day** | 2-3 | @pm |
| **Blockers identified** | <1 | @pm |
| **Blockers resolved same-day** | 100% | @pm |
| **Test coverage** | ≥95% | @qa/@dev |
| **CodeRabbit issues** | 0 CRITICAL | @qa |
| **Phase 1 timeline** | On track | @pm |

---

## 🔄 RECURRING DECISIONS

**Every standup, @pm assesses:**

1. **Phase 1 timeline:** On track? ✅ or ⚠️ or 🚨?
2. **Quality gates:** All passing? ✅ or ⚠️?
3. **Team capacity:** Any burnout signals? ✅ or ⚠️?
4. **Phase 2 prep:** Anything we need to prepare early?

---

## 📞 CONTACT

**Standup Lead:** @pm (Morgan)
**Duration:** 30 minutes
**Frequency:** Daily (9:00 UTC, except holidays)
**Fallback (if host unavailable):** @sm (River) leads

**To reschedule standup:**
- Notify @pm minimum 4h before
- Propose new time (maintain 09:00 UTC as default)

---

## 🗓️ STANDUP CALENDAR

- **2026-05-16 → 2026-05-30:** Daily (Phase 1 execution)
- **2026-05-31+:** Daily (Phase 2 execution)
- **Review frequency:** Weekly (Friday) for comprehensive retrospective

---

**Effective Date:** 2026-05-16 09:00 UTC
**Owner:** @pm (Morgan)
**First Standup:** 2026-05-16 09:00 UTC (post-Phase 2 kickoff)

