import React from 'react';

const ProductCard = ({ product, onAddToCart }) => {
  const getImageUrl = (imageName) => {
    if (!imageName) return null;
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/products/${imageName}`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Product Image */}
      <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
        {product.image ? (
          <img
            src={getImageUrl(product.image)}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '';
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className={`w-full h-full bg-gray-200 flex items-center justify-center ${product.image ? 'hidden' : 'flex'}`}
        >
          <span className="text-gray-400 text-sm">No Image</span>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 mb-2 truncate" title={product.name}>
          {product.name}
        </h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Price:</span>
            <span className="font-semibold text-lg text-green-600">
              ${product.price}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Stock:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              product.stock > 10 ? 'bg-green-100 text-green-800' : 
              product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
              'bg-red-100 text-red-800'
            }`}>
              {product.stock} units
            </span>
          </div>
        </div>

        <button
          onClick={() => onAddToCart(product)}
          disabled={product.stock === 0}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
            product.stock === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;