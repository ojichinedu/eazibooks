<?php
namespace App\Http\Controllers;
use App\Models\BusinessRecord;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
class AuthController {
 public function me(Request $request) {
  $user=$request->user();
  return response()->json(['user'=>$user ? ['id'=>(string)$user->id,'email'=>$user->email,'name'=>$user->name] : null]);
 }
 public function register(Request $request) {
  $data=$request->validate(['name'=>['required','string','max:120'],'email'=>['required','email','max:255','unique:users,email'],'password'=>['required','string','min:6']]);
  $user=DB::transaction(function() use($data) {
   $companyId=(string)Str::uuid();
   $user=User::create(['name'=>$data['name'],'email'=>$data['email'],'password'=>Hash::make($data['password']),'company_id'=>$companyId]);
   $now=now()->toISOString();
   $this->saveRecord($companyId,'companies',['id'=>$companyId,'company_id'=>$companyId,'name'=>$data['name']."'s Company","email"=>$data['email'],'currency'=>'NGN','country'=>'Nigeria','created_at'=>$now,'updated_at'=>$now]);
   $this->saveRecord($companyId,'profiles',['id'=>(string)$user->id,'user_id'=>(string)$user->id,'company_id'=>$companyId,'email'=>$data['email'],'full_name'=>$data['name'],'role'=>'admin','created_at'=>$now,'updated_at'=>$now]);
   $this->saveRecord($companyId,'subscriptions',['id'=>(string)Str::uuid(),'company_id'=>$companyId,'user_id'=>(string)$user->id,'plan_type'=>'free','status'=>'active','start_date'=>now()->toDateString(),'invoices_limit'=>10,'bills_limit'=>10,'invoices_used'=>0,'bills_used'=>0,'auto_renew'=>false,'created_at'=>$now,'updated_at'=>$now]);
   return $user;
  });
  Auth::login($user);
  $request->session()->regenerate();
  return response()->json(['user'=>['id'=>(string)$user->id,'email'=>$user->email,'name'=>$user->name]],201);
 }
 public function login(Request $request) {
  $data=$request->validate(['email'=>['required','email'],'password'=>['required','string']]);
  if(!Auth::attempt($data,$request->boolean('remember'))) return response()->json(['message'=>'These credentials do not match our records.'],422);
  $request->session()->regenerate();
  $user=$request->user();
  return response()->json(['user'=>['id'=>(string)$user->id,'email'=>$user->email,'name'=>$user->name]]);
 }
 public function logout(Request $request) {
  Auth::logout();
  $request->session()->invalidate();
  $request->session()->regenerateToken();
  return response()->json(['ok'=>true]);
 }
 public function update(Request $request) {
  $user=$request->user();
  $data=$request->validate(['name'=>['sometimes','required','string','max:120'],'email'=>['sometimes','required','email','max:255','unique:users,email,'.$user->id],'password'=>['sometimes','required','string','min:6']]);
  if(isset($data['password'])) $data['password']=Hash::make($data['password']);
  $user->fill($data)->save();
  return response()->json(['user'=>['id'=>(string)$user->id,'email'=>$user->email,'name'=>$user->name]]);
 }
 private function saveRecord(string $companyId,string $table,array $payload): void {
  BusinessRecord::updateOrCreate(['id'=>BusinessRecord::recordKey($companyId,$table,(string)$payload['id'])],['company_id'=>$companyId,'table_name'=>$table,'payload'=>$payload]);
 }
}