import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import Cart from '../components/Cart';
import CalculatorPopup from '../components/CalculatorPopup';
import { getProducts, createSale } from '../utils/api';
import { Search, Filter, Grid, BarChart3 } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const POS = () => {
  const { user, loading } = useAuth();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      // Only fetch if user is authenticated and not loading
      if (!loading && user && user.token) {
        console.log('POS: User authenticated, fetching products...');
        try {
          const response = await getProducts();
          setProducts(response.data);
          setError('');
        } catch (error) {
          console.error('Failed to fetch products:', error);
          setError(error.response?.data?.message || 'Failed to load products');
        }
      } else {
        console.log('POS: Waiting for auth...', { loading, user: !!user });
      }
    };

    fetchProducts();
  }, [user, loading]); // Depend on auth state

  const addToCart = product => {
    const existing = cart.find(item => item.productId === product._id);
    if (existing) {
      setCart(
        cart.map(item =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { 
        productId: product._id, 
        name: product.name, 
        quantity: 1, 
        price: product.price,
        image: product.image
      }]);
    }
  };

  const updateQuantity = (productId, quantity) => {
    setCart(
      cart.map(item =>
        item.productId === productId ? { ...item, quantity: parseInt(quantity) } : item
      )
    );
  };

  const removeFromCart = productId => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const checkout = async () => {
    try {
      await createSale({ products: cart });
      setCart([]);
      alert('Sale completed successfully!');
    } catch (error) {
      console.error(error);
      alert('Error processing sale. Please try again.');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode.includes(search)
  );

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Show loading while auth is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading POS System...</p>
        </div>
      </div>
    );
  }

  // Show error if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold text-red-600 mb-2">Authentication Required</h2>
          <p className="text-slate-600">Please log in to access the POS system.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header Section - More Compact */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg shadow-md">
                <Grid className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Point of Sale</h1>
                <p className="text-sm text-slate-600">Manage transactions and inventory</p>
              </div>
            </div>
            
            {/* Quick Stats - More Compact */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200">
                <div className="flex items-center space-x-1.5">
                  <BarChart3 className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-700">
                    {filteredProducts.length} Products
                  </span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-1.5 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-1.5">
                  <Grid className="h-3.5 w-3.5 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">
                    {getTotalItems()} in Cart
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar - Slightly Smaller */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search products by name or barcode..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder-slate-500 bg-white shadow-sm"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="bg-slate-100 p-1.5 rounded-md">
                <Filter className="h-3.5 w-3.5 text-slate-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Show error message if there's an API error */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800">Products</h2>
                <div className="text-sm text-slate-500">
                  {filteredProducts.length} of {products.length} products
                </div>
              </div>
              
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search className="h-6 w-6 text-slate-400" />
                  </div>
                  <h3 className="text-base font-medium text-slate-600 mb-2">
                    {products.length === 0 ? 'Loading products...' : 'No products found'}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {products.length === 0 ? 'Please wait while we load your inventory' : 'Try adjusting your search terms'}
                  </p>
                </div>
              ) : (
                // More Compact Grid - 4 columns on large screens, more on extra large
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                  {filteredProducts.map(product => (
                    <ProductCard 
                      key={product._id} 
                      product={product} 
                      onAddToCart={addToCart} 
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cart Section - Larger */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 h-fit sticky top-4">
              <Cart
                cart={cart}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
                checkout={checkout}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Calculator Popup */}
      <CalculatorPopup
        isOpen={isCalculatorOpen}
        onToggle={() => setIsCalculatorOpen(!isCalculatorOpen)}
      />
    </div>
  );
};

export default POS;