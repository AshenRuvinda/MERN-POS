import React from 'react';
import { ShoppingCart, Minus, Plus, X, CreditCard, Package } from 'lucide-react';

const Cart = ({ cart, updateQuantity, removeFromCart, checkout }) => {
  const getImageUrl = (imageName) => {
    if (!imageName) return null;
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/products/${imageName}`;
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
      {/* Cart Header */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg shadow-lg">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Shopping Cart</h2>
              <p className="text-sm text-slate-500">Review your items</p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full shadow-lg">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span className="text-sm font-semibold">
                {cart.length} {cart.length === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {cart.length === 0 ? (
        /* Empty Cart State */
        <div className="text-center py-16 px-6">
          <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="h-10 w-10 text-slate-400" />
          </div>
          <div className="text-slate-600 text-lg font-medium mb-2">Your cart is empty</div>
          <div className="text-slate-500 text-sm">Add some products to get started</div>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="max-h-96 overflow-y-auto p-4">
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.productId} className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition-colors duration-200">
                  <div className="flex items-center gap-4">
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200">
                      {item.image ? (
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-full h-full bg-slate-200 flex items-center justify-center ${item.image ? 'hidden' : 'flex'}`}
                      >
                        <Package className="h-6 w-6 text-slate-400" />
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-grow min-w-0">
                      <h3 className="font-semibold text-slate-800 mb-1 truncate">{item.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-600">$</span>
                        <span className="text-sm font-medium text-emerald-600">{item.price}</span>
                        <span className="text-sm text-slate-500">each</span>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center bg-white border border-slate-300 rounded-lg shadow-sm">
                      <button
                        onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                        className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-l-lg transition-colors duration-200"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={e => updateQuantity(item.productId, Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 text-center border-0 py-1.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                      />
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-r-lg transition-colors duration-200"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right min-w-[80px]">
                      <p className="font-bold text-slate-800 text-lg">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                      title="Remove from cart"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Summary */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-t border-slate-200 p-6">
            <div className="space-y-4">
              {/* Total Amount */}
              <div className="flex justify-between items-center py-2 border-b border-slate-300">
                <span className="text-lg font-semibold text-slate-700">Total Amount:</span>
                <div className="text-right">
                  <span className="text-3xl font-bold text-emerald-600">
                    ${getTotalAmount()}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={checkout}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center space-x-2"
              >
                <CreditCard className="h-5 w-5" />
                <span>Proceed to Checkout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;