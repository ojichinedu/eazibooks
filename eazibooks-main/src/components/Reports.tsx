import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  FileText,
  Download,
  TrendingUp,
  DollarSign,
  BarChart,
  PieChart,
  FileSpreadsheet,
  Calendar,
  Eye,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useCurrency } from '../utils/CurrencyContext';
import { formatCurrency } from '../utils/currency';
import {
  calculateProfitLoss,
  calculateBalanceSheet,
  calculateCashFlow,
  getSalesByCustomer,
  getSalesByProduct,
  getSalesByPeriod,
  getInvoiceAgingReport,
  getExpensesByCategory,
  getExpensesBySupplier,
  getMonthlyExpenseTrend,
  getStockValuation,
  getLowStockReport,
  getInventoryMovement,
} from '../utils/database';

export function Reports() {
  const { currency } = useCurrency();
  const [dateRange, setDateRange] = useState('this-month');
  const [reportFormat, setReportFormat] = useState('pdf');
  const [loading, setLoading] = useState(true);

  // Financial data states
  const [profitLossData, setProfitLossData] = useState<any>(null);
  const [balanceSheetData, setBalanceSheetData] = useState<any>(null);
  const [cashFlowData, setCashFlowData] = useState<any>(null);

  // Calculate date range
  const getDateRange = (range: string) => {
    const today = new Date();
    let startDate: Date;
    let endDate = today;

    switch (range) {
      case 'today':
        startDate = today;
        break;
      case 'this-week':
        startDate = new Date(today.setDate(today.getDate() - 7));
        break;
      case 'this-month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'this-quarter':
        const quarter = Math.floor(today.getMonth() / 3);
        startDate = new Date(today.getFullYear(), quarter * 3, 1);
        break;
      case 'this-year':
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
      case 'last-month':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'last-quarter':
        const lastQuarter = Math.floor(today.getMonth() / 3) - 1;
        startDate = new Date(today.getFullYear(), lastQuarter * 3, 1);
        endDate = new Date(today.getFullYear(), lastQuarter * 3 + 3, 0);
        break;
      case 'last-year':
        startDate = new Date(today.getFullYear() - 1, 0, 1);
        endDate = new Date(today.getFullYear() - 1, 11, 31);
        break;
      default:
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  };

  // Load financial data
  const loadFinancialData = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange(dateRange);

      const [profitLoss, balanceSheet, cashFlow] = await Promise.all([
        calculateProfitLoss(startDate, endDate),
        calculateBalanceSheet(),
        calculateCashFlow(startDate, endDate),
      ]);

      setProfitLossData(profitLoss);
      setBalanceSheetData(balanceSheet);
      setCashFlowData(cashFlow);
    } catch (error) {
      console.error('Error loading financial data:', error);
      toast.error('Failed to load financial reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinancialData();
  }, [dateRange]);

  const salesReports = [
    {
      id: '1',
      name: 'Sales by Customer',
      description: 'Breakdown of sales revenue by customer',
      icon: BarChart,
      type: 'sales-by-customer',
    },
    {
      id: '2',
      name: 'Sales by Product',
      description: 'Breakdown of sales revenue by product/service',
      icon: PieChart,
      type: 'sales-by-product',
    },
    {
      id: '3',
      name: 'Sales by Period',
      description: 'Sales trends over time (daily, weekly, monthly)',
      icon: TrendingUp,
      type: 'sales-by-period',
    },
    {
      id: '4',
      name: 'Invoice Aging Report',
      description: 'Outstanding invoices grouped by age',
      icon: Calendar,
      type: 'invoice-aging',
    },
  ];

  const expenseReports = [
    {
      id: '5',
      name: 'Expenses by Category',
      description: 'Breakdown of expenses by category',
      icon: PieChart,
      type: 'expenses-by-category',
    },
    {
      id: '6',
      name: 'Expenses by Supplier',
      description: 'Breakdown of expenses by supplier',
      icon: BarChart,
      type: 'expenses-by-supplier',
    },
    {
      id: '7',
      name: 'Monthly Expense Trends',
      description: 'Track expense patterns over time',
      icon: TrendingUp,
      type: 'monthly-expenses',
    },
  ];

  const inventoryReports = [
    {
      id: '8',
      name: 'Stock Valuation',
      description: 'Current inventory value and quantities',
      icon: DollarSign,
      type: 'stock-valuation',
    },
    {
      id: '9',
      name: 'Low Stock Alert',
      description: 'Products below minimum stock levels',
      icon: FileText,
      type: 'low-stock',
    },
    {
      id: '10',
      name: 'Inventory Movement',
      description: 'Stock in and out movements',
      icon: BarChart,
      type: 'inventory-movement',
    },
  ];

  const handleGenerateReport = async (reportName: string, reportType?: string) => {
    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const { startDate, endDate } = getDateRange(dateRange);
          let reportData;

          switch (reportType) {
            case 'sales-by-customer':
              reportData = await getSalesByCustomer(startDate, endDate);
              break;
            case 'sales-by-product':
              reportData = await getSalesByProduct(startDate, endDate);
              break;
            case 'sales-by-period':
              reportData = await getSalesByPeriod(startDate, endDate);
              break;
            case 'invoice-aging':
              reportData = await getInvoiceAgingReport();
              break;
            case 'expenses-by-category':
              reportData = await getExpensesByCategory(startDate, endDate);
              break;
            case 'expenses-by-supplier':
              reportData = await getExpensesBySupplier(startDate, endDate);
              break;
            case 'monthly-expenses':
              reportData = await getMonthlyExpenseTrend();
              break;
            case 'stock-valuation':
              reportData = await getStockValuation();
              break;
            case 'low-stock':
              reportData = await getLowStockReport();
              break;
            case 'inventory-movement':
              reportData = await getInventoryMovement(startDate, endDate);
              break;
            default:
              reportData = null;
          }

          console.log(`${reportName} Report Data:`, reportData);
          
          setTimeout(() => {
            resolve(reportData);
          }, 1000);
        } catch (error) {
          reject(error);
        }
      }),
      {
        loading: `Generating ${reportName}...`,
        success: `${reportName} generated successfully!`,
        error: `Failed to generate ${reportName}`,
      }
    );
  };

  const handleExport = (reportType: string) => {
    toast.success(`Exporting ${reportType} as ${reportFormat.toUpperCase()}...`);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading financial reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1>Reports & Analytics</h1>
            <Badge variant="secondary">Business Intelligence</Badge>
          </div>
          <p className="text-muted-foreground">
            Generate comprehensive financial and business reports
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="this-quarter">This Quarter</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="last-quarter">Last Quarter</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Select value={reportFormat} onValueChange={setReportFormat}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Report Tabs */}
      <Tabs defaultValue="financial" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="financial">Financial Reports</TabsTrigger>
          <TabsTrigger value="sales">Sales Reports</TabsTrigger>
          <TabsTrigger value="expenses">Expense Reports</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Reports</TabsTrigger>
          <TabsTrigger value="tax">Tax Reports</TabsTrigger>
        </TabsList>

        {/* Financial Reports */}
        <TabsContent value="financial" className="space-y-6">
          {/* Profit & Loss Statement */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Profit & Loss Statement
                  </CardTitle>
                  <CardDescription>
                    Income statement showing revenue, costs, and profitability
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerateReport('Profit & Loss Statement')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button size="sm" onClick={() => handleExport('Profit & Loss')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <span className="font-medium">Total Revenue</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(profitLossData?.revenue || 0, currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <span>Cost of Sales</span>
                  <span className="text-red-600">
                    -{formatCurrency(profitLossData?.costOfSales || 0, currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg border-2">
                  <span className="font-medium">Gross Profit</span>
                  <div className="text-right">
                    <p className="font-bold">
                      {formatCurrency(profitLossData?.grossProfit || 0, currency)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {profitLossData?.grossProfitMargin || 0}% margin
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <span>Operating Expenses</span>
                  <span className="text-red-600">
                    -{formatCurrency(profitLossData?.operatingExpenses || 0, currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200">
                  <span className="font-medium">Net Profit</span>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {formatCurrency(profitLossData?.netProfit || 0, currency)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {profitLossData?.netProfitMargin || 0}% margin
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Balance Sheet */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5" />
                    Balance Sheet
                  </CardTitle>
                  <CardDescription>
                    Statement of financial position showing assets, liabilities, and equity
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerateReport('Balance Sheet')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button size="sm" onClick={() => handleExport('Balance Sheet')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Assets</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between p-3 bg-muted rounded">
                      <span className="text-sm">Current Assets</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(balanceSheetData?.assets.currentAssets || 0, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-muted rounded">
                      <span className="text-sm">Fixed Assets</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(balanceSheetData?.assets.fixedAssets || 0, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-primary/10 rounded border-2">
                      <span className="font-medium">Total Assets</span>
                      <span className="font-bold">
                        {formatCurrency(balanceSheetData?.assets.total || 0, currency)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Liabilities</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between p-3 bg-muted rounded">
                      <span className="text-sm">Current Liabilities</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(balanceSheetData?.liabilities.currentLiabilities || 0, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-muted rounded">
                      <span className="text-sm">Long-term Liabilities</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(balanceSheetData?.liabilities.longTermLiabilities || 0, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-primary/10 rounded border-2">
                      <span className="font-medium">Total Liabilities</span>
                      <span className="font-bold">
                        {formatCurrency(balanceSheetData?.liabilities.total || 0, currency)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Equity</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between p-3 bg-muted rounded">
                      <span className="text-sm">Capital</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(balanceSheetData?.equity.capital || 0, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-muted rounded">
                      <span className="text-sm">Retained Earnings</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(balanceSheetData?.equity.retainedEarnings || 0, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-primary/10 rounded border-2">
                      <span className="font-medium">Total Equity</span>
                      <span className="font-bold">
                        {formatCurrency(balanceSheetData?.equity.total || 0, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cash Flow Statement */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Cash Flow Statement
                  </CardTitle>
                  <CardDescription>
                    Statement of cash inflows and outflows
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerateReport('Cash Flow Statement')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button size="sm" onClick={() => handleExport('Cash Flow')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <span>Operating Activities</span>
                  <span className="font-medium text-green-600">
                    +{formatCurrency(Math.abs(cashFlowData?.operating || 0), currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <span>Investing Activities</span>
                  <span className="font-medium text-red-600">
                    {formatCurrency(cashFlowData?.investing || 0, currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <span>Financing Activities</span>
                  <span className="font-medium text-green-600">
                    +{formatCurrency(Math.abs(cashFlowData?.financing || 0), currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg border-2">
                  <span className="font-medium">Net Cash Flow</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(cashFlowData?.netCashFlow || 0, currency)}
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Opening Balance</p>
                    <p className="font-bold">
                      {formatCurrency(cashFlowData?.openingBalance || 0, currency)}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200">
                    <p className="text-sm text-muted-foreground">Closing Balance</p>
                    <p className="font-bold text-green-600">
                      {formatCurrency(cashFlowData?.closingBalance || 0, currency)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales Reports */}
        <TabsContent value="sales" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {salesReports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <report.icon className="w-5 h-5" />
                    {report.name}
                  </CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleGenerateReport(report.name, report.type)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => handleExport(report.name)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Expense Reports */}
        <TabsContent value="expenses" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {expenseReports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <report.icon className="w-5 h-5" />
                    {report.name}
                  </CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleGenerateReport(report.name, report.type)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => handleExport(report.name)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Inventory Reports */}
        <TabsContent value="inventory" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {inventoryReports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <report.icon className="w-5 h-5" />
                    {report.name}
                  </CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleGenerateReport(report.name, report.type)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => handleExport(report.name)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tax Reports */}
        <TabsContent value="tax" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tax Reports</CardTitle>
              <CardDescription>
                GST/VAT returns and tax compliance reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center border-2 border-dashed rounded-lg">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-4">
                  Tax reports will be available after configuring tax settings
                </p>
                <Button variant="outline">Configure Tax Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
