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
      // Clear the input after successful update
      setStockUpdate({ ...stockUpdate, [id]: '' });
    } catch (error) {
      console.error(error);
    }
  };

  const getImageUrl = (imageName) => {
    if (!imageName) return null;
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/products/${imageName}`;
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Stock Management</h2>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700">Product Inventory</h3>
        </div>
        
        <Table
          headers={['Image', 'Name', 'Barcode', 'Current Stock', 'Update Stock']}
          data={products}
          renderRow={product => (
            <tr key={product._id} className="hover:bg-gray-50">
              <td className="border-b border-gray-200 p-4">
                {product.image ? (
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No Image</span>
                  </div>
                )}
              </td>
              <td className="border-b border-gray-200 p-4">
                <div className="font-medium text-gray-800">{product.name}</div>
              </td>
              <td className="border-b border-gray-200 p-4 text-gray-600">
                {product.barcode}
              </td>
              <td className="border-b border-gray-200 p-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  product.stock > 20 ? 'bg-green-100 text-green-800' : 
                  product.stock > 10 ? 'bg-yellow-100 text-yellow-800' : 
                  product.stock > 0 ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {product.stock} units
                </span>
              </td>
              <td className="border-b border-gray-200 p-4">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={stockUpdate[product._id] || ''}
                    onChange={e => setStockUpdate({ ...stockUpdate, [product._id]: e.target.value })}
                    placeholder={product.stock.toString()}
                    className="w-20 border border-gray-300 rounded-lg px-3 py-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                  <button
                    onClick={() => handleStockUpdate(product._id, stockUpdate[product._id] || product.stock)}
                    disabled={!stockUpdate[product._id]}
                    className={`px-4 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      stockUpdate[product._id] 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Update
                  </button>
                </div>
              </td>
            </tr>
          )}
        />
      </div>
    </div>
  );
};

export default Stock;