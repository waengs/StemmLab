# STEMM Lab — Sprint Plan (Linear / Azure DevOps)

**Project:** StemmLab (offline-first STEM mobile lab)  
**Repo:** `StemmLab`  
**Tooling:** Linear Cycles + GitHub integration (commits linked by issue ID in message, e.g. `STEM-42`)

---

## How to set this up in Linear

1. **Create project** → *StemmLab*
2. **Settings → Cycles** → enable cycles, start day = Monday
3. **Create 3 cycles** with the dates below
4. **GitHub** → Linear integration → connect `waengs/StemmLab` (or your org repo)
5. For each issue, put the **issue ID in commit messages**:  
   `git commit -m "STEM-12: forum create post UI"`
6. Import issues manually from the tables below, or paste descriptions into Linear issues

**Suggested labels:** `sprint-1`, `sprint-2`, `sprint-3`, `feature`, `bug`, `infra`, `i18n`, `sync`, `sensor`, `activity`

---

## Sprint 1 — Foundation & Auth (Week 3–5)

| | |
|---|---|
| **Dates** | **16 Feb 2026 → 6 Mar 2026** |
| **Cycle name in Linear** | `Sprint 1 — Foundation` |

### Sprint goal

Deliver a navigable Expo app shell with authentication, team onboarding, bilingual UI foundation, and local state persistence so users can register, join a team, and use core navigation offline.

### Incremental demo (end of sprint)

- User can register / sign in / join team  
- Home grid + tab navigation works  
- EN/ID strings load; profanity filter on text entry  
- Zustand stores hydrate; SQLite schema started  
- Forum delete + login error handling  

### User stories

| ID | User story | Acceptance criteria | Owner |
|----|------------|---------------------|-------|
| S1-01 | As a **student**, I want to **sign up and sign in** so I can save my work. | Email/password auth; session persists across restarts; clear errors on failure. | Dev A |
| S1-02 | As a **team lead**, I want to **create or join a team** so we share one team ID. | Create team with grade level; join with code + password; team shown on home. | Dev A |
| S1-03 | As a **user**, I want **Indonesian and English UI** so I can use my preferred language. | `i18next` wired; device/stored language; core tabs translated. | Dev B |
| S1-04 | As a **teacher**, I want **inappropriate text blocked** so forum/inputs stay safe. | Profanity check on submit; user sees warning alert. | Dev B |
| S1-05 | As a **developer**, I want **shared UI components and navigation** so features ship faster. | Button, Input, Card, tabs, home quick actions, settings entry. | Dev C |
| S1-06 | As a **user**, I want **data stored on device** so the app works without internet. | Zustand stores; SQLite + Firebase wiring started; forum post delete local. | Dev C |

### Task decomposition

| Task | Story | Estimate | Status (from git) |
|------|-------|----------|-------------------|
| Initialize Expo + React Native project | S1-05 | 3h | Done |
| Setup Expo Router + tab layout | S1-05 | 4h | Done |
| Design system (`src/theme`, UI primitives) | S1-05 | 6h | Done |
| Firebase Auth integration | S1-01 | 5h | Done |
| Team create/join flows | S1-02 | 6h | Done |
| i18n EN/ID dictionaries | S1-03 | 4h | Done |
| Profanity utility + alerts | S1-04 | 2h | Done |
| Zustand store scaffold | S1-06 | 4h | Done |
| SQLite schema + Firebase bridge | S1-06 | 8h | Done |
| Home grid + navbar polish | S1-05 | 3h | Done |
| Forum post delete + login popups | S1-01 | 3h | Done |

### GitHub commits (Sprint 1) — link in Linear issue descriptions

| Date | Commit | Message | Suggested Linear link |
|------|--------|---------|------------------------|
| 2026-02-23 | `887c2f9` | initialize react UI design | S1-05 |
| 2026-02-24 | `a2b51a9` | setup-expo | S1-05 |
| 2026-02-25 | `6705c30` | team-registration | S1-02 |
| 2026-02-28 | `c96d823` | translation | S1-03 |
| 2026-03-01 | `ba4ddf2` | foul-filter | S1-04 |
| 2026-03-02 | `3b6e12a` | ui-components | S1-05 |
| 2026-03-03 | `ace1f9b` | home-grid + navbar edits | S1-05 |
| 2026-03-04 | `3c9de39` | data-store w/ Zustand | S1-06 |
| 2026-03-05 | `b42e1f6` | firebase-sqlite | S1-06 |
| 2026-03-06 | `b0e4b1c` | forum-post-delete and login-popups | S1-01 |

---

## Sprint 2 — Offline sync & core activities (Week 6–8)

| | |
|---|---|
| **Dates** | **7 Mar 2026 → 24 Apr 2026** |
| **Cycle name in Linear** | `Sprint 2 — Sync & Activities 1–4` |

### Sprint goal

Ship offline-first sync (SQLite ↔ Firestore), a working community forum, and the first engineering activities (Parachute, Hand Fan, Sound Pollution, Earthquake) with experiment UI and data capture.

### Incremental demo (end of sprint)

- Forum: create post, thread detail, attachments path started  
- Offline cache + Firebase sync on reconnect  
- Parachute + Hand Fan experiments with slow-mo  
- Sound Pollution map UI + Earthquake experiment UI  
- Activity results saved locally and synced when online  

### User stories

| ID | User story | Acceptance criteria | Owner |
|----|------------|---------------------|-------|
| S2-01 | As a **student**, I want to **post and read forum threads** so we can collaborate. | Create post; view list; open thread; basic moderation (delete own). | Dev A |
| S2-02 | As a **user in the field**, I want **offline mode** so I can work without signal. | SQLite writes immediately; queue sync; pull shared data when online. | Dev B |
| S2-03 | As a **physics student**, I want the **Parachute Drop** activity so I can record drops and analysis. | Multi-tab form; trials; slow-mo capture; submit result. | Dev C |
| S2-04 | As an **engineering student**, I want the **Hand Fan** activity so I can compare fan designs. | Designs, trials, results table; integrates with shared activity shell. | Dev C |
| S2-05 | As an **environment student**, I want **Sound Pollution** mapping so I can log dB at locations. | Map recordings; min trials; predictions tab; results view. | Dev A |
| S2-06 | As a **student**, I want the **Earthquake structure** activity so I can test designs. | Timer, intensity presets, trial logging, results. | Dev B |
| S2-07 | As a **developer**, I want **sensor/slow-mo logs** tied to activities. | Slow-mo log storage; sensor log repository; sync queue entries. | Dev B |

### Task decomposition

| Task | Story | Estimate | Status |
|------|-------|----------|--------|
| Main forum UI shell | S2-01 | 5h | Done |
| Create post + composer | S2-01 | 6h | Done |
| Thread detail view | S2-01 | 4h | Done |
| Offline caching layer | S2-02 | 8h | Done |
| Firebase bi-directional sync service | S2-02 | 10h | Done |
| Parachute form + slow-mo camera | S2-03 | 12h | Done |
| Hand fan implementation | S2-04 | 10h | Done |
| Slow-mo logs + merge act1and3 | S2-07 | 6h | Done |
| Sound pollution UI | S2-05 | 10h | Done |
| Dependency fixes (Expo/RN) | infra | 3h | Done |
| Earthquake experiment UI | S2-06 | 10h | Done |

### GitHub commits (Sprint 2)

| Date | Commit | Message | Suggested Linear link |
|------|--------|---------|------------------------|
| 2026-03-10 | `c030ec9` | main ui | S2-01 |
| 2026-03-10 | `ba9feac` | create post | S2-01 |
| 2026-03-10 | `539b14d` | thread detail | S2-01 |
| 2026-03-11 | `8d3d1b5` | offline caching | S2-02 |
| 2026-03-11 | `c52a66b` | firebase sync | S2-02 |
| 2026-03-12 | `51d4679` | parachute and slowmo camera | S2-03 |
| 2026-03-16 | `1ca4b0c` | hand-fan implementation with parachute changes | S2-04 |
| 2026-03-17 | `4299ead` | slow-mo logs | S2-07 |
| 2026-03-17 | `f915c89` | Merge branch 'act1and3' into base | S2-03/S2-04 |
| 2026-03-18 | `7640752` | sound pollution ui | S2-05 |
| 2026-03-18 | `9e677d9` | fixed dependencies | infra |
| 2026-03-19 | `62b22bb` | earthquake ui | S2-06 |

*Note: No commits between 2026-03-19 and 2026-05-27 — document as planning/QA/refinement period in Linear (design reviews, testing Sprint 2 demo, assignment work).*

---

## Sprint 3 — Sensors, health activities, production (Week 9–11)

| | |
|---|---|
| **Dates** | **25 Apr 2026 → 10 Jun 2026** |
| **Cycle name in Linear** | `Sprint 3 — Sensors, Scale & Release` |

### Sprint goal

Complete remaining STEM activities and sensor hub, add grade-band segmentation and leaderboard, implement production features (parallel load, WorkManager sync, notifications, AdMob interstitials), Indonesian localization pass, and ship testable Android APK.

### Incremental demo (end of sprint)

- All 7 activities + post-quiz flows localized (EN/ID)  
- Sensors: sound meter, vibration, GPS, reaction test, battery  
- Leaderboard by team/activity; forum media attachments  
- Parallel feed load; background sync registered  
- Push token + in-app notifications; interstitial after activity completion  
- EAS preview APK build  

### User stories

| ID | User story | Acceptance criteria | Owner |
|----|------------|---------------------|-------|
| S3-01 | As a **health student**, I want **Human Performance, Breathing, Reaction Board** activities. | Full experiment → quiz → discussion for each. | Dev A |
| S3-02 | As a **user**, I want a **sensor toolkit** so I can log standalone measurements. | Sensors tab; log book; share to forum. | Dev B |
| S3-03 | As a **student**, I want **grade-appropriate content** (primary vs lower HS). | Grade band filter on forum/activities/quiz copy. | Dev C |
| S3-04 | As a **competitive team**, I want a **leaderboard** so we see rankings. | Per-activity boards; team detail; scores from results. | Dev A |
| S3-05 | As a **forum user**, I want **attachments and translation** on posts. | Images/video upload; ID forum strings; foul filter. | Dev B |
| S3-06 | As a **user**, I want **fast refresh** when opening forum/home. | Parallel load: posts + profile + notifications. | Dev C |
| S3-07 | As a **field user**, I want **background sync** when app is closed. | WorkManager task registered; sync queue drains offline writes. | Dev C |
| S3-08 | As a **user**, I want **reply notifications** when someone responds. | Notification docs in Firestore; local alert on sync; push token saved. | Dev B |
| S3-09 | As a **product owner**, I want **monetization via interstitial ads** after activities. | AdMob app ID + interstitial unit; ad after quiz complete. | Dev A |
| S3-10 | As a **tester**, I want a **release APK** with env config. | EAS preview build; Firebase/Cloudinary/AdMob env documented. | Dev C |

### Task decomposition

| Task | Story | Estimate | Status |
|------|-------|----------|--------|
| Human performance / stretch-speed activity | S3-01 | 12h | Done |
| Vibration + GPS sensor panels | S3-02 | 8h | Done |
| Breathing pace trainer | S3-01 | 10h | Done |
| Reaction board UI + experiment | S3-01 | 10h | Done |
| Forum translate + foul filter polish | S3-05 | 4h | Done |
| Leaderboard tabs + team detail | S3-04 | 8h | Done |
| Forum media attachments (Cloudinary) | S3-05 | 8h | Done |
| Grade band segmentation | S3-03 | 6h | Done |
| Sensor log + hardware chips cleanup | S3-02 | 6h | Done |
| Sound meter + reaction test sensor | S3-02 | 8h | Done |
| Logout fix + primary/lower HS forum filter | S3-03 | 4h | Done |
| Parallel feed load service | S3-06 | 5h | Done |
| Background sync (expo-background-fetch) | S3-07 | 6h | Done |
| Notification service + push registration | S3-08 | 8h | Done |
| First EAS Android build | S3-10 | 6h | Done |
| AdMob interstitial after activity quiz | S3-09 | 4h | Done |
| Full activity i18n pass (EN/ID) | S3-03 | 12h | Done |
| Dashboard completed-activities modal | polish | 3h | Done |
| Jest tests + build v2 | S3-10 | 8h | Done |

### GitHub commits (Sprint 3)

| Date | Commit | Message | Suggested Linear link |
|------|--------|---------|------------------------|
| 2026-05-27 | `478a739` | activity 5 stretch-speed | S3-01 |
| 2026-05-27 | `87bc48b` | vibration-sensor | S3-02 |
| 2026-05-28 | `283558b` | gps-tagging | S3-02 |
| 2026-05-29 | `a57eb6d` | breathing-trainer | S3-01 |
| 2026-05-29 | `147e7f4` | fixed merge conflicts | infra |
| 2026-05-29 | `88e79a5` | Merge branch 'act5and7' into base | S3-01 |
| 2026-05-29 | `a8c013a` | forum-translate | S3-05 |
| 2026-05-29 | `998b4ad` | forum-foul-filter | S3-05 |
| 2026-05-30 | `246c99d` | reaction-board ui | S3-01 |
| 2026-05-30 | `a3f782b` | leaderboard | S3-04 |
| 2026-05-30 | `forum-attachment` | `3bdb414` | S3-05 |
| 2026-06-01 | `c85c3b1` | feat(sensors): hardware chips, reaction test, and tab cleanup | S3-02 |
| 2026-06-02 | `f1ea436` | fixed logout, implemented segmentation of primary and lower highschool | S3-03 |
| 2026-06-02 | `99c37f7` | sensor log and leaderboard | S3-02/S3-04 |
| 2026-06-02 | `10c509e` | added sound meter | S3-02 |
| 2026-06-03 | `cb799e9` | added reaction test sensor | S3-02 |
| 2026-06-04 | `dcb9323` | notifications and first build | S3-08/S3-10 |
| 2026-06-05 | `1cb6b6f` | bug fixes, added ads | S3-09 |
| 2026-06-06 | `600b9a5` | build version 2 and fix UI styling | S3-10 |
| 2026-06-09 | `bb55e09` | added jest-tests | S3-10 |
| 2026-06-09 | `f8d4059` | testing-phase2 | S3-10 |

---

## Sprint ceremony checklist (for assessors)

| Requirement | Evidence in Linear | Evidence in GitHub |
|-------------|-------------------|-------------------|
| Sprint goals | Cycle description + goal issue per sprint | Milestone or tag `sprint-1`, `sprint-2`, `sprint-3` |
| User stories | Issues type *Story* with acceptance criteria in description | Issue ID in PR title / commit message |
| Task decomposition | Sub-issues or checklist under each story | One or more commits per task |
| Incremental delivery | Demo notes attached to cycle review issue | Commits clustered by sprint dates (tables above) |
| Regular commits | — | 10 + 12 + 21 commits across sprints; timestamps match cycle dates |

---

## Linear issue template (copy per story)

```markdown
## User story
As a [role], I want [goal], so that [benefit].

## Acceptance criteria
- [ ] ...
- [ ] ...

## Tasks
- [ ] Task A (Xh) — @assignee
- [ ] Task B (Xh) — @assignee

## GitHub commits
- `abc1234` (2026-MM-DD) — message

## Sprint
Sprint N — [dates]
```

---

## Team allocation summary

| Member | Sprint 1 focus | Sprint 2 focus | Sprint 3 focus |
|--------|----------------|----------------|----------------|
| Dev A | Auth, teams, forum delete | Forum, Sound Pollution | Health activities, leaderboard, ads |
| Dev B | i18n, profanity | Offline sync, Earthquake | Sensors, forum media, notifications |
| Dev C | UI shell, Zustand/SQLite | Parachute, Hand Fan | Grade bands, parallel load, APK release |

*Replace Dev A/B/C with your real team names in Linear assignees.*

---

## Quick Linear setup (5 minutes)

1. **Cycles → New cycle** × 3 with exact end dates above.  
2. **New issue** per row in user story tables → set **Cycle** + **Label** `sprint-N`.  
3. **Sub-issues** from task tables → link to parent story.  
4. **Integrations → GitHub** → enable autolink `STEM-` or your team prefix.  
5. Paste commit SHAs from tables into issue **Links → Commit** (or reference in comments).

For **Azure DevOps** instead: use **Sprints** with same dates; **Product Backlog Item** = user story; **Task** = task rows; **Development** tab links commits by `#workitem ID`.
