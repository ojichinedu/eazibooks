import { supabase } from '../supabase/client';

export interface Employee {
  id?: string;
  company_id?: string;
  user_id?: string;
  employee_code?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  date_of_joining?: string;
  designation?: string;
  department?: string;
  employment_type?: 'full-time' | 'part-time' | 'contract' | 'intern';
  salary?: number;
  bank_name?: string;
  bank_account_number?: string;
  tax_id?: string;
  status?: 'active' | 'inactive' | 'terminated';
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PayrollRun {
  id?: string;
  company_id?: string;
  payroll_period: string;
  payment_date: string;
  status?: 'draft' | 'processed' | 'paid';
  total_gross?: number;
  total_deductions?: number;
  total_net?: number;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PayrollItem {
  id?: string;
  payroll_run_id: string;
  employee_id: string;
  basic_salary?: number;
  allowances?: number;
  bonuses?: number;
  gross_salary?: number;
  tax_deduction?: number;
  other_deductions?: number;
  total_deductions?: number;
  net_salary?: number;
  created_at?: string;
  employee?: Employee; // For joined queries
}

// ==================== EMPLOYEE FUNCTIONS ====================

// Fetch all employees for the current company
export async function fetchEmployees(): Promise<Employee[]> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
}

// Fetch a single employee by ID
export async function fetchEmployeeById(id: string): Promise<Employee | null> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching employee:', error);
    return null;
  }
}

// Generate unique employee code
async function generateEmployeeCode(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 5;
  
  while (attempts < maxAttempts) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const code = `EMP${timestamp.toString().slice(-6)}${random.toString().padStart(3, '0')}`;
    
    // Check if code already exists
    const { data } = await supabase
      .from('employees')
      .select('id')
      .eq('employee_code', code)
      .maybeSingle();
    
    if (!data) {
      return code;
    }
    
    attempts++;
  }
  
  // Fallback to UUID-based code
  return `EMP-${crypto.randomUUID().substring(0, 8)}`;
}

// Create a new employee
export async function createEmployee(employee: Employee): Promise<Employee | null> {
  try {
    // Generate unique employee code if not provided
    if (!employee.employee_code) {
      employee.employee_code = await generateEmployeeCode();
    }

    const { data, error } = await supabase
      .from('employees')
      .insert([employee])
      .select()
      .single();

    if (error) {
      // If duplicate key error, retry with new code
      if (error.code === '23505' && error.message.includes('employee_code')) {
        employee.employee_code = await generateEmployeeCode();
        const { data: retryData, error: retryError } = await supabase
          .from('employees')
          .insert([employee])
          .select()
          .single();
        
        if (retryError) throw retryError;
        return retryData;
      }
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error creating employee:', error);
    return null;
  }
}

// Update an existing employee
export async function updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee | null> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating employee:', error);
    return null;
  }
}

// Delete an employee
export async function deleteEmployee(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting employee:', error);
    return false;
  }
}

// Get employee stats
export async function getEmployeeStats() {
  try {
    const employees = await fetchEmployees();
    
    const stats = {
      total: employees.length,
      active: employees.filter(e => e.status === 'active').length,
      inactive: employees.filter(e => e.status === 'inactive').length,
      terminated: employees.filter(e => e.status === 'terminated').length,
      totalSalary: employees
        .filter(e => e.status === 'active')
        .reduce((sum, e) => sum + (e.salary || 0), 0),
    };

    return stats;
  } catch (error) {
    console.error('Error getting employee stats:', error);
    return {
      total: 0,
      active: 0,
      inactive: 0,
      terminated: 0,
      totalSalary: 0,
    };
  }
}

// ==================== PAYROLL RUN FUNCTIONS ====================

// Fetch all payroll runs for the current company
export async function fetchPayrollRuns(): Promise<PayrollRun[]> {
  try {
    const { data, error } = await supabase
      .from('payroll_runs')
      .select('*')
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching payroll runs:', error);
    return [];
  }
}

// Fetch a single payroll run by ID
export async function fetchPayrollRunById(id: string): Promise<PayrollRun | null> {
  try {
    const { data, error } = await supabase
      .from('payroll_runs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching payroll run:', error);
    return null;
  }
}

// Create a new payroll run
export async function createPayrollRun(payrollRun: PayrollRun): Promise<PayrollRun | null> {
  try {
    const { data, error } = await supabase
      .from('payroll_runs')
      .insert([payrollRun])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating payroll run:', error);
    return null;
  }
}

// Update an existing payroll run
export async function updatePayrollRun(id: string, updates: Partial<PayrollRun>): Promise<PayrollRun | null> {
  try {
    const { data, error } = await supabase
      .from('payroll_runs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating payroll run:', error);
    return null;
  }
}

// Delete a payroll run
export async function deletePayrollRun(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('payroll_runs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting payroll run:', error);
    return false;
  }
}

// ==================== PAYROLL ITEM FUNCTIONS ====================

// Fetch all payroll items for a payroll run
export async function fetchPayrollItemsByRunId(payrollRunId: string): Promise<PayrollItem[]> {
  try {
    const { data, error } = await supabase
      .from('payroll_items')
      .select(`
        *,
        employee:employees(*)
      `)
      .eq('payroll_run_id', payrollRunId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching payroll items:', error);
    return [];
  }
}

// Create a new payroll item
export async function createPayrollItem(payrollItem: PayrollItem): Promise<PayrollItem | null> {
  try {
    const { data, error } = await supabase
      .from('payroll_items')
      .insert([payrollItem])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating payroll item:', error);
    return null;
  }
}

// Update an existing payroll item
export async function updatePayrollItem(id: string, updates: Partial<PayrollItem>): Promise<PayrollItem | null> {
  try {
    const { data, error } = await supabase
      .from('payroll_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating payroll item:', error);
    return null;
  }
}

// Calculate payroll for all active employees
export async function calculatePayrollForEmployees(employees: Employee[]): Promise<{
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  items: Omit<PayrollItem, 'id' | 'created_at'>[];
}> {
  const items: Omit<PayrollItem, 'id' | 'created_at'>[] = [];
  let totalGross = 0;
  let totalDeductions = 0;
  let totalNet = 0;

  employees.forEach(employee => {
    if (employee.status === 'active' && employee.salary) {
      const basicSalary = employee.salary;
      const allowances = basicSalary * 0.3; // 30% of basic
      const bonuses = 0;
      const grossSalary = basicSalary + allowances + bonuses;
      
      // Calculate deductions
      const taxDeduction = grossSalary * 0.10; // 10% tax
      const otherDeductions = grossSalary * 0.05; // 5% for pension, insurance, etc.
      const totalEmpDeductions = taxDeduction + otherDeductions;
      
      const netSalary = grossSalary - totalEmpDeductions;

      items.push({
        payroll_run_id: '', // Will be set when creating the run
        employee_id: employee.id!,
        basic_salary: basicSalary,
        allowances,
        bonuses,
        gross_salary: grossSalary,
        tax_deduction: taxDeduction,
        other_deductions: otherDeductions,
        total_deductions: totalEmpDeductions,
        net_salary: netSalary,
      });

      totalGross += grossSalary;
      totalDeductions += totalEmpDeductions;
      totalNet += netSalary;
    }
  });

  return {
    totalGross,
    totalDeductions,
    totalNet,
    items,
  };
}

// Get payroll summary
export async function getPayrollSummary() {
  try {
    const employees = await fetchEmployees();
    const activeEmployees = employees.filter(e => e.status === 'active');
    
    const calculation = await calculatePayrollForEmployees(activeEmployees);

    return {
      totalEmployees: activeEmployees.length,
      totalGrossSalary: calculation.totalGross,
      totalDeductions: calculation.totalDeductions,
      totalNetSalary: calculation.totalNet,
      pfContribution: calculation.totalGross * 0.12, // 12% PF
      esiContribution: calculation.totalGross * 0.0075, // 0.75% ESI
      tdsDeducted: calculation.totalGross * 0.10, // 10% TDS
    };
  } catch (error) {
    console.error('Error getting payroll summary:', error);
    return {
      totalEmployees: 0,
      totalGrossSalary: 0,
      totalDeductions: 0,
      totalNetSalary: 0,
      pfContribution: 0,
      esiContribution: 0,
      tdsDeducted: 0,
    };
  }
}
