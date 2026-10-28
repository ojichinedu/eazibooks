<?php

namespace App\Http\Controllers;

use App\Models\BusinessRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use LogicException;

class LedgerController
{
    public function accounts(Request $request)
    {
        $business = $this->businessId($request);
        $this->ensureDefaults($business);
        return response()->json(['data' => DB::table('accounts')->where('business_id', $business)->where('is_active', true)->orderBy('code')->get()]);
    }

    public function categories(Request $request)
    {
        $business = $this->businessId($request);
        $this->ensureDefaults($business);
        return response()->json(['data' => DB::table('categories')->where('business_id', $business)->orderBy('direction')->orderBy('name')->get()]);
    }

    public function contacts(Request $request)
    {
        $business = $this->businessId($request);
        return response()->json(['data' => DB::table('contacts')->where('business_id', $business)->orderBy('name')->get()]);
    }

    public function storeContact(Request $request)
    {
        $business = $this->businessId($request);
        $data = $request->validate(['name' => ['required', 'string', 'max:160'], 'type' => ['required', Rule::in(['customer', 'vendor'])], 'phone' => ['nullable', 'string', 'max:40'], 'email' => ['nullable', 'email', 'max:255']]);
        $id = DB::table('contacts')->insertGetId($data + ['business_id' => $business, 'created_at' => now(), 'updated_at' => now()]);
        return response()->json(['data' => DB::table('contacts')->find($id)], 201);
    }
    public function transactions(Request $request)
    {
        $business = $this->businessId($request);
        $query = DB::table('ledger_transactions as t')->leftJoin('categories as c', 'c.id', '=', 't.category_id')->where('t.business_id', $business);
        if ($request->filled('from')) $query->whereDate('t.occurred_at', '>=', $request->string('from'));
        if ($request->filled('to')) $query->whereDate('t.occurred_at', '<=', $request->string('to'));
        if ($request->filled('category_id')) $query->where('t.category_id', $request->integer('category_id'));
        if ($request->filled('q')) $query->where('t.note', 'like', '%'.$request->string('q').'%');
        return response()->json(['data' => $query->orderByDesc('t.occurred_at')->orderByDesc('t.id')->limit(100)->get(['t.*', 'c.name as category_name'])]);
    }

    public function summary(Request $request)
    {
        $business = $this->businessId($request);
        $totals = DB::table('ledger_transactions')->where('business_id', $business)->where('status', 'posted')->selectRaw("COALESCE(SUM(CASE WHEN direction = 'in' THEN amount ELSE 0 END),0) as income, COALESCE(SUM(CASE WHEN direction = 'out' THEN amount ELSE 0 END),0) as expenses")->first();
        return response()->json(['data' => ['income' => (float) $totals->income, 'expenses' => (float) $totals->expenses, 'balance' => (float) $totals->income - (float) $totals->expenses]]);
    }

    public function dashboard(Request $request)
    {
        $business = $this->businessId($request);
        $start = now()->startOfMonth();
        $previousStart = now()->subMonthNoOverflow()->startOfMonth();
        $income = fn ($from, $to) => (float) DB::table('ledger_transactions')
            ->where('business_id', $business)->where('status', 'posted')->where('direction', 'in')
            ->whereBetween('occurred_at', [$from->toDateString(), $to->toDateString()])->sum('amount');
        $currentIncome = $income($start, now());
        $previousIncome = $income($previousStart, $start->copy()->subDay());
        $records = BusinessRecord::where('company_id', $business)
            ->whereIn('table_name', ['products', 'invoices'])->get()->groupBy('table_name');
        $invoices = $records->get('invoices', collect())->map(fn ($record) => $record->payload);
        $openInvoices = $invoices->filter(fn ($invoice) => in_array($invoice['status'] ?? '', ['draft', 'sent'], true));
        $recentTransactions = DB::table('ledger_transactions as t')
            ->leftJoin('categories as c', 'c.id', '=', 't.category_id')
            ->where('t.business_id', $business)->where('t.status', 'posted')
            ->orderByDesc('t.occurred_at')->orderByDesc('t.id')->limit(5)
            ->get(['t.id', 't.direction', 't.amount', 't.note', 't.occurred_at', 'c.name as category_name'])
            ->map(fn ($transaction) => [
                'id' => 'ledger-'.$transaction->id,
                'message' => $transaction->note ?: (($transaction->direction === 'in' ? 'Income' : 'Expense').': '.($transaction->category_name ?: 'Uncategorised')),
                'time' => $transaction->occurred_at,
                'status' => $transaction->direction === 'in' ? 'success' : 'pending',
                'created_at' => $transaction->occurred_at,
            ]);

        return response()->json(['data' => [
            'revenue' => $currentIncome,
            'revenue_change' => $previousIncome > 0 ? round((($currentIncome - $previousIncome) / $previousIncome) * 100, 1) : null,
            'customers' => DB::table('contacts')->where('business_id', $business)->where('type', 'customer')->count(),
            'products' => $records->get('products', collect())->count(),
            'pending_invoices' => $openInvoices->count(),
            'overdue_invoices' => $invoices->filter(fn ($invoice) => ($invoice['status'] ?? '') === 'overdue')->count(),
            'draft_invoices' => $invoices->filter(fn ($invoice) => ($invoice['status'] ?? '') === 'draft')->count(),
            'pending_payments' => (float) $openInvoices->sum(fn ($invoice) => (float) ($invoice['balance_due'] ?? $invoice['total'] ?? 0)),
            'paid_this_month' => $currentIncome,
            'recent_activities' => $recentTransactions->values(),
        ]]);
    }    public function categoryBreakdown(Request $request)
    {
        $business = $this->businessId($request);
        $from = $request->input('from', now()->startOfMonth()->toDateString());
        $to = $request->input('to', now()->toDateString());
        $rows = DB::table('ledger_transactions as t')->join('categories as c', 'c.id', '=', 't.category_id')->where('t.business_id', $business)->where('t.status', 'posted')->whereBetween('t.occurred_at', [$from, $to])->groupBy('c.id', 'c.name', 'c.direction')->orderBy('c.direction')->orderByDesc('total')->get(['c.id', 'c.name', 'c.direction', DB::raw('SUM(t.amount) as total'), DB::raw('COUNT(*) as transactions')]);
        return response()->json(['data' => $rows, 'meta' => ['from' => $from, 'to' => $to]]);
    }
    public function store(Request $request)
    {
        $business = $this->businessId($request);
        $data = $request->validate($this->entryRules());
        return response()->json(['data' => $this->postEntry($business, $request->user()->id, $data)], 201);
    }

    public function postCapture(string $business, int $userId, int $captureId, array $data): object
    {
        $data = validator($data, $this->entryRules())->validate();
        return $this->postEntry($business, $userId, $data, 'capture', $captureId);
    }

    private function postEntry(string $business, int $userId, array $data, string $source = 'manual', ?int $captureId = null): object
    {
        $this->ensureDefaults($business);
        $category = DB::table('categories')->where('business_id', $business)->where('id', $data['category_id'])->first();
        abort_unless($category, 422, 'Category does not belong to this business.');
        $cash = DB::table('accounts')->where('business_id', $business)->where('code', '1000')->first();
        abort_unless($cash, 422, 'Default cash account is missing.');
        $amount = round((float) $data['amount'], 2);
        $id = DB::transaction(function () use ($business, $userId, $data, $category, $cash, $amount, $source, $captureId) {
            $transactionId = DB::table('ledger_transactions')->insertGetId([
                'business_id' => $business, 'created_by' => $userId, 'category_id' => $category->id, 'contact_id' => $data['contact_id'] ?? null, 'capture_input_id' => $captureId,
                'source' => $source, 'status' => 'posted', 'amount' => $amount, 'direction' => $data['direction'], 'note' => $data['note'] ?? null,
                'occurred_at' => $data['occurred_at'] ?? now()->toDateString(), 'created_at' => now(), 'updated_at' => now(),
            ]);
            $in = $data['direction'] === 'in';
            DB::table('transaction_entries')->insert([
                ['ledger_transaction_id' => $transactionId, 'account_id' => $in ? $cash->id : $category->account_id, 'debit' => $in ? 0 : $amount, 'credit' => $in ? $amount : 0, 'created_at' => now(), 'updated_at' => now()],
                ['ledger_transaction_id' => $transactionId, 'account_id' => $in ? $category->account_id : $cash->id, 'debit' => $in ? $amount : 0, 'credit' => $in ? 0 : $amount, 'created_at' => now(), 'updated_at' => now()],
            ]);
            $totals = DB::table('transaction_entries')->where('ledger_transaction_id', $transactionId)->selectRaw('SUM(debit) as debits, SUM(credit) as credits')->first();
            if (round((float) $totals->debits, 2) !== round((float) $totals->credits, 2)) throw new LogicException('Ledger entry is not balanced.');
            return $transactionId;
        });
        return DB::table('ledger_transactions')->find($id);
    }

    private function entryRules(): array
    {
        return ['amount' => ['required', 'numeric', 'gt:0'], 'direction' => ['required', Rule::in(['in', 'out'])], 'category_id' => ['required', 'integer'], 'note' => ['nullable', 'string', 'max:1000'], 'occurred_at' => ['nullable', 'date'], 'contact_id' => ['nullable', 'integer']];
    }

    private function businessId(Request $request): string
    {
        abort_unless($request->user()?->company_id, 422, 'Business context required.');
        return $request->user()->company_id;
    }

    private function ensureDefaults(string $business): void
    {
        if (!DB::table('businesses')->where('id', $business)->exists()) DB::table('businesses')->insert(['id' => $business, 'name' => 'My Business', 'currency' => 'NGN', 'created_at' => now(), 'updated_at' => now()]);
        if (!DB::table('accounts')->where('business_id', $business)->exists()) {
            $now = now();
            DB::table('accounts')->insert([
                ['business_id' => $business, 'code' => '1000', 'name' => 'Cash', 'type' => 'asset', 'created_at' => $now, 'updated_at' => $now],
                ['business_id' => $business, 'code' => '4000', 'name' => 'Income', 'type' => 'income', 'created_at' => $now, 'updated_at' => $now],
                ['business_id' => $business, 'code' => '5000', 'name' => 'Expenses', 'type' => 'expense', 'created_at' => $now, 'updated_at' => $now],
            ]);
            $expense = DB::table('accounts')->where('business_id', $business)->where('code', '5000')->value('id');
            $income = DB::table('accounts')->where('business_id', $business)->where('code', '4000')->value('id');
            DB::table('categories')->insert([
                ['business_id' => $business, 'name' => 'Sales', 'direction' => 'income', 'account_id' => $income, 'created_at' => $now, 'updated_at' => $now],
                ['business_id' => $business, 'name' => 'General Expense', 'direction' => 'expense', 'account_id' => $expense, 'created_at' => $now, 'updated_at' => $now],
            ]);
        }
    }
}