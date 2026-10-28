import { supabase } from '../supabase/client';
import { getCurrentUserCompanyId } from './helpers';

export interface Product {
  id?: string;
  company_id?: string;
  sku?: string;
  name: string;
  description?: string;
  type: 'product' | 'service';
  category?: string;
  unit?: string;
  price: number;
  cost?: number;
  tax_rate?: number;
  stock_quantity?: number;
  low_stock_threshold?: number;
  image_url?: string;
  barcode?: string;
  status?: 'active' | 'inactive' | 'discontinued';
  created_at?: string;
  updated_at?: string;
}

// Fetch all products
export async function fetchProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// Fetch a single product by ID
export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Generate unique SKU
async function generateSKU(productType: 'product' | 'service', companyId?: string): Promise<string> {
  let attempts = 0;
  const maxAttempts = 5;
  
  while (attempts < maxAttempts) {
    const prefix = productType === 'product' ? 'PROD' : 'SERV';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000);
    const sku = `${prefix}-${timestamp}${random}`;
    
    // Check if SKU already exists
    const { data } = await supabase
      .from('products')
      .select('id')
      .eq('sku', sku)
      .maybeSingle();
    
    if (!data) {
      return sku;
    }
    
    attempts++;
  }
  
  // Fallback to UUID-based SKU
  const prefix = productType === 'product' ? 'PROD' : 'SERV';
  return `${prefix}-${crypto.randomUUID().substring(0, 8)}`;
}

// Create a new product
export async function createProduct(product: Product): Promise<Product | null> {
  try {
    // Get company_id if not provided
    if (!product.company_id) {
      const companyId = await getCurrentUserCompanyId();
      if (!companyId) {
        console.error('Error creating product: No company_id found for user');
        throw new Error('User company not found. Please ensure your profile is set up correctly.');
      }
      product.company_id = companyId;
    }

    // Generate unique SKU if not provided
    if (!product.sku) {
      product.sku = await generateSKU(product.type, product.company_id);
    }

    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      // If duplicate key error, retry with new SKU
      if (error.code === '23505' && error.message.includes('sku')) {
        product.sku = await generateSKU(product.type, product.company_id);
        const { data: retryData, error: retryError } = await supabase
          .from('products')
          .insert([product])
          .select()
          .single();
        
        if (retryError) {
          console.error('Error creating product (retry):', retryError);
          throw retryError;
        }
        return retryData;
      }
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error creating product:', error);
    return null;
  }
}

// Update an existing product
export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating product:', error);
    return null;
  }
}

// Delete a product
export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
}

// Search products
export async function searchProducts(query: string): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,sku.ilike.%${query}%,description.ilike.%${query}%`)
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}

// Get low stock products
export async function getLowStockProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('type', 'product')
      .order('stock_quantity');

    if (error) throw error;
    
    // Filter in JavaScript since we can't compare columns in Supabase filter
    const lowStockProducts = (data || []).filter(p => 
      (p.stock_quantity || 0) <= (p.low_stock_threshold || 0)
    );
    
    return lowStockProducts;
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    return [];
  }
}

// Get product stats
export async function getProductStats() {
  try {
    const products = await fetchProducts();
    
    const stats = {
      total: products.length,
      products: products.filter(p => p.type === 'product').length,
      services: products.filter(p => p.type === 'service').length,
      active: products.filter(p => p.status === 'active').length,
      lowStock: products.filter(p => 
        p.type === 'product' && 
        (p.stock_quantity || 0) <= (p.low_stock_threshold || 0)
      ).length,
      totalValue: products.reduce((sum, p) => 
        sum + (p.price * (p.stock_quantity || 0)), 0
      ),
    };

    return stats;
  } catch (error) {
    console.error('Error getting product stats:', error);
    return {
      total: 0,
      products: 0,
      services: 0,
      active: 0,
      lowStock: 0,
      totalValue: 0,
    };
  }
}

// Update product stock
export async function updateProductStock(
  id: string, 
  quantity: number, 
  operation: 'add' | 'subtract' | 'set'
): Promise<Product | null> {
  try {
    const product = await fetchProductById(id);
    if (!product) return null;

    let newQuantity = product.stock_quantity || 0;
    
    switch (operation) {
      case 'add':
        newQuantity += quantity;
        break;
      case 'subtract':
        newQuantity -= quantity;
        if (newQuantity < 0) newQuantity = 0;
        break;
      case 'set':
        newQuantity = quantity;
        break;
    }

    return await updateProduct(id, { stock_quantity: newQuantity });
  } catch (error) {
    console.error('Error updating product stock:', error);
    return null;
  }
}