<?php

namespace App\Services;

class CaptureParser
{
    public function parse(string $text, string $channel): array
    {
        $normalized = trim(preg_replace('/\s+/', ' ', $text));
        $amount = null;
        if (preg_match('/(?:₦|NGN|N)?\s*([0-9][0-9,]*(?:\.\d{1,2})?)/iu', $normalized, $matches)) {
            $amount = (float) str_replace(',', '', $matches[1]);
        }

        $lower = mb_strtolower($normalized);
        $incomeWords = ['sold', 'sale', 'received', 'income', 'payment received', 'credit'];
        $expenseWords = ['bought', 'paid', 'spent', 'expense', 'purchase', 'debit'];
        $direction = null;
        foreach ($incomeWords as $word) if (str_contains($lower, $word)) $direction = 'in';
        foreach ($expenseWords as $word) if (str_contains($lower, $word)) $direction = 'out';

        $confidence = $amount && $direction ? 0.90 : ($amount ? 0.55 : 0.20);
        return [
            'amount' => $amount,
            'direction' => $direction,
            'note' => $normalized ?: null,
            'occurred_at' => now()->toDateString(),
            'channel' => $channel,
            'parser' => config('liege.capture.mode', 'local') === 'production' ? 'provider-pending' : 'local-rules',
        ] + ['confidence' => $confidence];
    }
}