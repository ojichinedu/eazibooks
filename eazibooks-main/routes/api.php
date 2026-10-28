<?php
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
Route::get('/health', function () {
 try { DB::connection()->getPdo(); return response()->json(['application'=>config('app.name'),'status'=>'ok','database'=>'ok']); }
 catch (Throwable $exception) { report($exception); return response()->json(['application'=>config('app.name'),'status'=>'degraded','database'=>'unavailable'],503); }
})->name('api.health');