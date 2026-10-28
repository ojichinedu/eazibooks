import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
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
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Download,
  Upload,
  Grid,
  List,
  DollarSign,
  Barcode,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useCurrency } from '../utils/CurrencyContext';
import { formatCurrency } from '../utils/currency';
import { 
  fetchProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  searchProducts,
  getLowStockProducts,
  type Product as DBProduct 
} from '../utils/database/products';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  type: 'product' | 'service';
  description: string;
  price: number;
  cost: number;
  stock: number;
  lowStockThreshold: number;
  taxRate: number;
  unit: string;
  status: 'active' | 'inactive';
}

export function ProductsCatalog() {
  const { currency } = useCurrency();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [lowStockCount, setLowStockCount] = useState(0);

  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: '',
    type: 'product' as 'product' | 'service',
    description: '',
    price: 0,
    cost: 0,
    stock_quantity: 0,
    low_stock_threshold: 10,
    tax_rate: 18,
    unit: 'piece',
  });

  const categories = ['Electronics', 'Office', 'Services', 'Hardware', 'Software'];

  // Load products on mount
  useEffect(() => {
    loadProducts();
    loadLowStock();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadLowStock = async () => {
    try {
      const lowStock = await getLowStockProducts();
      setLowStockCount(lowStock.length);
    } catch (error) {
      console.error('Error loading low stock:', error);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory =
      filterCategory === 'all' || product.category === filterCategory;

    const matchesType =
      filterType === 'all' || product.type === filterType;

    return matchesSearch && matchesCategory && matchesType;
  });

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsAdding(true);
    try {
      const created = await createProduct({
        ...newProduct,
        status: 'active',
      });
      
      if (created) {
        toast.success('Product added successfully');
        setProducts([created, ...products]);
        setIsAddDialogOpen(false);
        setNewProduct({
          name: '',
          sku: '',
          category: '',
          type: 'product',
          description: '',
          price: 0,
          cost: 0,
          stock_quantity: 0,
          low_stock_threshold: 10,
          tax_rate: 18,
          unit: 'piece',
        });
        loadLowStock();
      } else {
        console.error('Product creation returned null - check database connection and RLS policies');
        toast.error('Failed to add product. Check browser console (F12) for details.', {
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error('Error adding product:', error);
      const errorMessage = error?.message || 'Failed to add product';
      
      // Provide helpful error messages based on common issues
      if (errorMessage.includes('company')) {
        toast.error('Setup Error: Your profile is missing company information. See FINAL_FIX_GUIDE.md', {
          duration: 7000,
        });
      } else if (errorMessage.includes('policy') || errorMessage.includes('RLS')) {
        toast.error('Permission Error: Database policies not set up. Run COMPLETE_RLS_AND_SETUP_FIX.sql', {
          duration: 7000,
        });
      } else {
        toast.error(`Error: ${errorMessage}`, {
          duration: 5000,
        });
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const success = await deleteProduct(id);
      
      if (success) {
        toast.success('Product deleted successfully');
        setProducts(products.filter((p) => p.id !== id));
        loadLowStock();
      } else {
        toast.error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleSearch = async (query: string) => {
    setSearchTerm(query);
    
    if (!query.trim()) {
      loadProducts();
      return;
    }

    try {
      const results = await searchProducts(query);
      setProducts(results);
    } catch (error) {
      console.error('Error searching products:', error);
      toast.error('Search failed');
    }
  };

  const getTotalValue = () => {
    return products.reduce((sum, p) => sum + (p.price * (p.stock_quantity || 0)), 0);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading products...</p>
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
            <h1>Products & Services</h1>
            <Badge variant="secondary">{products.length} Items</Badge>
          </div>
          <p className="text-muted-foreground">
            Manage your product catalog and service offerings
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.success('Export feature coming soon')} className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Product/Service</DialogTitle>
                <DialogDescription>
                  Enter product or service details to add to your catalog
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="productName">Product/Service Name *</Label>
                    <Input
                      id="productName"
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, name: e.target.value })
                      }
                      placeholder="Premium Widget A"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sku">SKU/Code *</Label>
                    <Input
                      id="sku"
                      value={newProduct.sku}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, sku: e.target.value.toUpperCase() })
                      }
                      placeholder="PWA-001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={newProduct.type}
                      onValueChange={(value: 'product' | 'service') =>
                        setNewProduct({ ...newProduct, type: value })
                      }
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newProduct.category}
                      onValueChange={(value) =>
                        setNewProduct({ ...newProduct, category: value })
                      }
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, description: e.target.value })
                    }
                    placeholder="Product description..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Selling Price (₦)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="15000"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cost">Cost Price (₦)</Label>
                    <Input
                      id="cost"
                      type="number"
                      value={newProduct.cost}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          cost: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="10000"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      value={newProduct.tax_rate}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          tax_rate: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="18"
                    />
                  </div>
                </div>

                {newProduct.type === 'product' && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="stock">Stock Quantity</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={newProduct.stock_quantity}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            stock_quantity: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="45"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="threshold">Low Stock Alert</Label>
                      <Input
                        id="threshold"
                        type="number"
                        value={newProduct.low_stock_threshold}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            low_stock_threshold: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="10"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="unit">Unit</Label>
                      <Select
                        value={newProduct.unit}
                        onValueChange={(value) =>
                          setNewProduct({ ...newProduct, unit: value })
                        }
                      >
                        <SelectTrigger id="unit">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="piece">Piece</SelectItem>
                          <SelectItem value="box">Box</SelectItem>
                          <SelectItem value="bundle">Bundle</SelectItem>
                          <SelectItem value="kg">Kilogram</SelectItem>
                          <SelectItem value="liter">Liter</SelectItem>
                          <SelectItem value="meter">Meter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {newProduct.type === 'service' && (
                  <div className="grid gap-2">
                    <Label htmlFor="serviceUnit">Service Unit</Label>
                    <Select
                      value={newProduct.unit}
                      onValueChange={(value) =>
                        setNewProduct({ ...newProduct, unit: value })
                      }
                    >
                      <SelectTrigger id="serviceUnit">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hour">Hour</SelectItem>
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                        <SelectItem value="month">Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddProduct} disabled={isAdding}>
                  {isAdding ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add to Catalog'
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
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold">
              {products.filter((p) => p.type === 'product').length}
            </div>
            <p className="text-xs text-muted-foreground">Physical items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold">
              {products.filter((p) => p.type === 'service').length}
            </div>
            <p className="text-xs text-muted-foreground">Service offerings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold">{formatCurrency(getTotalValue(), currency)}</div>
            <p className="text-xs text-muted-foreground">Total stock value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-destructive">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Items need restocking</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Product List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Catalog
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name, SKU, or category..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
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
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="product">Products Only</SelectItem>
                <SelectItem value="service">Services Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product/Service</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="w-12 h-12 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm
                          ? 'No products found matching your search'
                          : 'No products yet. Add your first product to get started.'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {product.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.type === 'product' ? 'default' : 'secondary'}>
                        {product.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(product.price, currency)}
                    </TableCell>
                    <TableCell className="text-center">
                      {product.type === 'product' ? (
                        <div className="flex flex-col items-center">
                          <span
                            className={
                              (product.stock_quantity || 0) <= (product.low_stock_threshold || 0)
                                ? 'text-destructive font-medium'
                                : ''
                            }
                          >
                            {product.stock_quantity || 0}
                          </span>
                          <span className="text-xs text-muted-foreground">{product.unit}(s)</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                        {product.status}
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
                          onClick={() => handleDeleteProduct(product.id)}
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