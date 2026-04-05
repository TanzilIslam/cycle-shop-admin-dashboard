# Admin Dashboard — CLAUDE.md

Vue 3 multi-tenant admin dashboard for managing a generic product store. Each tenant (shop owner) manages their own data in isolation. Part of the `store` app within the multi-app `cms` Supabase project.

## Tech Stack

| Tool | Version | Role |
|---|---|---|
| Vue | 3.5.18 | UI framework |
| Vite | 7.0.6 | Build tool / dev server |
| Pinia | 3.0.3 | State management |
| Vue Router | 4.5.1 | Client-side routing |
| Vuetify | 3.9.3 | Material Design UI components |
| Supabase JS | 2.53.0 | Auth, DB, Storage |
| CKEditor 5 | 44.3.0 | Rich text editing |
| pnpm | — | Package manager |

## Project Structure

```
src/
├── assets/          # CSS (main.css, base.css)
├── components/
│   └── common/      # AppConfirmDialog, AppDialog, AppNotificationMenu, AppRichTextEditor
├── layouts/
│   ├── dashboardLayout.vue   # Sidebar + top bar for protected pages
│   └── defaultLayout.vue     # Minimal layout for auth pages
├── lib/
│   ├── supabaseClient.js     # Supabase client (reads VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
│   ├── dbTable.js            # DB table name constants (all prefixed with store_)
│   ├── helper.js             # formatDate utility
│   └── ckeditor/             # Custom CKEditor build + Supabase upload adapter
├── router/
│   └── index.js              # Routes + auth guard
├── stores/                   # Pinia stores (one per domain)
└── views/                    # One component per route; auth/ subfolder for login
```

## Path Alias

`@` resolves to `./src`. Always use `@/` for imports (e.g. `@/stores/user`, `@/lib/supabaseClient`).

## Environment Variables

Required in `.env` (not committed):
```
VITE_SUPABASE_URL=https://crqpqaxhdzvqnmzwbrkt.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

## Database Tables

All constants are in `src/lib/dbTable.js`. Root prefix: `store_`.

| Constant | Table Name |
|---|---|
| `CATEGORY_TABLE` | `store_categories` |
| `PRODUCT_TABLE` | `store_products` |
| `PRODUCT_SPECIFICATION_TABLE` | `store_product_specs` |
| `USER_TABLE` | `store_users` |
| `SPECIFICATION_SECTION_TABLE` | `store_spec_sections` |
| `SPECIFICATION_KEY_TABLE` | `store_spec_keys` |
| `ENQUIRY_TABLE` | `store_enquiries` |

Always import table names from `@/lib/dbTable.js` — never hardcode strings.

## Multi-Tenant Design

- `store_users.id = auth.uid()` — user row IS the tenant identity
- On register, `user.js` inserts into `store_users` with the provided shop name
- On login, `user.js` verifies a `store_users` row exists — blocks login if not found
- All data tables have a `shop_id` column referencing `store_users.id`; RLS enforces `shop_id = auth.uid()`
- No super-admin role — self-signup only

## Routing

- `/` → redirects to `/dashboard` — protected (requires auth)
- All dashboard routes use `dashboardLayout.vue` and `meta: { requiresAuth: true }`
- `/auth/login` — public, uses `defaultLayout.vue`
- Auth guard in `router/index.js`: checks `userStore.isLoggedIn`, calls `fetchSession()` on first load
- Route meta fields used for sidebar: `usedInSideNav`, `icon`, `title`
- All route components are lazy-loaded

## State Management (Pinia)

### `stores/app.js` — Global UI state
- `showSnackbar(text, color, timeout)` — toast notifications
- `showError(message)` — convenience wrapper
- `openConfirmDialog(options)` — Promise-based confirm dialog

### `stores/user.js` — Auth
- `loginWithEmail(email, password)` — authenticates; verifies `store_users` row exists, blocks if not
- `signupWithEmail(shopName, email, password)` — creates auth user + inserts `store_users` row
- `logout()` — signs out, redirects to login
- `fetchSession()` — restores existing session on page load
- `isLoggedIn` — computed boolean

### `stores/shop.js` — My Shop profile
- `fetchMyShop()` — fetches the current user's row from `store_users`
- `saveMyShop(data)` — upserts the `store_users` row with `id = auth.uid()`

### Data stores (category, product, enquiry, specificationSection, specificationKey)
Consistent CRUD interface: `fetchAll`, `fetchById`, `create`, `update`, `remove`.
Product store additionally has: `createProductSpecs`, `removeProductSpecs`, `fetchProductSpecs`.
Enquiry store additionally has: pagination, search/sort, unread count, `markAsRead`, `markAsUnread`.

## Supabase Usage Patterns

- Client: `import { supabase } from '@/lib/supabaseClient'`
- Auth: `supabase.auth.signInWithPassword()`, `supabase.auth.signOut()`, `supabase.auth.getSession()`
- DB: standard `supabase.from(TABLE).select/insert/update/delete`
- No realtime — data refreshes on user action or page load
- Storage: via `SupabaseUploadAdapter.js` inside CKEditor (bucket: `store-public`)
- Always use the anon key from env — never hardcode credentials

## Component Conventions

- All components use `<script setup>` (Composition API)
- Common reusable components live in `src/components/common/`
- Page components (views) live in `src/views/` — one per route
- Dialog-based forms: use `AppDialog.vue` wrapper, expose form ref for validation
- Confirmations: use `appStore.openConfirmDialog()` — returns a Promise

## Vuetify Defaults (set in main.js)

All form inputs default to `variant: 'outlined'`, `density: 'compact'`. Don't override these per-component unless necessary.

## Code Style

- Formatter: Prettier — `semi: false`, `singleQuote: true`, `printWidth: 100`
- Linter: ESLint with `eslint-plugin-vue` (recommended) + Prettier
- Run `pnpm lint` to fix lint issues, `pnpm format` to format `src/`
- ESLint ignores: `dist/`, `src/lib/ckeditor/`

## Dev Commands

```bash
pnpm dev        # start dev server
pnpm build      # production build
pnpm preview    # preview production build
pnpm lint       # lint + auto-fix
pnpm format     # format src/
```

## Key Architectural Decisions

- No triggers in DB — all post-auth logic is explicit in app code
- Optimistic UI updates in enquiry store (mark read before API confirms)
- No realtime subscriptions — removed to simplify the system; users refresh to see new data
- Server-side pagination/search for enquiries (not client-side)
- Slugify package used for auto-generating slugs from names
- `store_spec_keys.section_id` links keys to sections (column name: `section_id`)
- `store_product_specs.product_id` links specs to products (column name: `product_id`)
