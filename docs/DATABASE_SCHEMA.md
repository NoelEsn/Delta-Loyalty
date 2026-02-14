# DATABASE_SCHEMA.md – Delta Fraternité Data Model

## Overview

**Database**: SQLite (local dev) / PostgreSQL (production)
**ORM**: Prisma 5.9.1
**Schema Version**: 1.0 (migration: `20260210180801_init`)
**Total Tables**: 7 core tables + implicit junction tables

---

## Table: User

**Purpose**: Authentication and role management

| Field | Type | Constraints | Description |
|-------|------|-----------|-------------|
| `id` | String | PRIMARY KEY, cuid() | Unique user identifier (auto-generated) |
| `email` | String | UNIQUE, NOT NULL | Email address (used for login) |
| `password` | String | NOT NULL | Hashed password (bcryptjs, 10 rounds) |
| `role` | Enum | NOT NULL, default: `'member'` | `'admin'` or `'member'` |
| `createdAt` | DateTime | NOT NULL, auto | Account creation timestamp |
| `updatedAt` | DateTime | NOT NULL, auto | Last updated timestamp |

**Relationships**:
- `member`: 1-to-1 relation (optional, only if user.role = 'member')

**Indexes**:
- `UNIQUE(email)` – Fast login lookups

**Example Data**:
```json
{
  "id": "clin1abc2def3ghi",
  "email": "admin@delta-fraternite.com",
  "password": "$2a$10$...",
  "role": "admin",
  "createdAt": "2026-02-10T12:00:00Z",
  "updatedAt": "2026-02-10T12:00:00Z"
}
```

---

## Table: Member

**Purpose**: Loyalty member profiles and metrics

| Field | Type | Constraints | Description |
|-------|------|-----------|-------------|
| `id` | String | PRIMARY KEY, cuid() | Unique member identifier |
| `userId` | String | FOREIGN KEY → User.id, NOT NULL | Link to authentication user |
| `memberNumber` | String | UNIQUE, NOT NULL | Auto-generated: `DF-YYYY-XXXXX` |
| `totalSpent` | Float | default: 0 | Cumulative purchase amount ($) |
| `eventAttendances` | Int | default: 0 | Count of events attended |
| `referralsCompleted` | Int | default: 0 | Count of successful referrals |
| `refCode` | String | UNIQUE | Unique referral code (e.g., `REF-abc123def`) |
| `hasDiamond` | Boolean | default: false | Manual admin flag for Diamond Pin award |
| `createdAt` | DateTime | NOT NULL, auto | Member join date |
| `updatedAt` | DateTime | NOT NULL, auto | Last metric update |

**Computed Fields** (calculated in application, stored for performance):
- `clientLevel`: Derived from `totalSpent` (0–3)
- `eventLevel`: Derived from `eventAttendances` (0–3)
- `ambassadorLevel`: Derived from `referralsCompleted` (0–3)
- `totalPins`: Count of visible pins (0–9)
- `isDiamondEligible`: Boolean check (all three levels === 3)

**Relationships**:
- `user`: 1-to-1 back-reference to User
- `purchases`: 1-to-many (member bought items)
- `events`: Many-to-many via EventParticipation (member attended events)
- `referralsGiven`: 1-to-many (member referred others)
- `referralsReceived`: 1-to-many (member was referred by others)

**Indexes**:
- `UNIQUE(memberNumber)` – Fast member lookup
- `memberNumber` – Admin searches
- `refCode` – Referral code validation

**Example Data**:
```json
{
  "id": "clmember1xyz",
  "userId": "clin1abc2def3ghi",
  "memberNumber": "DF-2024-00001",
  "totalSpent": 2500.50,
  "eventAttendances": 6,
  "referralsCompleted": 2,
  "refCode": "REF-abc123def",
  "hasDiamond": false,
  "createdAt": "2026-02-01T10:30:00Z",
  "updatedAt": "2026-02-10T15:45:00Z"
}
```

---

## Table: Purchase

**Purpose**: Track spending transactions

| Field | Type | Constraints | Description |
|-------|------|-----------|-------------|
| `id` | String | PRIMARY KEY, cuid() | Unique purchase identifier |
| `memberId` | String | FOREIGN KEY → Member.id, NOT NULL | Which member made purchase |
| `amount` | Float | NOT NULL, > 0 | Purchase amount in $ |
| `description` | String | optional | Item/service description |
| `date` | DateTime | NOT NULL | When purchase occurred |
| `createdAt` | DateTime | NOT NULL, auto | Record creation time |

**Relationships**:
- `member`: Many-to-1 back-reference to Member

**DML Trigger** (on INSERT or UPDATE):
1. Fetch `Member` by `memberId`
2. Call `recalculateMember(memberId)` function:
   - Sum all `Member.purchases[].amount` → `totalSpent`
   - Recalculate `clientLevel` based on new `totalSpent`
   - Check `isDiamondEligible()` and flag admin if true
   - Update membership `updatedAt`
3. Update rankings (spending_rank)

**Indexes**:
- `memberId` – Fast member's purchase history
- `date DESC` – Recent purchases first

**Example Data**:
```json
{
  "id": "clpurch001abc",
  "memberId": "clmember1xyz",
  "amount": 150.00,
  "description": "Restaurant bill + 15% tip",
  "date": "2026-02-09T19:30:00Z",
  "createdAt": "2026-02-10T08:00:00Z"
}
```

---

## Table: Event

**Purpose**: Track events members can attend

| Field | Type | Constraints | Description |
|-------|------|-----------|-------------|
| `id` | String | PRIMARY KEY, cuid() | Unique event identifier |
| `title` | String | NOT NULL | Event name (e.g., "VIP Brunch") |
| `description` | String | optional | Event details |
| `date` | DateTime | NOT NULL | Event date/time |
| `location` | String | optional | Event location |
| `maxCapacity` | Int | optional | Max attendees (null = unlimited) |
| `qrCode` | String | optional | Encoded QR data (event ID) |
| `createdAt` | DateTime | NOT NULL, auto | When event created |
| `updatedAt` | DateTime | NOT NULL, auto | Last edit |

**Relationships**:
- `participations`: 1-to-many via EventParticipation (attendees)

**Indexes**:
- `date DESC` – Upcoming events first
- `qrCode` – Fast QR lookup for check-ins

**Example Data**:
```json
{
  "id": "clevent001xyz",
  "title": "VIP Brunch - Members Only",
  "description": "Exclusive brunch for platinum members",
  "date": "2026-02-15T11:00:00Z",
  "location": "Rooftop Restaurant, 5th Floor",
  "maxCapacity": 50,
  "qrCode": "clevent001xyz",
  "createdAt": "2026-02-08T14:00:00Z",
  "updatedAt": "2026-02-08T14:00:00Z"
}
```

---

## Table: EventParticipation

**Purpose**: Many-to-many join table (members attending events)

| Field | Type | Constraints | Description |
|-------|------|-----------|-------------|
| `id` | String | PRIMARY KEY, cuid() | Participation record ID |
| `memberId` | String | FOREIGN KEY → Member.id, NOT NULL | Which member |
| `eventId` | String | FOREIGN KEY → Event.id, NOT NULL | Which event |
| `checkedInAt` | DateTime | NOT NULL | When member checked in |
| `createdAt` | DateTime | NOT NULL, auto | Record creation |

**Unique Constraint**: `UNIQUE(memberId, eventId)` – Each member attends each event at most once

**Relationships**:
- `member`: Many-to-1 back-reference
- `event`: Many-to-1 back-reference

**DML Trigger** (on INSERT):
1. Fetch `Member` by `memberId`
2. Call `recalculateMember(memberId)`:
   - Count all `EventParticipation` records for member → `eventAttendances`
   - Recalculate `eventLevel` based on new count
   - Check `isDiamondEligible()` and flag admin if true
3. Update rankings (event_rank)

**Example Data**:
```json
{
  "id": "clpart001abc",
  "memberId": "clmember1xyz",
  "eventId": "clevent001xyz",
  "checkedInAt": "2026-02-15T11:15:00Z",
  "createdAt": "2026-02-15T11:15:00Z"
}
```

---

## Table: Referral

**Purpose**: Track member referrals

| Field | Type | Constraints | Description |
|-------|------|-----------|-------------|
| `id` | String | PRIMARY KEY, cuid() | Unique referral ID |
| `referrerId` | String | FOREIGN KEY → Member.id, NOT NULL | Member who referred |
| `referredId` | String | FOREIGN KEY → Member.id, optional | Member who was referred (after signup) |
| `referralCode` | String | NOT NULL | Referral code used (matches Member.refCode) |
| `status` | Enum | default: 'pending' | `'pending'` or `'completed'` |
| `verifiedAt` | DateTime | optional | When admin approved referral |
| `createdAt` | DateTime | NOT NULL, auto | Referral initiated |

**Relationships**:
- `referrer`: Many-to-1 to Member (who referred)
- `referred`: Many-to-1 to Member (who was referred, optional until signup)

**Indexes**:
- `referralCode` – Track unique codes
- `status` – List pending referrals for admin

**DML Trigger** (on UPDATE status='completed'):
1. Fetch `Member` by `referrerId`
2. Call `recalculateMember(referrerId)`:
   - Count all completed Referral records where this member is referrer → `referralsCompleted`
   - Recalculate `ambassadorLevel` based on new count
   - Check `isDiamondEligible()` and flag admin if true
3. Update rankings (referral_rank)

**Example Data**:
```json
{
  "id": "clref001abc",
  "referrerId": "clmember1xyz",
  "referredId": "clmember2abc",
  "referralCode": "REF-abc123def",
  "status": "completed",
  "verifiedAt": "2026-02-08T10:00:00Z",
  "createdAt": "2026-02-03T15:30:00Z"
}
```

---

## Table: GlobalSettings

**Purpose**: System-wide toggles and configuration

| Field | Type | Constraints | Description |
|-------|------|-----------|-------------|
| `id` | String | PRIMARY KEY, cuid() | (single row) |
| `hallOfFameEnabled` | Boolean | default: false | Enable/disable Hall of Fame display |
| `minSpamForSpendingPin1` | Float | default: 1000 | $ threshold for Level 1 |
| `minSpentForSpendingPin2` | Float | default: 5000 | $ threshold for Level 2 |
| `minSpentForSpendingPin3` | Float | default: 10000 | $ threshold for Level 3 |
| `minEventsForEventPin1` | Int | default: 5 | Events needed for Level 1 |
| `minEventsForEventPin2` | Int | default: 15 | Events needed for Level 2 |
| `minEventsForEventPin3` | Int | default: 30 | Events needed for Level 3 |
| `minReferralsForAmbPin1` | Int | default: 2 | Referrals needed for Level 1 |
| `minReferralsForAmbPin2` | Int | default: 5 | Referrals needed for Level 2 |
| `minReferralsForAmbPin3` | Int | default: 10 | Referrals needed for Level 3 |
| `updatedAt` | DateTime | NOT NULL, auto | Last config change |

**Rationale**: Thresholds stored in DB for easy admin adjustments without redeploying code

**Example Data**:
```json
{
  "id": "global-settings",
  "hallOfFameEnabled": true,
  "minSpentForSpendingPin1": 1000,
  "minSpentForSpendingPin2": 5000,
  "minEventsForEventPin1": 5,
  "minEventsForEventPin2": 15,
  "minReferralsForAmbPin1": 2,
  "minReferralsForAmbPin2": 5,
  "updatedAt": "2026-02-10T12:00:00Z"
}
```

---

## Computed Fields (Application Logic)

### **Member.clientLevel**

```typescript
function determineClientLevel(totalSpent: number, thresholds: GlobalSettings): number {
  if (totalSpent >= thresholds.minSpentForSpendingPin3) return 3;
  if (totalSpent >= thresholds.minSpentForSpendingPin2) return 2;
  if (totalSpent >= thresholds.minSpentForSpendingPin1) return 1;
  return 0;
}
```

**Thresholds**:
- Level 0: $0–$999
- Level 1: $1,000–$4,999
- Level 2: $5,000–$9,999
- Level 3: $10,000+

### **Member.eventLevel**

```typescript
function determineEventLevel(eventAttendances: number, thresholds: GlobalSettings): number {
  if (eventAttendances >= thresholds.minEventsForEventPin3) return 3;
  if (eventAttendances >= thresholds.minEventsForEventPin2) return 2;
  if (eventAttendances >= thresholds.minEventsForEventPin1) return 1;
  return 0;
}
```

**Thresholds**:
- Level 0: 0–4 events
- Level 1: 5–14 events
- Level 2: 15–29 events
- Level 3: 30+ events

### **Member.ambassadorLevel**

```typescript
function determineAmbassadorLevel(referralsCompleted: number, thresholds: GlobalSettings): number {
  if (referralsCompleted >= thresholds.minReferralsForAmbPin3) return 3;
  if (referralsCompleted >= thresholds.minReferralsForAmbPin2) return 2;
  if (referralsCompleted >= thresholds.minReferralsForAmbPin1) return 1;
  return 0;
}
```

**Thresholds**:
- Level 0: 0 referrals
- Level 1: 1–2 referrals
- Level 2: 2–4 referrals
- Level 3: 5+ referrals

### **Member.totalPins**

```typescript
function calculateTotalPins(levels: {clientLevel, eventLevel, ambassadorLevel}): number {
  return (levels.clientLevel > 0 ? 1 : 0) +
         (levels.eventLevel > 0 ? 1 : 0) +
         (levels.ambassadorLevel > 0 ? 1 : 0) +
         (levels.clientLevel > 1 ? 1 : 0) +
         (levels.eventLevel > 1 ? 1 : 0) +
         (levels.ambassadorLevel > 1 ? 1 : 0) +
         (levels.clientLevel > 2 ? 1 : 0) +
         (levels.eventLevel > 2 ? 1 : 0) +
         (levels.ambassadorLevel > 2 ? 1 : 0);
}
```

**Calculation**:
- 1 pin per level per axis = 3 × 3 = 9 pins max
- (clientLevel=3 + eventLevel=3 + ambassadorLevel=3) = 3 pins
- Example: clientLevel=1, eventLevel=0, ambassadorLevel=3 → 1 + 0 + 3 = 4 pins

### **Member.isDiamondEligible**

```typescript
function isDiamondEligible(levels: {clientLevel, eventLevel, ambassadorLevel}): boolean {
  return levels.clientLevel === 3 && 
         levels.eventLevel === 3 && 
         levels.ambassadorLevel === 3;
}
```

---

## Key Constraints & Rules

| Rule | Enforcement | Details |
|------|-------------|---------|
| Email uniqueness | DB constraint | Cannot create two users with same email |
| Member number uniqueness | DB constraint | Auto-generated, never duplicated |
| Referral code uniqueness | DB constraint | Each member has unique refCode |
| Single event per member | Unique constraint `(memberId, eventId)` | Can't check-in twice to same event |
| Password strength | Application | Bcryptjs minimum 8 chars recommended |
| Admin-only actions | API middleware | API checks session.role before DB writes |
| Cascade deletes | Prisma relation | Delete user → auto-delete member → auto-delete related records |

---

## Relationships Diagram (Text)

```
User (1) ──┐
           │ 1-to-1
           └──→ Member (1) ──┬─→ Purchase (many)
                             ├─→ EventParticipation (many)
                             │    └──→ Event (1)
                             ├─→ Referral (many) as referrer
                             └─→ Referral (many) as referred

Event (1) ──→ EventParticipation (many) ──→ Member (1)

GlobalSettings (1) – Singleton config for all members
```

---

## Indexes for Performance

```sql
-- User table
CREATE UNIQUE INDEX idx_user_email ON "User"("email");

-- Member table
CREATE UNIQUE INDEX idx_member_number ON "Member"("memberNumber");
CREATE UNIQUE INDEX idx_member_refcode ON "Member"("refCode");
CREATE INDEX idx_member_userid ON "Member"("userId");

-- Purchase table
CREATE INDEX idx_purchase_memberid ON "Purchase"("memberId");
CREATE INDEX idx_purchase_date ON "Purchase"("date" DESC);

-- Event table
CREATE INDEX idx_event_date ON "Event"("date" DESC);
CREATE INDEX idx_event_qrcode ON "Event"("qrCode");

-- EventParticipation table
CREATE UNIQUE INDEX idx_participation_unique ON "EventParticipation"("memberId", "eventId");
CREATE INDEX idx_participation_memberid ON "EventParticipation"("memberId");
CREATE INDEX idx_participation_eventid ON "EventParticipation"("eventId");

-- Referral table
CREATE INDEX idx_referral_referrerid ON "Referral"("referrerId");
CREATE INDEX idx_referral_referredid ON "Referral"("referredId");
CREATE INDEX idx_referral_code ON "Referral"("referralCode");
CREATE INDEX idx_referral_status ON "Referral"("status");
```

---

## Migration History

| Migration | Date | Description |
|-----------|------|-------------|
| `20260210180801_init` | 2026-02-10 | Initial schema: User, Member, Purchase, Event, EventParticipation, Referral, GlobalSettings |

---

## Data Types by Database

| Prisma Type | SQLite | PostgreSQL |
|------------|--------|------------|
| `String` with `@id` | TEXT PRIMARY KEY | UUID PRIMARY KEY |
| `String` | TEXT | VARCHAR(255) |
| `Int` | INTEGER | INTEGER |
| `Float` | REAL | DOUBLE PRECISION |
| `Boolean` | INTEGER (0/1) | BOOLEAN |
| `DateTime` | TEXT (ISO 8601) | TIMESTAMP |
| `Enum` | TEXT | ENUM type |

---

## Seeding Initial Data

On first deploy, `prisma/seed.ts` creates:

1. **Admin User**: `admin@delta-fraternite.com` / `admin123` (role: `admin`)
2. **Global Settings**: Default thresholds for all pin levels
3. (Optional) 2–3 demo members for testing

```bash
npx ts-node --esm prisma/seed.ts
```

---

## Backup & Recovery

### **SQLite (Development)**
```bash
# Backup
cp delta-fraternite.db delta-fraternite.db.backup

# Restore
cp delta-fraternite.db.backup delta-fraternite.db
```

### **PostgreSQL (Production)**
```bash
# Via Vercel dashboard: Automatic daily backups
# Manual export:
pg_dump postgres://user:pass@host/delta_fraternite > backup.sql

# Restore:
psql postgres://new-host/delta_fraternite < backup.sql
```

