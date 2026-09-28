# AGENTS.md

Instructions for AI coding agents working on this project. Read this file before
writing or changing any code, and follow it in every task.

## 1. Project overview

- **What:** an inventory management web app that will be sold to companies of all
  sizes. Each company has its own private data inside one shared app (multi-tenant).
- **Stage:** startup MVP, built from scratch by a beginner developer. Keep things
  simple and do not over-engineer.
- **Architecture:** modular monolith. ONE Next.js project, ONE deployment. No
  microservices and no separate backend server.
- **Stack:** TypeScript (strict), Next.js (App Router), React, Prisma with two
  supported databases (PostgreSQL and MySQL, see section 8), Tailwind CSS,
  shadcn/ui, React Hook Form + Zod, deployed on Vercel.
- Before using any library, check its current official documentation. Do not rely
  on memory for APIs or versions.

## 2. How to work with me

- I am a beginner. After writing new code, explain it in simple language, line by
  line, and define any new technical term.
- Work in small steps. Finish one step, tell me how to test it, then wait for me.
- Do not add features, libraries, or refactors I did not ask for. Ask before
  adding a dependency.
- Show complete code with the full file path. No "..." and no "rest of the file
  stays the same".
- Ask before doing anything destructive: deleting data or files, resetting the
  database, force-pushing.
- If a request conflicts with this file, tell me and explain instead of silently
  breaking a rule.
- When in doubt, choose the simpler option and ask me.

## 3. Formatting and indentation

Prettier formats the code and ESLint checks it. Do not hand-format against them.

- Indentation: **2 spaces**, never tabs. This applies to TS, TSX, JSON, CSS,
  Markdown, YAML, and Prisma files.
- Line endings: LF. One newline at the end of every file. No trailing whitespace.
- Maximum line length: 100 characters.
- Double quotes for strings, semicolons always, trailing commas in multi-line lists
  and objects.
- Always use braces for `if`, `else`, `for`, and `while`, even for one-line bodies.
- One blank line between logical blocks. Never more than one blank line in a row.
- Prefer early returns over deep nesting. Avoid more than 3 levels of nesting.
- In JSX, put long props on separate lines, one prop per line.
- Import order, with a blank line between groups: (1) React and Next.js,
  (2) external packages, (3) internal imports with the `@/` alias (maps to
  `src/`), (4) relative imports. Use `import type` for type-only imports.

### Config files (create these if they are missing)

`.prettierrc`

```json
{
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100,
  "endOfLine": "lf"
}
```

`.editorconfig`

```ini
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
trim_trailing_whitespace = true
insert_final_newline = true
```

Optional later: `prettier-plugin-tailwindcss` to sort Tailwind classes automatically.

### Style example

```ts
import { z } from "zod";

const MAX_SKU_LENGTH = 40;

export const createProductSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1).max(MAX_SKU_LENGTH),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

// Returns true when the stock has reached the low-stock level.
export function isLowStock(currentStock: number, lowStockLevel: number): boolean {
  return currentStock <= lowStockLevel;
}
```

## 4. Naming conventions

Use clear, descriptive names. No unclear abbreviations (common ones like `id`,
`url`, and `sku` are fine). No single-letter names except short loop indexes.
File and folder names have their own rules in section 5.

| What                            | Convention                                       | Example                              |
| ------------------------------- | ------------------------------------------------ | ------------------------------------ |
| Variables, parameters           | camelCase                                        | `currentStock`, `lowStockLevel`      |
| Functions                       | camelCase, start with a verb                     | `createProduct`, `calculateTotal`    |
| Booleans                        | prefix `is`, `has`, `can`, or `should`           | `isLowStock`, `hasPermission`        |
| React components                | PascalCase                                       | `ProductForm`                        |
| Types, interfaces, enums        | PascalCase                                       | `StockMovement`, `UserRole`          |
| Enum values                     | UPPER_SNAKE_CASE                                 | `IN`, `OUT`, `ADJUSTMENT`            |
| True constants                  | UPPER_SNAKE_CASE                                 | `MAX_PAGE_SIZE`                      |
| Files and folders               | kebab-case                                       | `product-form.tsx`, `stock-movements/` |
| Next.js special files           | keep the required names                          | `page.tsx`, `layout.tsx`, `route.ts` |
| React hooks                     | `use` prefix                                     | `useDebounce`                        |
| Event handlers                  | `handle` inside a component, `on` for props      | `handleSubmit`, `onSubmit`           |
| Zod schemas                     | camelCase + `Schema`                             | `createProductSchema`                |
| Types inferred from Zod         | PascalCase + `Input`                             | `CreateProductInput`                 |
| Server Actions                  | verb + noun, kept in `actions.ts`                | `createProduct`                      |
| Prisma models                   | PascalCase, singular                             | `Product`, `StockMovement`           |
| Prisma fields                   | camelCase                                        | `companyId`, `createdAt`             |
| Database tables and columns     | snake_case, tables plural, via `@@map` / `@map`  | `stock_movements`, `company_id`      |
| API routes and URLs             | kebab-case, plural nouns                         | `/api/stock-movements`               |
| Environment variables           | UPPER_SNAKE_CASE                                 | `DATABASE_URL`                       |
| Git branches                    | `type/short-description`                         | `feat/product-list`                  |
| Commit messages                 | Conventional Commits                             | `feat: add product list page`        |

Prisma example (shortened):

```prisma
model StockMovement {
  id        String   @id @default(cuid())
  companyId String   @map("company_id")
  createdAt DateTime @default(now()) @map("created_at")

  @@index([companyId])
  @@map("stock_movements")
}
```

Only prefix an environment variable with `NEXT_PUBLIC_` if it is safe to show in
the browser.

## 5. File and folder naming

Every file and folder must be easy to name and easy to find without guessing.
Follow these rules everywhere in the codebase so the whole project looks like it
was written by one person.

### General rules

- Use **kebab-case** (lowercase words joined by hyphens) for every file and folder
  name: `product-form.tsx`, `stock-movements/`. No capital letters, spaces, or
  underscores.
- Use English names that describe what is inside. No vague or temporary names such
  as `helpers.ts`, `misc.ts`, `new-file.ts`, `test2.ts`, or `final-v2.ts`.
- The file name must match its main export: `ProductForm` lives in
  `product-form.tsx`, `useDebounce` in `use-debounce.ts`, and `formatCurrency` in
  `format-currency.ts`.
- One main component per file. Prefer named exports. Use a default export only
  where Next.js requires one (`page.tsx`, `layout.tsx`, and similar).
- Do not create `index.ts` barrel files. Import from the specific file instead.
- Create a folder only when it will hold two or more files.
- Use the same name for the same concept in every layer (see "One concept, one
  name" below).

### Exceptions (keep the required or generated name)

- Next.js special files: `page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx`,
  `error.tsx`, `not-found.tsx`.
- Next.js route syntax: dynamic segments in camelCase inside square brackets
  (`[productId]`) and route groups in kebab-case inside parentheses
  (`(dashboard)`).
- Tool and config files keep their standard names: `package.json`,
  `tsconfig.json`, `next.config.ts`, `.prettierrc`, `.editorconfig`, `.env.local`,
  `.env.example`, `README.md`, `AGENTS.md`.
- Prisma: `prisma/postgresql/schema.prisma`, `prisma/mysql/schema.prisma`,
  `prisma/seed.ts`, and migration names in snake_case that describe the change
  (for example `add_stock_movements`). Never rename or hand-edit a migration that
  has already been applied.

### File names by type

| File type                   | Pattern                                | Example                         |
| --------------------------- | -------------------------------------- | ------------------------------- |
| React component             | `<component-name>.tsx`                 | `product-form.tsx`              |
| Hook                        | `use-<name>.ts`, kept in `hooks/`      | `use-debounce.ts`               |
| Utility function            | `<verb>-<noun>.ts`, kept in `lib/`     | `format-currency.ts`            |
| Server Actions              | `actions.ts` in the feature folder     | `modules/products/actions.ts`   |
| Business logic and database | `service.ts` in the feature folder     | `modules/products/service.ts`   |
| Zod schemas                 | `schemas.ts` in the feature folder     | `modules/products/schemas.ts`   |
| Types                       | `types.ts` in the feature folder       | `modules/products/types.ts`     |
| Constants                   | `constants.ts` in the feature folder   | `modules/products/constants.ts` |
| Shared setup or client      | named after what it is, kept in `lib/` | `lib/db.ts`, `lib/auth.ts`      |
| Test                        | name of the tested file + `.test`      | `service.test.ts`               |

Put a test file next to the file it tests.

### Folder names

- Fixed technical folders: `app`, `components`, `hooks`, `lib`, `modules`,
  `prisma`, `public`. Do not add new top-level folders inside `src/` without
  asking me.
- Feature folders inside `modules/` are named after the business area, in
  kebab-case. Use the plural for things you have many of (`products`, `suppliers`,
  `stock-movements`) and the singular for a concept (`auth`, `dashboard`,
  `settings`).
- Route folders inside `app/` become the URL, so use kebab-case and plural nouns
  for resources: `app/(dashboard)/products/[productId]/edit/page.tsx` serves
  `/products/123/edit`.

### One concept, one name

Use the same name for a concept in every layer. Example for "stock movement":

| Layer          | Name                                             |
| -------------- | ------------------------------------------------ |
| Feature folder | `modules/stock-movements/`                       |
| Route folder   | `app/(dashboard)/stock-movements/`               |
| API route      | `/api/stock-movements`                           |
| Component      | `StockMovementForm` in `stock-movement-form.tsx` |
| Zod schema     | `createStockMovementSchema`                      |
| Prisma model   | `StockMovement`                                  |
| Database table | `stock_movements`                                |

If a concept is ever renamed, rename it in every layer in the same change.

## 6. TypeScript and code quality

- Strict mode is on. Never use `any`. Use `unknown` and narrow it, or write a
  proper type.
- Use `const` by default and `let` only when a value is reassigned. Never `var`.
- Prefer `type` aliases. Use `interface` only when you need to extend one.
- Add explicit return types to exported functions that are not React components.
- Use `async`/`await`, not `.then()` chains. Handle errors on purpose. Never leave
  an empty `catch` block.
- No magic numbers or strings. Give them named constants.
- Derive types from Prisma and Zod instead of writing them twice.
- Keep functions small and single-purpose. Split a file when it grows past about
  200 lines.
- Put a short comment above each function saying what it is for, and comment any
  non-obvious line. Longer explanations belong in the chat, not in the code.
- Before finishing, remove unused code, unused imports, and debug `console.log`
  calls.

## 7. Project structure (modular monolith)

```text
src/
  app/                  # Routes, layouts, pages. Keep thin: no business logic.
  components/
    ui/                 # shadcn/ui components
                        # Shared components used by several features go here too
  hooks/                # Hooks shared by several features
  modules/
    products/           # One folder per feature (names: see section 5)
      components/       # Components used only by this feature
      actions.ts        # Server Actions (called from forms and UI)
      service.ts        # Business logic and database access for this feature
      schemas.ts        # Zod schemas and inferred types
      types.ts          # Types for this feature (only when needed)
      constants.ts      # Constants for this feature (only when needed)
    stock-movements/
    auth/
  lib/
    db.ts               # The single shared Prisma client (uses the active database)
                        # Auth helpers and utilities go here too
prisma/
  postgresql/
    schema.prisma       # Database file 1: PostgreSQL (see section 8)
    migrations/
  mysql/
    schema.prisma       # Database file 2: MySQL (see section 8)
    migrations/
  seed.ts
```

- Pages and components never import Prisma directly. Only `service.ts` files talk
  to the database.
- A Server Action validates input with Zod, checks permissions, then calls a
  service function.
- A feature module uses another module only through its exported service
  functions, never its internals.
- Use Server Components by default. Add `"use client"` only when a component needs
  state, effects, or browser events.

## 8. Database files (PostgreSQL and MySQL)

This project supports two databases. Each has its own database file, and the two
files must always match.

- **Database file 1 (PostgreSQL):** `prisma/postgresql/schema.prisma`
- **Database file 2 (MySQL):** `prisma/mysql/schema.prisma`
- Each folder also has its own `migrations/` folder. Migrations are specific to one
  engine, so never copy them from one folder to the other.

### Always write to both

- Every database change (table, column, index, enum, or relation) is written to
  BOTH database files and BOTH migration folders, in the same task and the same
  commit. Never finish a task that changed only one of them.
- Give the two migrations the same snake_case name (for example
  `add_stock_movements`). Only the automatic timestamp prefix may differ.
- If a change cannot be made the same way on both engines, stop and tell me why
  before writing anything.
- The seed script (`prisma/seed.ts`) and the app code must work on both engines.
  Test every change on both.

### The two files must be written the same way

Only the `datasource` and `generator` blocks (provider and generated client path)
may differ. Native type attributes (for example `@db.Text`) may differ only when an
engine truly needs it. Everything else is identical:

- Same names for every model, enum, field, index, and constraint, following the
  naming conventions in section 4.
- Same order: enums first, then models, both alphabetical. Inside a model: `id`,
  then `companyId` (for company data), then the business fields, then `createdAt`
  and `updatedAt`, then relations, then block attributes (`@@index`, `@@unique`,
  `@@map`).
- Same formatting and comments. Run `prisma format` on both files.
- Give every index, unique constraint, and foreign key an explicit name with
  `map:` so the engines do not invent different names. Pattern:
  `idx_<table>_<columns>`, `uq_<table>_<columns>`, `fk_<table>_<column>`, in
  snake_case and under 60 characters (PostgreSQL allows 63, MySQL 64).
- Mark any allowed difference with a comment, `// ENGINE DIFFERENCE: <reason>`,
  and tell me about it.

### Keep the code portable

- Use only features that work on both engines. No PostgreSQL-only features (such
  as array columns or `mode: "insensitive"` filters) and no engine-specific raw
  SQL.
- Text comparison is case-sensitive in PostgreSQL but usually case-insensitive in
  MySQL. Normalize values that must be unique (for example, store SKUs in
  uppercase) so both engines behave the same.
- Money is `Decimal` with the same precision in both files (for example
  `@db.Decimal(12, 2)`).
- The app uses one database at a time. Before wiring how it chooses between the
  two (for example with an environment variable), explain the options and wait for
  my approval.

## 9. Business rules (never break these)

1. **Multi-tenancy:** every business table has an indexed `companyId`. Every query
   is filtered by the logged-in user's company through one central helper. Take
   `companyId` from the server session, never from client input.
2. **Inventory is a ledger:** never overwrite a stock quantity. Record every
   change as a `StockMovement` (IN, OUT, ADJUSTMENT) and calculate current stock
   from the movements. Use `prisma.$transaction` when one action writes to several
   tables.
3. **Money:** use `Decimal` in Prisma. Never use `number` (floating point) for
   money. Format values for display only in the UI layer.
4. **Permissions:** roles are OWNER, MANAGER, and STAFF. Check permissions on the
   server for every action, not only in the UI.
5. **Validation:** validate all input with Zod on the server, even when the client
   already validated it.
6. **Deleting:** archive products (soft delete). Do not hard-delete business
   records.
7. **Audit log:** record who did what and when for important actions (stock
   changes, role changes, product edits).
8. **Secrets:** keep them in `.env.local`, never commit them, and never expose
   server-only values to the browser.
9. **If PostgreSQL runs on Supabase, use it only as a database.** Connect from the
   server only, and keep the Supabase Data API disabled (or enable Row Level
   Security on every table).
10. **Raw SQL:** avoid it. If it is unavoidable, always use parameterized queries.

## 10. UI conventions

- Use shadcn/ui components first, then Tailwind utility classes. No inline `style`
  unless there is no alternative.
- Merge class names with the `cn()` helper.
- Build mobile-first, responsive layouts.
- Be accessible by default: every input has a label, icon-only buttons have an
  `aria-label`, and forms show clear error messages.

## 11. Before you say a task is done

1. Format, lint, and type-check all pass. Use the scripts in `package.json`, and
   add `format` (`prettier --write .`) and `typecheck` (`tsc --noEmit`) if they
   are missing.
2. The app still builds when the change is more than trivial.
3. You have told me exactly how to test the change and what I should see.
4. If the database changed, both database files and both migrations are updated and
   match in names and structure (section 8).
5. You have suggested a Conventional Commit message for the change.
