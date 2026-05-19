import React from 'react';
import { ShoppingCart, Minus, Plus, X, CreditCard, Package, Receipt } from 'lucide-react';
import { formatLkr } from '../utils/currency';

const Cart = ({ cart, updateQuantity, removeFromCart, checkout }) => {
  const getImageUrl = (imageName) => {
    if (!imageName) return null;
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/products/${imageName}`;
  };

  const getCashierName = () => {
    try {
      // Get user data from localStorage (stored during login)
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        console.log('User data from localStorage:', user); // Debug log
        
        if (user.userType === 'cashier') {
          // Try to get first and last name, fallback to username
          if (user.firstName && user.lastName) {
            return `${user.firstName} ${user.lastName}`;
          }
          // Fallback to username if names are not available
          return user.username || 'Unknown Cashier';
        } else if (user.userType === 'admin') {
          return user.username || 'Administrator';
        }
      }
      
      // Additional fallback: try to get from token if user data is not properly stored
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          return tokenPayload.username || 'Unknown User';
        } catch (tokenError) {
          console.error('Error parsing token:', tokenError);
        }
      }
      
      return 'Unknown Cashier';
    } catch (error) {
      console.error('Error getting cashier name:', error);
      return 'Unknown Cashier';
    }
  };

  const generateReceipt = () => {
    // Get cashier name from stored user data
    const cashierName = getCashierName();
    
    const receiptWindow = window.open('', '_blank');
    const receiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            max-width: 400px; 
            margin: 0 auto; 
            padding: 20px; 
            line-height: 1.4;
          }
          .logo-section {
            text-align: center;
            margin-bottom: 15px;
          }
          .logo-placeholder {
            width: 80px;
            height: 80px;
            border: 2px dashed #ccc;
            border-radius: 8px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: #999;
            font-size: 12px;
            margin-bottom: 10px;
          }
          .company-info {
            text-align: center;
            margin-bottom: 10px;
          }
          .company-name {
            font-size: 1.4em;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .header { 
            text-align: center; 
            border-bottom: 2px solid #000; 
            padding-bottom: 10px; 
            margin-bottom: 20px; 
          }
          .receipt-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 0.9em;
          }
          .item { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 8px; 
            border-bottom: 1px dotted #ccc; 
            padding-bottom: 5px; 
          }
          .total { 
            border-top: 2px solid #000; 
            margin-top: 15px; 
            padding-top: 10px; 
            font-weight: bold; 
            font-size: 1.2em; 
          }
          .cashier-info {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #ccc;
            text-align: center;
            font-size: 0.9em;
          }
          .footer { 
            text-align: center; 
            margin-top: 20px; 
            padding-top: 15px; 
            border-top: 1px solid #ccc; 
            color: #666; 
            font-size: 0.9em;
          }
          @media print {
            body { margin: 0; padding: 10px; }
          }
        </style>
      </head>
      <body>
        <div class="logo-section">
          <div class="logo-placeholder">
            <img src="https://github.com/AshenRuvinda/ProjectImages/blob/master/WhatsApp%20Image%202025-08-20%20at%203.11.05%20PM.jpeg?raw=true" alt="Jilani Super Logo" style="width: 80px; height: 80px; object-fit: contain; border-radius: 8px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
            <div style="width: 80px; height: 80px; border: 2px dashed #ccc; border-radius: 8px; display: none; align-items: center; justify-content: center; color: #999; font-size: 12px;">
              JILANI SUPER
            </div>
          </div>
          <div class="company-info">
            <div class="company-name">Jilani Super</div>
            <div style="font-size: 0.9em; color: #666;">
              No 46, Main Street, Eheliyagoda<br>
              Phone: 0112458739
            </div>
          </div>
        </div>
        
        <div class="header">
          <h2>PURCHASE RECEIPT</h2>
          <div class="receipt-info">
            <span>Receipt #: ${Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
            <span>Date: ${new Date().toLocaleDateString()}</span>
          </div>
          <div class="receipt-info">
            <span>Time: ${new Date().toLocaleTimeString()}</span>
            <span>Items: ${cart.length}</span>
          </div>
        </div>
        
        ${cart.map(item => `
          <div class="item">
            <div>
              <div>${item.name}</div>
              <div style="font-size: 0.9em; color: #666;">
                ${formatLkr(item.price)} x ${item.quantity}
              </div>
            </div>
            <div>${formatLkr(item.price * item.quantity)}</div>
          </div>
        `).join('')}
        
        <div class="total">
          <div style="display: flex; justify-content: space-between;">
            <span>TOTAL:</span>
            <span>${formatLkr(getTotalAmount())}</span>
          </div>
        </div>
        
        <div class="cashier-info">
          <strong>Served by: ${cashierName}</strong>
        </div>
        
        <div class="footer">
          <p><strong>Thank you for your purchase!</strong></p>
          <p>Please keep this receipt for your records</p>
          <p style="font-size: 0.8em;">Receipt generated on ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;
    
    receiptWindow.document.write(receiptContent);
    receiptWindow.document.close();
    receiptWindow.print();
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <div className="bg-white border border-emerald-200 rounded-xl shadow-md overflow-hidden flex flex-col h-full">
      {/* Cart Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 border-b border-emerald-300 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Shopping Cart</h3>
            <p className="text-xs text-emerald-100">{cart.length} items</p>
          </div>
        </div>
      </div>

      {cart.length === 0 ? (
        /* Empty Cart State */
        <div className="text-center py-8 px-4 flex flex-col items-center justify-center flex-grow">
          <ShoppingCart className="h-10 w-10 text-slate-300 mb-3" />
          <div className="text-slate-500 text-sm font-medium">Cart is empty</div>
          <p className="text-slate-400 text-xs mt-1">Add products to get started</p>
        </div>
      ) : (
        <>
          {/* Cart Items Table */}
          <div className="overflow-x-auto flex-grow overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-emerald-100 border-b-2 border-emerald-300">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-slate-800">Product</th>
                  <th className="px-2 py-2 text-right font-semibold text-slate-800 w-16">Price</th>
                  <th className="px-2 py-2 text-center font-semibold text-slate-800 w-20">Qty</th>
                  <th className="px-2 py-2 text-right font-semibold text-slate-800 w-20">Total</th>
                  <th className="px-2 py-2 text-center font-semibold text-slate-800 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-200">
                {cart.map(item => (
                  <tr key={item.productId} className="hover:bg-emerald-50 transition-colors">
                    <td className="px-3 py-3 text-slate-800 font-medium">{item.name}</td>
                    <td className="px-2 py-3 text-right text-emerald-600 font-semibold">{formatLkr(item.price)}</td>
                    <td className="px-2 py-3">
                      <div className="flex items-center justify-center bg-white border border-emerald-300 rounded gap-0.5 w-fit mx-auto">
                        <button
                          onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-emerald-100 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={e => updateQuantity(item.productId, Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-8 text-center border-0 py-1 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                          min="1"
                        />
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-emerald-100 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-right font-bold text-emerald-700">{formatLkr(item.price * item.quantity)}</td>
                    <td className="px-2 py-3 text-center">
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded transition-all"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cart Summary */}
          <div className="bg-emerald-50 border-t border-emerald-200 p-4 space-y-3 flex-shrink-0">
            {/* Total Amount */}
            <div className="flex justify-between items-center py-2 border-b-2 border-emerald-200">
              <span className="text-sm font-semibold text-slate-700">Subtotal:</span>
              <span className="text-xl font-bold text-emerald-600">
                {formatLkr(getTotalAmount())}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5">
              {/* Generate Receipt Button */}
              <button
                onClick={generateReceipt}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 px-3 rounded-lg font-semibold transition-all text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              >
                <Receipt className="h-4 w-4" />
                Receipt
              </button>

              {/* Checkout Button */}
              <button
                onClick={checkout}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-lg font-semibold transition-all text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              >
                <CreditCard className="h-4 w-4" />
                Pay
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;