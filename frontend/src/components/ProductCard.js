import React from 'react';
import { Package, DollarSign, Archive, ShoppingCart } from 'lucide-react';

const ProductCard = ({ product, onAddToCart }) => {
  const getImageUrl = (imageName) => {
    if (!imageName) return null;
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/products/${imageName}`;
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { color: 'red', label: 'Out of Stock', bgColor: 'bg-red-100', textColor: 'text-red-800' };
    if (stock <= 5) return { color: 'orange', label: 'Low Stock', bgColor: 'bg-orange-100', textColor: 'text-orange-800' };
    if (stock <= 10) return { color: 'yellow', label: 'Limited', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' };
    return { color: 'green', label: 'In Stock', bgColor: 'bg-green-100', textColor: 'text-green-800' };
  };

  const stockStatus = getStockStatus(product.stock);

  return (
    <div 
      className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
      onClick={() => product.stock > 0 && onAddToCart(product)}
    >
      {/* Product Image - Smaller */}
      <div className="relative w-full h-28 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
        {product.image ? (
          <img
            src={getImageUrl(product.image)}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              e.target.src = '';
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className={`w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center ${product.image ? 'hidden' : 'flex'}`}
        >
          <div className="text-center">
            <Package className="h-6 w-6 text-slate-400 mx-auto mb-1" />
            <span className="text-slate-500 text-xs font-medium">No Image</span>
          </div>
        </div>
        
        {/* Stock Status Badge - Smaller */}
        <div className="absolute top-2 right-2">
          <div className={`${stockStatus.bgColor} ${stockStatus.textColor} px-1.5 py-0.5 rounded-md text-xs font-medium shadow-sm backdrop-blur-sm`}>
            {stockStatus.label}
          </div>
        </div>
      </div>

      {/* Product Details - Compact */}
      <div className="p-3">
        {/* Product Name - Smaller */}
        <h3 className="font-semibold text-sm text-slate-800 mb-2 line-clamp-2 leading-tight" title={product.name}>
          {product.name}
        </h3>
        
        {/* Product Info - More Compact */}
        <div className="space-y-2 mb-3">
          {/* Price - Inline Style */}
          <div className="flex items-center justify-between p-2 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg">
            <div className="flex items-center space-x-1.5">
              <div className="bg-emerald-500 p-1 rounded-md">
                <DollarSign className="h-2.5 w-2.5 text-white" />
              </div>
              <span className="text-xs font-medium text-emerald-700">Price</span>
            </div>
            <span className="font-bold text-lg text-emerald-600">
              ${product.price}
            </span>
          </div>
          
          {/* Stock - Inline Style */}
          <div className="flex items-center justify-between p-2 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg">
            <div className="flex items-center space-x-1.5">
              <div className="bg-slate-500 p-1 rounded-md">
                <Archive className="h-2.5 w-2.5 text-white" />
              </div>
              <span className="text-xs font-medium text-slate-700">Stock</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-slate-800 text-sm">{product.stock}</span>
              <span className="text-xs text-slate-500">units</span>
            </div>
          </div>
        </div>

        {/* Action Button - Smaller */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click event
            onAddToCart(product);
          }}
          disabled={product.stock === 0}
          className={`w-full py-2 px-3 rounded-lg font-medium text-xs transition-all duration-200 flex items-center justify-center space-x-1.5 ${
            product.stock === 0
              ? 'bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm hover:shadow-blue-500/25 transform hover:-translate-y-0.5'
          }`}
        >
          {product.stock === 0 ? (
            <>
              <Archive className="h-3 w-3" />
              <span>Out of Stock</span>
            </>
          ) : (
            <>
              <ShoppingCart className="h-3 w-3" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;