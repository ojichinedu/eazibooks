import { supabase } from '../supabase/client';

export interface Customer {
  id?: string;
  company_id?: string;
  customer_code?: string;
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
  credit_limit?: number;
  balance?: number;
  payment_terms?: string;
  status?: 'active' | 'inactive';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Fetch all customers for the current company
export async function fetchCustomers(): Promise<Customer[]> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
}

// Fetch a single customer by ID
export async function fetchCustomerById(id: string): Promise<Customer | null> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching customer:', error);
    return null;
  }
}

// Generate unique customer code
async function generateCustomerCode(companyId?: string): Promise<string> {
  let attempts = 0;
  const maxAttempts = 5;
  
  while (attempts < maxAttempts) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const code = `CUST-${timestamp}-${random}`;
    
    // Check if code already exists
    const { data } = await supabase
      .from('customers')
      .select('id')
      .eq('customer_code', code)
      .maybeSingle();
    
    if (!data) {
      return code;
    }
    
    attempts++;
  }
  
  // Fallback to UUID-based code
  return `CUST-${crypto.randomUUID().substring(0, 8)}`;
}

// Create a new customer
export async function createCustomer(customer: Customer): Promise<Customer | null> {
  try {
    // Generate unique customer code if not provided
    if (!customer.customer_code) {
      customer.customer_code = await generateCustomerCode(customer.company_id);
    }

    const { data, error } = await supabase
      .from('customers')
      .insert([customer])
      .select()
      .single();

    if (error) {
      // If duplicate key error, retry with new code
      if (error.code === '23505' && error.message.includes('customer_code')) {
        customer.customer_code = await generateCustomerCode(customer.company_id);
        const { data: retryData, error: retryError } = await supabase
          .from('customers')
          .insert([customer])
          .select()
          .single();
        
        if (retryError) throw retryError;
        return retryData;
      }
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error creating customer:', error);
    return null;
  }
}

// Update an existing customer
export async function updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating customer:', error);
    return null;
  }
}

// Delete a customer
export async function deleteCustomer(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting customer:', error);
    return false;
  }
}

// Search customers
export async function searchCustomers(query: string): Promise<Customer[]> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,company_name.ilike.%${query}%`)
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching customers:', error);
    return [];
  }
}

// Get customer stats
export async function getCustomerStats() {
  try {
    const customers = await fetchCustomers();
    
    const stats = {
      total: customers.length,
      active: customers.filter(c => c.status === 'active').length,
      inactive: customers.filter(c => c.status === 'inactive').length,
      totalBalance: customers.reduce((sum, c) => sum + (c.balance || 0), 0),
    };

    return stats;
  } catch (error) {
    console.error('Error getting customer stats:', error);
    return {
      total: 0,
      active: 0,
      inactive: 0,
      totalBalance: 0,
    };
  }
}
