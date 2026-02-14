# ARCHITECTURE.md – Delta Fraternité Technical Stack & Design

## Technology Stack

### **Frontend Framework**
- **Next.js 14.2.35** (App Router)
- **React 18.3.1**
- **TypeScript**
- **Tailwind CSS 3.4.1** (dark theme)

### **Backend**
- **Next.js API Routes** (no separate backend server)
- **Node.js v25.6.1**

### **Database**
- **SQLite** (local development)
- **Prisma ORM 5.9.1** (with auto-migrations)
- **Database file**: `./delta-fraternite.db`

### **Authentication**
- **bcryptjs 2.4.3** (password hashing)
- **Session-based auth** (HTTP-only cookies)
- **Next.js cookies API** (secure cookie management)

### **UI & Analytics**
- **QR Code**: `qrcode.react 3.1.0` (QR generation for events)
- **Styling**: Tailwind CSS with custom dark theme colors

### **Development Tools**
- **npm v11.9.0** (package management)
- **next/dev** (built-in dev server with hot reload)
- **Prisma Studio** (optional: `npx prisma studio`)

---

## Folder Structure

```
/Users/noeldejimbei/Desktop/Projet-Fidélite_DELTA/
├── app/                                 # Next.js App Router
│   ├── globals.css                      # Global styles + Tailwind setup
│   ├── layout.tsx                       # Root layout (metadata, fonts)
│   ├── page.tsx                         # Home page (landing)
│   │
│   ├── api/                             # API routes
│   │   ├── auth/
│   │   │   ├── login/route.ts           # POST: authenticate user, create session
│   │   │   └── logout/route.ts          # POST: destroy session
│   │   ├── member/
│   │   │   └── metrics/route.ts         # GET: fetch member's pin data
│   │   ├── admin/
│   │   │   ├── stats/route.ts           # GET: dashboard KPIs
│   │   │   ├── members/route.ts         # POST/GET: create/list members
│   │   │   ├── purchases/route.ts       # POST: record purchase
│   │   │   ├── events/route.ts          # POST/GET: create/list events
│   │   │   └── referrals/route.ts       # POST: approve referral
│   │   └── health/route.ts              # GET: health check (for monitoring)
│   │
│   ├── login/                           # Member login page
│   │   └── page.tsx                     # Login form → /member/dashboard
│   │
│   ├── member/
│   │   ├── dashboard/                   # Member dashboard
│   │   │   └── page.tsx                 # Display pins, progress, rankings
│   │   └── [memberId]/                  # Member profile (future)
│   │
│   ├── admin/
│   │   ├── login/                       # Admin login page
│   │   │   └── page.tsx                 # Login form → /admin/dashboard
│   │   ├── dashboard/                   # Admin hub
│   │   │   └── page.tsx                 # KPIs, quick actions
│   │   ├── members/                     # Member management
│   │   │   ├── page.tsx                 # List & create members
│   │   │   └── [memberId]/page.tsx      # Edit single member
│   │   ├── purchases/                   # Purchase tracking
│   │   │   ├── page.tsx                 # List/create purchases
│   │   │   └── [purchaseId]/page.tsx    # Edit purchase (future)
│   │   ├── events/                      # Event management
│   │   │   ├── page.tsx                 # List/create events
│   │   │   └── [eventId]/page.tsx       # Event detail & check-in
│   │   └── hall-of-fame/                # Hall of Fame settings
│   │       └── page.tsx                 # Enable/configure HOF
│   │
│   └── [other]/                         # Catch-all 404 pages
│
├── lib/                                 # Shared utilities
│   ├── db.ts                            # Prisma client singleton + helpers
│   ├── pinEngine.ts                     # Pin calculation logic
│   └── ranking.ts                       # Ranking calculation (stub)
│
├── prisma/
│   ├── schema.prisma                    # Data model (7 tables)
│   ├── seed.ts                          # Database seeding script
│   └── migrations/
│       ├── migration_lock.toml
│       └── 20260210180801_init/
│           └── migration.sql            # Initial SQLite schema
│
├── public/                              # Static assets (future)
│
├── .env                                 # Environment variables (git-ignored)
├── .env.local                           # Local overrides
├── .gitignore                           # Git exclusions
├── next.config.js                       # Next.js configuration
├── tailwind.config.ts                   # Tailwind theme config
├── tsconfig.json                        # TypeScript config
├── package.json                         # Dependencies & scripts
├── package-lock.json                    # Locked dependency versions
├── postcss.config.js                    # PostCSS setup for Tailwind
└── next-env.d.ts                        # Auto-generated Next.js types
```

---

## Application Architecture

### **Layered Structure**

```
┌─────────────────────────────────────┐
│        Frontend Pages (.tsx)         │ User views: /login, /dashboard, etc.
├─────────────────────────────────────┤
│     API Routes (/api/...) (RSC)      │ Business logic layer
├─────────────────────────────────────┤
│    Lib Utilities (pinEngine, db)     │ Reusable functions
├─────────────────────────────────────┤
│      Prisma ORM + Client             │ Data access layer
├─────────────────────────────────────┤
│      SQLite Database                 │ Persistent storage
└─────────────────────────────────────┘
```

### **Three Core Modules**

#### **1. Auth Module**
- **Entry Points**: `/login`, `/admin/login`
- **API**: `POST /api/auth/login`, `POST /api/auth/logout`
- **Flow**:
  1. User POST email + password to `/api/auth/login`
  2. Validate credentials against `User` table
  3. Verify password hash with bcryptjs
  4. Create session cookie (7-day expiration)
  5. Return `{success: true, role: 'admin' | 'member'}`
- **Session Data** (stored in encrypted cookie):
  ```json
  {
    "userId": "uuid",
    "email": "user@example.com",
    "role": "admin" | "member",
    "memberId": "uuid-or-null",
    "memberNumber": "DF-2024-00001"
  }
  ```

#### **2. Member Dashboard Module**
- **Entry Point**: `/member/dashboard`
- **Prerequisites**: Valid session with `role: 'member'`
- **API**: `GET /api/member/metrics`
- **Flow**:
  1. Fetch session cookie
  2. Call `GET /api/member/metrics` with session `memberId`
  3. Fetch member from DB with relationships
  4. Call `pinEngine.determinePinLevels(metrics)` → `{clientLevel, eventLevel, ambassadorLevel}`
  5. Calculate `totalPins` and `isDiamondEligible`
  6. Render dashboard with pins, progress bars, rankings
- **Data Displayed**:
  - Member number, total pins collected
  - Progress per axis (bar graphs)
  - Personal rankings vs. other members
  - Hall of Fame (if enabled)

#### **3. Admin Dashboard Module**
- **Entry Point**: `/admin/dashboard`
- **Prerequisites**: Valid session with `role: 'admin'`
- **API**: `GET /api/admin/stats`
- **Flow**:
  1. Fetch all members
  2. Calculate stats: count, revenue, events this month
  3. Detect eligible Diamond members
  4. Render KPI cards
  5. Provide quick-action buttons to sub-modules
- **Sub-modules**:
  - **Members**: Create, list, edit members
  - **Purchases**: Record spending (triggers member recalculation)
  - **Events**: Create events, check-in QR code (triggers member recalculation)
  - **Referrals**: Approve referrals (triggers member recalculation)

---

## State Management Approach

**No Redux/Zustand – All state server-side:**

1. **Session State**: HTTP-only cookie (server read, client cannot access)
2. **Database State**: Single source of truth in SQLite
3. **UI State**: React `useState` in individual components (form inputs, loading spinners)
4. **Derived State**: Calculated on-demand (pin levels, rankings)

**Why?** 
- Small team, low complexity
- All data lives in DB – no sync issues
- API routes fetch fresh data per request
- Reduces bundle size and client-side bugs

---

## Authentication Strategy

### **Session-Based (Not JWT)**

**Rationale**: 
- Simpler logout (just delete cookie)
- Server controls expiration
- Better for password-reset flows

**How it Works**:

```
1. User submits email + password to /api/auth/login
2. API hashes password, compares with DB
3. If valid:
   - Create session object: {userId, email, role, memberId, memberNumber}
   - Encrypt & set as HTTP-only secure cookie
   - Return {success: true, role: ...}
   - Browser redirects to /member/dashboard or /admin/dashboard
4. On each API request:
   - Cookie middleware reads session from cookie
   - Validates session exists and is not expired
   - Attaches to request context
5. On logout:
   - DELETE the cookie
   - Redirect to home
```

**Cookie Details**:
- Name: `session`
- Format: JSON stringified
- HttpOnly: `true` (inaccessible to JavaScript)
- Secure: `true` (HTTPS only in production)
- SameSite: `lax` (CSRF protection)
- MaxAge: 604800 seconds (7 days)

---

## QR Flow (Event Check-in)

```
Admin creates event:
  POST /api/admin/events → event record in DB

Admin displays event:
  QR generated with event ID encoded

Member scans QR:
  Browser navigates to /member/checkin?eventId=...

Member confirms:
  POST /api/admin/events/{eventId}/checkin?memberId=...

Server:
  1. Verify member exists
  2. Add EventParticipation record
  3. Increment member.eventAttendances
  4. Call recalculateMember() → update levels
  5. Check isDiamondEligible()
  6. Return updated member data

Member Dashboard:
  Re-renders with new event count, updated levels, new pins
```

---

## Ranking Calculation Strategy

**Trigger**: After any metric change (purchase, event check-in, referral approval)

**Algorithm**:

```typescript
// For each axis (clientLevel, eventLevel, ambassadorLevel):
// 1. Fetch all members
// 2. Sort by metric (totalSpent, eventAttendances, referralsCompleted) DESC
// 3. Assign rank: `rank = index + 1`
// 4. Handle ties: same metric = same rank, next rank skips
// 5. Update member.spending_rank, event_rank, referral_rank
```

**Efficiency**:
- Recalculate on-demand (not real-time)
- Batch recalculate nightly if needed
- Cache rankings in DB for fast dashboard loads

**Display**:
- Member dashboard shows: "You are ranked #5 out of 2000 spenders"
- Hall of Fame shows: Top 10 per axis

---

## Deployment Assumptions

### **Local Development**
- SQLite database file: `/delta-fraternite.db`
- Database auto-migrates with `npm run dev`
- Hot reload on file changes

### **Production (Vercel)**
- Same codebase, different database
- Switch to PostgreSQL (or Neon/Supabase)
```prisma
// In production .env:
DATABASE_URL="postgresql://user:password@host/delta_fraternite"
```
- Prisma migrations run on deployment
- Vercel serverless functions handle API routes
- Vercel KV or similar for session storage (if scaling)

### **Database Backup Strategy**
- Local SQLite: Manual backup before major changes
- Production: PostgreSQL automated backups via Vercel

### **Secrets Management**
```env
# Required in .env.local (development) or Vercel dashboard (production):
DATABASE_URL=file:./delta-fraternite.db  # or postgresql://...
NEXTAUTH_SECRET=<random-256-bit-key>    # For cookie encryption
NEXTAUTH_URL=http://localhost:3000      # or https://delta.vercel.app
```

### **Monitoring & Logging**
- Next.js built-in logging in console
- Can add Sentry or similar for production errors
- Health check endpoint: `GET /api/health`

---

## Performance Considerations

| Component | Target | Approach |
|-----------|--------|----------|
| Page load | <1s | Static rendering + Data fetching in API |
| API response | <200ms | Direct DB queries, no N+1 |
| Dashboard render | <500ms | Precompute rankings on demand |
| Pin calculation | <10ms | Pure JS functions (no DB calls) |
| QR generation | <50ms | client-side with qrcode.react |

---

## Security Decisions

| Threat | Mitigation |
|--------|----------|
| SQL Injection | Prisma ORM (parameterized queries) |
| XSS | React auto-escaping, CSP headers (future) |
| CSRF | SameSite=lax cookies |
| Password Weak | Bcryptjs hashing (10 rounds), min 8 chars recommended |
| Session Hijacking | HTTP-only, secure, SameSite flags |
| Unauthorized Access | Session validation on every protected route |
| Admin Escalation | Role check before DB modifications |

---

## Future Scalability

**As membership grows (to 10k+ members)**:

1. **Database**: Migrate from SQLite to PostgreSQL (Vercel Postgres or Neon)
2. **Caching**: Add Redis for rankings cache (recalc nightly, not per-action)
3. **CDN**: Vercel Edge for static assets
4. **Monitoring**: Sentry for errors, Datadog for performance
5. **Notifications**: Queue system (Bull/Bee-Queue) for async email/SMS
6. **Search**: Postgres full-text search for members
7. **Analytics**: PostHog or Mixpanel for tracking engagement

---

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server (port 3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Database commands
npx prisma migrate dev --name <name>   # Create + run migration
npx prisma db push                       # Push schema to DB
npx prisma db seed                       # Run seed script
npx prisma studio                        # Open GUI database viewer

# Seeding (admin setup)
npx ts-node --esm prisma/seed.ts        # Populate initial data
```

---

## File Naming Conventions

- **Pages**: Lowercase, kebab-case: `page.tsx`, NOT `Page.tsx`
- **Route handlers**: `route.ts` in `[route]/` folders
- **Components**: PascalCase (future): `LoginCard.tsx`
- **Utils**: camelCase: `pinEngine.ts`, `db.ts`
- **Styles**: `globals.css` (single stylesheet)

