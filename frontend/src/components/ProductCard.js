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
    <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Product Image */}
      <div className="relative w-full h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
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
            <Package className="h-12 w-12 text-slate-400 mx-auto mb-2" />
            <span className="text-slate-500 text-sm font-medium">No Image</span>
          </div>
        </div>
        
        {/* Stock Status Badge */}
        <div className="absolute top-3 right-3">
          <div className={`${stockStatus.bgColor} ${stockStatus.textColor} px-2 py-1 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm`}>
            {stockStatus.label}
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-5">
        {/* Product Name */}
        <h3 className="font-bold text-lg text-slate-800 mb-3 line-clamp-2 leading-tight" title={product.name}>
          {product.name}
        </h3>
        
        {/* Product Info Grid */}
        <div className="space-y-3 mb-5">
          {/* Price */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl">
            <div className="flex items-center space-x-2">
              <div className="bg-emerald-500 p-1.5 rounded-lg">
                <DollarSign className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-medium text-emerald-700">Price</span>
            </div>
            <span className="font-bold text-xl text-emerald-600">
              ${product.price}
            </span>
          </div>
          
          {/* Stock */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
            <div className="flex items-center space-x-2">
              <div className="bg-slate-500 p-1.5 rounded-lg">
                <Archive className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700">Stock</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-800">{product.stock}</span>
              <span className="text-sm text-slate-500">units</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onAddToCart(product)}
          disabled={product.stock === 0}
          className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
            product.stock === 0
              ? 'bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5'
          }`}
        >
          {product.stock === 0 ? (
            <>
              <Archive className="h-4 w-4" />
              <span>Out of Stock</span>
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;