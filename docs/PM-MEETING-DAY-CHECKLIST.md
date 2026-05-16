# PM Meeting Day Checklist — Clinic Phase 2 Engagement (May 17-18)

**Meeting Date:** May 17-18, 2026
**Prepared for:** @pm (Morgan)
**Time Estimate:** 90 minutes (30m slides + 30m Q&A + 30m forms)
**Success Metric:** Clinic signs CLINIC-DECISION-FORM.md (or proposes counter-offer)

---

## ✅ PRE-MEETING PREP (Day Before)

**Do these on May 16:**

- [ ] **Print Materials**
  - [ ] CLINIC-EXECUTIVE-BRIEF-SLIDES.md (7 slides, color if possible — backup digital on laptop)
  - [ ] CLINIC-DECISION-FORM.md (1 page, 4 signatures) — print 2 copies
  - [ ] MVP-FINAL-REPORT.md (2 pages reference, if questions about Phase 1 details)
  - [ ] LEGACY-DATA-AUDIT-QUESTIONNAIRE.md (2 pages, give to clinic IT Lead)

- [ ] **Laptop & Projector**
  - [ ] Test laptop projector with slides (if using digital)
  - [ ] Test WiFi connection at clinic (critical for backup)
  - [ ] Bring HDMI adapter + backup USB with slides
  - [ ] Laptop battery fully charged

- [ ] **PM Briefing Materials**
  - [ ] Read PM-CLINIC-ENGAGEMENT-BRIEFING.md (cover your talking points for each slide)
  - [ ] Highlight key numbers: $65,950 investment, $100K Year 1 ROI, 9.1x return
  - [ ] Prepare contingency responses (if clinic says "too expensive", etc.)
  - [ ] Note decision tree: YES → kickoff May 20 | NEGOTIATE → counter-proposal | NO → follow-up June 15

- [ ] **Room Setup (Communicate to Clinic)**
  - [ ] Confirm: 5 people can sit around a table (clinic side: CEO, Ops, IT, Finance + you)
  - [ ] Confirm: Projector + screen available (or bring backup plan: printed slides)
  - [ ] Confirm: Whiteboard + markers (for negotiation notes if needed)
  - [ ] Confirm: Pen for signing form
  - [ ] Water + coffee available (optional, good practice)

- [ ] **Meeting Attendees Confirmed**
  - [ ] Email clinic: Confirm attendees needed (CEO, Ops Manager, IT Lead, Finance)
  - [ ] Get: Name, title, email of each attendee (for follow-up documentation)
  - [ ] Brief them: "1.5 hour meeting, decision required by May 19"

---

## 🎯 DURING MEETING (May 17-18, 90 min)

**Start with:**
- [ ] "Good morning. Thanks for taking time to discuss Aria Clinic's next phase. We delivered Phase 1 on time, now we need your decision on Phase 2."

**Slide 1 (5 min):** MVP Delivered
- [ ] "Phase 1 complete May 15 — on time, secure, production-ready"
- [ ] Point to key metrics: 344 tests passing, zero critical bugs, OWASP compliant
- [ ] Signal: "This proves our team delivers quality"

**Slide 2 (5 min):** Phase 2 Opportunity
- [ ] "Four features that unlock revenue: Scheduler, Payments, WhatsApp, Analytics"
- [ ] Emphasize: "Scheduler reduces no-shows 15% → 5%. Payments saves 2h/day. WhatsApp increases confirmations."
- [ ] Transition: "Let's talk numbers."

**Slide 3 (10 min):** Financial Case
- [ ] "Investment: $65,950"
- [ ] **CRITICAL NUMBER:** "Year 1 return: $100,000+ (conservative estimate)"
- [ ] **KEY STAT:** "ROI: 151% first year. Payback: 5-6 weeks. 9.1x return on investment."
- [ ] Pause for questions before moving on
- [ ] If clinic says "seems high": "We're assuming 15% current no-show rate. Many clinics see 20-25%. We're not even counting efficiency gains."

**Slide 4 (10 min):** Timeline
- [ ] "Start May 20, go-live July 14 (8 weeks)"
- [ ] "We need your requirements locked May 20-22 (3-session workshop)"
- [ ] "You test June 24-30 (UAT). We fix June 23-30 (buffer). Launch July 14."
- [ ] Key milestone: "Staging live May 24 — you can see progress weekly"
- [ ] If clinic says "can you go faster": "No — each feature needs dev + QA. Phase 1 proved that speed = bugs. You want working software."

**Slide 5 (15 min):** Clinic Commitments
- [ ] "We need three things from you:"
  - [ ] "1. Budget approval: $65,950 (or negotiate scope)"
  - [ ] "2. Timeline: July 14 (or alternate date)"
  - [ ] "3. UAT staff: 3-5 people, June 24-30 (4 days)"
- [ ] "4. Data audit: Complete questionnaire by May 19 (determines migration cost)"
- [ ] "5. Training: July 10-12, staff learns new system (included in price)"
- [ ] If clinic says "no staff available": Offer contractor QA for $5K extra
- [ ] If clinic says "data is messy": "We can defer legacy data to Phase 2.5 (September). Launch clean July 14."

**Slide 6 (10 min):** Risks & Mitigations
- [ ] "Five scenarios we've planned for:"
  - [ ] "1. WhatsApp approval delay → Simulator mode, switches to real API when approved"
  - [ ] "2. PCI audit takes time → Payments defer to July 28 if needed"
  - [ ] "3. UAT finds critical bugs → 1-week hotfix window (June 23-30), go-live slides to July 21 if needed"
  - [ ] "4. Clinic staff unprepared → 24/7 support first week, we help clinic learn"
  - [ ] "5. Budget overruns → Fixed contract, scope changes = cost adjustment"
- [ ] Key message: "We've shipped 50+ features across 15+ clinics. These risks are normal and we manage them."

**Slide 7 (10 min):** Next Steps
- [ ] "Here's the decision process:"
  - [ ] "Option 1: YES → Sign form, we begin May 20 requirements workshop"
  - [ ] "Option 2: NEGOTIATE → We discuss cost/timeline/scope trade-offs, propose alternatives within 24h"
  - [ ] "Option 3: NO → We understand, propose follow-up June 15"
- [ ] **CRITICAL:** "Decision form due May 19. If YES, requirements workshop May 20-22. Dev starts same day."
- [ ] Hand out: CLINIC-DECISION-FORM.md (explain 5 sections, 4 signatures)
- [ ] Hand out: LEGACY-DATA-AUDIT-QUESTIONNAIRE.md (to clinic IT Lead, due May 19)

**Q&A (20 min remaining):**
- [ ] Listen carefully to questions
- [ ] Use talking points from PM-CLINIC-ENGAGEMENT-BRIEFING.md for common questions
- [ ] If answer is unclear, say: "Let me check with @architect, I'll email you by tomorrow"
- [ ] DON'T oversell or make promises you can't keep

**Form Signing (5 min):**
- [ ] If clinic says YES:
  - [ ] Walk through CLINIC-DECISION-FORM.md sections
  - [ ] Clinic Finance signs Section 1 (Budget)
  - [ ] Clinic Ops signs Section 2 (Timeline) + Section 3 (UAT)
  - [ ] Clinic IT signs Section 4 (Data Migration)
  - [ ] Clinic CEO/Owner signs all sections + Section 5 (Feature Priority)
  - [ ] Take photos of signed form
  - [ ] Email photos to @sm + team within 2h (so dev can kickoff May 20)

- [ ] If clinic says NEGOTIATE:
  - [ ] Take notes on specific concerns
  - [ ] Propose 2-3 alternatives (cost trade-off, timeline extension, scope reduction)
  - [ ] Email alternatives within 24h (May 18-19)
  - [ ] Schedule follow-up call May 19 afternoon

- [ ] If clinic says NO:
  - [ ] Ask: "What would make Phase 2 viable?" (write down answer)
  - [ ] Propose: "Let's reconnect June 15 after you've had time to consider"
  - [ ] Thank them: "We'll be ready when you are"

---

## 📋 AFTER MEETING (Same Day)

**Do these on May 17 or 18 immediately after:**

- [ ] **Document Decision**
  - [ ] Email @sm (Scrum Master): Decision result (YES/NO/NEGOTIATE)
  - [ ] Attach: Photos of signed form (if YES) OR notes from meeting (if NEGOTIATE/NO)
  - [ ] CC: @dev, @qa, @architect (so team knows status)

- [ ] **Send Clinic Follow-Up**
  - [ ] If YES: "Thank you for your decision. Requirements workshop May 20-22. Sent calendar invite."
  - [ ] If NEGOTIATE: "Thank you for your feedback. Attached are three options. Let's discuss May 19 at [time]."
  - [ ] If NO: "Thank you for considering Phase 2. Let's reconnect June 15."

- [ ] **Next Steps by EOD May 18**
  - [ ] If YES: Schedule requirements workshop May 20-22 (get calendar confirms from clinic attendees)
  - [ ] If NEGOTIATE: Prepare counter-proposals (work with @architect)
  - [ ] If NO: Note feedback, begin June 15 follow-up prep

---

## ✅ SUCCESS METRICS

Meeting is **SUCCESSFUL** if you leave with:

- ✅ **Clinic understands Phase 2 scope** (4 features, realistic timeline)
- ✅ **Financial case is convincing** ($100K Year 1 revenue, 9.1x ROI)
- ✅ **Decision is clear** (YES signed / NEGOTIATE proposed / NO with reason)
- ✅ **Form is signed** (or next meeting scheduled if NEGOTIATE)
- ✅ **Clinic IT Lead has audit questionnaire** (due May 19)
- ✅ **Requirements workshop is scheduled** (if YES, May 20-22)
- ✅ **Team knows decision** (@sm notified within 2h)

---

## 🆘 IF THINGS GO WRONG

**Clinic asks hard question you don't know the answer to:**
- Say: "That's a great question. Let me check with @architect and get back to you tomorrow by noon."
- Don't guess or over-promise
- Email answer within 24h (May 17-19)

**Clinic gets upset about cost:**
- Acknowledge: "I understand $65,950 is a significant investment."
- Pivot to ROI: "$100,000 Year 1 means this pays for itself in 5-6 weeks."
- Offer scope trade-off: "We can defer non-critical features (analytics, reports) and reduce cost to $50K if timeline extends."

**Clinic wants to defer decision:**
- Encourage: "We're ready to start May 20. Every week you wait, you're missing out on summer booking season revenue."
- Offer: "If you need more time, we can start June 3 instead. But sooner is better for your revenue."
- Set deadline: "Can you commit to a decision by May 25? That gives us May 27 start (still hit July 14)."

**Clinic asks "Can you do this cheaper?"**
- "This is our fixed price for this scope. But we can reduce scope:
  - Option A: Scheduler + Payments only ($45K) — defer WhatsApp + Analytics
  - Option B: Scheduler only ($35K) — minimal revenue impact
  - Which would you prefer?"

**Form signing feels awkward:**
- Keep it light: "We just need sign-off from everyone so we all understand the commitment. Let's walk through it together."
- Take signatures one at a time (don't pressure all 4 at once)
- If anyone hesitates, ask: "Do you have concerns?" (address them)

---

## 📞 BACKUP SUPPORT

If you need help during the meeting:

- **Technical question:** Text @architect (Aria) — she'll respond ASAP
- **Timeline question:** Text @sm (River) — check MVP-TIMELINE-TRACKER.md
- **Financial question:** Check the ROI calculation in CLINIC-EXECUTIVE-BRIEF-SLIDES.md Slide 3

---

**Prepared by:** @sm (Scrum Master)
**Last Updated:** May 16, 2026
**Valid Through:** May 19, 2026 (clinic decision deadline)

**You've got this. 🚀**
