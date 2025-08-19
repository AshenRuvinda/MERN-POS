import React from 'react';

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div className="border p-4 rounded shadow">
      <h3 className="font-bold">{product.name}</h3>
      <p>Price: ${product.price}</p>
      <p>Stock: {product.stock}</p>
      <button
        onClick={() => onAddToCart(product)}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;