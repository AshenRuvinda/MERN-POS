import React from 'react';
import { Package, ShoppingCart } from 'lucide-react';
import { formatLkr } from '../utils/currency';

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
      className="bg-white border border-emerald-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 cursor-pointer flex flex-col h-full"
      onClick={() => product.stock > 0 && onAddToCart(product)}
    >
      {/* Product Image */}
      <div className="relative w-full h-24 bg-emerald-50 flex items-center justify-center overflow-hidden flex-shrink-0">
        {product.image ? (
          <img
            src={getImageUrl(product.image)}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            onError={(e) => {
              e.target.src = '';
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className={`w-full h-full bg-emerald-100 flex items-center justify-center ${product.image ? 'hidden' : 'flex'}`}
        >
          <Package className="h-5 w-5 text-emerald-400" />
        </div>
        
        {/* Stock Status Badge */}
        <div className="absolute top-1 right-1">
          <div className={`${stockStatus.bgColor} ${stockStatus.textColor} px-1 py-0.5 rounded text-xs font-semibold shadow-sm`}>
            {stockStatus.label}
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-2.5 flex flex-col flex-grow">
        {/* Product Name */}
        <h3 className="font-semibold text-xs text-slate-900 mb-1.5 line-clamp-2 leading-tight" title={product.name}>
          {product.name}
        </h3>
        
        {/* Price */}
        <div className="mb-1.5">
          <div className="text-xs text-slate-500 font-medium">Price</div>
          <div className="font-bold text-sm text-emerald-600">
            {formatLkr(product.price)}
          </div>
        </div>

        {/* Stock */}
        <div className="mb-2">
          <div className="text-xs text-slate-500 font-medium">Stock</div>
          <div className="font-semibold text-xs text-slate-700">
            {product.stock} units
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          disabled={product.stock === 0}
          className={`w-full py-1.5 px-2 rounded-lg font-medium text-xs transition-all duration-200 flex items-center justify-center gap-1 mt-auto ${
            product.stock === 0
              ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
          }`}
        >
          <ShoppingCart className="h-3 w-3" />
          <span>{product.stock === 0 ? 'Out' : 'Add'}</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;