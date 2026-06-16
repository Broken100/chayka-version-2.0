# Spec: category-management

> **Source of truth** for the Chayka Coffee v2.0 menu categories and table areas functionality.
> Last merged from delta: `admin-polish-and-extras` (2026-06-15) — PR#1.

## Purpose

Move menu categories and table areas from hardcoded client constants (`src/data.ts:INITIAL_CATEGORIES`) and a Postgres enum (`table_area`) into two proper DB-backed tables with public GETs and admin CRUD. The `table_area` Postgres enum on `reservations.area` and `tables.area` STAYS — it is the physical room code (e.g. `waterfall_deck`) and is distinct from the new `table_areas` table, which is the user-facing category with bilingual name, description, icon, and display order.

## Requirements

### Requirement: Menu categories are persisted in the database

The system MUST persist `menu_categories` in Postgres with columns: `id` (text, PK), `name_es` (text, NOT NULL), `name_en` (text, NOT NULL), `display_order` (integer, NOT NULL), `active` (boolean, NOT NULL, default true), `updated_at` (timestamp, default now). The API MUST expose `GET /api/menu-categories` returning all rows ordered by `display_order ASC` and seeded with 3 default rows (`hot_drinks`, `frappes`, `soft_drinks`) on first run.

#### Scenario: GET returns seeded categories

- GIVEN the database has 3 seeded menu categories
- WHEN a client requests `GET /api/menu-categories`
- THEN the server MUST respond HTTP 200 with a JSON array of 3 rows ordered by `display_order`

#### Scenario: Empty database returns empty array

- GIVEN the `menu_categories` table is empty
- WHEN a client requests `GET /api/menu-categories`
- THEN the server MUST respond HTTP 200 with an empty JSON array

### Requirement: Table areas are persisted in the database

The system MUST persist `table_areas` in Postgres with columns: `id` (text, PK), `name_es` (text, NOT NULL), `name_en` (text, NOT NULL), `description_es` (text), `description_en` (text), `display_order` (integer, NOT NULL), `active` (boolean, NOT NULL, default true), `updated_at` (timestamp, default now). The API MUST expose `GET /api/table-areas` returning all rows ordered by `display_order ASC` and seeded with 4 default rows on first run (one per existing `tableAreaEnum` value).

#### Scenario: GET returns seeded areas

- GIVEN the database has 4 seeded table areas
- WHEN a client requests `GET /api/table-areas`
- THEN the server MUST respond HTTP 200 with a JSON array of 4 rows ordered by `display_order`

### Requirement: Admin can manage menu categories and table areas

The system MUST accept `POST /api/admin/menu-categories`, `PUT /api/admin/menu-categories/:id`, and `DELETE /api/admin/menu-categories/:id`; and the same four verbs under `/api/admin/table-areas`. All endpoints MUST require an active admin session. `POST` MUST validate the body and reject duplicate ids with HTTP 409. `PUT` MUST be a partial update with the same validation. `DELETE` MUST be a SOFT delete (sets `active = false`) when at least one `menu_items` row references the category, and a HARD delete otherwise; the system MUST return HTTP 409 with `{ "error": "X items use this category" }` when the soft-delete guard fires — the row stays, but the client receives a 409 so the UI can surface the guard.

#### Scenario: Create menu category with unique id

- GIVEN the id `specialty_tea` does not exist
- WHEN `POST /api/admin/menu-categories` is called with that id and valid bilingual body
- THEN the server MUST respond HTTP 201 and the created row

#### Scenario: Duplicate id returns 409

- GIVEN the id `hot_drinks` already exists
- WHEN `POST /api/admin/menu-categories` is called with the same id
- THEN the server MUST respond HTTP 409 and `{ "error": "Menu category id already exists" }`

#### Scenario: Soft delete is blocked when items reference the category

- GIVEN 4 menu items have `category = 'hot_drinks'`
- WHEN `DELETE /api/admin/menu-categories/hot_drinks` is called
- THEN the server MUST respond HTTP 409 and `{ "error": "4 items use this category" }`; the row MUST stay active

#### Scenario: Hard delete is allowed when no items reference the category

- GIVEN 0 menu items have `category = 'specialty_tea'`
- WHEN `DELETE /api/admin/menu-categories/specialty_tea` is called
- THEN the server MUST respond HTTP 204 and the row MUST be removed permanently

### Requirement: CategoryManager UI surfaces both tables with ordered tabs

The admin panel MUST render a `CategoryManager` view with two ordered tabs: "Menu Categories" and "Table Areas". Each tab MUST list rows from its respective query, expose Add / Edit / Delete controls, show the current `display_order`, and MUST refuse deletion when the soft-delete guard fires by rendering a confirmation prompt that quotes the "X items use this" count. Drag-handles MUST allow re-ordering rows and persist the new `display_order` to the server.

#### Scenario: CategoryManager renders two tabs

- GIVEN the admin navigates to the Category Manager
- WHEN the view mounts
- THEN it MUST render the "Menu Categories" tab and the "Table Areas" tab, with the menu tab active by default

#### Scenario: Delete shows the items-in-use guard

- GIVEN the "Menu Categories" tab is active and the category `hot_drinks` has 4 items
- WHEN the admin clicks Delete on `hot_drinks`
- THEN the UI MUST surface "4 items use this category" and MUST NOT issue the DELETE call

### Requirement: Client queries the new endpoints and `INITIAL_CATEGORIES` is removed

The frontend MUST consume `GET /api/menu-categories` and `GET /api/table-areas` via new `useMenuCategoriesQuery` and `useTableAreasQuery` TanStack Query hooks. `MenuSection`, `MenuManager`, and `TableSelector` MUST read from those queries and MUST NOT import `INITIAL_CATEGORIES` from `src/data.ts`. The `INITIAL_CATEGORIES` constant MUST be removed from `src/data.ts`.

#### Scenario: MenuManager renders dropdown from the query

- GIVEN `useMenuCategoriesQuery` returns 3 rows
- WHEN `MenuManager` renders its product form
- THEN the category dropdown MUST list the 3 rows' bilingual names and MUST NOT contain any row whose `active = false`

#### Scenario: MenuSection consumes the query

- GIVEN `useMenuCategoriesQuery` returns 3 rows
- WHEN `MenuSection` renders
- THEN it MUST render a category chip per row, in `display_order` order

#### Scenario: INITIAL_CATEGORIES is no longer exported

- GIVEN the change is merged
- WHEN a developer greps the codebase for `INITIAL_CATEGORIES`
- THEN zero matches MUST be returned
