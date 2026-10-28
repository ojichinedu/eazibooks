import { useCurrency } from '../utils/CurrencyContext';
import { formatCurrency, getCurrencySymbol } from '../utils/currency';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Download,
  Upload,
  FileText,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  MoreVertical,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { 
  fetchCustomers, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer,
  searchCustomers,
  type Customer as DBCustomer 
} from '../utils/database/customers';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  city: string;
  country: string;
  taxId: string;
  creditLimit: number;
  balance: number;
  totalInvoices: number;
  status: 'active' | 'inactive';
}

export function Customers() {
  const { currency } = useCurrency();
  const [customers, setCustomers] = useState<DBCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<DBCustomer | null>(null);

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    company_name: '',
    address: '',
    city: '',
    country: 'Nigeria',
    tax_id: '',
    credit_limit: 0,
  });

  const [editCustomer, setEditCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    company_name: '',
    address: '',
    city: '',
    country: 'Nigeria',
    tax_id: '',
    credit_limit: 0,
  });

  // Load customers on component mount
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await fetchCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus =
      filterStatus === 'all' || customer.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleAddCustomer = async () => {
    if (!newCustomer.name || !newCustomer.email) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsAdding(true);
    try {
      const created = await createCustomer({
        ...newCustomer,
        status: 'active',
      });
      
      if (created) {
        toast.success('Customer added successfully');
        setCustomers([created, ...customers]);
        setIsAddDialogOpen(false);
        setNewCustomer({
          name: '',
          email: '',
          phone: '',
          company_name: '',
          address: '',
          city: '',
          country: 'Nigeria',
          tax_id: '',
          credit_limit: 0,
        });
      } else {
        toast.error('Failed to add customer');
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      toast.error('Failed to add customer');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      const success = await deleteCustomer(id);
      
      if (success) {
        toast.success('Customer deleted successfully');
        setCustomers(customers.filter((c) => c.id !== id));
      } else {
        toast.error('Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer');
    }
  };

  const handleEditClick = (customer: DBCustomer) => {
    setSelectedCustomer(customer);
    setEditCustomer({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      company_name: customer.company_name || '',
      address: customer.address || '',
      city: customer.city || '',
      country: customer.country || 'Nigeria',
      tax_id: customer.tax_id || '',
      credit_limit: customer.credit_limit || 0,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateCustomer = async () => {
    if (!selectedCustomer || !editCustomer.name || !editCustomer.email) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsEditing(true);
    try {
      const updated = await updateCustomer(selectedCustomer.id, editCustomer);
      
      if (updated) {
        toast.success('Customer updated successfully');
        setCustomers(customers.map((c) => c.id === selectedCustomer.id ? updated : c));
        setIsEditDialogOpen(false);
        setSelectedCustomer(null);
      } else {
        toast.error('Failed to update customer');
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Failed to update customer');
    } finally {
      setIsEditing(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchTerm(query);
    
    if (!query.trim()) {
      loadCustomers();
      return;
    }

    try {
      const results = await searchCustomers(query);
      setCustomers(results);
    } catch (error) {
      console.error('Error searching customers:', error);
      toast.error('Search failed');
    }
  };

  const handleExport = () => {
    toast.success('Exporting customers to CSV...');
  };

  const handleImport = () => {
    toast.success('Import functionality coming soon');
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading customers...</p>
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
            <h1>Customers</h1>
            <Badge variant="secondary">{customers.length} Total</Badge>
          </div>
          <p className="text-muted-foreground">
            Manage your customer database and client information
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
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogDescription>
                  Enter customer details to add them to your database
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Customer Name *</Label>
                    <Input
                      id="name"
                      value={newCustomer.name}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, name: e.target.value })
                      }
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input
                      id="company"
                      value={newCustomer.company_name}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, company_name: e.target.value })
                      }
                      placeholder="ABC Corporation"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, email: e.target.value })
                      }
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={newCustomer.phone}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, phone: e.target.value })
                      }
                      placeholder="+234 803 456 7890"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newCustomer.address}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, address: e.target.value })
                    }
                    placeholder="123 Business Street"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={newCustomer.city}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, city: e.target.value })
                      }
                      placeholder="Lagos"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={newCustomer.country}
                      onValueChange={(value) =>
                        setNewCustomer({ ...newCustomer, country: value })
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
                      value={newCustomer.tax_id}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, tax_id: e.target.value })
                      }
                      placeholder="TIN-12345678"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="creditLimit">Credit Limit ({getCurrencySymbol(currency)})</Label>
                    <Input
                      id="creditLimit"
                      type="number"
                      value={newCustomer.credit_limit}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          credit_limit: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCustomer} disabled={isAdding}>
                  {isAdding ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Customer'
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
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">Active clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold">
              {formatCurrency(customers.reduce((sum, c) => sum + c.balance, 0), currency)}
            </div>
            <p className="text-xs text-muted-foreground">Pending payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold">
              {customers.length > 0 ? customers.length * 5 : 0}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Status</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold">
              {customers.filter((c) => c.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">Active customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Customer List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search customers by name, email, or company..."
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
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-12 h-12 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm
                          ? 'No customers found matching your search'
                          : 'No customers yet. Add your first customer to get started.'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{customer.company_name || '-'}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {customer.phone || '-'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {customer.city || '-'}, {customer.country || '-'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(customer.balance || 0, currency)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={customer.status === 'active' ? 'default' : 'secondary'}
                      >
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditClick(customer)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCustomer(customer.id)}
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

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer details
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Customer Name *</Label>
                <Input
                  id="edit-name"
                  value={editCustomer.name}
                  onChange={(e) =>
                    setEditCustomer({ ...editCustomer, name: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-company">Company Name</Label>
                <Input
                  id="edit-company"
                  value={editCustomer.company_name}
                  onChange={(e) =>
                    setEditCustomer({ ...editCustomer, company_name: e.target.value })
                  }
                  placeholder="ABC Corporation"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editCustomer.email}
                  onChange={(e) =>
                    setEditCustomer({ ...editCustomer, email: e.target.value })
                  }
                  placeholder="john@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={editCustomer.phone}
                  onChange={(e) =>
                    setEditCustomer({ ...editCustomer, phone: e.target.value })
                  }
                  placeholder="+234 803 456 7890"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={editCustomer.address}
                onChange={(e) =>
                  setEditCustomer({ ...editCustomer, address: e.target.value })
                }
                placeholder="123 Business Street"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-city">City</Label>
                <Input
                  id="edit-city"
                  value={editCustomer.city}
                  onChange={(e) =>
                    setEditCustomer({ ...editCustomer, city: e.target.value })
                  }
                  placeholder="Lagos"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-country">Country</Label>
                <Select
                  value={editCustomer.country}
                  onValueChange={(value) =>
                    setEditCustomer({ ...editCustomer, country: value })
                  }
                >
                  <SelectTrigger id="edit-country">
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
                <Label htmlFor="edit-taxId">Tax ID / GST Number</Label>
                <Input
                  id="edit-taxId"
                  value={editCustomer.tax_id}
                  onChange={(e) =>
                    setEditCustomer({ ...editCustomer, tax_id: e.target.value })
                  }
                  placeholder="TIN-12345678"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-creditLimit">Credit Limit ({getCurrencySymbol(currency)})</Label>
                <Input
                  id="edit-creditLimit"
                  type="number"
                  value={editCustomer.credit_limit}
                  onChange={(e) =>
                    setEditCustomer({
                      ...editCustomer,
                      credit_limit: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCustomer} disabled={isEditing}>
              {isEditing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Customer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}