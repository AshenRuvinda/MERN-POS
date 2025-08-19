import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../utils/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', barcode: '', price: '', stock: '' });

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await getProducts();
      setProducts(response.data);
    };
    fetchProducts();
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await createProduct(form);
      setForm({ name: '', barcode: '', price: '', stock: '' });
      const response = await getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async id => {
    try {
      await deleteProduct(id);
      setProducts(products.filter(p => p._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Products</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="border p-2 mr-2"
        />
        <input
          type="text"
          placeholder="Barcode"
          value={form.barcode}
          onChange={e => setForm({ ...form, barcode: e.target.value })}
          className="border p-2 mr-2"
        />
        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })}
          className="border p-2 mr-2"
        />
        <input
          type="number"
          placeholder="Stock"
          value={form.stock}
          onChange={e => setForm({ ...form, stock: e.target.value })}
          className="border p-2 mr-2"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Product
        </button>
      </form>
      <Table
        headers={['Name', 'Barcode', 'Price', 'Stock', 'Actions']}
        data={products}
        renderRow={product => (
          <tr key={product._id}>
            <td className="border p-2">{product.name}</td>
            <td className="border p-2">{product.barcode}</td>
            <td className="border p-2">${product.price}</td>
            <td className="border p-2">{product.stock}</td>
            <td className="border p-2">
              <button
                onClick={() => handleDelete(product._id)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            </td>
          </tr>
        )}
      />
    </div>
  );
};

export default Products;