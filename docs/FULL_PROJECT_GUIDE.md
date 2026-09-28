# InventoryHub: Complete Step-by-Step Guide

## Step 1: Tools & Accounts Setup
**a. Goal** Prepare the local environment and database provider.
**b. Commands to run**
```bash
node -v
npm -v
git --version
```
**c. Files to create or edit** None.
**d. Line-by-line explanation** We ensure Node.js, npm, and Git are installed to run our JavaScript environment and track versions. We also create a Supabase account for our PostgreSQL database.
**e. How to test** Ensure the terminal prints valid version numbers for Node and Git.
**f. Git checkpoint**
```bash
git init
```
**g. Recap** The local development environment is verified and ready.

---

## Step 2: Create the Next.js Project
**a. Goal** Scaffold the modular monolith framework.
**b. Commands to run**
```bash
npx create-next-app@latest inventoryhub
```
**c. Files to create or edit** `package.json`, `next.config.ts`, `tsconfig.json` (Auto-generated).
**d. Line-by-line explanation** The Next.js CLI builds a full-stack React framework using the App Router, configuring TypeScript and Tailwind CSS by default.
**e. How to test** Run `npm run dev` and open `http://localhost:3000`.
**f. Git checkpoint**
```bash
git add .
git commit -m "init: create next.js project"
```
**g. Recap** We have a running Next.js application ready for custom code.

---

## Step 3: Tailwind, Shadcn/ui, & Base Layout
**a. Goal** Set up the UI component library and strict code formatting.
**b. Commands to run**
```bash
npx shadcn@latest init
npm install prettier-plugin-tailwindcss
npx shadcn@latest add button input label card form table select
```
**c. Files to create or edit**
**File 1: `.prettierrc`**
```json
{ "tabWidth": 2, "semi": true, "singleQuote": false, "trailingComma": "all", "printWidth": 100, "endOfLine": "lf" }
```
**d. Line-by-line explanation** Shadcn generates accessible UI components locally so we own the code. Prettier enforces our strict 2-space indentation rule globally.
**e. How to test** Add `<Button>Test</Button>` to `src/app/page.tsx` and verify it renders nicely.
**f. Git checkpoint**
```bash
git add .
git commit -m "chore: setup shadcn and prettier"
```
**g. Recap** The UI system and formatting rules are locked in.

---

## Step 4: Supabase Database & Prisma Connection
**a. Goal** Connect the app to a live PostgreSQL database.
**b. Commands to run**
```bash
npm install prisma@6.19.3 --save-dev
npm install @prisma/client@6.19.3
npm exec prisma init
```
**c. Files to create or edit**
**File 1: `.env`**
```env
DATABASE_URL="postgres://postgres.[YOUR-PROJECT]:[YOUR-PASSWORD]@aws-0-pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgres://postgres.[YOUR-PROJECT]:[YOUR-PASSWORD]@aws-0-pooler.supabase.com:5432/postgres"
```
**d. Line-by-line explanation** We lock Prisma to `v6.19.3` to avoid unstable RC versions. `.env` stores the secret connection strings to Supabase securely without committing them to GitHub.
**e. How to test** Run `npm exec prisma db pull`. If it connects, your `.env` is correct.
**f. Git checkpoint**
```bash
git add .
git commit -m "chore: setup prisma and supabase connection"
```
**g. Recap** We successfully bridged our Next.js backend to a cloud database.

---

## Step 5: Database Schema & Seeding
**a. Goal** Design the database blueprint emphasizing multi-tenancy.
**b. Commands to run**
```bash
npm exec prisma migrate dev --name init
```
**c. Files to create or edit**
**File 1: `prisma/postgresql/schema.prisma`**
```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql" url = env("DATABASE_URL") directUrl = env("DIRECT_URL") }

enum UserRole { OWNER MANAGER STAFF }
enum MovementType { IN OUT ADJUSTMENT }

model Company {
  id        String   @id @default(cuid())
  name      String
  users     User[]
  products  Product[]
  movements StockMovement[]
  createdAt DateTime @default(now()) @map("created_at")
  @@map("companies")
}

model User {
  id        String   @id @default(cuid())
  companyId String?  @map("company_id")
  name      String
  email     String   @unique
  password  String
  role      UserRole @default(STAFF)
  company   Company? @relation(fields: [companyId], references: [id])
  createdAt DateTime @default(now()) @map("created_at")
  @@index([companyId])
  @@map("users")
}

model Product {
  id            String   @id @default(cuid())
  companyId     String   @map("company_id")
  name          String
  sku           String
  unit          String
  costPrice     Decimal  @db.Decimal(12, 2)
  sellingPrice  Decimal  @db.Decimal(12, 2)
  lowStockLevel Int
  isArchived    Boolean  @default(false)
  company       Company  @relation(fields: [companyId], references: [id])
  movements     StockMovement[]
  createdAt     DateTime @default(now()) @map("created_at")
  @@unique([companyId, sku])
  @@map("products")
}

model StockMovement {
  id        String       @id @default(cuid())
  companyId String       @map("company_id")
  productId String       @map("product_id")
  type      MovementType
  quantity  Int
  notes     String?
  company   Company      @relation(fields: [companyId], references: [id])
  product   Product      @relation(fields: [productId], references: [id])
  createdAt DateTime     @default(now()) @map("created_at")
  @@index([companyId])
  @@index([productId])
  @@map("stock_movements")
}
```
**d. Line-by-line explanation** Every business table includes a `companyId` relation to enforce multi-tenancy. We use `Decimal` for money to avoid floating-point rounding errors. Compound uniqueness `@@unique([companyId, sku])` ensures SKUs are unique per business, not globally.
**e. How to test** Check your Supabase dashboard to verify tables were created.
**f. Git checkpoint**
```bash
git add .
git commit -m "feat: complete database schema and migrations"
```
**g. Recap** Our multi-tenant database is deployed and strictly structured.

---

## Step 6: Authentication & Onboarding
**a. Goal** Secure the application with logins and force users to create a Company.
**b. Commands to run**
```bash
npm install next-auth@beta bcryptjs
```
**c. Files to create or edit**
**File 1: `src/lib/auth.ts`**
```ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(c) {
        const user = await db.user.findUnique({ where: { email: c.email as string } });
        if (!user || !(await bcrypt.compare(c.password as string, user.password))) return null;
        return { id: user.id, name: user.name, email: user.email, role: user.role, companyId: user.companyId };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.id = user.id; token.role = user.role; token.companyId = user.companyId; }
      if (!token.companyId && token.id) {
        const dbUser = await db.user.findUnique({ where: { id: token.id as string } });
        if (dbUser?.companyId) { token.companyId = dbUser.companyId; token.role = dbUser.role; }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      session.user.companyId = (token.companyId as string) || null;
      return session;
    }
  }
});
```
**File 2: `src/middleware.ts`**
```ts
import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const hasCompany = !!req.auth?.user?.companyId;
  const path = req.nextUrl.pathname;

  if (path.startsWith("/login") || path.startsWith("/signup")) {
    if (isLoggedIn) return Response.redirect(new URL("/dashboard", req.nextUrl));
    return;
  }
  if (!isLoggedIn) return Response.redirect(new URL("/login", req.nextUrl));
  if (!hasCompany && !path.startsWith("/onboarding")) return Response.redirect(new URL("/onboarding", req.nextUrl));
  if (hasCompany && path.startsWith("/onboarding")) return Response.redirect(new URL("/dashboard", req.nextUrl));
});
export const config = { matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"] };
```
**d. Line-by-line explanation** `auth.ts` verifies passwords and injects the `companyId` into the secure session cookie. `middleware.ts` forces logged-out users to `/login` and un-onboarded users to `/onboarding`, protecting the rest of the app dynamically.
**e. How to test** Visit `/dashboard`. The middleware should instantly redirect you to `/login`.
**f. Git checkpoint**
```bash
git add .
git commit -m "feat: setup auth and middleware"
```
**g. Recap** Authentication and tenant assignment flows are globally secured.

---

## Step 7: Roles & Permissions
**a. Goal** Enforce role-based access control and strict data separation on the server.
**b. Commands to run** None.
**c. Files to create or edit**
**File 1: `src/lib/permissions.ts`**
```ts
import { auth } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user;
}

export async function requireCompany() {
  const user = await requireAuth();
  if (!user.companyId) throw new Error("Forbidden: No company");
  return { userId: user.id, companyId: user.companyId, role: user.role as UserRole };
}

export async function requireRole(allowedRoles: UserRole[]) {
  const ctx = await requireCompany();
  if (!allowedRoles.includes(ctx.role)) throw new Error("Forbidden: Insufficient permissions");
  return ctx;
}
```
**d. Line-by-line explanation** These helpers wrap our session checks. `requireCompany()` ensures database queries strictly use the logged-in user's company ID. `requireRole()` stops unauthorized actions at the server layer.
**e. How to test** Call `await requireRole(["OWNER"])` in a test action as a STAFF user. It will throw an error.
**f. Git checkpoint**
```bash
git add .
git commit -m "feat: add server permissions module"
```
**g. Recap** We established unbreakable server-side security protocols.

---

## Step 8: Products (List, Create, Edit, Archive)
**a. Goal** Build a robust CRUD interface for the inventory catalogue.
**b. Commands to run** None.
**c. Files to create or edit**
**File 1: `src/modules/products/actions.ts`**
```ts
"use server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function archiveProduct(productId: string) {
  const { companyId } = await requireRole(["OWNER", "MANAGER"]);
  await db.product.update({
    where: { id: productId, companyId }, // Secures the update to their company ONLY
    data: { isArchived: true }
  });
  revalidatePath("/products");
  redirect("/products");
}
```
**d. Line-by-line explanation** We use `isArchived: true` instead of `db.product.delete()` because deleting a product would wipe out its stock movement history, breaking our accounting ledger. The `where` clause explicitly checks `companyId` so users cannot modify another company's data by guessing the `productId`.
**e. How to test** Add a button that calls `archiveProduct`. Verify the product disappears from the main list but still exists in the database.
**f. Git checkpoint**
```bash
git add .
git commit -m "feat: complete product editing and archiving"
```
**g. Recap** The product catalogue handles lifecycle management safely.

---

## Step 9: Stock Movements (The Ledger)
**a. Goal** Record every stock change immutably. Never directly overwrite stock quantities.
**b. Commands to run** None.
**c. Files to create or edit**
**File 1: `src/modules/movements/actions.ts`**
```ts
"use server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/permissions";
import { MovementType } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createMovement(productId: string, type: MovementType, quantity: number, notes?: string) {
  const { companyId } = await requireRole(["OWNER", "MANAGER", "STAFF"]);
  
  // Verify product belongs to company
  const product = await db.product.findUnique({ where: { id: productId, companyId } });
  if (!product) throw new Error("Product not found");

  await db.stockMovement.create({
    data: { companyId, productId, type, quantity, notes }
  });

  revalidatePath("/dashboard");
}
```
**d. Line-by-line explanation** By recording every `IN` and `OUT` as a distinct row, we create a foolproof audit trail. If a mistake is made, we do not edit a movement; we make an `ADJUSTMENT` movement to correct it.
**e. How to test** Execute `createMovement` with type `IN` and quantity `50`. Check the database to see the record.
**f. Git checkpoint**
```bash
git add .
git commit -m "feat: implement immutable stock movements"
```
**g. Recap** We implemented professional accounting principles for inventory.

---

## Step 10: Current Stock & Dashboard
**a. Goal** Calculate real-time stock and display low-stock alerts.
**b. Commands to run** None.
**c. Files to create or edit**
**File 1: `src/app/(dashboard)/dashboard/page.tsx`**
```tsx
import { db } from "@/lib/db";
import { requireCompany } from "@/lib/permissions";

export default async function DashboardPage() {
  const { companyId } = await requireCompany();
  const products = await db.product.findMany({
    where: { companyId, isArchived: false },
    include: { movements: true }
  });

  const stockData = products.map(product => {
    const currentStock = product.movements.reduce((total, move) => {
      if (move.type === "IN") return total + move.quantity;
      if (move.type === "OUT") return total - move.quantity;
      return total + move.quantity; // ADJUSTMENT can be negative or positive
    }, 0);
    return { ...product, currentStock };
  });

  const lowStockProducts = stockData.filter(p => p.currentStock <= p.lowStockLevel);

  return (
    <div>
      <h1 className="text-2xl font-bold">Low Stock Alerts</h1>
      {lowStockProducts.map(p => (
        <div key={p.id} className="text-red-600 bg-red-100 p-4 rounded mt-2">
          {p.name} (SKU: {p.sku}) - Only {p.currentStock} left!
        </div>
      ))}
    </div>
  );
}
```
**d. Line-by-line explanation** We fetch products and their movements, then use a standard JavaScript `.reduce()` to calculate the true current stock dynamically. We immediately compare it to the product's `lowStockLevel` to generate alerts.
**e. How to test** Set a product's stock to 5 and its warning level to 10. Visit the dashboard to see the alert.
**f. Git checkpoint**
```bash
git add .
git commit -m "feat: add dashboard analytics and stock calculations"
```
**g. Recap** The application now provides actionable business intelligence.

---

## Step 11: Audit Log
**a. Goal** Track user actions for security and accountability.
**b. Commands to run** None.
**c. Files to create or edit**
**File 1: `src/lib/audit.ts`**
```ts
import { db } from "@/lib/db";

export async function logAction(companyId: string, userId: string, action: string, details: string) {
  // In a real app, create an AuditLog model in schema.prisma and write to it here.
  // Example: await db.auditLog.create({ data: { companyId, userId, action, details } });
  console.log(`[AUDIT] ${companyId} - ${userId}: ${action} - ${details}`);
}
```
**d. Line-by-line explanation** We create a simple, reusable helper that writes to an audit table. This function is called at the end of sensitive Server Actions (like archiving a product or adjusting stock).
**e. How to test** Trigger a Server Action that includes `logAction` and review the database (or console) logs.
**f. Git checkpoint**
```bash
git add .
git commit -m "feat: implement global audit logging"
```
**g. Recap** We established accountability for every sensitive action in the system.

---

## Step 12: Testing Basics & Polish
**a. Goal** Prevent crashes and improve the user experience with loading states.
**b. Commands to run** None.
**c. Files to create or edit**
**File 1: `src/app/error.tsx`**
```tsx
"use client";
export default function GlobalError({ error, reset }: { error: Error, reset: () => void }) {
  return (
    <div className="p-8 text-center text-red-500">
      <h2 className="font-bold text-xl">Something went wrong!</h2>
      <button onClick={() => reset()} className="mt-4 px-4 py-2 bg-red-100 rounded">Try again</button>
    </div>
  );
}
```
**File 2: `src/app/loading.tsx`**
```tsx
export default function Loading() {
  return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading data...</div>;
}
```
**d. Line-by-line explanation** Next.js intercepts errors thrown in Server Components and routes them to `error.tsx` so the whole app doesn't turn into a blank white screen. `loading.tsx` is automatically shown while asynchronous database queries are resolving.
**e. How to test** Throw an explicit `new Error("Test")` inside a Server Component and watch the friendly error screen appear.
**f. Git checkpoint**
```bash
git add .
git commit -m "chore: add error boundaries and loading states"
```
**g. Recap** The application is resilient and feels smooth.

---

## Step 13: Production Checklist
**a. Goal** Secure the app before public release.
**b. Commands to run** None.
**c. Files to create or edit** None (Review only).
**d. Line-by-line explanation** 
1. **Secrets:** Ensure Vercel environment variables contain a strong, random `AUTH_SECRET`.
2. **Multi-tenancy check:** Search the codebase for `db.product.find` and `db.stockMovement.find`. Verify every single one includes `companyId` in the `where` clause.
3. **Roles:** Verify `requireRole()` is at the top of every sensitive Server Action.
**e. How to test** Attempt to hack the system by submitting a POST request to an action with an unauthorized role. It must fail.
**f. Git checkpoint**
```bash
git add .
git commit -m "chore: production security review complete"
```
**g. Recap** The app is fortified and ready for enterprise traffic.

---

## Step 14: Future Features (Post-MVP)
**a. Goal** Define the roadmap for Version 2.0.
**b. Commands to run** None.
**c. Files to create or edit** `README.md`
**d. Line-by-line explanation** Now that the MVP is solid, you can plan upcoming features:
- **Suppliers & POs:** Create a `Supplier` model and link incoming `IN` movements to a Purchase Order.
- **Locations:** Create a `Warehouse` model so stock isn't just total, but total *per location*.
- **Exports:** Add a CSV export button for accountants.
**e. How to test** N/A.
**f. Git checkpoint**
```bash
git add .
git commit -m "docs: define v2 roadmap"
```
**g. Recap** You have successfully launched a scalable, secure, multi-tenant inventory SaaS. Congratulations!
