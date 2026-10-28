import { supabase } from '../supabase/client';
import { getCurrentUserCompanyId } from './helpers';

export interface Supplier {
  id?: string;
  company_id?: string;
  supplier_code?: string;
  name: string;
  email?: string;
  phone?: string;
  company_name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  tax_id?: string;
  payment_terms?: string;
  bank_account?: string;
  balance?: number;
  totalPurchases?: number;
  status?: 'active' | 'inactive';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Fetch all suppliers
export async function fetchSuppliers(): Promise<Supplier[]> {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return [];
  }
}

// Fetch a single supplier by ID
export async function fetchSupplierById(id: string): Promise<Supplier | null> {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching supplier:', error);
    return null;
  }
}

// Create a new supplier
export async function createSupplier(supplier: Supplier): Promise<Supplier | null> {
  try {
    // Get company_id if not provided
    if (!supplier.company_id) {
      const companyId = await getCurrentUserCompanyId();
      if (!companyId) {
        console.error('Error creating supplier: No company_id found for user');
        throw new Error('User company not found. Please ensure your profile is set up correctly.');
      }
      supplier.company_id = companyId;
    }

    // Generate supplier code if not provided
    if (!supplier.supplier_code) {
      const count = await fetchSuppliers();
      supplier.supplier_code = `SUPP-${String(count.length + 1).padStart(4, '0')}`;
    }

    const { data, error } = await supabase
      .from('suppliers')
      .insert([supplier])
      .select()
      .single();

    if (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error creating supplier:', error);
    return null;
  }
}

// Update an existing supplier
export async function updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier | null> {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating supplier:', error);
    return null;
  }
}

// Delete a supplier
export async function deleteSupplier(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return false;
  }
}

// Search suppliers
export async function searchSuppliers(query: string): Promise<Supplier[]> {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,company_name.ilike.%${query}%`)
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching suppliers:', error);
    return [];
  }
}

// Get supplier stats
export async function getSupplierStats() {
  try {
    const suppliers = await fetchSuppliers();
    
    const stats = {
      total: suppliers.length,
      active: suppliers.filter(s => s.status === 'active').length,
      inactive: suppliers.filter(s => s.status === 'inactive').length,
    };

    return stats;
  } catch (error) {
    console.error('Error getting supplier stats:', error);
    return {
      total: 0,
      active: 0,
      inactive: 0,
    };
  }
}