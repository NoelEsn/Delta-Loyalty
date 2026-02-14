# PROJECT_SPEC.md – Delta Fraternité Loyalty System V1

## Product Vision

**Delta Fraternité** is a gamified membership loyalty system that rewards members for three types of engagement: spending, event participation, and referrals. Members collect a visual "pin collection" as they progress through each engagement axis, creating a fun, achievement-driven experience that encourages repeat participation.

The system is designed for a leisure/hospitality business or membership club with ~2000 members seeking to increase engagement and repeat spending without external API integrations (fully manual operations).

---

## Core Mechanics – The Pin System

### 10-Pin Collection Model

Members unlock **9 publicly visible pins** across three engagement axes:

#### **Axis 1: Spending** 💰
- **Level 0 → 1**: Silver Spending Pin (0–$999)
- **Level 1 → 2**: Gold Spending Pin ($1,000–$4,999)
- **Level 2 → 3**: Platinum Spending Pin ($5,000+)
- **Metric**: `totalSpent` (cumulative purchase amount)

#### **Axis 2: Events** 🎯
- **Level 0 → 1**: Silver Event Pin (0–4 events)
- **Level 1 → 2**: Gold Event Pin (5–14 events)
- **Level 2 → 3**: Platinum Event Pin (15+ events)
- **Metric**: `eventAttendances` (cumulative event check-ins)

#### **Axis 3: Referrals** 🌟
- **Level 0 → 1**: Silver Ambassador Pin (0–1 referral)
- **Level 1 → 2**: Gold Ambassador Pin (2–4 referrals)
- **Level 2 → 3**: Platinum Ambassador Pin (5+ referrals)
- **Metric**: `referralsCompleted` (successful referrals converted to members)

### **Hidden 10th Pin: The Diamond Pin** 💎

The **Diamond Pin** is automatically earned when a member unlocks **all 9 pins** (Level 3 on all three axes simultaneously).

- **Unlock Condition**: `clientLevel === 3 && eventLevel === 3 && ambassadorLevel === 3`
- **Visibility**: Marked as "SECRET" in system – members don't know it exists until they unlock it
- **Validation**: Admin must manually verify eligibility before awarding (no auto-grant in V1)
- **Hall of Fame**: First Diamond member(s) displayed in Hall of Fame

### **Total Pin Count**
- **0–6**: Actively collecting (some axes unlocked)
- **7–8**: Elite status (two axes maxed)
- **9**: Master collector (all public pins)
- **10**: Diamond status (hidden pin unlocked – highest achievement)

---

## User Roles & Permissions

### **Admin Role**
**Capabilities:**
- Create/edit/delete member accounts
- Record purchases and verify spending
- Create events and manage check-in with QR codes
- Award referral pin levels manually
- Recalculate member levels on demand
- View analytics dashboard (member count, revenue, events, diamond count)
- Manage Hall of Fame (activate/deactivate, add to featured list)
- View all member details and pin progress
- View rankings by axis

**Access:** `/admin/login` → `/admin/dashboard`

### **Member Role**
**Capabilities:**
- View personal dashboard with pin collection progress
- See current level on each axis
- View progress bars showing distance to next level
- Join events (via QR code or list)
- See personal referral code (generated on signup)
- View personal rankings vs. other members
- Access Hall of Fame (if activated)

**Access:** `/login` → `/member/dashboard`

### **Guest (Unauthenticated)**
- View landing page with feature overview
- Cannot access any protected routes

---

## Functional Scope – V1

### **Core Features (MVP)**

✅ **Authentication**
- Member signup with email/password (bcryptjs hashing)
- Admin login with email/password
- Session-based auth (7-day cookie expiration)
- Auto-generate member numbers: `DF-YYYY-XXXXX` format

✅ **Member Profiles**
- Store: email, name, member number, join date
- Track: total spending, event count, referral count
- Computed fields: pin levels (0–3 per axis), total pin count, diamond eligibility

✅ **Pin Calculations**
- Real-time level determination based on metrics
- Automatic recalculation after any transaction
- Diamond detection and Hall of Fame eligibility check

✅ **Admin Dashboard**
- KPI cards: member count, diamond count, revenue, events this month
- Member management (create, view, edit)
- Purchase tracking (amount, date, auto-recalculate member)
- Event management (create, list, check-in via QR)
- Referral approval (admin marks referral as completed)

✅ **Member Dashboard**
- Personal stats: member number, pins collected, levels
- Progress bars for each axis (showing % to next level)
- Rankings (by spending, events, referrals)
- Hall of Fame (if activated)

✅ **Referral System**
- Generate unique referral code for each member
- Track incoming referrals (who referred whom)
- Manual admin approval of completed referrals
- Automatically increment referral count on approval

✅ **Event Management**
- Create event with date/time/location
- Generate QR code for event
- Member check-in via QR (linked to event)
- Event count updated; levels recalculated per member

✅ **Hall of Fame** (Conditional)
- Optional feature: activate/deactivate via global settings
- Display members with 10+ pins (once Diamond Pin logic implemented)
- Show top members by axis (top 10 Spenders, Event lovers, Ambassadors)
- Display Diamond members prominently

### **Out of Scope (V1)**

❌ Email notifications (no external email service)
❌ Mobile app (web-responsive only)
❌ Payment gateway integration (manual purchase entry)
❌ Advanced analytics/reporting
❌ Photo uploads or member customization
❌ Tiers or achievement badges beyond pins
❌ Leaderboard real-time updates
❌ Two-factor authentication

---

## Ranking Logic

### **Ranking Calculation**
Members are ranked within three separate axes:

1. **Spending Ranking**
   - Sort all members by `totalSpent` (descending)
   - Assign rank 1, 2, 3... to each member
   - Update on every purchase creation

2. **Events Ranking**
   - Sort all members by `eventAttendances` (descending)
   - Assign rank 1, 2, 3... to each member
   - Update on every event check-in

3. **Referrals Ranking**
   - Sort all members by `referralsCompleted` (descending)
   - Assign rank 1, 2, 3... to each member
   - Update on every referral approval

### **Tie-Breaking**
- Members with same metric value tied for same rank
- Next rank skips (e.g., 3 people tied for #1, next person is #4)

### **Hall of Fame Leaderboards**
- Top 10 by Spending
- Top 10 by Event Attendance
- Top 10 by Referrals
- All Diamond Pin holders (separate "Elite" section)

---

## Diamond Logic (Hidden Achievement)

### **Unlock Condition**
```
isDiamondEligible = (clientLevel === 3) && (eventLevel === 3) && (ambassadorLevel === 3)
```

### **Triggers**
- After any metric update (purchase, event, referral), system checks eligibility
- If newly eligible and not already awarded: flag member in admin UI
- Admin manually reviews and awards Diamond Pin

### **Admin Manual Award**
- Reason: Confirmation that member's achievement is legitimate
- Action: `/api/admin/members/{memberId}/award-diamond`
- Effect: Sets `hasDiamond = true`, adds to Hall of Fame

### **Visibility**
- Internal: Yes (stored in DB, computed from levels)
- Member-facing: No notification until awarded
- Once awarded: Displayed on profile + Hall of Fame

### **Edge Case: Regression**
- If member's spending drops below $5000 (unlikely but possible): `clientLevel` reverts to 2
- Diamond eligibility is checked: member loses Diamond status
- Admin can manually re-award if warranted

---

## Hall of Fame Logic

### **Activation**
- Feature controlled by `GlobalSettings.hallOfFameEnabled` (boolean)
- Default: `false` (disabled in V1, can be enabled by admin)
- Accessible at `/member/hall-of-fame` (or section on dashboard)

### **Display**
1. **Elite Section**: All Diamond Pin holders
2. **Axis Leaderboards**:
   - Top 10 by Spending
   - Top 10 by Event Attendance
   - Top 10 by Referrals
3. **Member Card Display**: Name, member number, count/amount by axis, pin icons

### **Updates**
- Real-time after each action (recalculated on demand)
- Or batch-updated nightly (depending on implementation)

### **Privacy**
- Only member number, name, and achievement metrics displayed
- No email, no profile photos, minimal personal data

---

## Non-Goals (Explicitly Out)

- **Seasonal campaigns**: No time-based pin resets or limited editions
- **Social features**: No profiles, no messaging, no groups
- **Mobile app**: Web responsive design only
- **Blockchain/NFT**: Traditional database approach
- **API for external systems**: Fully self-contained
- **Third-party auth**: Email/password only
- **Real-time collab**: No concurrent editing or live updates needed
- **Accessibility perfection**: WCAG AA target, not AAA
- **Multi-language**: English only in V1
- **Subscription tiers**: All members in single tier

---

## Terminology

| Term | Definition |
|------|-----------|
| **Level** | Progress indicator 0–3 per axis (0=no pins, 1–3=progressively higher pins) |
| **Pin** | Visual achievements earned by reaching level milestones |
| **Axis** | One of three engagement dimensions: Spending, Events, Referrals |
| **Member Number** | Unique identifier: `DF-YYYY-XXXXX` (e.g., `DF-2024-00001`) |
| **Referral Code** | Unique code shared by member to bring new members (e.g., `REF-abc123def`) |
| **QR Check-in** | Member scans QR code at event to register attendance |
| **Diamond Pin** | Secret 10th pin earned for unlocking all 9 pins |
| **Hall of Fame** | Optional leaderboard display of top members and Diamond holders |
| **Computed Field** | Database field auto-calculated from other values (e.g., `totalPins`) |

---

## Success Metrics (Post-Launch Goals)

- Member engagement increase: 30% more repeat visits
- Average pin collection: 6+ pins per active member
- Diamond achievement rate: 5–10% of members
- Hall of Fame activation: Enable after 20–30 members reach Diamond status

---

## Version Info

- **Version**: 1.0.0
- **Status**: MVP – Core features only
- **Created**: 2026-02-10
- **Target Deployment**: Local testing → Vercel production

