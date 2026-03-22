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
