import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Users, 
  DollarSign, 
  FileText, 
  Calendar,
  Plus,
  Download,
  Search,
  Calculator,
  Loader2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';
import { useCurrency } from '../utils/CurrencyContext';
import { formatCurrency } from '../utils/currency';
import {
  fetchEmployees,
  createEmployee,
  getPayrollSummary,
  fetchPayrollRuns,
  type Employee,
  type PayrollRun
} from '../utils/database/payroll';

export function Payroll() {
  const [selectedTab, setSelectedTab] = useState('employees');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollHistory, setPayrollHistory] = useState<PayrollRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { currency } = useCurrency();

  const [payrollSummary, setPayrollSummary] = useState({
    totalEmployees: 0,
    totalGrossSalary: 0,
    totalDeductions: 0,
    totalNetSalary: 0,
    pfContribution: 0,
    esiContribution: 0,
    tdsDeducted: 0
  });

  // New employee form state
  const [newEmployee, setNewEmployee] = useState({
    first_name: '',
    last_name: '',
    employee_code: '',
    email: '',
    phone: '',
    designation: '',
    department: '',
    employment_type: 'full-time' as 'full-time' | 'part-time' | 'contract' | 'intern',
    salary: 0,
    date_of_joining: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [employeesData, summary, history] = await Promise.all([
        fetchEmployees(),
        getPayrollSummary(),
        fetchPayrollRuns()
      ]);

      setEmployees(employeesData);
      setPayrollSummary(summary);
      setPayrollHistory(history);
    } catch (error) {
      console.error('Error loading payroll data:', error);
      toast.error('Failed to load payroll data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEmployee = async () => {
    if (!newEmployee.first_name || !newEmployee.last_name || !newEmployee.salary) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsAddingEmployee(true);
    try {
      const employee = await createEmployee({
        ...newEmployee,
        status: 'active'
      });

      if (employee) {
        toast.success('Employee added successfully');
        setEmployees([employee, ...employees]);
        
        // Refresh summary
        const summary = await getPayrollSummary();
        setPayrollSummary(summary);

        // Reset form and close dialog
        setNewEmployee({
          first_name: '',
          last_name: '',
          employee_code: '',
          email: '',
          phone: '',
          designation: '',
          department: '',
          employment_type: 'full-time',
          salary: 0,
          date_of_joining: new Date().toISOString().split('T')[0],
        });
        setDialogOpen(false);
      } else {
        toast.error('Failed to add employee');
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error('An error occurred while adding employee');
    } finally {
      setIsAddingEmployee(false);
    }
  };

  // Calculate derived values for display
  const calculateEmployeeDetails = (employee: Employee) => {
    const baseSalary = employee.salary || 0;
    const hra = baseSalary * 0.3; // 30% HRA
    const allowances = baseSalary * 0.1; // 10% allowances
    const grossSalary = baseSalary + hra + allowances;
    
    // Deductions
    const pf = baseSalary * 0.12; // 12% PF
    const esi = grossSalary * 0.0075; // 0.75% ESI
    const tds = grossSalary * 0.10; // 10% TDS
    const totalDeductions = pf + esi + tds;
    
    const netSalary = grossSalary - totalDeductions;

    return {
      baseSalary,
      hra,
      allowances,
      grossSalary,
      pf,
      esi,
      tds,
      totalDeductions,
      netSalary
    };
  };

  // Filter employees
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = searchQuery === '' || 
      employee.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.employee_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || 
      employee.department?.toLowerCase() === departmentFilter.toLowerCase();

    return matchesSearch && matchesDepartment;
  });

  const statutoryReports = [
    { name: 'PAYE Return', period: 'January 2025', dueDate: '2025-02-10', status: 'pending' },
    { name: 'NSITF Contribution', period: 'January 2025', dueDate: '2025-02-15', status: 'pending' },
    { name: 'Pension Contribution', period: 'January 2025', dueDate: '2025-02-10', status: 'pending' },
    { name: 'NHF Deduction', period: 'January 2025', dueDate: '2025-02-15', status: 'pending' },
    { name: 'ITF Contribution', period: 'January 2025', dueDate: '2025-02-28', status: 'pending' },
    { name: 'Annual Tax Returns', period: 'FY 2024', dueDate: '2025-03-31', status: 'not-due' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Payroll Management</h1>
          <p className="text-muted-foreground">Manage employee salaries and statutory compliance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calculator className="w-4 h-4 mr-2" />
            Salary Calculator
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby="payroll-dialog-description">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <p id="payroll-dialog-description" className="sr-only">
                  Add a new employee to the payroll system
                </p>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input 
                      id="first_name" 
                      placeholder="John" 
                      value={newEmployee.first_name}
                      onChange={(e) => setNewEmployee({ ...newEmployee, first_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input 
                      id="last_name" 
                      placeholder="Doe" 
                      value={newEmployee.last_name}
                      onChange={(e) => setNewEmployee({ ...newEmployee, last_name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email"
                      placeholder="john@example.com" 
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      placeholder="+234 800 000 0000" 
                      value={newEmployee.phone}
                      onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="designation">Designation</Label>
                    <Input 
                      id="designation" 
                      placeholder="Software Engineer" 
                      value={newEmployee.designation}
                      onChange={(e) => setNewEmployee({ ...newEmployee, designation: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select 
                      value={newEmployee.department}
                      onValueChange={(value) => setNewEmployee({ ...newEmployee, department: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IT">IT</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="HR">HR</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Support">Support</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employment_type">Employment Type</Label>
                    <Select 
                      value={newEmployee.employment_type}
                      onValueChange={(value: any) => setNewEmployee({ ...newEmployee, employment_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="intern">Intern</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="salary">Base Salary * ({currency})</Label>
                    <Input 
                      id="salary" 
                      type="number" 
                      placeholder="50000" 
                      value={newEmployee.salary || ''}
                      onChange={(e) => setNewEmployee({ ...newEmployee, salary: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="date_of_joining">Date of Joining</Label>
                  <Input 
                    id="date_of_joining" 
                    type="date" 
                    value={newEmployee.date_of_joining}
                    onChange={(e) => setNewEmployee({ ...newEmployee, date_of_joining: e.target.value })}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleAddEmployee}
                  disabled={isAddingEmployee}
                >
                  {isAddingEmployee ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Employee'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Payroll Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payrollSummary.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(payrollSummary.totalGrossSalary, currency)}</div>
            <p className="text-xs text-muted-foreground">Monthly total</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(payrollSummary.totalDeductions, currency)}</div>
            <p className="text-xs text-muted-foreground">PF, ESI, TDS</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{formatCurrency(payrollSummary.totalNetSalary, currency)}</div>
            <p className="text-xs text-muted-foreground">After deductions</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="payroll">Payroll Run</TabsTrigger>
          <TabsTrigger value="statutory">Statutory Reports</TabsTrigger>
          <TabsTrigger value="history">Payroll History</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Salary Details</CardTitle>
              <div className="flex gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search employees..." 
                    className="pl-9" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="it">IT</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredEmployees.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No employees found</p>
                  <p className="text-sm">Add your first employee to get started</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-right">Base Salary</TableHead>
                      <TableHead className="text-right">Gross Salary</TableHead>
                      <TableHead className="text-right">Deductions</TableHead>
                      <TableHead className="text-right">Net Salary</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map((employee) => {
                      const details = calculateEmployeeDetails(employee);
                      return (
                        <TableRow key={employee.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{employee.first_name} {employee.last_name}</p>
                              <p className="text-sm text-muted-foreground">{employee.employee_code}</p>
                            </div>
                          </TableCell>
                          <TableCell>{employee.designation || '-'}</TableCell>
                          <TableCell>{employee.department || '-'}</TableCell>
                          <TableCell className="text-right">{formatCurrency(details.baseSalary, currency)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(details.grossSalary, currency)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(details.totalDeductions, currency)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(details.netSalary, currency)}</TableCell>
                          <TableCell>
                            <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                              {employee.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Process Payroll</CardTitle>
              <p className="text-sm text-muted-foreground">
                Process salary for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} • {payrollSummary.totalEmployees} employees
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Salary Components</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Basic</span>
                      <span>{formatCurrency(payrollSummary.totalGrossSalary * 0.6, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total HRA</span>
                      <span>{formatCurrency(payrollSummary.totalGrossSalary * 0.3, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Allowances</span>
                      <span>{formatCurrency(payrollSummary.totalGrossSalary * 0.1, currency)}</span>
                    </div>
                    <div className="border-t pt-2 font-medium">
                      <div className="flex justify-between">
                        <span>Gross Total</span>
                        <span>{formatCurrency(payrollSummary.totalGrossSalary, currency)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Deductions</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>PF (Employee)</span>
                      <span>{formatCurrency(payrollSummary.pfContribution / 2, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ESI (Employee)</span>
                      <span>{formatCurrency(payrollSummary.esiContribution / 2, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>TDS</span>
                      <span>{formatCurrency(payrollSummary.tdsDeducted, currency)}</span>
                    </div>
                    <div className="border-t pt-2 font-medium">
                      <div className="flex justify-between">
                        <span>Total Deductions</span>
                        <span>{formatCurrency(payrollSummary.totalDeductions, currency)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Employer Contributions</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>PF (Employer)</span>
                      <span>{formatCurrency(payrollSummary.pfContribution / 2, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ESI (Employer)</span>
                      <span>{formatCurrency(payrollSummary.esiContribution / 2, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Professional Tax</span>
                      <span>{formatCurrency(payrollSummary.totalGrossSalary * 0.02, currency)}</span>
                    </div>
                    <div className="border-t pt-2 font-medium">
                      <div className="flex justify-between">
                        <span>Total Contribution</span>
                        <span>{formatCurrency((payrollSummary.pfContribution + payrollSummary.esiContribution) / 2 + payrollSummary.totalGrossSalary * 0.02, currency)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Net Payable Amount</p>
                  <p className="text-sm text-muted-foreground">Total amount to be transferred</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{formatCurrency(payrollSummary.totalNetSalary, currency)}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button className="flex-1">Process Payroll</Button>
                <Button variant="outline">Generate Payslips</Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statutory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Statutory Compliance Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Type</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statutoryReports.map((report, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{report.name}</TableCell>
                      <TableCell>{report.period}</TableCell>
                      <TableCell>{report.dueDate}</TableCell>
                      <TableCell>
                        <Badge variant={
                          report.status === 'completed' ? 'default' : 
                          report.status === 'pending' ? 'secondary' : 'outline'
                        }>
                          {report.status.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          {report.status === 'pending' && (
                            <Button size="sm">Generate</Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Processing History</CardTitle>
            </CardHeader>
            <CardContent>
              {payrollHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No payroll history found</p>
                  <p className="text-sm">Process your first payroll to see history</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Payment Date</TableHead>
                      <TableHead className="text-right">Gross Salary</TableHead>
                      <TableHead className="text-right">Deductions</TableHead>
                      <TableHead className="text-right">Net Paid</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrollHistory.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.payroll_period}</TableCell>
                        <TableCell>{new Date(record.payment_date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">{formatCurrency(record.total_gross || 0, currency)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(record.total_deductions || 0, currency)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(record.total_net || 0, currency)}</TableCell>
                        <TableCell>
                          <Badge variant={record.status === 'paid' ? 'default' : record.status === 'processed' ? 'secondary' : 'outline'}>
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
