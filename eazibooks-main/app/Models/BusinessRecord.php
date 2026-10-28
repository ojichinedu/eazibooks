<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class BusinessRecord extends Model {
 protected $table='business_records';
 protected $primaryKey='id';
 public $incrementing=false;
 protected $keyType='string';
 protected $fillable=['id','company_id','table_name','payload'];
 protected function casts(): array {return ['payload'=>'array'];}
 public static function recordKey(string $companyId,string $table,string $recordId): string {
  return hash('sha256',$companyId.'|'.$table.'|'.$recordId);
 }
}