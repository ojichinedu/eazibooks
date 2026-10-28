<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Symfony\Component\Process\Process;

class CaptureProcessor
{
    public function __construct(private CaptureParser $parser) {}

    public function process(?UploadedFile $file, string $channel, string $text = ''): array
    {
        if (!$file) return $this->parser->parse($text, $channel);
        if (config('liege.capture.mode', 'local') !== 'production') {
            return match ($channel) {
                'receipt' => $this->readReceiptLocally($file),
                'voice' => $this->transcribeLocally($file),
                default => $this->parser->parse($text, $channel),
            };
        }
        return match ($channel) {
            'voice' => $this->transcribe($file),
            'receipt' => $this->readReceipt($file),
            default => $this->parser->parse($text, $channel),
        };
    }

    private function readReceiptLocally(UploadedFile $file): array
    {
        $binary = 'C:\\Program Files\\Tesseract-OCR\\tesseract.exe';
        if (!is_file($binary)) return array_merge($this->parser->parse('', 'receipt'), ['parser' => 'local-manual-review', 'note' => 'Receipt saved; local OCR is unavailable.']);
        $process = new Process([$binary, $file->getRealPath(), 'stdout', '-l', 'eng']);
        $process->setTimeout(30)->run();
        if (!$process->isSuccessful()) return array_merge($this->parser->parse('', 'receipt'), ['parser' => 'local-manual-review', 'note' => 'Receipt saved; OCR could not read this file.']);
        return array_merge($this->parser->parse($process->getOutput(), 'receipt'), ['parser' => 'tesseract']);
    }

    private function transcribeLocally(UploadedFile $file): array
    {
        $directory = storage_path('app/captures/transcripts');
        if (!is_dir($directory)) mkdir($directory, 0775, true);
        $output = $directory.'/'.pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME).'.txt';
        if (is_file($output)) unlink($output);
        $process = new Process(['py', '-3', '-X', 'utf8', '-m', 'whisper', $file->getRealPath(), '--model', 'tiny', '--language', 'en', '--output_format', 'txt', '--output_dir', $directory, '--fp16', 'False']);
        $process->setTimeout(240)->run();
        if (!$process->isSuccessful() || !is_file($output)) return array_merge($this->parser->parse('', 'voice'), ['parser' => 'local-manual-review', 'note' => 'Audio saved; local transcription could not complete.']);
        return array_merge($this->parser->parse((string) file_get_contents($output), 'voice'), ['parser' => 'whisper-tiny-local']);
    }
    private function transcribe(UploadedFile $file): array
    {
        $key = config('liege.capture.openai_api_key');
        if (!$key) throw new RuntimeException('OPENAI_API_KEY is required for voice capture.');
        $response = Http::withToken($key)->attach('file', file_get_contents($file->getRealPath()), $file->getClientOriginalName())->post('https://api.openai.com/v1/audio/transcriptions', ['model' => 'gpt-4o-mini-transcribe']);
        $response->throw();
        return $this->parser->parse((string) $response->json('text'), 'voice');
    }

    private function readReceipt(UploadedFile $file): array
    {
        $key = config('liege.capture.google_vision_api_key');
        if (!$key) throw new RuntimeException('GOOGLE_VISION_API_KEY is required for receipt capture.');
        $response = Http::post('https://vision.googleapis.com/v1/images:annotate?key='.$key, ['requests' => [['image' => ['content' => base64_encode(file_get_contents($file->getRealPath()))], 'features' => [['type' => 'DOCUMENT_TEXT_DETECTION']]]]]);
        $response->throw();
        return $this->parser->parse((string) data_get($response->json(), 'responses.0.fullTextAnnotation.text', ''), 'receipt');
    }
}