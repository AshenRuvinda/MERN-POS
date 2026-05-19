import React, { useEffect, useMemo, useRef, useState } from 'react';
import Table from '../components/Table';
import {
  getProducts,
  getProductCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../utils/api';
import {
  Package,
  Plus,
  Upload,
  Image,
  Trash2,
  Banknote,
  Hash,
  Archive,
  Search,
  Download,
  Edit2,
  Tag,
  Building2,
  CalendarDays,
  AlertTriangle,
  X,
  Filter,
} from 'lucide-react';
import JsBarcode from 'jsbarcode';
import useAuth from '../hooks/useAuth';
import { formatLkr } from '../utils/currency';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const EXPIRY_SOON_DAYS = 30;
const UNIT_OPTIONS = ['piece', 'kg', 'g', 'liter', 'ml', 'packet', 'box'];

const createInitialFormState = () => ({
  name: '',
  barcode: '',
  sku: '',
  category: '',
  brand: '',
  description: '',
  buyingPrice: '',
  sellingPrice: '',
  price: '',
  discountPrice: '',
  stock: '',
  reorderLevel: '',
  unit: 'piece',
  batchNumber: '',
  manufactureDate: '',
  expiryDate: '',
  supplierName: '',
  supplierContact: '',
});

const generateBarcodeFromName = (name = '', suffix = '') => {
  const input = `${String(name).trim().toUpperCase().replace(/[^A-Z0-9]/g, '') || 'PRODUCT'}${suffix}`;
  let hash1 = 5381;
  let hash2 = 52711;

  for (let index = 0; index < input.length; index += 1) {
    const charCode = input.charCodeAt(index);
    hash1 = ((hash1 << 5) + hash1) + charCode;
    hash2 = (hash2 * 33) ^ charCode;
  }

  const combined = `${Math.abs(hash1 >>> 0)}${Math.abs(hash2 >>> 0)}`.replace(/\D/g, '');
  return combined.padStart(12, '0').slice(0, 12);
};

const firstDefined = (...values) => values.find(value => value !== undefined && value !== null && value !== '');

const formatStoredValue = (value) => (value === undefined || value === null ? '' : String(value));

const toNumber = (value) => {
  if (value === undefined || value === null || value === '') {
    return 0;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const getImageUrl = (imageName) => {
  if (!imageName) return null;
  return `${API_BASE_URL}/uploads/products/${imageName}`;
};

const getBarcodeUrl = (barcodeImageName) => {
  if (!barcodeImageName) return null;
  return `${API_BASE_URL}/uploads/barcodes/${barcodeImageName}`;
};

const getResolvedCategory = (product) => String(product?.category || '').trim() || 'Uncategorized';

const getResolvedUnit = (product) => String(product?.unit || '').trim() || 'piece';

const getDisplayPrice = (product) => {
  const value = firstDefined(product?.discountPrice, product?.sellingPrice, product?.price);
  return value === undefined ? null : Number(value);
};

const getStockValue = (product) => toNumber(product?.stock);

const getReorderLevelValue = (product) => toNumber(product?.reorderLevel);

const getExpiryInfo = (product) => {
  if (!product?.expiryDate) {
    return {
      label: 'No expiry',
      tone: 'bg-slate-100 text-slate-700 border-slate-200',
      daysRemaining: null,
      expired: false,
      expiringSoon: false,
    };
  }

  const expiryDate = new Date(product.expiryDate);
  if (Number.isNaN(expiryDate.getTime())) {
    return {
      label: 'Invalid date',
      tone: 'bg-slate-100 text-slate-700 border-slate-200',
      daysRemaining: null,
      expired: false,
      expiringSoon: false,
    };
  }

  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const daysRemaining = Math.ceil((expiryDate.getTime() - new Date().getTime()) / millisecondsPerDay);

  if (daysRemaining < 0) {
    return {
      label: 'Expired',
      tone: 'bg-red-100 text-red-800 border-red-200',
      daysRemaining,
      expired: true,
      expiringSoon: false,
    };
  }

  if (daysRemaining <= EXPIRY_SOON_DAYS) {
    return {
      label: `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left`,
      tone: 'bg-amber-100 text-amber-800 border-amber-200',
      daysRemaining,
      expired: false,
      expiringSoon: true,
    };
  }

  return {
    label: `${daysRemaining} days left`,
    tone: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    daysRemaining,
    expired: false,
    expiringSoon: false,
  };
};

const getProductStatusInfo = (product) => {
  const stock = getStockValue(product);
  const reorderLevel = getReorderLevelValue(product);
  const expiryInfo = getExpiryInfo(product);

  if (stock <= 0) {
    return {
      label: 'Out of Stock',
      tone: 'bg-red-100 text-red-800 border-red-200',
    };
  }

  if (expiryInfo.expired) {
    return {
      label: 'Expired',
      tone: 'bg-red-100 text-red-800 border-red-200',
    };
  }

  if (stock <= reorderLevel) {
    return {
      label: 'Low Stock',
      tone: 'bg-amber-100 text-amber-800 border-amber-200',
    };
  }

  if (expiryInfo.expiringSoon) {
    return {
      label: 'Expiring Soon',
      tone: 'bg-amber-100 text-amber-800 border-amber-200',
    };
  }

  return {
    label: 'Active',
    tone: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };
};

const buildFormData = (formState, imageFile) => {
  const formData = new FormData();
  Object.keys(formState).forEach((key) => {
    const value = formState[key];
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

  if (imageFile) {
    formData.append('image', imageFile);
  }

  return formData;
};

const normalizeProductToFormState = (product) => {
  const sellingPrice = firstDefined(product?.sellingPrice, product?.price);

  return {
    name: product?.name || '',
    barcode: product?.barcode || '',
    sku: product?.sku || '',
    category: product?.category || '',
    brand: product?.brand || '',
    description: product?.description || '',
    buyingPrice: formatStoredValue(product?.buyingPrice),
    sellingPrice: formatStoredValue(sellingPrice),
    price: formatStoredValue(sellingPrice),
    discountPrice: formatStoredValue(product?.discountPrice),
    stock: formatStoredValue(product?.stock),
    reorderLevel: formatStoredValue(product?.reorderLevel),
    unit: product?.unit || 'piece',
    batchNumber: product?.batchNumber || '',
    manufactureDate: product?.manufactureDate ? new Date(product.manufactureDate).toISOString().slice(0, 10) : '',
    expiryDate: product?.expiryDate ? new Date(product.expiryDate).toISOString().slice(0, 10) : '',
    supplierName: product?.supplierName || '',
    supplierContact: product?.supplierContact || '',
  };
};

const ProductFormFields = ({
  formState,
  categories,
  onFieldChange,
  imagePreview,
  onImageChange,
  imageInputRef,
  barcodeRef,
  generatedBarcode,
  isSaving,
  isEditMode = false,
  formId,
}) => {
  const categoryListId = `${formId}-category-options`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="mb-4 flex items-center space-x-2">
              <Package className="h-4 w-4 text-slate-700" />
              <h3 className="text-sm font-semibold text-slate-900">Basic Information</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-slate-800">
                  <Package className="h-4 w-4 text-slate-700" />
                  <span>Product Name</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter product name"
                  value={formState.name}
                  onChange={e => onFieldChange('name', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-slate-800 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isSaving}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-slate-800">
                    <Hash className="h-4 w-4 text-slate-700" />
                    <span>SKU</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Optional SKU"
                    value={formState.sku}
                    onChange={e => onFieldChange('sku', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-slate-800">
                    <Tag className="h-4 w-4 text-slate-700" />
                    <span>Category</span>
                  </label>
                  <input
                    list={categoryListId}
                    type="text"
                    placeholder="Select or type category"
                    value={formState.category}
                    onChange={e => onFieldChange('category', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSaving}
                  />
                  <datalist id={categoryListId}>
                    {categories.map(category => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-slate-800">
                    <Building2 className="h-4 w-4 text-slate-700" />
                    <span>Brand</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Brand name"
                    value={formState.brand}
                    onChange={e => onFieldChange('brand', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-slate-800">
                    <Archive className="h-4 w-4 text-slate-700" />
                    <span>Unit</span>
                  </label>
                  <select
                    value={formState.unit}
                    onChange={e => onFieldChange('unit', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSaving}
                  >
                    {UNIT_OPTIONS.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-slate-800">
                  <Image className="h-4 w-4 text-slate-700" />
                  <span>Description</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Product description, notes, or usage details"
                  value={formState.description}
                  onChange={e => onFieldChange('description', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="mb-4 flex items-center space-x-2">
              <Banknote className="h-4 w-4 text-slate-700" />
              <h3 className="text-sm font-semibold text-slate-900">Pricing and Stock</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-slate-800">
                  <Banknote className="h-4 w-4 text-slate-700" />
                  <span>Buying Price</span>
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={formState.buyingPrice}
                  onChange={e => onFieldChange('buyingPrice', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                  min="0"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-slate-800">
                  <Banknote className="h-4 w-4 text-slate-700" />
                  <span>Selling Price</span>
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={formState.sellingPrice}
                  onChange={e => onFieldChange('sellingPrice', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                  min="0"
                  required
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-slate-800">
                  <Banknote className="h-4 w-4 text-slate-700" />
                  <span>Discount Price</span>
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={formState.discountPrice}
                  onChange={e => onFieldChange('discountPrice', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                  min="0"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-slate-800">
                  <Archive className="h-4 w-4 text-slate-700" />
                  <span>Stock</span>
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={formState.stock}
                  onChange={e => onFieldChange('stock', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-slate-800">
                  <AlertTriangle className="h-4 w-4 text-slate-700" />
                  <span>Reorder Level</span>
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={formState.reorderLevel}
                  onChange={e => onFieldChange('reorderLevel', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-slate-800">
                  <Archive className="h-4 w-4 text-slate-700" />
                  <span>Legacy Price</span>
                </label>
                <input
                  type="number"
                  placeholder="Auto-synced"
                  value={formState.price}
                  readOnly
                  className="w-full rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-slate-800"
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="mb-4 flex items-center space-x-2">
              <CalendarDays className="h-4 w-4 text-slate-700" />
              <h3 className="text-sm font-semibold text-slate-900">Expiry and Supplier</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-slate-800">
                  <Hash className="h-4 w-4 text-slate-700" />
                  <span>Batch Number</span>
                </label>
                <input
                  type="text"
                  placeholder="Batch number"
                  value={formState.batchNumber}
                  onChange={e => onFieldChange('batchNumber', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-slate-800">
                  <CalendarDays className="h-4 w-4 text-slate-700" />
                  <span>Manufacture Date</span>
                </label>
                <input
                  type="date"
                  value={formState.manufactureDate}
                  onChange={e => onFieldChange('manufactureDate', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-slate-800">
                  <CalendarDays className="h-4 w-4 text-slate-700" />
                  <span>Expiry Date</span>
                </label>
                <input
                  type="date"
                  value={formState.expiryDate}
                  onChange={e => onFieldChange('expiryDate', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-slate-800">
                  <Building2 className="h-4 w-4 text-slate-700" />
                  <span>Supplier Name</span>
                </label>
                <input
                  type="text"
                  placeholder="Supplier name"
                  value={formState.supplierName}
                  onChange={e => onFieldChange('supplierName', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-slate-800">
                  <Hash className="h-4 w-4 text-slate-700" />
                  <span>Supplier Contact</span>
                </label>
                <input
                  type="text"
                  placeholder="Phone, email, or other contact detail"
                  value={formState.supplierContact}
                  onChange={e => onFieldChange('supplierContact', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="mb-4 flex items-center space-x-2">
              <Hash className="h-4 w-4 text-slate-700" />
              <h3 className="text-sm font-semibold text-slate-900">Barcode</h3>
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-semibold text-slate-800">
                <Hash className="h-4 w-4 text-slate-700" />
                <span>Auto Generated Barcode</span>
              </label>
              <input
                type="text"
                placeholder="Auto-generated from product name"
                value={formState.barcode}
                readOnly
                className="w-full rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-slate-800"
                disabled={isSaving}
              />
              <p className="text-xs text-slate-600">
                {isEditMode
                  ? 'Changing the product name will refresh the barcode automatically.'
                  : 'This barcode is generated automatically from the product name.'}
              </p>
              {generatedBarcode && (
                <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
                  <div className="text-xs font-medium text-slate-700">Barcode Preview</div>
                  <svg ref={barcodeRef} />
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="mb-4 flex items-center space-x-2">
              <Image className="h-4 w-4 text-slate-700" />
              <h3 className="text-sm font-semibold text-slate-900">Product Image</h3>
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-semibold text-slate-800">
                <Image className="h-4 w-4 text-slate-700" />
                <span>Upload Image</span>
              </label>

              <div className="relative">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onImageChange}
                  className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                  disabled={isSaving}
                />
                <div className="rounded-xl border-2 border-dashed border-slate-300 p-6 text-center transition-all duration-200 hover:border-blue-400 hover:bg-blue-50">
                  <Upload className="mx-auto mb-2 h-8 w-8 text-slate-400" />
                  <p className="text-sm font-medium text-slate-800">Click to upload image</p>
                  <p className="mt-1 text-xs text-slate-700">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>

            {imagePreview && (
              <div className="mt-4 space-y-2">
                <label className="text-sm font-semibold text-slate-800">Image Preview</label>
                <div className="overflow-hidden rounded-xl border border-slate-300 bg-white">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-40 w-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Products = () => {
  const { user, loading } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(createInitialFormState());
  const [editForm, setEditForm] = useState(createInitialFormState());
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [generatedBarcode, setGeneratedBarcode] = useState('');
  const [editGeneratedBarcode, setEditGeneratedBarcode] = useState('');
  const [error, setError] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeActionId, setActiveActionId] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const barcodeRef = useRef(null);
  const editBarcodeRef = useRef(null);
  const createImageInputRef = useRef(null);
  const editImageInputRef = useRef(null);

  const drawBarcodePreview = (targetRef, barcodeValue) => {
    if (!targetRef.current) {
      return;
    }

    if (!barcodeValue) {
      targetRef.current.innerHTML = '';
      return;
    }

    try {
      JsBarcode(targetRef.current, barcodeValue, {
        format: 'CODE128',
        displayValue: true,
        fontSize: 14,
        height: 60,
      });
    } catch (barcodeError) {
      console.error('Barcode preview update failed', barcodeError);
    }
  };

  const loadInventory = async ({ silent = false } = {}) => {
    if (!silent) {
      setIsFetching(true);
    }

    try {
      const [productsResult, categoriesResult] = await Promise.allSettled([
        getProducts(),
        getProductCategories(),
      ]);

      if (productsResult.status !== 'fulfilled') {
        throw productsResult.reason;
      }

      const nextProducts = productsResult.value.data || [];
      setProducts(nextProducts);

      const fallbackCategories = Array.from(
        new Set(
          nextProducts
            .map(product => getResolvedCategory(product))
            .filter(category => category && category !== 'Uncategorized')
        )
      ).sort((left, right) => left.localeCompare(right));

      if (categoriesResult.status === 'fulfilled') {
        const fetchedCategories = (categoriesResult.value.data || [])
          .map(category => String(category || '').trim())
          .filter(Boolean);

        setCategories(
          Array.from(new Set([...fetchedCategories, ...fallbackCategories]))
            .sort((left, right) => left.localeCompare(right))
        );
      } else {
        setCategories(fallbackCategories);
      }

      setError('');
    } catch (fetchError) {
      console.error('Failed to fetch products:', fetchError);
      setError(fetchError.response?.data?.message || fetchError.message || 'Failed to load products');
    } finally {
      if (!silent) {
        setIsFetching(false);
      }
    }
  };

  useEffect(() => {
    if (!loading && user && user.token) {
      loadInventory();
    }
  }, [user, loading]);

  useEffect(() => {
    const autoBarcode = form.name ? generateBarcodeFromName(form.name) : '';
    setForm(prev => ({ ...prev, barcode: autoBarcode }));
    setGeneratedBarcode(autoBarcode);
    drawBarcodePreview(barcodeRef, autoBarcode);
  }, [form.name]);

  useEffect(() => {
    const shouldPreserveExistingBarcode = Boolean(
      editingProduct
      && editForm.name === editingProduct.name
      && editForm.barcode === editingProduct.barcode
    );

    const nextBarcode = shouldPreserveExistingBarcode
      ? editForm.barcode
      : (editForm.name ? generateBarcodeFromName(editForm.name) : '');

    setEditForm(prev => ({ ...prev, barcode: nextBarcode }));
    setEditGeneratedBarcode(nextBarcode);
    drawBarcodePreview(editBarcodeRef, nextBarcode);
  }, [editForm.name, editingProduct]);

  const categoryOptions = useMemo(() => {
    const values = new Set(['Uncategorized']);
    categories.forEach(category => {
      if (category) {
        values.add(category);
      }
    });

    products.forEach(product => {
      const resolvedCategory = getResolvedCategory(product);
      if (resolvedCategory) {
        values.add(resolvedCategory);
      }
    });

    return Array.from(values).sort((left, right) => left.localeCompare(right));
  }, [categories, products]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const resolvedCategory = getResolvedCategory(product);

      if (categoryFilter !== 'all' && resolvedCategory !== categoryFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchableValues = [
        product.name,
        product.barcode,
        product.sku,
        product.category,
        resolvedCategory,
        product.brand,
        product.description,
        product.supplierName,
        product.supplierContact,
        product.batchNumber,
        product.unit,
        product.stock,
        product.reorderLevel,
        product.price,
        product.sellingPrice,
        product.discountPrice,
      ]
        .filter(value => value !== undefined && value !== null)
        .map(value => String(value).toLowerCase());

      return searchableValues.some(value => value.includes(query));
    });
  }, [products, searchQuery, categoryFilter]);

  const dashboardStats = useMemo(() => {
    const totalProducts = products.length;
    let lowStockProducts = 0;
    let expiringSoonProducts = 0;
    let outOfStockProducts = 0;

    products.forEach((product) => {
      const stock = getStockValue(product);
      const reorderLevel = getReorderLevelValue(product);
      const expiryInfo = getExpiryInfo(product);

      if (stock <= 0) {
        outOfStockProducts += 1;
      }

      if (stock <= reorderLevel) {
        lowStockProducts += 1;
      }

      if (expiryInfo.expiringSoon) {
        expiringSoonProducts += 1;
      }
    });

    return [
      {
        label: 'Total Products',
        value: totalProducts,
        icon: Package,
        tone: 'from-slate-900 to-slate-700',
        badge: 'All inventory items',
      },
      {
        label: 'Low Stock Products',
        value: lowStockProducts,
        icon: AlertTriangle,
        tone: 'from-amber-500 to-orange-500',
        badge: 'At or below reorder level',
      },
      {
        label: 'Expiring Soon',
        value: expiringSoonProducts,
        icon: CalendarDays,
        tone: 'from-emerald-500 to-teal-500',
        badge: `Within ${EXPIRY_SOON_DAYS} days`,
      },
      {
        label: 'Out Of Stock',
        value: outOfStockProducts,
        icon: Archive,
        tone: 'from-red-500 to-rose-500',
        badge: 'No available stock',
      },
    ];
  }, [products]);

  const resetCreateForm = () => {
    setForm(createInitialFormState());
    setImageFile(null);
    setImagePreview(null);
    setGeneratedBarcode('');
    if (createImageInputRef.current) {
      createImageInputRef.current.value = '';
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingProduct(null);
    setEditForm(createInitialFormState());
    setEditImageFile(null);
    setEditImagePreview(null);
    setEditGeneratedBarcode('');
    if (editImageInputRef.current) {
      editImageInputRef.current.value = '';
    }
  };

  const handleImageChange = (event, setFile, setPreview) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      return;
    }

    setFile(null);
    setPreview(null);
  };

  const handleCreateFieldChange = (field, value) => {
    if (field === 'sellingPrice') {
      setForm(prev => ({
        ...prev,
        sellingPrice: value,
        price: value,
      }));
      return;
    }

    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleEditFieldChange = (field, value) => {
    if (field === 'sellingPrice') {
      setEditForm(prev => ({
        ...prev,
        sellingPrice: value,
        price: value,
      }));
      return;
    }

    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      await createProduct(buildFormData(form, imageFile));
      resetCreateForm();
      await loadInventory({ silent: true });
    } catch (submitError) {
      console.error('Failed to create product:', submitError);
      setError(submitError.response?.data?.message || submitError.message || 'Failed to create product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSubmit = async (event) => {
    event.preventDefault();
    if (!editingProduct?._id) {
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await updateProduct(editingProduct._id, buildFormData(editForm, editImageFile));
      closeEditModal();
      await loadInventory({ silent: true });
    } catch (submitError) {
      console.error('Failed to update product:', submitError);
      setError(submitError.response?.data?.message || submitError.message || 'Failed to update product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setEditForm(normalizeProductToFormState(product));
    setEditImageFile(null);
    setEditImagePreview(product.image ? getImageUrl(product.image) : null);
    setEditGeneratedBarcode(product.barcode || '');
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    setActiveActionId(id);
    setError('');

    try {
      await deleteProduct(id);
      await loadInventory({ silent: true });
    } catch (deleteError) {
      console.error('Failed to delete product:', deleteError);
      setError(deleteError.response?.data?.message || deleteError.message || 'Failed to delete product');
    } finally {
      setActiveActionId('');
    }
  };

  const downloadFile = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1000);
  };

  const handleGenerateAndDownload = async (product) => {
    setActiveActionId(product._id);
    setError('');

    try {
      let productWithBarcode = product;

      if (!product.barcodeImage) {
        const response = await fetch(`${API_BASE_URL}/api/products/${product._id}/barcode`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || 'Failed to generate barcode');
        }

        productWithBarcode = await response.json();
        setProducts(prev => prev.map(item => (item._id === productWithBarcode._id ? productWithBarcode : item)));
      }

      const downloadResponse = await fetch(`${API_BASE_URL}/api/products/${product._id}/barcode/download`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!downloadResponse.ok) {
        const text = await downloadResponse.text();
        throw new Error(text || 'Failed to download barcode');
      }

      const blob = await downloadResponse.blob();
      const url = URL.createObjectURL(blob);
      downloadFile(url, `${productWithBarcode.barcode}-barcode.svg`);
    } catch (downloadError) {
      console.error('Generate+download failed', downloadError);
      setError(downloadError.message || 'Failed to generate or download barcode');
    } finally {
      setActiveActionId('');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-white"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="rounded-lg border border-gray-700 bg-black p-8 text-center">
          <h2 className="mb-2 text-xl font-bold text-red-500">Authentication Required</h2>
          <p className="text-gray-300">Please log in to access product management.</p>
        </div>
      </div>
    );
  }

  if (user.userType !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="rounded-lg border border-gray-700 bg-black p-8 text-center">
          <h2 className="mb-2 text-xl font-bold text-red-500">Access Denied</h2>
          <p className="text-gray-300">You don't have permission to access product management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mb-8">
        <div className="mb-2 flex items-center space-x-4">
          <div className="rounded-lg bg-black p-3">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-black">Product Management</h1>
            <p className="text-gray-600">Manage your inventory and product catalog</p>
          </div>
        </div>

        <div className="inline-flex items-center space-x-2 rounded-lg border border-gray-700 bg-black px-4 py-2">
          <Archive className="h-4 w-4 text-white" />
          <span className="text-sm font-medium text-gray-300">
            Showing {filteredProducts.length} of {products.length} Products
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <div className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</div>
                </div>
                <div className={`rounded-2xl bg-gradient-to-br ${stat.tone} p-3 text-white shadow-lg`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 text-xs font-medium text-slate-500">{stat.badge}</div>
            </div>
          );
        })}
      </div>

      <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-emerald-500 p-2">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Add New Product</h2>
              <p className="text-sm text-slate-800">Fill in the details to add a product to your catalog</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <ProductFormFields
              formState={form}
              categories={categoryOptions}
              onFieldChange={handleCreateFieldChange}
              imagePreview={imagePreview}
              onImageChange={(event) => handleImageChange(event, setImageFile, setImagePreview)}
              imageInputRef={createImageInputRef}
              barcodeRef={barcodeRef}
              generatedBarcode={generatedBarcode}
              isSaving={isSaving}
              formId="create-product"
            />

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className={`flex items-center space-x-2 rounded-xl px-8 py-3 font-semibold shadow-lg transition-all duration-200 ${
                  isSaving
                    ? 'cursor-not-allowed bg-gray-400 text-gray-700'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/25'
                }`}
              >
                <Plus className="h-5 w-5" />
                <span>{isSaving ? 'Adding Product...' : 'Add Product'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-emerald-200/80 bg-white shadow-lg">
        <div className="border-b border-emerald-200 bg-emerald-50/70 px-5 py-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Product Catalog</h3>
              <p className="text-sm text-slate-600">Aligned view for inventory, stock status, and actions</p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-auto">
              <div className="relative w-full min-w-[280px] xl:min-w-[360px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search name, barcode, category, brand, supplier"
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="relative w-full min-w-[220px] xl:min-w-[240px]">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Categories</option>
                  <option value="Uncategorized">Uncategorized</option>
                  {categoryOptions
                    .filter(category => category !== 'Uncategorized')
                    .map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isFetching && products.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-900 border-t-transparent"></div>
              <p className="text-slate-600 font-medium">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                <Package className="h-8 w-8 text-slate-500" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-slate-800">
                {searchQuery || categoryFilter !== 'all' ? 'No matching products found' : 'No products found'}
              </h3>
              <p className="text-slate-700">
                {searchQuery || categoryFilter !== 'all'
                  ? 'Try another search term or change the category filter'
                  : 'Add your first product using the form above'}
              </p>
            </div>
          ) : (
            <Table
              title="Product Catalog"
              description="View and manage your products"
              icon={<Archive className="h-5 w-5 text-white" />}
              headers={['Image', 'Product Details', 'Category', 'Brand', 'Barcode', 'Price', 'Unit', 'Stock', 'Expiry Status', 'Supplier', 'Product Status', 'Actions']}
              data={filteredProducts}
              loading={isFetching}
              emptyState={{
                title: 'No products available',
                description: 'Add a product to get started',
                icon: <Package className="h-8 w-8 text-slate-400" />,
              }}
              renderRow={(product) => {
                const displayPrice = getDisplayPrice(product);
                const expiryInfo = getExpiryInfo(product);
                const statusInfo = getProductStatusInfo(product);
                const isLowStock = getStockValue(product) <= getReorderLevelValue(product);
                const isOutOfStock = getStockValue(product) <= 0;
                const isActionBusy = activeActionId === product._id;

                return (
                  <tr key={product._id} className="align-top transition-colors duration-200 hover:bg-emerald-50/50">
                    <td className="border-b border-slate-200 px-4 py-4">
                      {product.image ? (
                        <img
                          src={getImageUrl(product.image)}
                          alt={product.name}
                          className="h-14 w-14 rounded-xl border border-slate-200 object-cover shadow-sm"
                          onError={(event) => { event.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-slate-300 bg-slate-200">
                          <Package className="h-6 w-6 text-slate-500" />
                        </div>
                      )}
                    </td>

                    <td className="border-b border-slate-200 px-4 py-4">
                      <div className="max-w-[260px] space-y-2">
                        <div>
                          <h4 className="line-clamp-2 font-semibold text-slate-900">{product.name}</h4>
                          <p className="text-sm text-slate-700">Product ID: {product._id.slice(-6)}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {product.sku && (
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                              SKU: {product.sku}
                            </span>
                          )}
                          {product.description && (
                            <span className="max-w-xs rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                              {product.description.length > 30 ? `${product.description.slice(0, 30)}...` : product.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="border-b border-slate-200 px-4 py-4">
                      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-sm font-medium text-slate-800">
                        {getResolvedCategory(product)}
                      </span>
                    </td>

                    <td className="border-b border-slate-200 px-4 py-4">
                      <div className="text-sm text-slate-800">
                        {product.brand || '—'}
                      </div>
                    </td>

                    <td className="border-b border-slate-200 px-4 py-4">
                      <div className="space-y-3">
                        <code className="inline-block rounded-lg bg-slate-100 px-3 py-1 text-sm font-mono text-slate-800">
                          {product.barcode}
                        </code>
                        {product.barcodeImage && (
                          <div className="flex items-center space-x-3">
                            <img
                              src={getBarcodeUrl(product.barcodeImage)}
                              alt="barcode"
                              className="h-20 rounded-lg border border-slate-200 object-contain"
                            />
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="border-b border-slate-200 px-4 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                          <Banknote className="h-4 w-4 text-emerald-600" />
                          <span className="text-base font-semibold text-emerald-600">
                            {displayPrice === null ? '—' : formatLkr(displayPrice)}
                          </span>
                        </div>
                        {product.discountPrice !== undefined && product.discountPrice !== null && product.discountPrice !== '' && (
                          <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                            Discount
                          </span>
                        )}
                        {product.buyingPrice !== undefined && product.buyingPrice !== null && product.buyingPrice !== '' && (
                          <p className="text-xs text-slate-500">
                            Cost: {formatLkr(Number(product.buyingPrice))}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="border-b border-slate-200 px-4 py-4">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                        {getResolvedUnit(product)}
                      </span>
                    </td>

                    <td className="border-b border-slate-200 px-4 py-4">
                      <div className="space-y-2">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                          isOutOfStock ? 'bg-red-100 text-red-800' : isLowStock ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {getStockValue(product)} {getResolvedUnit(product)}
                        </span>
                        {isLowStock && (
                          <div className="text-xs font-medium text-amber-700">Low stock alert</div>
                        )}
                      </div>
                    </td>

                    <td className="border-b border-slate-200 px-4 py-4">
                      <div className="space-y-2">
                        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${expiryInfo.tone}`}>
                          {expiryInfo.label}
                        </span>
                        {expiryInfo.daysRemaining !== null && !expiryInfo.expired && (
                          <div className="text-xs text-slate-500">{expiryInfo.daysRemaining} days remaining</div>
                        )}
                      </div>
                    </td>

                    <td className="border-b border-slate-200 px-4 py-4">
                      <div className="space-y-1 text-sm text-slate-800">
                        <div className="max-w-[160px] truncate font-medium">{product.supplierName || '—'}</div>
                        {product.supplierContact && (
                          <div className="max-w-[160px] truncate text-xs text-slate-500">{product.supplierContact}</div>
                        )}
                      </div>
                    </td>

                    <td className="border-b border-slate-200 px-4 py-4">
                      <div className="space-y-2">
                        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${statusInfo.tone}`}>
                          {statusInfo.label}
                        </span>
                        {(isLowStock || isOutOfStock) && (
                          <div className="text-xs text-slate-500">
                            Reorder at {getReorderLevelValue(product)} {getResolvedUnit(product)}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="border-b border-slate-200 px-4 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          disabled={isSaving || isActionBusy}
                          className="inline-flex items-center space-x-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Edit2 className="h-4 w-4" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleGenerateAndDownload(product)}
                          disabled={isActionBusy || isSaving}
                          className="inline-flex items-center space-x-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Download className="h-4 w-4" />
                          <span>{isActionBusy ? 'Working...' : 'Barcode'}</span>
                        </button>

                        <button
                          onClick={() => handleDelete(product._id)}
                          disabled={isActionBusy || isSaving}
                          className="inline-flex items-center space-x-2 rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }}
            />
          )}
        </div>
      </div>

      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-blue-500 p-2">
                    <Edit2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Edit Product</h2>
                    <p className="text-sm text-slate-800">Update the existing product without changing the current workflow</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleUpdateSubmit} className="space-y-6">
                <ProductFormFields
                  formState={editForm}
                  categories={categoryOptions}
                  onFieldChange={handleEditFieldChange}
                  imagePreview={editImagePreview}
                  onImageChange={(event) => handleImageChange(event, setEditImageFile, setEditImagePreview)}
                  imageInputRef={editImageInputRef}
                  barcodeRef={editBarcodeRef}
                  generatedBarcode={editGeneratedBarcode}
                  isSaving={isSaving}
                  isEditMode
                  formId="edit-product"
                />

                <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    disabled={isSaving}
                    className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`flex items-center justify-center space-x-2 rounded-xl px-8 py-3 font-semibold shadow-lg transition-all duration-200 ${
                      isSaving
                        ? 'cursor-not-allowed bg-gray-400 text-gray-700'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/25'
                    }`}
                  >
                    <Edit2 className="h-5 w-5" />
                    <span>{isSaving ? 'Saving Changes...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
