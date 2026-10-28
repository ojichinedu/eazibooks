<?php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BusinessDataController;
use App\Http\Controllers\StorageController;
use App\Http\Controllers\LedgerController;
use App\Http\Controllers\CaptureController;
use Illuminate\Support\Facades\Route;
Route::view('/', 'app')->name('home');
Route::prefix('api')->group(function () {
    Route::get('/health', fn () => response()->json(['application' => config('app.name'), 'status' => 'ok', 'database' => 'ok']));
    Route::get('/auth/me',[AuthController::class,'me']);
    Route::post('/auth/register',[AuthController::class,'register'])->middleware('guest');
    Route::post('/auth/login',[AuthController::class,'login'])->middleware('guest');
    Route::post('/auth/logout',[AuthController::class,'logout'])->middleware('auth');
    Route::patch('/auth/user',[AuthController::class,'update'])->middleware('auth');
    Route::middleware('auth')->group(function () {
        Route::get('/ledger/summary', [LedgerController::class, 'summary']);
        Route::get('/ledger/dashboard', [LedgerController::class, 'dashboard']);
        Route::get('/ledger/accounts', [LedgerController::class, 'accounts']);
        Route::get('/ledger/categories', [LedgerController::class, 'categories']);
        Route::get('/ledger/transactions', [LedgerController::class, 'transactions']);
        Route::get('/ledger/category-breakdown', [LedgerController::class, 'categoryBreakdown']);
        Route::get('/ledger/contacts', [LedgerController::class, 'contacts']);
        Route::post('/ledger/contacts', [LedgerController::class, 'storeContact']);
        Route::post('/ledger/transactions', [LedgerController::class, 'store']);
        Route::get('/captures', [CaptureController::class, 'index']);
        Route::post('/captures', [CaptureController::class, 'store']);
        Route::patch('/captures/{captureId}/review', [CaptureController::class, 'review']);
        Route::post('/data/{table}',[BusinessDataController::class,'query']);
        Route::get('/storage/buckets',[StorageController::class,'buckets']);
        Route::post('/storage/upload',[StorageController::class,'upload']);
    });
});
Route::match(['get', 'post'], '/api/webhooks/whatsapp', [CaptureController::class, 'whatsapp']);
Route::fallback(fn () => view('app'));
