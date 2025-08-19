import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../utils/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', barcode: '', price: '', stock: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await getProducts();
      setProducts(response.data);
    };
    fetchProducts();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('barcode', form.barcode);
      formData.append('price', form.price);
      formData.append('stock', form.stock);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await createProduct(formData);
      setForm({ name: '', barcode: '', price: '', stock: '' });
      setImageFile(null);
      setImagePreview(null);
      // Reset file input
      document.getElementById('imageInput').value = '';
      
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

  const getImageUrl = (imageName) => {
    if (!imageName) return null;
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/products/${imageName}`;
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Products</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-4">Add New Product</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder="Product Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Barcode"
                value={form.barcode}
                onChange={e => setForm({ ...form, barcode: e.target.value })}
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Price"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Stock"
                value={form.stock}
                onChange={e => setForm({ ...form, stock: e.target.value })}
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image
            </label>
            <input
              id="imageInput"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {imagePreview && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image Preview
              </label>
              <img
                src={imagePreview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg border border-gray-300"
              />
            </div>
          )}

          <button 
            type="submit" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Add Product
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <Table
          headers={['Image', 'Name', 'Barcode', 'Price', 'Stock', 'Actions']}
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
              <td className="border-b border-gray-200 p-4 font-medium">{product.name}</td>
              <td className="border-b border-gray-200 p-4">{product.barcode}</td>
              <td className="border-b border-gray-200 p-4">${product.price}</td>
              <td className="border-b border-gray-200 p-4">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  product.stock > 10 ? 'bg-green-100 text-green-800' : 
                  product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {product.stock}
                </span>
              </td>
              <td className="border-b border-gray-200 p-4">
                <button
                  onClick={() => handleDelete(product._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition-colors duration-200"
                >
                  Delete
                </button>
              </td>
            </tr>
          )}
        />
      </div>
    </div>
  );
};

export default Products;