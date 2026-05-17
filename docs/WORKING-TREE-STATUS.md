# Working Tree Status — Files Ready for Commit

**Last Scanned:** 2026-05-15 21:30 UTC
**Total Modified:** 30+ files | **Status:** ⚠️ Need categorization & commit

---

## 📋 Modified Files (Tracked, Need Commit)

### App Code Changes
```
 M app/api/auth/patient-register/route.ts       — Auth registration endpoint
 M app/api/patient/insurance/route.ts            — Patient insurance API
 M app/api/patient/medical-history/route.ts      — Patient medical history API
 M app/auth/patient-register/page.tsx            — Registration UI
 M app/auth/verify-email/page.tsx                — Email verification UI
```

### Validation & Lib Changes
```
 M lib/validations/patient.ts                   — Patient validation schemas
```

### Configuration
```
 M .env.supabase                                — Supabase environment config
 M package.json                                 — Dependencies (check for changes)
 M package-lock.json                            — Dependency lock (auto-generated)
 M supabase/config.toml                         — Supabase local config
```

### Test Coverage Reports (Auto-Generated)
```
 M coverage/clover.xml                          — Coverage report (auto-generated)
 M coverage/coverage-final.json                 — Coverage data (auto-generated)
 M coverage/lcov.info                           — LCOV coverage (auto-generated)
 M coverage/lcov-report/*.html                  — Coverage HTML (auto-generated)
 M coverage/lcov-report/*.js                    — Coverage JS (auto-generated)
 M coverage/lcov-report/*.css                   — Coverage CSS (auto-generated)
```

---

## 🆕 New Files (Untracked, Need Decision)

### API Endpoints (New)
```
?? app/api/patient/insurance/[insuranceId]/      — Insurance detail endpoint
?? app/api/patient/medical-history/[historyId]/  — Medical history detail endpoint
```

### Components (New)
```
?? components/ui/form.tsx                       — Form component (new UI)
?? components/ui/tabs.tsx                       — Tabs component (new UI)
```

### Lib (New)
```
?? lib/supabase/server.ts                       — Supabase server utilities (new)
```

### Supabase Temp Files (Auto-Generated, Ignore)
```
?? supabase/.temp/gotrue-version                — Temp file (auto-generated)
?? supabase/.temp/linked-project.json           — Temp file (auto-generated)
?? supabase/.temp/pooler-url                    — Temp file (auto-generated)
?? supabase/.temp/postgres-version              — Temp file (auto-generated)
?? supabase/.temp/project-ref                   — Temp file (auto-generated)
?? supabase/.temp/rest-version                  — Temp file (auto-generated)
?? supabase/.temp/storage-migration             — Temp file (auto-generated)
?? supabase/.temp/storage-version               — Temp file (auto-generated)
```

### Session Logs (New)
```
?? docs/EPIC-003-SESSION-LOG.md                 — Session log (new)
```

### Coverage Reports (New)
```
?? coverage/lcov-report/lib/email/              — Email lib coverage (new)
?? coverage/lcov-report/lib/middleware/         — Middleware coverage (new)
?? coverage/lcov-report/lib/services/           — Services coverage (new)
?? coverage/lcov-report/lib/auth/verification.ts.html — Verification coverage (new)
```

---

## ✅ Commit Strategy

### Commit 1: Feature Code (Priority)
**Files:** App code + validation + config
**Message:** `feat: patient insurance & medical history APIs [EPIC-003-Wave-2]`

```bash
git add app/api/patient/insurance/route.ts \
        app/api/patient/medical-history/route.ts \
        app/auth/patient-register/page.tsx \
        app/auth/verify-email/page.tsx \
        lib/validations/patient.ts \
        .env.supabase \
        supabase/config.toml

git commit -m "feat: patient insurance & medical history APIs [EPIC-003-Wave-2]"
```

### Commit 2: New Components & Utils (Priority)
**Files:** New UI components + server utilities
**Message:** `feat: add form & tabs UI components, supabase server utilities [EPIC-003-Wave-2]`

```bash
git add components/ui/form.tsx \
        components/ui/tabs.tsx \
        lib/supabase/server.ts \
        app/api/patient/insurance/[insuranceId]/ \
        app/api/patient/medical-history/[historyId]/

git commit -m "feat: add form & tabs UI components, supabase server utilities [EPIC-003-Wave-2]"
```

### Commit 3: Dependencies (Auto-Handle)
**Files:** package.json + package-lock.json
**Message:** `chore: update dependencies`

```bash
git add package.json package-lock.json
git commit -m "chore: update dependencies"
```

### Commit 4: Coverage Reports (Optional, Usually Ignored)
**Files:** All coverage/* (or add to .gitignore)
**Decision:** Recommend adding `coverage/` to `.gitignore` if not already present

```bash
# Option A: Ignore coverage
echo "coverage/" >> .gitignore
git add .gitignore
git commit -m "chore: ignore coverage reports"

# Option B: Commit (not recommended for large reports)
# Depends on repo policy
```

### Commits 5+: Auto-Generated Ignore
**Files:** supabase/.temp/*
**Action:** Ensure `.gitignore` has `supabase/.temp/` entry

---

## 🎯 Next Steps

1. **Review** modified files: Do all changes belong to EPIC-003 Wave 2?
2. **Test** before commit: `npm test && npm run lint && npm run typecheck`
3. **Execute** commits 1-3 above
4. **Verify** git status: `git status` should show clean working tree
5. **Push** when ready: `git push origin feature/epic-003-wave-2` (or appropriate branch)

---

## 📊 Summary

| Category | Count | Status |
|----------|-------|--------|
| Modified (tracked) | 14 | Ready to commit |
| New (untracked) | 16+ | Review + add |
| Auto-generated (ignore) | 8+ | Add to .gitignore or ignore |
| **Total** | **30+** | **Actionable** |

**Estimated commit time:** 5-10 minutes (after test run)

