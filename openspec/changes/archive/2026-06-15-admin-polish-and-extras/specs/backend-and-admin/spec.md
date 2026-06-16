# Delta for: backend-and-admin

> **Change**: `admin-polish-and-extras` (D5 — `useBusinessConfigQuery.staleTime = 0`)
> **Target spec**: `openspec/specs/backend-and-admin/spec.md`
> **Mode**: hybrid (engram + OpenSpec)

## MODIFIED Requirements

### Requirement: Frontend uses TanStack Query for data fetching

The system MUST wrap `GET /api/menu`, `GET /api/tables`, `GET /api/business-config` with `useQuery` and MUST replace the `useState` reads in `ReservationContext` for these resources. The system MUST keep `useState` for `language`, `activeView`, and `notifications` only. The `useBusinessConfigQuery` hook MUST set `staleTime: 0` so admin edits to the business config (WhatsApp number, bank details, QR URL) are reflected in the consuming views within one render of the next mount or focus event, with no 5-minute delay.

(Previously: 5-minute cache via the global `queryClient.staleTime` default, which delayed the visibility of admin edits to `business_config` for up to 5 minutes.)

#### Scenario: Loading state shows skeleton

- GIVEN `useQuery(['menu'])` is fetching for the first time
- WHEN the data has not yet arrived
- THEN the components that depend on menu MUST render a loading skeleton

#### Scenario: Error state shows retry

- GIVEN the network request failed
- WHEN the error is caught by `useQuery`
- THEN the components MUST render an error message with a retry button

#### Scenario: useBusinessConfigQuery refetches immediately after admin edit

- GIVEN the admin is authenticated and edits `whatsappNumber` via `SettingsPanel` and clicks Save
- WHEN the `PUT /api/admin/business-config` mutation returns 200
- THEN `useBusinessConfigQuery` MUST refetch on the next mount / focus event with no observable delay beyond the network round-trip; the new value MUST be visible in `BookingSection` and `KanbanBoard` within 1 second
