import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import Cart from '../components/Cart';
import { getProducts, createSale } from '../utils/api';
import { Search, Filter, Grid, BarChart3 } from 'lucide-react';

const POS = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await getProducts();
      setProducts(response.data);
    };
    fetchProducts();
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                <Grid className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Point of Sale</h1>
                <p className="text-slate-600">Manage transactions and inventory</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 px-4 py-2 rounded-xl border border-emerald-200">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">
                    {filteredProducts.length} Products Available
                  </span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-2 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-2">
                  <Grid className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    {getTotalItems()} Items in Cart
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search products by name or barcode..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder-slate-500 bg-white shadow-sm"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <div className="bg-slate-100 p-2 rounded-lg">
                <Filter className="h-4 w-4 text-slate-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Grid */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">Products</h2>
                <div className="text-sm text-slate-500">
                  Showing {filteredProducts.length} of {products.length} products
                </div>
              </div>
              
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-600 mb-2">No products found</h3>
                  <p className="text-slate-500">Try adjusting your search terms</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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

          {/* Cart Section */}
          <div className="lg:col-span-1">
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
  );
};

export default POS;