import React, { useState, useEffect, useRef } from 'react';
import ProductCard from '../components/ProductCard';
import Cart from '../components/Cart';
import CalculatorPopup from '../components/CalculatorPopup';
import { getProducts, createSale } from '../utils/api';
import { Search, ScanLine, X, Barcode, AlertCircle, Loader2, Keyboard } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

const POS = () => {
  const { user, loading } = useAuth();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const [scannerStatus, setScannerStatus] = useState('Ready to scan');
  const [isScanConfirmOpen, setIsScanConfirmOpen] = useState(false);
  const [pendingScannedProduct, setPendingScannedProduct] = useState(null);
  const [pendingScanQuantity, setPendingScanQuantity] = useState(1);
  const scannerInstanceRef = useRef(null);
  const lastScannedCodeRef = useRef('');
  const searchInputRef = useRef(null);
  const qtyInputRef = useRef(null);
  const scannerElementId = 'pos-barcode-reader';

  useEffect(() => {
    const fetchProducts = async () => {
      if (!loading && user && user.token) {
        console.log('POS: User authenticated, fetching products...');
        try {
          const response = await getProducts();
          setProducts(response.data);
          setError('');
        } catch (fetchError) {
          console.error('Failed to fetch products:', fetchError);
          setError(fetchError.response?.data?.message || 'Failed to load products');
        }
      } else {
        console.log('POS: Waiting for auth...', { loading, user: !!user });
      }
    };

    fetchProducts();
  }, [user, loading]);

  const addToCart = (product, quantityToAdd = 1) => {
    const safeQuantity = Math.max(1, parseInt(quantityToAdd, 10) || 1);
    const resolvedProductId = product?._id || product?.productId;

    if (!resolvedProductId) {
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find(item => item.productId === resolvedProductId);

      if (existing) {
        return prevCart.map(item =>
          item.productId === resolvedProductId
            ? { ...item, quantity: item.quantity + safeQuantity }
            : item
        );
      }

      return [
        ...prevCart,
        {
          productId: resolvedProductId,
          name: product.name,
          quantity: safeQuantity,
          price: product.price,
          image: product.image,
        },
      ];
    });
  };

  const updateQuantity = (productId, quantity) => {
    setCart(
      cart.map(item =>
        item.productId === productId ? { ...item, quantity: parseInt(quantity, 10) } : item
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
      alert('Sale completed successfully!');
    } catch (checkoutError) {
      console.error(checkoutError);
      alert('Error processing sale. Please try again.');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    String(product.barcode || '').includes(search)
  );

  const getTotalItems = () => cart.reduce((total, item) => total + item.quantity, 0);

  const findProductByBarcode = (barcodeValue) => {
    const normalizedBarcode = String(barcodeValue || '').trim();
    if (!normalizedBarcode) {
      return null;
    }

    return products.find(product => String(product.barcode || '').trim() === normalizedBarcode) || null;
  };

  const stopBarcodeScanner = async () => {
    if (!scannerInstanceRef.current) {
      return;
    }

    try {
      await scannerInstanceRef.current.stop();
    } catch (stopError) {
      console.warn('Scanner stop warning', stopError);
    }

    try {
      scannerInstanceRef.current.clear();
    } catch (clearError) {
      console.warn('Scanner clear warning', clearError);
    }

    scannerInstanceRef.current = null;
  };

  const handleBarcodeDetected = (barcodeValue) => {
    const normalizedBarcode = String(barcodeValue || '').trim();
    if (!normalizedBarcode || lastScannedCodeRef.current === normalizedBarcode || isScanConfirmOpen) {
      return;
    }

    lastScannedCodeRef.current = normalizedBarcode;
    setSearch(normalizedBarcode);

    const matchedProduct = findProductByBarcode(normalizedBarcode);
    if (matchedProduct) {
      void stopBarcodeScanner();
      setPendingScannedProduct(matchedProduct);
      setPendingScanQuantity(1);
      setIsScanConfirmOpen(true);
      setScannerStatus(`Detected ${matchedProduct.name}. Press Enter to confirm.`);
      return;
    }

    setScannerStatus('No matching product found');
    setTimeout(() => {
      lastScannedCodeRef.current = '';
      setScannerStatus('Point the camera at a barcode');
    }, 1000);
  };

  const confirmScannedProduct = () => {
    if (!pendingScannedProduct) {
      return;
    }

    addToCart(pendingScannedProduct, pendingScanQuantity);
    setScannerStatus(`Added ${pendingScannedProduct.name} to cart`);
    setPendingScannedProduct(null);
    setPendingScanQuantity(1);
    setIsScanConfirmOpen(false);

    setTimeout(() => {
      setIsScannerOpen(false);
      setScannerStatus('Ready to scan');
      lastScannedCodeRef.current = '';
    }, 500);
  };

  const cancelScannedProduct = () => {
    setPendingScannedProduct(null);
    setPendingScanQuantity(1);
    setIsScanConfirmOpen(false);
    lastScannedCodeRef.current = '';
    setScannerStatus('Point the camera at a barcode');

    if (isScannerOpen) {
      setTimeout(() => {
        void startBarcodeScanner();
      }, 150);
    }
  };

  const startBarcodeScanner = async () => {
    if (!document.getElementById(scannerElementId)) {
      return;
    }

    if (scannerInstanceRef.current) {
      return;
    }

    setScannerError('');
    setScannerStatus('Starting camera...');
    lastScannedCodeRef.current = '';

    try {
      const scanner = new Html5Qrcode(scannerElementId, {
        useBarCodeDetectorIfSupported: true,
        formatsToSupport: [
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.CODABAR,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.RSS_14,
          Html5QrcodeSupportedFormats.RSS_EXPANDED,
          Html5QrcodeSupportedFormats.DATA_MATRIX,
          Html5QrcodeSupportedFormats.AZTEC,
          Html5QrcodeSupportedFormats.QR_CODE,
        ],
      });

      scannerInstanceRef.current = scanner;
      setScannerStatus('Point the camera at a barcode');

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.333333,
          disableFlip: false,
        },
        (decodedText) => {
          handleBarcodeDetected(decodedText);
        },
        () => {
          // Ignore frame-level decode misses. The scanner keeps running until a code is found.
        }
      );
    } catch (cameraError) {
      console.error('Failed to start barcode scanner', cameraError);
      setScannerError('Unable to start live scanning. Check camera permissions or use manual barcode entry.');
      setScannerStatus('Camera unavailable');
      await stopBarcodeScanner();
    }
  };

  const closeBarcodeScanner = () => {
    void stopBarcodeScanner();
    setIsScannerOpen(false);
    setScannerError('');
    setScannerStatus('Ready to scan');
  };

  useEffect(() => {
    if (isScannerOpen) {
      void startBarcodeScanner();
      return () => {
        void stopBarcodeScanner();
      };
    }

    void stopBarcodeScanner();
    return undefined;
  }, [isScannerOpen]);

  useEffect(() => {
    if (!isScanConfirmOpen) {
      return undefined;
    }

    setTimeout(() => {
      qtyInputRef.current?.focus();
      qtyInputRef.current?.select();
    }, 0);

    const handleConfirmKey = (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        confirmScannedProduct();
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        cancelScannedProduct();
      }
    };

    window.addEventListener('keydown', handleConfirmKey);
    return () => {
      window.removeEventListener('keydown', handleConfirmKey);
    };
  }, [isScanConfirmOpen, pendingScannedProduct, pendingScanQuantity, isScannerOpen]);

  useEffect(() => {
    const isTypingTarget = (target) => {
      if (!target) {
        return false;
      }

      const tagName = target.tagName;
      return tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT' || target.isContentEditable;
    };

    const handleGlobalHotkeys = (event) => {
      const key = event.key.toLowerCase();
      const typing = isTypingTarget(event.target);

      if (!typing && key === 'f2') {
        event.preventDefault();
        setIsScannerOpen(true);
        return;
      }

      if (!typing && (key === 'f8' || key === '?')) {
        event.preventDefault();
        setIsShortcutsOpen(prev => !prev);
        return;
      }

      if (!typing && key === 'f3') {
        event.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }

      if (!typing && key === 'f4') {
        event.preventDefault();
        setIsCalculatorOpen(prev => !prev);
        return;
      }

      if (!typing && key === 'f9') {
        event.preventDefault();
        if (cart.length > 0) {
          void checkout();
        }
        return;
      }

      if (isScannerOpen && key === 'escape' && !isScanConfirmOpen) {
        event.preventDefault();
        closeBarcodeScanner();
        return;
      }

      if (isShortcutsOpen && key === 'escape') {
        event.preventDefault();
        setIsShortcutsOpen(false);
        return;
      }

      if (isScanConfirmOpen && ['+', '=', 'arrowup'].includes(key)) {
        event.preventDefault();
        setPendingScanQuantity(prev => prev + 1);
        return;
      }

      if (isScanConfirmOpen && ['-', '_', 'arrowdown'].includes(key)) {
        event.preventDefault();
        setPendingScanQuantity(prev => Math.max(1, prev - 1));
      }
    };

    window.addEventListener('keydown', handleGlobalHotkeys);
    return () => {
      window.removeEventListener('keydown', handleGlobalHotkeys);
    };
  }, [isScannerOpen, isScanConfirmOpen, isShortcutsOpen, cart.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-slate-600">Loading Point of Sale...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-blue-100 max-w-md w-full">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 text-center mb-2">Authentication Required</h2>
          <p className="text-slate-600 text-center">Please log in to access the POS system.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 shadow-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Point of Sale</h1>
              <p className="text-emerald-100 mt-1">Fast checkout system</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-6 px-5 py-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{filteredProducts.length}</div>
                  <div className="text-xs text-emerald-100 mt-1">Products</div>
                </div>
                <div className="w-px h-10 bg-white/30"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{getTotalItems()}</div>
                  <div className="text-xs text-emerald-100 mt-1">In Cart</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsShortcutsOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-3 bg-white/20 text-white rounded-2xl border border-white/30 hover:bg-white/30 transition-all font-semibold text-sm"
                title="Keyboard Shortcuts (F8 or ?)"
              >
                <Keyboard className="h-4 w-4" />
                <span>Keys</span>
              </button>

              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-3 bg-white text-emerald-600 rounded-2xl hover:bg-emerald-50 transition-all font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <ScanLine className="h-4 w-4" />
                <span>Scan</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-4 border-2 border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-white/60 bg-white/20 backdrop-blur-sm transition-all"
            />
          </div>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <div>
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-emerald-700">Products</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {filteredProducts.length} of {products.length} available
                </p>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {products.length === 0 ? 'Loading products...' : 'No products found'}
                  </h3>
                  <p className="text-slate-500">
                    {products.length === 0 ? 'Please wait while we load your inventory' : 'Try adjusting your search terms'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      onAddToCart={addToCart}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-2">
            <div className="sticky top-6 bg-white rounded-2xl border border-emerald-200 h-fit shadow-lg" style={{ maxHeight: 'calc(100vh - 100px)' }}>
              <Cart
                cart={cart}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
                checkout={checkout}
              />
            </div>
          </div>
        </div>
      </div>

      <CalculatorPopup
        isOpen={isCalculatorOpen}
        onToggle={() => setIsCalculatorOpen(!isCalculatorOpen)}
      />

      {isScannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-emerald-200 bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2.5 rounded-lg">
                  <Barcode className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Scanner</h2>
                  <p className="text-emerald-100 text-sm">{scannerStatus}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeBarcodeScanner}
                className="p-2 text-emerald-100 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="rounded-2xl border-2 border-slate-300 overflow-hidden bg-slate-900 shadow-lg">
                  <div id={scannerElementId} className="h-96 w-full bg-slate-900" />
                </div>

                <p className="text-sm text-slate-600">Point the camera at a barcode to scan.</p>

                {scannerError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>{scannerError}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isScanConfirmOpen && pendingScannedProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-emerald-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Confirm Add to Cart</h3>
            <p className="mt-2 text-sm text-slate-600">Barcode matched this product:</p>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="font-semibold text-slate-900">{pendingScannedProduct.name}</div>
              <div className="mt-1 text-xs text-slate-500">Barcode: {pendingScannedProduct.barcode || 'N/A'}</div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-slate-700">Quantity</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPendingScanQuantity((prev) => Math.max(1, prev - 1))}
                  className="h-10 w-10 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  -
                </button>
                <input
                  ref={qtyInputRef}
                  type="number"
                  min="1"
                  value={pendingScanQuantity}
                  onChange={(e) => setPendingScanQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="h-10 w-24 rounded-lg border border-emerald-200 px-3 text-center text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setPendingScanQuantity((prev) => prev + 1)}
                  className="h-10 w-10 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  +
                </button>
              </div>
            </div>

            <p className="mt-3 text-xs text-emerald-700">Press Enter to confirm or Esc to cancel.</p>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={cancelScannedProduct}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmScannedProduct}
                className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Add Item x{pendingScanQuantity} (Enter)
              </button>
            </div>
          </div>
        </div>
      )}

      {isShortcutsOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-emerald-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-4">
              <div className="flex items-center gap-2 text-white">
                <Keyboard className="h-5 w-5" />
                <h3 className="text-lg font-bold">Keyboard Shortcuts</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsShortcutsOpen(false)}
                className="rounded-lg p-2 text-emerald-100 hover:bg-white/20 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"><span>Open scanner</span><kbd className="rounded bg-slate-200 px-2 py-1 text-xs font-semibold">F2</kbd></div>
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"><span>Focus search</span><kbd className="rounded bg-slate-200 px-2 py-1 text-xs font-semibold">F3</kbd></div>
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"><span>Toggle calculator</span><kbd className="rounded bg-slate-200 px-2 py-1 text-xs font-semibold">F4</kbd></div>
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"><span>Checkout</span><kbd className="rounded bg-slate-200 px-2 py-1 text-xs font-semibold">F9</kbd></div>
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"><span>Open/close shortcuts</span><kbd className="rounded bg-slate-200 px-2 py-1 text-xs font-semibold">F8 / ?</kbd></div>
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"><span>Close scanner / cancel popup</span><kbd className="rounded bg-slate-200 px-2 py-1 text-xs font-semibold">Esc</kbd></div>
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"><span>Confirm add item</span><kbd className="rounded bg-slate-200 px-2 py-1 text-xs font-semibold">Enter</kbd></div>
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"><span>Adjust confirmation qty</span><kbd className="rounded bg-slate-200 px-2 py-1 text-xs font-semibold">+ / - / Up / Down</kbd></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
