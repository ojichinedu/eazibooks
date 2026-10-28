# EaziBook

EaziBook is a Laravel 13 application with the existing React interface. Laravel handles account registration, sign-in, sessions, company-scoped business records, and file uploads. SQLite is the default database.

## Requirements
- PHP 8.3 or newer with PDO SQLite enabled
- Composer 2
- Node.js 20 or newer and npm

## Local setup
1. Run composer install.
2. Copy .env.example to .env.
3. Run php artisan key:generate.
4. Run php artisan migrate.
5. Run php artisan storage:link.
6. Run npm install.
7. Run npm run build.
8. Start php artisan serve.
9. Open http://127.0.0.1:8000.

The JSON API is under /api. GET /api/health checks Laravel and the database. Run npm run build after frontend source changes and point the web server document root to public/.

## Importing existing Supabase records
Register a Laravel account first. Export one company's data from Supabase as a JSON object whose keys are table names and whose values are arrays of rows. Then run php artisan app:import-supabase path-to-export.json account@example.com OLD_COMPANY_ID. The importer skips rows from other companies and assigns the selected Laravel account's company ID.

Supabase password hashes cannot be reused by Laravel. Existing users need to register with Laravel; the import does not copy user accounts or passwords.
## LIEGE Phase 1

This Laravel build follows the LIEGE model: capture-first bookkeeping backed by a balanced double-entry ledger. The first workflow is the manual quick entry screen, with Laravel owning authentication, business data, chart of accounts, categories, transactions, and capture review records.

Run locally:

```bash
php artisan migrate
npm run build
php artisan serve
```

Phase 1 API endpoints include `/api/ledger/summary`, `/api/ledger/accounts`, `/api/ledger/categories`, `/api/ledger/transactions`, and the WhatsApp capture stub at `/api/capture/whatsapp`.

## Local capture mode (no provider keys)

The default `LIEGE_CAPTURE_MODE=local` lets you test Phase 1 without Meta, OpenAI, or Google credentials. Sign in, open **Ledger capture**, and enter a text capture such as `Sold shoes NGN 12500` or upload a receipt/audio file. Text is parsed with local rules; uploaded files are retained locally and placed in the review inbox. Use **Edit & approve** to enter/correct the amount, direction, category, date, and note before it posts a balanced double-entry transaction.

To enable cloud processing later, add the provider keys to `.env` and switch `LIEGE_CAPTURE_MODE=production`.