import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import { getProducts, updateStock } from '../utils/api';

const Stock = () => {
  const [products, setProducts] = useState([]);
  const [stockUpdate, setStockUpdate] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await getProducts();
      setProducts(response.data);
    };
    fetchProducts();
  }, []);

  const handleStockUpdate = async (id, stock) => {
    try {
      await updateStock(id, { stock });
      const response = await getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Stock Management</h2>
      <Table
        headers={['Name', 'Barcode', 'Stock', 'Update Stock']}
        data={products}
        renderRow={product => (
          <tr key={product._id}>
            <td className="border p-2">{product.name}</td>
            <td className="border p-2">{product.barcode}</td>
            <td className="border p-2">{product.stock}</td>
            <td className="border p-2">
              <input
                type="number"
                value={stockUpdate[product._id] || product.stock}
                onChange={e => setStockUpdate({ ...stockUpdate, [product._id]: e.target.value })}
                className="border p-1 mr-2"
              />
              <button
                onClick={() => handleStockUpdate(product._id, stockUpdate[product._id])}
                className="bg-blue-500 text-white px-2 py-1 rounded"
              >
                Update
              </button>
            </td>
          </tr>
        )}
      />
    </div>
  );
};

export default Stock;