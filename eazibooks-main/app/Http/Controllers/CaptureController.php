<?php

namespace App\Http\Controllers;

use App\Services\CaptureParser;
use App\Services\CaptureProcessor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CaptureController
{
    public function index(Request $request)
    {
        $business = $this->businessId($request);
        return response()->json(['data' => DB::table('capture_inputs')->where('business_id', $business)->orderByDesc('id')->limit(100)->get()]);
    }

    public function store(Request $request, CaptureProcessor $processor)
    {
        $business = $this->businessId($request);
        $data = $request->validate([
            'channel' => ['nullable', Rule::in(['text', 'receipt', 'voice', 'whatsapp'])],
            'text' => ['nullable', 'string', 'max:5000'],
            'media' => ['nullable', 'file', 'max:20480'],
        ]);
        abort_unless(!empty($data['text']) || $request->hasFile('media'), 422, 'Provide capture text or media.');
        $channel = $data['channel'] ?? ($request->hasFile('media') ? 'receipt' : 'text');
        $mediaPath = $request->hasFile('media') ? $request->file('media')->store('captures/'.$business) : null;
        $parsed = $parser->parse($data['text'] ?? '', $channel);
        $id = DB::table('capture_inputs')->insertGetId([
            'business_id' => $business,
            'channel' => $channel,
            'status' => 'needs_review',
            'payload' => json_encode(['text' => $data['text'] ?? null, 'media_name' => $request->file('media')?->getClientOriginalName()]),
            'parsed_data' => json_encode($parsed),
            'confidence' => $parsed['confidence'],
            'media_path' => $mediaPath,
            'created_at' => now(), 'updated_at' => now(),
        ]);
        return response()->json(['data' => DB::table('capture_inputs')->find($id)], 201);
    }

    public function review(Request $request, int $captureId, LedgerController $ledger)
    {
        $business = $this->businessId($request);
        $capture = DB::table('capture_inputs')->where('business_id', $business)->where('id', $captureId)->first();
        abort_unless($capture, 404, 'Capture not found.');
        abort_if($capture->status === 'posted', 422, 'This capture has already been posted.');
        $data = $request->validate([
            'status' => ['required', Rule::in(['needs_review', 'rejected', 'approved'])],
            'amount' => ['required_if:status,approved', 'nullable', 'numeric', 'gt:0'],
            'direction' => ['required_if:status,approved', 'nullable', Rule::in(['in', 'out'])],
            'category_id' => ['required_if:status,approved', 'nullable', 'integer'],
            'note' => ['nullable', 'string', 'max:1000'],
            'occurred_at' => ['nullable', 'date'],
            'contact_id' => ['nullable', 'integer'],
        ]);
        $parsed = array_merge((array) json_decode($capture->parsed_data ?: '{}', true), array_filter($data, fn ($value) => $value !== null && $value !== ''));
        if ($data['status'] === 'approved') {
            $transaction = $ledger->postCapture($business, $request->user()->id, $captureId, $parsed);
            DB::table('capture_inputs')->where('id', $captureId)->update(['status' => 'posted', 'parsed_data' => json_encode($parsed), 'reviewed_at' => now(), 'reviewed_by' => $request->user()->id, 'updated_at' => now()]);
            return response()->json(['data' => ['capture' => DB::table('capture_inputs')->find($captureId), 'transaction' => $transaction]]);
        }
        DB::table('capture_inputs')->where('id', $captureId)->update(['status' => $data['status'], 'parsed_data' => json_encode($parsed), 'reviewed_at' => now(), 'reviewed_by' => $request->user()->id, 'updated_at' => now()]);
        return response()->json(['data' => DB::table('capture_inputs')->find($captureId)]);
    }

    public function whatsapp(Request $request, CaptureParser $parser)
    {
        if ($request->isMethod('get')) {
            abort_unless(hash_equals((string) config('liege.capture.meta_verify_token'), (string) $request->query('hub_verify_token')), 403);
            return response((string) $request->query('hub_challenge'));
        }
        $business = config('liege.capture.default_business_id');
        abort_unless($business, 422, 'Set LIEGE_META_DEFAULT_BUSINESS_ID or map a WhatsApp number to a business before enabling the webhook.');
        $text = data_get($request->all(), 'entry.0.changes.0.value.messages.0.text.body', '');
        $parsed = $parser->parse($text, 'whatsapp');
        DB::table('capture_inputs')->insert(['business_id' => $business, 'channel' => 'whatsapp', 'status' => 'needs_review', 'payload' => json_encode($request->all()), 'parsed_data' => json_encode($parsed), 'confidence' => $parsed['confidence'], 'created_at' => now(), 'updated_at' => now()]);
        return response()->json(['received' => true], 202);
    }

    private function businessId(Request $request): string
    {
        abort_unless($request->user()?->company_id, 422, 'Business context required.');
        return $request->user()->company_id;
    }
}