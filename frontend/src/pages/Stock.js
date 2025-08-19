import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import { getProducts, updateStock } from '../utils/api';
import useAuth from '../hooks/useAuth';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Edit, 
  Save, 
  X,
  Archive,
  BarChart3,
  Zap,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';

const Stock = () => {
  const { user, loading } = useAuth();
  const [products, setProducts] = useState([]);
  const [stockUpdate, setStockUpdate] = useState({});
  const [editingStock, setEditingStock] = useState({});
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      if (!loading && user && user.token) {
        console.log('Stock: User authenticated, fetching products...');
        setIsLoading(true);
        setError('');
        
        try {
          const response = await getProducts();
          setProducts(response.data);
        } catch (error) {
          console.error('Failed to fetch products:', error);
          setError(error.response?.data?.message || 'Failed to load products');
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log('Stock: Waiting for auth...', { loading, user: !!user });
      }
    };

    fetchProducts();
  }, [user, loading]);

  const handleStockUpdate = async (id, newStock) => {
    try {
      setError('');
      setSuccessMessage('');
      
      await updateStock(id, { stock: parseInt(newStock) });
      
      // Update local state
      setProducts(products.map(product => 
        product._id === id 
          ? { ...product, stock: parseInt(newStock) }
          : product
      ));
      
      // Clear editing state
      setStockUpdate({ ...stockUpdate, [id]: '' });
      setEditingStock({ ...editingStock, [id]: false });
      
      // Show success message
      setSuccessMessage('Stock updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('Failed to update stock:', error);
      setError(error.response?.data?.message || 'Failed to update stock');
    }
  };

  const startEditing = (productId, currentStock) => {
    setEditingStock({ ...editingStock, [productId]: true });
    setStockUpdate({ ...stockUpdate, [productId]: currentStock.toString() });
  };

  const cancelEditing = (productId) => {
    setEditingStock({ ...editingStock, [productId]: false });
    setStockUpdate({ ...stockUpdate, [productId]: '' });
  };

  const getImageUrl = (imageName) => {
    if (!imageName) return null;
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/products/${imageName}`;
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { color: 'bg-red-100 text-red-800', label: 'Out of Stock', icon: <X className="h-3 w-3" /> };
    if (stock <= 5) return { color: 'bg-red-100 text-red-800', label: 'Critical', icon: <AlertTriangle className="h-3 w-3" /> };
    if (stock <= 20) return { color: 'bg-orange-100 text-orange-800', label: 'Low Stock', icon: <AlertTriangle className="h-3 w-3" /> };
    if (stock <= 50) return { color: 'bg-yellow-100 text-yellow-800', label: 'Moderate', icon: <BarChart3 className="h-3 w-3" /> };
    return { color: 'bg-green-100 text-green-800', label: 'Good', icon: <CheckCircle className="h-3 w-3" /> };
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.barcode.includes(search)
  );

  // Calculate stock statistics
  const stockStats = {
    total: products.length,
    outOfStock: products.filter(p => p.stock === 0).length,
    lowStock: products.filter(p => p.stock > 0 && p.stock <= 20).length,
    goodStock: products.filter(p => p.stock > 20).length
  };

  // Show loading while auth is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading Stock Management...</p>
        </div>
      </div>
    );
  }

  // Show error if user is not authenticated or not admin
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold text-red-600 mb-2">Authentication Required</h2>
          <p className="text-slate-600">Please log in to access stock management.</p>
        </div>
      </div>
    );
  }

  if (user.userType !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-slate-600">You don't have permission to access stock management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg">
              <Archive className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Stock Management</h1>
              <p className="text-slate-600">Monitor and update your inventory levels</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25 flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span><strong>Error:</strong> {error}</span>
          </div>
        )}

        {/* Stock Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-800">{stockStats.total}</span>
            </div>
            <p className="text-sm text-slate-600 font-medium">Total Products</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-green-500 p-2 rounded-lg">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-green-600">{stockStats.goodStock}</span>
            </div>
            <p className="text-sm text-slate-600 font-medium">Well Stocked</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-orange-500 p-2 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-orange-600">{stockStats.lowStock}</span>
            </div>
            <p className="text-sm text-slate-600 font-medium">Low Stock</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-red-500 p-2 rounded-lg">
                <X className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-red-600">{stockStats.outOfStock}</span>
            </div>
            <p className="text-sm text-slate-600 font-medium">Out of Stock</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search products by name or barcode..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-800 placeholder-slate-500 bg-slate-50/50"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <div className="bg-slate-100 p-2 rounded-lg">
                <Filter className="h-4 w-4 text-slate-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Product Inventory</h3>
              <p className="text-sm text-slate-600">Showing {filteredProducts.length} of {products.length} products</p>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium text-slate-700">Quick Stock Updates</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-slate-500">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-600 mb-2">
                {products.length === 0 ? 'No products found' : 'No matching products'}
              </h3>
              <p className="text-slate-500">
                {products.length === 0 ? 'Add products to start managing stock' : 'Try adjusting your search terms'}
              </p>
            </div>
          ) : (
            <Table
              headers={['Product', 'Details', 'Current Stock', 'Stock Level', 'Update Stock']}
              data={filteredProducts}
              renderRow={product => {
                const stockStatus = getStockStatus(product.stock);
                const isEditing = editingStock[product._id];
                
                return (
                  <tr key={product._id} className="hover:bg-slate-50 transition-colors duration-200">
                    {/* Product Image & Name */}
                    <td className="border-b border-slate-200 p-6">
                      <div className="flex items-center space-x-4">
                        {product.image ? (
                          <img
                            src={getImageUrl(product.image)}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-xl border border-slate-200 shadow-sm"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 bg-slate-200 rounded-xl flex items-center justify-center border border-slate-300">
                            <Package className="h-6 w-6 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-semibold text-slate-800 mb-1">{product.name}</h4>
                          <p className="text-sm text-slate-500">ID: {product._id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>

                    {/* Product Details */}
                    <td className="border-b border-slate-200 p-6">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-slate-500">Barcode:</span>
                          <code className="bg-slate-100 px-2 py-1 rounded text-sm font-mono text-slate-700">
                            {product.barcode}
                          </code>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-slate-500">Price:</span>
                          <span className="font-semibold text-emerald-600">${product.price}</span>
                        </div>
                      </div>
                    </td>

                    {/* Current Stock */}
                    <td className="border-b border-slate-200 p-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-slate-800 mb-1">
                          {product.stock}
                        </div>
                        <div className="text-sm text-slate-500">units</div>
                      </div>
                    </td>

                    {/* Stock Status */}
                    <td className="border-b border-slate-200 p-6">
                      <span className={`inline-flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium ${stockStatus.color}`}>
                        {stockStatus.icon}
                        <span>{stockStatus.label}</span>
                      </span>
                    </td>

                    {/* Stock Update Controls */}
                    <td className="border-b border-slate-200 p-6">
                      {isEditing ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={stockUpdate[product._id] || ''}
                            onChange={e => setStockUpdate({ ...stockUpdate, [product._id]: e.target.value })}
                            className="w-20 border border-slate-300 rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            min="0"
                            autoFocus
                          />
                          <button
                            onClick={() => handleStockUpdate(product._id, stockUpdate[product._id])}
                            disabled={!stockUpdate[product._id] || stockUpdate[product._id] === product.stock.toString()}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => cancelEditing(product._id)}
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-red-500/25"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(product._id, product.stock)}
                          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/25 flex items-center space-x-2"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Update</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Stock;