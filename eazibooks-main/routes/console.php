<?php

use App\Models\BusinessRecord;
use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

Artisan::command('app:about', function () {
    $this->comment('EaziBook Laravel app is ready.');
})->purpose('Show application status');

Artisan::command('app:import-supabase {file} {email} {sourceCompany}', function () {
    $path = $this->argument('file');
    if (!is_file($path)) {
        $this->error('JSON export file not found.');
        return 1;
    }

    $export = json_decode(file_get_contents($path), true);
    if (!is_array($export)) {
        $this->error('Export must be a JSON object whose values are arrays of table rows.');
        return 1;
    }

    $user = User::where('email', $this->argument('email'))->first();
    if (!$user) {
        $this->error('Create the Laravel account first, then import its company data.');
        return 1;
    }

    $sourceCompany = (string) $this->argument('sourceCompany');
    $allowed = ['companies','customers','suppliers','products','employees','invoices','invoice_items','bills','bill_items','payments','transactions','chart_of_accounts','journal_entries','journal_entry_lines','inventory_movements','payroll_runs','payroll_items','tax_returns','notifications','activity_log','attachments'];
    $counts = [];

    DB::transaction(function () use ($export, $user, $sourceCompany, $allowed, &$counts): void {
        foreach ($allowed as $table) {
            $rows = $export[$table] ?? [];
            if (!is_array($rows)) continue;
            foreach ($rows as $row) {
                if (!is_array($row)) continue;
                if (isset($row['company_id']) && (string) $row['company_id'] !== $sourceCompany) continue;
                if ($table === 'companies' && isset($row['id']) && (string) $row['id'] !== $sourceCompany) continue;
                if ($table === 'companies') $row['id'] = (string) $user->company_id;
                $row['company_id'] = (string) $user->company_id;
                if (isset($row['created_by'])) $row['created_by'] = (string) $user->id;
                if ($table === 'subscriptions') $row['user_id'] = (string) $user->id;
                $id = (string) ($row['id'] ?? Str::uuid());
                $row['id'] = $id;
                $row['updated_at'] = $row['updated_at'] ?? now()->toISOString();
                $row['created_at'] = $row['created_at'] ?? now()->toISOString();
                BusinessRecord::updateOrCreate(
                    ['id' => BusinessRecord::recordKey((string) $user->company_id, $table, $id)],
                    ['company_id' => (string) $user->company_id, 'table_name' => $table, 'payload' => $row]
                );
                $counts[$table] = ($counts[$table] ?? 0) + 1;
            }
        }
    });

    foreach ($counts as $table => $count) $this->line($table.': '.$count.' imported');
    $this->info('Import complete for '.$user->email.'.');
    return 0;
})->purpose('Import one company of exported Supabase rows into Laravel');