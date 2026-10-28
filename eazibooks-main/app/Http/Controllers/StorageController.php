<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
class StorageController {
 public function buckets(){return response()->json(['buckets'=>[['name'=>'uploads'],['name'=>'company-assets'],['name'=>'user-assets']]]);}
 public function upload(Request $request){
  $request->validate(['file'=>['required','file','max:10240'],'bucket'=>['required','string','max:80'],'path'=>['required','string','max:240']]);
  $company=(string)$request->user()->company_id;
  $file=$request->file('file');
  $name=Str::uuid().'.'.$file->getClientOriginalExtension();
  $path=$file->storePubliclyAs($company.'/'.$request->input('bucket'),$name,'public');
  return response()->json(['path'=>$path,'fullPath'=>$path],201);
 }
}