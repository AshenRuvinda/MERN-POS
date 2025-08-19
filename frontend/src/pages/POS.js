import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import Cart from '../components/Cart';
import { getProducts, createSale } from '../utils/api';

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
      setCart([...cart, { productId: product._id, name: product.name, quantity: 1, price: product.price }]);
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
      alert('Sale completed!');
    } catch (error) {
      console.error(error);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode.includes(search)
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">POS</h2>
      <input
        type="text"
        placeholder="Search by name or barcode"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="border p-2 mb-4 w-full"
      />
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <div className="grid grid-cols-3 gap-4">
            {filteredProducts.map(product => (
              <ProductCard key={product._id} product={product} onAddToCart={addToCart} />
            ))}
          </div>
        </div>
        <Cart
          cart={cart}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
          checkout={checkout}
        />
      </div>
    </div>
  );
};

export default POS;