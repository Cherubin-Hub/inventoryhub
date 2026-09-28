# InventoryHub

A modern, multi-tenant inventory management system built with Next.js, Prisma, and Tailwind CSS. 

## Features Completed (v1.0 MVP)
- **Strict Multi-tenancy:** Complete data isolation between companies.
- **Role-Based Access Control:** (Owner, Manager, Staff) to protect sensitive actions.
- **Product Catalogue:** Full CRUD with compound unique SKU constraints.
- **Immutable Ledger:** Stock is calculated via IN/OUT/ADJUSTMENT movements.
- **Business Intelligence:** Real-time dashboard with automatic low-stock alerts.
- **Accountability:** Global Audit Log tracking sensitive server actions.

## Version 2.0 Roadmap (Coming Soon)
1. **Suppliers & Purchase Orders:** 
   - Link incoming stock (`IN` movements) directly to a specific vendor.
2. **Multiple Warehouses:** 
   - Add a `Location` model so stock isn't just a global total, but tracked per-store.
3. **CSV Exports:** 
   - Add a "Download Report" button for accountants to load the ledger into Microsoft Excel.
4. **Barcode Scanning:** 
   - Allow mobile cameras to scan a barcode and automatically pull up the Product form.

## How to run locally
1. `npm install`
2. Connect a PostgreSQL database in `.env`
3. `npx prisma db push`
4. `npm run dev`