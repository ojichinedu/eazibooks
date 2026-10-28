<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="csrf-token" content="{{ csrf_token() }}">
<title>LIEGE - Ledger intelligence for growth</title>
@php
    $manifestPath = public_path('build/manifest.json');
    $manifest = file_exists($manifestPath) ? json_decode(file_get_contents($manifestPath), true) : [];
    $entry = $manifest['src/main.tsx'] ?? null;
@endphp
@if ($entry)
    @foreach (($entry['css'] ?? []) as $css)
        <link rel="stylesheet" href="{{ asset('build/' . $css) }}">
    @endforeach
    <script type="module" src="{{ asset('build/' . $entry['file']) }}"></script>
@else
    <p>Frontend assets are not built. Run <code>npm run build</code>.</p>
@endif
</head>
<body><div id="root"></div></body>
</html>
