import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Truck,
  Plus,
  Search,
  Edit2,
  Trash2,
  Download,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  FileText,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useCurrency } from '../utils/CurrencyContext';
import { formatCurrency } from '../utils/currency';
import { supabase } from '../utils/supabase/client';
import { 
  fetchSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  searchSuppliers,
  type Supplier as DBSupplier 
} from '../utils/database/suppliers';

export function Suppliers() {
  const { currency } = useCurrency();
  const [suppliers, setSuppliers] = useState<DBSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [totalPayable, setTotalPayable] = useState(0);
  const [totalPurchasesCount, setTotalPurchasesCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [newSupplier, setNewSupplier] = useState({
    name: '',
    email: '',
    phone: '',
    company_name: '',
    address: '',
    city: '',
    country: 'Nigeria',
    tax_id: '',
    payment_terms: 'Net 30',
  });

  // Load suppliers on mount
  useEffect(() => {
    loadSuppliers();
    calculateStats();
  }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const data = await fetchSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error('Error loading suppliers:', error);
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = async () => {
    try {
      const { data: bills, error } = await supabase.from('transactions').select('*');
      if (error) throw error;
      const records = (bills || []).filter((bill) => bill.type === 'bill');
      const openBills = records.filter((bill) => !['completed', 'paid', 'cancelled', 'void'].includes(String(bill.status || '').toLowerCase()));
      setTotalPayable(openBills.reduce((total, bill) => total + Number(bill.balance_due ?? bill.total ?? bill.amount ?? 0), 0));
      setTotalPurchasesCount(records.length);
    } catch (error) {
      console.error('Error loading supplier totals:', error);
      setTotalPayable(0);
      setTotalPurchasesCount(0);
    }
  };

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus =
      filterStatus === 'all' || supplier.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleAddSupplier = async () => {
    if (!newSupplier.name || !newSupplier.email) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsAdding(true);
    try {
      const created = await createSupplier({
        ...newSupplier,
        status: 'active',
      });
      
      if (created) {
        toast.success('Supplier added successfully');
        setSuppliers([created, ...suppliers]);
        setIsAddDialogOpen(false);
        setNewSupplier({
          name: '',
          email: '',
          phone: '',
          company_name: '',
          address: '',
          city: '',
          country: 'Nigeria',
          tax_id: '',
          payment_terms: 'Net 30',
        });
      } else {
        toast.error('Failed to add supplier');
      }
    } catch (error) {
      console.error('Error adding supplier:', error);
      toast.error('Failed to add supplier');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;

    try {
      const success = await deleteSupplier(id);
      
      if (success) {
        toast.success('Supplier deleted successfully');
        setSuppliers(suppliers.filter((s) => s.id !== id));
      } else {
        toast.error('Failed to delete supplier');
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
      toast.error('Failed to delete supplier');
    }
  };

  const handleSearch = async (query: string) => {
    setSearchTerm(query);
    
    if (!query.trim()) {
      loadSuppliers();
      return;
    }

    try {
      const results = await searchSuppliers(query);
      setSuppliers(results);
    } catch (error) {
      console.error('Error searching suppliers:', error);
      toast.error('Search failed');
    }
  };

  const handleExport = () => {
    toast.success('Exporting suppliers to CSV...');
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading suppliers...</p>
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
            <h1>Suppliers</h1>
            <Badge variant="secondary">{suppliers.length} Total</Badge>
          </div>
          <p className="text-muted-foreground">
            Manage your supplier and vendor database
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Supplier</DialogTitle>
                <DialogDescription>
                  Enter supplier details to add them to your database
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Contact Name *</Label>
                    <Input
                      id="name"
                      value={newSupplier.name}
                      onChange={(e) =>
                        setNewSupplier({ ...newSupplier, name: e.target.value })
                      }
                      placeholder="John Smith"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="company">Company Name *</Label>
                    <Input
                      id="company"
                      value={newSupplier.company_name}
                      onChange={(e) =>
                        setNewSupplier({ ...newSupplier, company_name: e.target.value })
                      }
                      placeholder="Global Supplies Inc"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newSupplier.email}
                      onChange={(e) =>
                        setNewSupplier({ ...newSupplier, email: e.target.value })
                      }
                      placeholder="contact@example.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={newSupplier.phone}
                      onChange={(e) =>
                        setNewSupplier({ ...newSupplier, phone: e.target.value })
                      }
                      placeholder="+234 801 234 5678"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newSupplier.address}
                    onChange={(e) =>
                      setNewSupplier({ ...newSupplier, address: e.target.value })
                    }
                    placeholder="45 Warehouse District"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={newSupplier.city}
                      onChange={(e) =>
                        setNewSupplier({ ...newSupplier, city: e.target.value })
                      }
                      placeholder="Lagos"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={newSupplier.country}
                      onValueChange={(value) =>
                        setNewSupplier({ ...newSupplier, country: value })
                      }
                    >
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Nigeria">Nigeria</SelectItem>
                        <SelectItem value="Ghana">Ghana</SelectItem>
                        <SelectItem value="South Africa">South Africa</SelectItem>
                        <SelectItem value="Kenya">Kenya</SelectItem>
                        <SelectItem value="USA">United States</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="taxId">Tax ID / GST Number</Label>
                    <Input
                      id="taxId"
                      value={newSupplier.tax_id}
                      onChange={(e) =>
                        setNewSupplier({ ...newSupplier, tax_id: e.target.value })
                      }
                      placeholder="TIN-98765432"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="paymentTerms">Payment Terms</Label>
                    <Select
                      value={newSupplier.payment_terms}
                      onValueChange={(value) =>
                        setNewSupplier({ ...newSupplier, payment_terms: value })
                      }
                    >
                      <SelectTrigger id="paymentTerms">
                        <SelectValue placeholder="Select terms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Immediate">Immediate</SelectItem>
                        <SelectItem value="Net 7">Net 7 Days</SelectItem>
                        <SelectItem value="Net 15">Net 15 Days</SelectItem>
                        <SelectItem value="Net 30">Net 30 Days</SelectItem>
                        <SelectItem value="Net 45">Net 45 Days</SelectItem>
                        <SelectItem value="Net 60">Net 60 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSupplier} disabled={isAdding}>
                  {isAdding ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Supplier'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold">{suppliers.length}</div>
            <p className="text-xs text-muted-foreground">Active vendors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payable</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold">
              {formatCurrency(totalPayable, currency)}
            </div>
            <p className="text-xs text-muted-foreground">Outstanding payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold">
              {totalPurchasesCount}
            </div>
            <p className="text-xs text-muted-foreground">All time orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Status</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold">
              {suppliers.filter((s) => s.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">Active suppliers</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Supplier List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search suppliers by name, email, or company..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Payment Terms</TableHead>
                <TableHead className="text-right">Payable</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Truck className="w-12 h-12 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm
                          ? 'No suppliers found matching your search'
                          : 'No suppliers yet. Add your first supplier to get started.'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{supplier.name}</p>
                        <p className="text-sm text-muted-foreground">{supplier.company_name || '-'}</p>
                      </div>
                    </TableCell>
                    <TableCell>{supplier.company_name || '-'}</TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <p className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {supplier.email || '-'}
                        </p>
                        <p className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {supplier.phone || '-'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {supplier.city || '-'}, {supplier.country || '-'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{supplier.payment_terms || '-'}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(supplier.balance || 0, currency)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={supplier.status === 'active' ? 'default' : 'secondary'}
                      >
                        {supplier.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSupplier(supplier.id)}
                        >
                          <Trash2 className="w-4 h-4" />
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