<?php
namespace App\Http\Controllers;

use App\Models\BusinessRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BusinessDataController
{
    private array $tables = [
        'companies','profiles','subscriptions','customers','suppliers','products','employees',
        'invoices','invoice_items','bills','bill_items','payments','transactions','chart_of_accounts',
        'journal_entries','journal_entry_lines','inventory_movements','payroll_runs','payroll_items',
        'tax_returns','notifications','activity_log','attachments','kv_store_db10586b',
    ];

    public function query(Request $request, string $table)
    {
        abort_unless(in_array($table, $this->tables, true), 404);
        $company = (string) $request->user()->company_id;
        abort_if($company === '', 403, 'Account has no company.');
        $action = $request->input('action', 'select');
        $rows = BusinessRecord::where('company_id', $company)
            ->where('table_name', $table)->get()->map(fn ($record) => $record->payload)->all();

        if ($action === 'select') {
            $rows = array_values(array_filter($rows, fn ($row) => $this->matches($row, $request)));
            foreach ($request->input('or', []) as $expression) {
                $rows = array_values(array_filter($rows, fn ($row) => $this->matchesOr($row, $expression)));
            }
            foreach (array_reverse($request->input('orders', [])) as $order) {
                $field = $order['field'];
                $descending = ($order['ascending'] ?? true) === false;
                usort($rows, function ($a, $b) use ($field, $descending) {
                    $comparison = ($a[$field] ?? null) <=> ($b[$field] ?? null);
                    return $descending ? -$comparison : $comparison;
                });
            }
            $rows = array_slice($rows, (int) $request->input('offset', 0), min((int) $request->input('limit', 500), 500));
            $columns = (string) $request->input('columns', '*');
            $rows = array_map(fn ($row) => $this->project($row, $columns, $company, $table), $rows);
            return response()->json(['data' => $rows, 'error' => null]);
        }

        if ($action === 'insert' || $action === 'upsert') {
            $items = $request->input('values', []);
            if (!is_array($items)) $items = [$items];
            elseif (!array_is_list($items)) $items = [$items];
            $saved = [];
            foreach ($items as $item) {
                if (!is_array($item)) continue;
                $id = (string) ($item['id'] ?? Str::uuid());
                $storageId = BusinessRecord::recordKey($company, $table, $id); $existing = BusinessRecord::find($storageId);
                $row = array_merge($existing?->payload ?? [], $item, ['id' => $id, 'company_id' => $company]);
                $row['created_at'] = $row['created_at'] ?? now()->toISOString();
                $row['updated_at'] = now()->toISOString();
                BusinessRecord::updateOrCreate(['id' => $storageId], ['company_id' => $company, 'table_name' => $table, 'payload' => $row]);
                $saved[] = $row;
            }
            return response()->json(['data' => $request->boolean('returning') ? $saved : null, 'error' => null]);
        }

        $selected = array_values(array_filter($rows, fn ($row) => $this->matches($row, $request)));
        if ($action === 'update') {
            $values = $request->input('values', []);
            $saved = [];
            foreach ($selected as $row) {
                $row = array_merge($row, is_array($values) ? $values : [], ['id' => $row['id'], 'company_id' => $company, 'updated_at' => now()->toISOString()]);
                BusinessRecord::where('id', BusinessRecord::recordKey($company, $table, (string) $row['id']))->update(['payload' => $row]);
                $saved[] = $row;
            }
            return response()->json(['data' => $request->boolean('returning') ? $saved : null, 'error' => null]);
        }
        if ($action === 'delete') {
            $ids = array_map(fn ($id) => BusinessRecord::recordKey($company, $table, (string) $id), array_column($selected, 'id'));
            if ($ids) BusinessRecord::where('company_id', $company)->where('table_name', $table)->whereIn('id', $ids)->delete();
            return response()->json(['data' => null, 'error' => null]);
        }
        return response()->json(['data' => null, 'error' => ['message' => 'Unsupported data operation.']], 422);
    }

    private function matches(array $row, Request $request): bool
    {
        foreach ($request->input('filters', []) as $filter) {
            $actual = $row[$filter['field']] ?? null;
            $expected = $filter['value'] ?? null;
            $operator = $filter['operator'] ?? 'eq';
            $matches = match ($operator) {
                'eq' => (string) $actual === (string) $expected,
                'neq' => (string) $actual !== (string) $expected,
                'is' => $expected === null ? $actual === null : (string) $actual === (string) $expected,
                'in' => in_array((string) $actual, array_map('strval', $expected ?? []), true),
                'not_in' => !in_array((string) $actual, array_map('strval', $expected ?? []), true),
                'gt' => $actual > $expected, 'gte' => $actual >= $expected,
                'lt' => $actual < $expected, 'lte' => $actual <= $expected,
                'ilike', 'like' => stripos((string) $actual, str_replace('%', '', (string) $expected)) !== false,
                'not_ilike', 'not_like' => stripos((string) $actual, str_replace('%', '', (string) $expected)) === false,
                'contains' => is_array($actual) ? count(array_diff_assoc((array) $expected, $actual)) === 0 : str_contains((string) $actual, (string) $expected),
                default => true,
            };
            if (!$matches) return false;
        }
        return true;
    }

    private function matchesOr(array $row, string $expression): bool
    {
        foreach (explode(',', $expression) as $condition) {
            $parts = explode('.', $condition, 3);
            if (count($parts) < 3) continue;
            $actual = (string) ($row[$parts[0]] ?? '');
            $expected = trim($parts[2], '%');
            if (in_array($parts[1], ['ilike', 'like'], true) && stripos($actual, $expected) !== false) return true;
            if ($parts[1] === 'eq' && $actual === $expected) return true;
        }
        return false;
    }

    private function project(array $row, string $columns, string $company, string $table): array
    {
        if (trim($columns) === '*') return $row;
        preg_match_all('/(?:(\w+):)?([a-z_][a-z0-9_]*)(!inner)?\(([^)]*)\)/i', $columns, $relations, PREG_SET_ORDER);
        $remaining = preg_replace('/(?:(\w+):)?[a-z_][a-z0-9_]*!?inner?\([^)]*\)/i', '', $columns);
        $fields = array_filter(array_map('trim', explode(',', str_replace('!', '', (string) $remaining))));
        $result = in_array('*', $fields, true) ? $row : array_intersect_key($row, array_flip($fields));

        foreach ($relations as $relation) {
            $property = ($relation[1] ?? '') !== '' ? $relation[1] : $relation[2];
            $relatedTable = $relation[2];
            $relatedColumns = trim($relation[4] ?? '*');
            $foreignKey = match ($relatedTable) {
                'chart_of_accounts' => 'account_id',
                default => Str::singular($relatedTable).'_id',
            };
            $relatedRows = BusinessRecord::where('company_id', $company)->where('table_name', $relatedTable)
                ->get()->map(fn ($record) => $record->payload)->all();

            if (!empty($row[$foreignKey])) {
                $related = null;
                foreach ($relatedRows as $candidate) {
                    if ((string) ($candidate['id'] ?? '') === (string) $row[$foreignKey]) {
                        $related = $this->relatedProjection($candidate, $relatedColumns);
                        break;
                    }
                }
                $result[$property] = $related;
            } else {
                $parentKey = Str::singular($table).'_id';
                $result[$property] = array_values(array_map(
                    fn ($candidate) => $this->relatedProjection($candidate, $relatedColumns),
                    array_filter($relatedRows, fn ($candidate) => (string) ($candidate[$parentKey] ?? '') === (string) ($row['id'] ?? ''))
                ));
            }
        }
        return $result;
    }

    private function relatedProjection(array $row, string $columns): array
    {
        if ($columns === '*' || $columns === '') return $row;
        return array_intersect_key($row, array_flip(array_map('trim', explode(',', $columns))));
    }
}