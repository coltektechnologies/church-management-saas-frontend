# Admin Dashboard API Integration

This document describes the backend API integration for the admin dashboard at `/admin` (http://localhost:3000/admin).

## Overview

The admin dashboard fetches live data from the church-management-saas-backend when the user is authenticated. Data is loaded automatically on mount and can be refreshed via the retry button if an error occurs.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  DashboardPage (/admin)                                          │
│  └── useAppData() → AppDataContext                               │
│        ├── members, transactions, announcements, events,         │
│        │   departments, approvals, activityLog                   │
│        ├── apiLoading, apiError, refetchDashboard                │
│        └── derived stats (totalMembers, totalIncome, etc.)       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  AppDataProvider                                                 │
│  └── useDashboardApiSync()                                       │
│        └── Fetches from lib/dashboardApi.ts                      │
│        └── Maps via lib/dashboardMappers.ts                      │
│        └── Populates context state                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend (church-management-saas-backend)                        │
│  http://localhost:8000/api                                       │
└─────────────────────────────────────────────────────────────────┘
```

## Configuration

### Environment Variables

Set in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

- **NEXT_PUBLIC_API_URL** – Base URL for the API (no trailing slash). The backend must be running and CORS must allow the frontend origin.

### Authentication

- The dashboard uses JWT authentication via `Authorization: Bearer <access_token>`.
- The access token is stored in `localStorage` under the key `access_token` after login.
- API sync runs only when `getAccessToken()` returns a non-null value.
- All endpoints are church-scoped; the backend derives church context from the authenticated user.

## Backend Endpoints Used

| Purpose               | Method | Endpoint                                                          | Response                   |
| --------------------- | ------ | ----------------------------------------------------------------- | -------------------------- |
| Members list          | GET    | `/members/members/?page_size=100`                                 | Paginated members          |
| Income transactions   | GET    | `/treasury/income-transactions/?page_size=100`                    | Paginated income txns      |
| Expense transactions  | GET    | `/treasury/expense-transactions/?page_size=100`                   | Paginated expense txns     |
| Announcements         | GET    | `/announcements/?page_size=100`                                   | Paginated announcements    |
| Departments           | GET    | `/departments/?page_size=100`                                     | Paginated departments      |
| Expense requests      | GET    | `/treasury/expense-requests/?page_size=50`                        | Paginated expense requests |
| Activity feed         | GET    | `/activity/?page_size=30`                                         | Paginated audit log        |
| Department activities | GET    | `/departments/{id}/activities/?time_filter=upcoming&page_size=10` | Upcoming events per dept   |

### Optional Analytics Endpoints (for future use)

| Purpose                 | Method | Endpoint                                       |
| ----------------------- | ------ | ---------------------------------------------- |
| Admin dashboard summary | GET    | `/analytics/dashboard/admin/`                  |
| Member stats            | GET    | `/analytics/members/stats/`                    |
| Finance KPIs            | GET    | `/analytics/finance/kpis/?date_from=&date_to=` |
| Finance trends          | GET    | `/analytics/finance/trends/?period_days=90`    |
| Announcement stats      | GET    | `/analytics/announcements/stats/`              |

## Files

| File                                                     | Purpose                                                                                                  |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `lib/dashboardApi.ts`                                    | API client functions for dashboard data. Handles both paginated `{ results }` and plain array responses. |
| `lib/dashboardMappers.ts`                                | Maps backend response shapes to frontend types                                                           |
| `hooks/useDashboardApiSync.ts`                           | Fetches and syncs API data into AppDataContext                                                           |
| `components/admin/dashboard/contexts/AppDataContext.tsx` | Holds dashboard state and triggers API sync                                                              |

## Data Flow

1. User navigates to `/admin`.
2. `AppDataProvider` mounts and runs `useDashboardApiSync`.
3. If `getAccessToken()` exists, the hook fetches in parallel:
   - Members, income txns, expense txns
   - Announcements, departments, expense requests
   - Activity feed, upcoming activities (per department)
4. Responses are mapped via `dashboardMappers.ts` to match `AppDataContext` types.
5. Context state is updated; derived stats (totalMembers, totalIncome, etc.) are recomputed.
6. Dashboard components read from `useAppData()` and render.

## Error Handling

- **API Error**: If any request fails, `apiError` is set and an error banner appears with a "Retry" button.
- **No token**: No requests are made; the dashboard shows empty state.
- **Network / CORS**: Errors are caught and displayed in the banner.

## Running Locally

1. Start the backend:

   ```bash
   cd church-management-saas-backend
   python manage.py runserver
   ```

2. Ensure `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:8000/api`.

3. Start the frontend:

   ```bash
   npm run dev
   ```

4. Log in at `/login` to obtain an access token.

5. Visit `/admin` to see the dashboard with live data.

## Members Page Integration (`/admin/members`)

The Members page is fully connected to the backend API. Data flow:

### API Endpoints

| Purpose              | Method | Endpoint                              | Used By                           |
| -------------------- | ------ | ------------------------------------- | --------------------------------- |
| Member stats         | GET    | `/analytics/members/stats/`           | Stats cards (Total, Active, etc.) |
| Tithe/offering stats | GET    | `/analytics/finance/tithe-offerings/` | Monthly trend + Tithing charts    |
| Members list         | GET    | `/members/members/`                   | MembersTable                      |
| Member detail        | GET    | `/members/members/{id}/`              | Member detail + edit pages        |
| Create member        | POST   | `/members/create/`                    | Add member page                   |
| Update member        | PUT    | `/members/members/{id}/`              | Edit member page                  |
| Delete member        | DELETE | `/members/members/{id}/`              | MembersTable (single + bulk)      |

### Filter Integration

The search bar and filter dropdowns are wired to the members table via shared state:

- **State location**: `app/admin/members/page.tsx` holds `filters` and passes them to both `MemberFilters` and `MembersTable`.
- **Filter logic**: `lib/memberFilters.ts` provides `applyMemberFilters()` for client-side filtering (backend returns full list; filtering is done in the browser).
- **Filter fields**:
  - **Search**: Matches name, email, phone, member ID (case-insensitive).
  - **Status**: Membership status (Active, Inactive, Transfer, New Convert, Visitor).
  - **Department**: Filters by department when data is available (extensible for future API).
  - **Date**: Member since date (This Month, Last 6 Months, This Year, Last Year).

When filters change, the table re-filters and pagination resets to page 1.

### Files

| File                                            | Purpose                                                      |
| ----------------------------------------------- | ------------------------------------------------------------ |
| `lib/memberFilters.ts`                          | Filter types, options, and `applyMemberFilters()`            |
| `lib/api.ts`                                    | `getMembers()`, `getMember()`, `createMember()`, etc.        |
| `components/admin/membership/MemberFilters.tsx` | Controlled filter UI; receives `filters` + `onFiltersChange` |
| `components/admin/membership/MembersTable.tsx`  | Fetches members, applies filters, paginates                  |

## Type Mappings

Backend models are mapped to frontend types as follows:

| Backend                                                  | Frontend                                    |
| -------------------------------------------------------- | ------------------------------------------- |
| `BackendMember`                                          | `Member` (name, status, joinedDate, etc.)   |
| `BackendIncomeTransaction` / `BackendExpenseTransaction` | `Transaction` (type: Income \| Expense)     |
| `BackendAnnouncement`                                    | `Announcement` (status: Draft \| Published) |
| `BackendDepartmentActivity`                              | `EventItem`                                 |
| `BackendDepartment`                                      | `Dept`                                      |
| `BackendExpenseRequest` (pending)                        | `Approval`                                  |
| `ActivityFeedItem` (AuditLog)                            | `ActivityLogItem`                           |

## Treasury Dashboard Integration (`/admin/treasury`)

**Status: Wired to backend API** (as of integration work).

The Treasury Dashboard fetches live data from the backend via `lib/treasuryApi.ts` and `services/treasuryService.ts`. Below is the mapping between each UI component, the data it needs, and the backend API used.

### Current UI Structure

| Component                | Data Needed                                                           | Backend API Status      |
| ------------------------ | --------------------------------------------------------------------- | ----------------------- |
| SummaryCards             | totalIncome, netBalance, totalExpenses, totalIncomeAllTime, change %s | Partially available     |
| IncomeExpenseChart       | Monthly trend (income vs expenses)                                    | Available               |
| RecentTransactions       | Combined income + expense txns                                        | Available               |
| BreakdownCharts          | Income by category, Expense by category                               | Available               |
| MemberContributions      | Members with contribution totals                                      | Derive from income txns |
| DepartmentBudgets        | Departments with allocated/utilized                                   | Partially available     |
| PendingExpenseRequests   | Pending expense requests + actions                                    | Available               |
| TransactionForm (record) | Create income/expense transaction                                     | Available               |
| QuickActions             | Navigation only (no API)                                              | N/A                     |

---

### 1. Summary Cards

**UI expects:** `TreasurySummary`

```ts
{
  totalIncome: number;
  netBalance: number;
  totalExpenses: number;
  totalIncomeAllTime: number;
  incomeChangePercent: number;
  expenseChangePercent: number;
  totalIncomeAllTimeChangePercent?: number;
}
```

**Backend options:**

| API                          | Endpoint                                                     | Response                                                                                                   | Mapping                      |
| ---------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Treasury Statistics          | `GET /api/treasury/statistics/?start_date=&end_date=`        | `total_income`, `total_expenses`, `net_balance`                                                            | Direct map for period totals |
| Analytics Treasury Dashboard | `GET /api/analytics/dashboard/treasury/?date_from=&date_to=` | `total_income`, `total_expenses`, `net_balance`, `pending_expense_requests`, `total_assets_value`          | Same period totals           |
| Finance KPIs                 | `GET /api/analytics/finance/kpis/?date_from=&date_to=`       | `total_income`, `total_expenses`, `net_cash_flow`, `income_transaction_count`, `expense_transaction_count` | Same structure               |

**Gap:** Change percentages (`incomeChangePercent`, `expenseChangePercent`, `totalIncomeAllTimeChangePercent`) are not returned. You need to either:

- Call the same endpoints twice (current vs previous period) and compute % change on the frontend, or
- Add a backend endpoint that returns period-over-period change.

**Integration:** Use `GET /api/treasury/statistics/` or `GET /api/analytics/dashboard/treasury/` with `start_date` / `end_date` from the period filter. Compute `incomeChangePercent` / `expenseChangePercent` by comparing with the previous period (call again with previous period dates).

---

### 2. Income vs Expense Chart (Monthly Trend)

**UI expects:** `MonthlyTrend[]`

```ts
{
  month: string;
  income: number;
  expenses: number;
}
[];
```

**Backend API:**

| API            | Endpoint                                            | Response                                                                 |
| -------------- | --------------------------------------------------- | ------------------------------------------------------------------------ |
| Finance Trends | `GET /api/analytics/finance/trends/?period_days=90` | `income_by_month`, `expenses_by_month` (each: `{ month, total, count }`) |

**Mapping:** Merge `income_by_month` and `expenses_by_month` by `month`, convert `total` to number. Format `month` (e.g. `"2024-01"`) to display (e.g. `"Jan"`).

---

### 3. Recent Transactions

**UI expects:** `Transaction[]`

```ts
{
  id: string;
  description: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  category: string;
  icon: string;
}
```

**Backend APIs:**

| API                  | Endpoint                                                        | Response                                                                                               |
| -------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Income Transactions  | `GET /api/treasury/income-transactions/?start_date=&end_date=`  | List with `id`, `transaction_date`, `amount`, `category_name`, `receipt_number`, `contributor_display` |
| Expense Transactions | `GET /api/treasury/expense-transactions/?start_date=&end_date=` | List with `id`, `transaction_date`, `amount`, `category_name`, `description`                           |

**Mapping:** Fetch both, combine, sort by date desc, take top N. Map `category_name` → `category`, `contributor_display` or `description` → `description`, add `type: 'income' | 'expense'`.

---

### 4. Income Breakdown (Donut)

**UI expects:** `IncomeCategory[]`

```ts
{
  name: string;
  value: number;
  color: string;
}
[];
```

**Backend API:**

| API                 | Endpoint                                              | Response                                                   |
| ------------------- | ----------------------------------------------------- | ---------------------------------------------------------- |
| Treasury Statistics | `GET /api/treasury/statistics/?start_date=&end_date=` | `income_by_category`: `[{ category__name, total, count }]` |

**Mapping:** Map `category__name` → `name`, `total` → `value`. Assign colors on the frontend (fixed palette or by index).

---

### 5. Expense Breakdown (Donut)

**UI expects:** `ExpenseCategory[]`

```ts
{
  name: string;
  value: number;
  color: string;
}
[];
```

**Backend API:** Same `GET /api/treasury/statistics/` → `expenses_by_category` (structure: `{ category__name, total, count }`).

**Mapping:** Same as income: `category__name` → `name`, `total` → `value`, assign colors on frontend.

---

### 6. Member Contributions

**UI expects:** `MemberContribution[]`

```ts
{
  id: string;
  name: string;
  avatar: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
  totalAmount: number;
  lastDate: string;
  contributions: {
    date: string;
    amount: number;
    type: string;
  }
  [];
}
```

**Backend:** No dedicated endpoint. `IncomeTransaction` has `member` FK and `category`. You can:

1. **Option A:** Use `GET /api/treasury/income-transactions/` and aggregate by `member` on the frontend.
2. **Option B:** Add `GET /api/analytics/finance/member-contributions/` (or similar) that aggregates income by member and category.

**Mapping:** Group income transactions by `member`, sum `amount` for `totalAmount`, take latest `transaction_date` for `lastDate`, list `contributions` from each txn. Use `member.full_name`, `member.phone_number`, `member.membership_status` from member data.

---

### 7. Department Budgets

**UI expects:** `DepartmentBudget[]`

```ts
{
  id: string;
  name: string;
  allocated: number;
  utilized: number;
  color: string;
}
[];
```

**Backend options:**

| API                            | Endpoint                                                                                    | Response                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Department statistics (action) | `GET /api/departments/departments/statistics/`                                              | Per-dept: `id`, `name`, `total_budget`, `total_spent` (from programs) |
| Department list + budget items | `GET /api/departments/departments/` + `GET /api/departments/departments/{id}/budget_items/` | Programs → budget items → allocated/utilized                          |

**Note:** Department budgets are stored as **Program** budgets (5-step flow). `DepartmentStatisticsView` in `department_views.py` returns `total_budget` and `total_spent` per department. Check if `departments/statistics/` is exposed in `departments/urls.py` (the router has `statistics` as an action on `DepartmentViewSet`).

**Mapping:** `total_budget` → `allocated`, `total_spent` (or similar) → `utilized`. Assign colors on frontend.

---

### 8. Pending Expense Requests

**UI expects:** `ExpenseRequest[]`

```ts
{
  id: string;
  title: string;
  department: string;
  requestedBy: string;
  date: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
}
```

**Backend APIs:**

| API                   | Endpoint                                                                      | Response                                                                                                                    |
| --------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| List expense requests | `GET /api/treasury/expense-requests/?status=SUBMITTED` (or multiple statuses) | `id`, `request_number`, `department_name`, `amount_requested`, `requested_by_name`, `required_by_date`, `status`, `purpose` |
| Approve (Dept Head)   | `POST /api/treasury/expense-requests/{id}/approve-dept-head/`                 | Updated request                                                                                                             |
| Approve (First Elder) | `POST /api/treasury/expense-requests/{id}/approve-first-elder/`               | Updated request                                                                                                             |
| Approve (Treasurer)   | `POST /api/treasury/expense-requests/{id}/approve-treasurer/`                 | Updated request                                                                                                             |
| Reject                | `POST /api/treasury/expense-requests/{id}/reject/`                            | Updated request                                                                                                             |

**Status filter:** For “pending” include: `SUBMITTED`, `DEPT_HEAD_APPROVED`, `FIRST_ELDER_APPROVED`, `TREASURER_APPROVED`, `APPROVED`. Backend supports `?status=SUBMITTED`; you may need multiple requests or a comma-separated status filter if supported.

**Mapping:** `purpose` → `title`, `department_name` → `department`, `requested_by_name` → `requestedBy`, `required_by_date` or `requested_at` → `date`, `amount_requested` → `amount`.

---

### 9. Record Transaction Form (`/admin/treasury/record`)

**Form fields:** Received from/Paid to, Phone, Member ID, Date, Category, Currency, Payment method, Amount.

**Backend APIs:**

| Action         | Endpoint                                   | Body                                                                                                                            |
| -------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Create income  | `POST /api/treasury/income-transactions/`  | See `IncomeTransactionDetailSerializer` (category_id, transaction_date, amount, payment_method, member, contributor_name, etc.) |
| Create expense | `POST /api/treasury/expense-transactions/` | See `ExpenseTransactionDetailSerializer`                                                                                        |

**Additional data for form:**

- `GET /api/treasury/income-categories/` for income category dropdown
- `GET /api/treasury/expense-categories/` for expense category dropdown
- `GET /api/members/members/?page_size=100` for member lookup (when linking to member)

---

### 10. Period Filter

**UI:** `this_week`, `this_quarter`, `this_year`, `custom` (with date range).

**Mapping to API params:**

- Compute `start_date` and `end_date` (YYYY-MM-DD) from the selected period.
- Pass to: `treasury/statistics`, `analytics/dashboard/treasury`, `analytics/finance/kpis`, `analytics/finance/trends`, `treasury/income-transactions`, `treasury/expense-transactions`.

---

### Files Updated (Integration Complete)

| File                                             | Changes                                                                                                         |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `lib/treasuryApi.ts`                             | **Created.** API client for treasury + analytics endpoints.                                                     |
| `services/treasuryService.ts`                    | **Updated.** Replaced mock with real API calls; added `periodToDateRange`, mappers.                             |
| `hooks/useTreasury.ts`                           | **Updated.** Added `useApproveExpenseRequest`, `useRejectExpenseRequest`; pass filters to member contributions. |
| `app/admin/treasury/page.tsx`                    | **Updated.** Custom date range for period filter; wired approve/reject mutations.                               |
| `components/treasury/PendingExpenseRequests.tsx` | **Updated.** `isApproving`, `isRejecting` props; loading states.                                                |
| `components/treasury/forms/TransactionForm.tsx`  | **Updated.** Form state, validation, categories from API, submit to income/expense endpoints.                   |

### Backend APIs Added

| Endpoint                                           | Purpose                                    |
| -------------------------------------------------- | ------------------------------------------ |
| `GET /api/analytics/finance/member-contributions/` | Members with contribution totals (new)     |
| `GET /api/analytics/finance/department-budgets/`   | Per-department allocated vs utilized (new) |

---

### Endpoint Summary

| Purpose                          | Method | Endpoint                                                                                                     |
| -------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------ |
| Summary stats (with breakdowns)  | GET    | `/api/treasury/statistics/?start_date=&end_date=`                                                            |
| Treasury dashboard (alternative) | GET    | `/api/analytics/dashboard/treasury/?date_from=&date_to=`                                                     |
| Finance KPIs                     | GET    | `/api/analytics/finance/kpis/?date_from=&date_to=`                                                           |
| Monthly trends                   | GET    | `/api/analytics/finance/trends/?period_days=90`                                                              |
| Income transactions              | GET    | `/api/treasury/income-transactions/?start_date=&end_date=`                                                   |
| Expense transactions             | GET    | `/api/treasury/expense-transactions/?start_date=&end_date=`                                                  |
| Income categories                | GET    | `/api/treasury/income-categories/`                                                                           |
| Expense categories               | GET    | `/api/treasury/expense-categories/`                                                                          |
| Pending expense requests         | GET    | `/api/treasury/expense-requests/?status=SUBMITTED` (or multiple)                                             |
| Approve expense (Dept Head)      | POST   | `/api/treasury/expense-requests/{id}/approve-dept-head/`                                                     |
| Approve expense (First Elder)    | POST   | `/api/treasury/expense-requests/{id}/approve-first-elder/`                                                   |
| Approve expense (Treasurer)      | POST   | `/api/treasury/expense-requests/{id}/approve-treasurer/`                                                     |
| Reject expense                   | POST   | `/api/treasury/expense-requests/{id}/reject/`                                                                |
| Create income                    | POST   | `/api/treasury/income-transactions/`                                                                         |
| Create expense                   | POST   | `/api/treasury/expense-transactions/`                                                                        |
| Department budgets               | GET    | `/api/departments/statistics/` (department list action; or per-dept `GET /api/departments/{id}/statistics/`) |

---

## Announcements (`/admin/announcements`) & notification center

**Status: wired to Django REST** when authenticated and mock flags are off.

### Environment

| Variable                                  | Effect                                                        |
| ----------------------------------------- | ------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`                     | Required for live API (e.g. `http://localhost:8000/api`).     |
| `NEXT_PUBLIC_USE_MOCK_ANNOUNCEMENTS=true` | Forces localStorage mock announcements (ignores API).         |
| `NEXT_PUBLIC_USE_MOCK_NOTIFICATIONS=true` | Forces mock notification inbox + create wizard (ignores API). |

If mock flags are **unset** or `false` and `getAccessToken()` is present, the UI calls the backend.

### Announcements

| Purpose                            | Method | Endpoint                                |
| ---------------------------------- | ------ | --------------------------------------- |
| List                               | GET    | `/announcements/?page_size=100&search=` |
| Categories (resolve `category_id`) | GET    | `/announcements/categories/`            |
| Detail (full `content`)            | GET    | `/announcements/{id}/`                  |
| Create                             | POST   | `/announcements/`                       |
| Patch                              | PATCH  | `/announcements/{id}/`                  |
| Delete                             | DELETE | `/announcements/{id}/`                  |
| Submit for review                  | POST   | `/announcements/{id}/submit/`           |
| Approve                            | POST   | `/announcements/{id}/approve/`          |
| Publish                            | POST   | `/announcements/{id}/publish/`          |

**Implementation:** `lib/announcementsApi.ts` (HTTP), `lib/announcementMappers.ts` (DRF → UI types), `services/announcementService.ts` (mock vs API). List rows omit `content`; the grid shows a short placeholder until **Edit** loads detail via `announcementService.getAnnouncementById()`.

**Publish flow:** Creating with “Publish” runs `submit → approve → publish` in sequence (requires permissions on the backend). “Save Draft” only `POST`s the announcement (stays `DRAFT`).

### In-app notifications

| Purpose                        | Method | Endpoint                                      |
| ------------------------------ | ------ | --------------------------------------------- |
| List (current user)            | GET    | `/notifications/notifications/?page_size=100` |
| Create (single user or member) | POST   | `/notifications/notifications/`               |
| Mark read                      | PUT    | `/notifications/notifications/{id}/read/`     |
| Mark all read                  | PUT    | `/notifications/notifications/mark_all_read/` |
| Unread count                   | GET    | `/notifications/notifications/unread_count/`  |
| Bulk send                      | POST   | `/notifications/send-bulk/`                   |
| Staff users (recipient picker) | GET    | `/accounts/users/`                            |
| Departments (batch picker)     | GET    | `/departments/`                               |

**Implementation:** `lib/notificationsApi.ts`, `services/notificationsService.ts`, `hooks/useNotificationsInbox.ts`. `NotificationCenterPanel` uses React Query when the API is enabled. `CreateNotificationModal` loads real users/departments when authenticated; **visitor-only** single recipient and **visitors-only** batch are blocked with a message (not in `NotificationCreateSerializer` / `send-bulk` target options). **Recurring** wizard schedules are not submitted to the API from this modal (use recurring-schedules endpoint separately).

### Files

| File                                                   | Purpose                                                     |
| ------------------------------------------------------ | ----------------------------------------------------------- |
| `lib/announcementsApi.ts`                              | Announcement CRUD + workflow actions                        |
| `lib/announcementMappers.ts`                           | Backend ↔ `Announcement` UI type                            |
| `lib/notificationsApi.ts`                              | Notifications + bulk + account users list                   |
| `lib/featureFlags.ts`                                  | `isMockAnnouncementsEnabled` / `isMockNotificationsEnabled` |
| `services/announcementService.ts`                      | Single entry for announcements page                         |
| `services/notificationsService.ts`                     | Map API rows to `MockNotificationItem`                      |
| `hooks/useNotificationsInbox.ts`                       | React Query + mark-read mutations                           |
| `components/announcements/NotificationCenterPanel.tsx` | Live inbox vs mock                                          |
| `components/announcements/CreateNotificationModal.tsx` | Live create/bulk vs mock                                    |
