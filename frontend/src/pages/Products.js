import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../utils/api';
import { Package, Plus, Upload, Image, Trash2, DollarSign, Hash, Archive } from 'lucide-react';

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
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        setProducts(products.filter(p => p._id !== id));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const getImageUrl = (imageName) => {
    if (!imageName) return null;
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/products/${imageName}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-2">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Product Management</h1>
            <p className="text-slate-600">Manage your inventory and product catalog</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-2 rounded-xl border border-blue-200 inline-flex items-center space-x-2">
          <Archive className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">
            {products.length} Products in Catalog
          </span>
        </div>
      </div>
      
      {/* Add Product Form */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 mb-8 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Add New Product</h2>
              <p className="text-sm text-slate-600">Fill in the details to add a product to your catalog</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Product Details */}
              <div className="space-y-4">
                {/* Product Name */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700">
                    <Package className="h-4 w-4 text-slate-500" />
                    <span>Product Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter product name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50"
                    required
                  />
                </div>

                {/* Barcode */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700">
                    <Hash className="h-4 w-4 text-slate-500" />
                    <span>Barcode</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter barcode"
                    value={form.barcode}
                    onChange={e => setForm({ ...form, barcode: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50"
                    required
                  />
                </div>

                {/* Price and Stock Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Price */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700">
                      <DollarSign className="h-4 w-4 text-slate-500" />
                      <span>Price</span>
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={form.price}
                      onChange={e => setForm({ ...form, price: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>

                  {/* Stock */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700">
                      <Archive className="h-4 w-4 text-slate-500" />
                      <span>Stock</span>
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.stock}
                      onChange={e => setForm({ ...form, stock: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50"
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Image Upload */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700">
                    <Image className="h-4 w-4 text-slate-500" />
                    <span>Product Image</span>
                  </label>
                  
                  {/* File Input */}
                  <div className="relative">
                    <input
                      id="imageInput"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200">
                      <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-600">Click to upload image</p>
                      <p className="text-xs text-slate-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                </div>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Image Preview</label>
                    <div className="border border-slate-300 rounded-xl overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-32 object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-blue-500/25 flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add Product</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">Product Catalog</h3>
          <p className="text-sm text-slate-600">View and manage all products</p>
        </div>
        
        <div className="overflow-x-auto">
          <Table
            headers={['Image', 'Product Details', 'Barcode', 'Price', 'Stock', 'Actions']}
            data={products}
            renderRow={product => (
              <tr key={product._id} className="hover:bg-slate-50 transition-colors duration-200">
                <td className="border-b border-slate-200 p-6">
                  {product.image ? (
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-xl border border-slate-200 shadow-sm"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-slate-200 rounded-xl flex items-center justify-center border border-slate-300">
                      <Package className="h-6 w-6 text-slate-400" />
                    </div>
                  )}
                </td>
                <td className="border-b border-slate-200 p-6">
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1">{product.name}</h4>
                    <p className="text-sm text-slate-500">Product ID: {product._id.slice(-6)}</p>
                  </div>
                </td>
                <td className="border-b border-slate-200 p-6">
                  <code className="bg-slate-100 px-3 py-1 rounded-lg text-sm font-mono text-slate-700">
                    {product.barcode}
                  </code>
                </td>
                <td className="border-b border-slate-200 p-6">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    <span className="font-semibold text-emerald-600 text-lg">{product.price}</span>
                  </div>
                </td>
                <td className="border-b border-slate-200 p-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    product.stock > 20 ? 'bg-green-100 text-green-800' : 
                    product.stock > 10 ? 'bg-yellow-100 text-yellow-800' : 
                    product.stock > 0 ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {product.stock} units
                  </span>
                </td>
                <td className="border-b border-slate-200 p-6">
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-red-500/25 flex items-center space-x-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </td>
              </tr>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default Products;