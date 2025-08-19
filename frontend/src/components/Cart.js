import React from 'react';

const Cart = ({ cart, updateQuantity, removeFromCart, checkout }) => {
  return (
    <div className="border p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Cart</h2>
      {cart.map(item => (
        <div key={item.productId} className="flex justify-between mb-2">
          <span>{item.name}</span>
          <div>
            <input
              type="number"
              value={item.quantity}
              onChange={e => updateQuantity(item.productId, e.target.value)}
              className="w-16 border p-1"
            />
            <button
              onClick={() => removeFromCart(item.productId)}
              className="ml-2 text-red-500"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={checkout}
        className="bg-green-500 text-white px-4 py-2 rounded mt-4"
      >
        Checkout
      </button>
    </div>
  );
};

export default Cart;