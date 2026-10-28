import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  List,
  Search,
  Download,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  Loader2,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useCurrency } from '../utils/CurrencyContext';
import { formatCurrency } from '../utils/currency';
import { 
  fetchTransactions,
  fetchTransactionsByDateRange,
  fetchTransactionsByType,
  deleteTransaction,
  searchTransactions,
  getTransactionStats,
  type Transaction as DBTransaction 
} from '../utils/database/transactions';

export function Transactions() {
  const { currency } = useCurrency();
  const [transactions, setTransactions] = useState<DBTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    income: 0,
    expenses: 0,
    pending: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const categories = Array.from(new Set(transactions.map((transaction) => transaction.category).filter(Boolean))).sort() as string[];

  // Load transactions on mount
  useEffect(() => {
    loadTransactions();
    loadStats();
  }, [filterType, filterStatus, dateRange]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      let data: DBTransaction[];
      
      if (dateRange.start && dateRange.end) {
        data = await fetchTransactionsByDateRange(dateRange.start, dateRange.end);
      } else if (filterType && filterType !== 'all') {
        data = await fetchTransactionsByType(filterType as any);
      } else {
        data = await fetchTransactions();
      }
      
      // Apply status filter if needed
      if (filterStatus && filterStatus !== 'all') {
        data = data.filter(t => t.status === filterStatus);
      }
      
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statistics = await getTransactionStats();
      setStats({
        total: statistics.total,
        income: statistics.income,
        expenses: statistics.expenses,
        pending: statistics.pending,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      const success = await deleteTransaction(id);
      
      if (success) {
        toast.success('Transaction deleted successfully');
        setTransactions(transactions.filter(t => t.id !== id));
        loadStats();
      } else {
        toast.error('Failed to delete transaction');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    }
  };

  const handleSearch = async (query: string) => {
    setSearchTerm(query);
    
    if (!query.trim()) {
      loadTransactions();
      return;
    }

    try {
      const results = await searchTransactions(query);
      setTransactions(results);
    } catch (error) {
      console.error('Error searching transactions:', error);
      toast.error('Search failed');
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.transaction_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  const handleExport = () => {
    toast.success('Exporting transactions to CSV...');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
      case 'expense':
        return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading transactions...</p>
          </div>
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
            <h1>Transactions</h1>
            <Badge variant="secondary">{transactions.length} Total</Badge>
          </div>
          <p className="text-muted-foreground">
            View and manage all financial transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-green-600">
              {formatCurrency(stats.income, currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              {transactions.filter((t) => t.type === 'income').length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-red-600">
              {formatCurrency(stats.expenses, currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              {transactions.filter((t) => t.type === 'expense').length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`font-bold ${(stats.income - stats.expenses) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(stats.income - stats.expenses), currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              {(stats.income - stats.expenses) >= 0 ? 'Surplus' : 'Deficit'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Transaction List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="w-5 h-5" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by description, reference, customer, or supplier..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income Only</SelectItem>
                  <SelectItem value="expense">Expense Only</SelectItem>
                  <SelectItem value="transfer">Transfer Only</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Transaction Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Reconciled</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <List className="w-12 h-12 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm || filterType !== 'all' || filterStatus !== 'all' || filterCategory !== 'all'
                          ? 'No transactions found matching your filters'
                          : 'No transactions yet.'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {new Date(transaction.transaction_date || transaction.created_at || new Date()).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(transaction.type)}
                        <span className="capitalize">{transaction.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{transaction.description || '-'}</p>
                        {transaction.customer_name && (
                          <p className="text-sm text-muted-foreground">
                            Customer: {transaction.customer_name}
                          </p>
                        )}
                        {transaction.supplier_name && (
                          <p className="text-sm text-muted-foreground">
                            Supplier: {transaction.supplier_name}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{transaction.category || 'Other'}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {transaction.transaction_number || '-'}
                    </TableCell>
                    <TableCell className="text-sm">{transaction.payment_method || '-'}</TableCell>
                    <TableCell className="text-right font-medium">
                      <span
                        className={
                          transaction.type === 'income'
                            ? 'text-green-600'
                            : transaction.type === 'expense'
                            ? 'text-red-600'
                            : ''
                        }
                      >
                        {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
                        {formatCurrency(transaction.amount, currency)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          transaction.status === 'completed'
                            ? 'default'
                            : transaction.status === 'pending'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {transaction.is_reconciled ? (
                        <Badge variant="outline" className="bg-green-50">
                          ✓
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-50">
                          -
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteTransaction(transaction.id!)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
