import { useState, useMemo, useEffect } from 'react';
import { Product, ExpiryStatus, CategoryFilter } from './types';
import { INITIAL_MEDICINES } from './data/medicinesData';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ScannerModal } from './components/ScannerModal';
import { IdentifyModal } from './components/IdentifyModal';
import { AddProductModal } from './components/AddProductModal';
import { getDaysRemaining } from './utils/productVisuals';
import { exportToJSONFile, exportToCSVFile } from './utils/fileExport';
import {
  testConnection,
  subscribeProducts,
  subscribeAuth,
  loginWithGoogle,
  logoutUser,
  addOrUpdateProduct,
  updateProductQuantity,
  deleteProductDoc,
  checkAndSeedFirestore,
} from './firebase';
import { User } from 'firebase/auth';
import { AlertCircle, PackageX, WifiOff } from 'lucide-react';

export function App() {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('expiry_tracker_products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        return INITIAL_MEDICINES;
      }
    }
    return INITIAL_MEDICINES;
  });

  const [user, setUser] = useState<User | null>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'slow' | 'offline'>(() => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return 'offline';
    return 'online';
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<ExpiryStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isIdentifyOpen, setIsIdentifyOpen] = useState<boolean>(false);
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [prefilledBarcode, setPrefilledBarcode] = useState<string | undefined>();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Network connection monitoring for low network / offline optimization
  useEffect(() => {
    const updateNetwork = () => {
      if (!navigator.onLine) {
        setNetworkStatus('offline');
        return;
      }

      const nav = navigator as any;
      const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
      if (conn && (conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g' || conn.saveData)) {
        setNetworkStatus('slow');
      } else {
        setNetworkStatus('online');
      }
    };

    window.addEventListener('online', updateNetwork);
    window.addEventListener('offline', updateNetwork);
    updateNetwork();

    return () => {
      window.removeEventListener('online', updateNetwork);
      window.removeEventListener('offline', updateNetwork);
    };
  }, []);

  // Firebase initialization and subscription with offline resilience
  useEffect(() => {
    testConnection().then((connected) => {
      setIsFirebaseConnected(connected);
    });

    const unsubscribeAuth = subscribeAuth((currentUser) => {
      setUser(currentUser);
    });

    // Check & seed Firestore with initial medicines if empty
    checkAndSeedFirestore(INITIAL_MEDICINES);

    // Subscribe to real-time Firestore product changes (reads from IndexedDB when offline)
    const unsubscribeProducts = subscribeProducts(
      (remoteProducts) => {
        if (remoteProducts.length > 0) {
          setProducts(remoteProducts);
          localStorage.setItem('expiry_tracker_products', JSON.stringify(remoteProducts));
          setIsFirebaseConnected(true);
        }
      },
      (err) => {
        console.warn('Firestore subscription using local offline cache:', err);
      }
    );

    return () => {
      unsubscribeAuth();
      unsubscribeProducts();
    };
  }, []);

  // Save to localStorage whenever products change
  useEffect(() => {
    try {
      localStorage.setItem('expiry_tracker_products', JSON.stringify(products));
    } catch (e) {
      console.warn('LocalStorage save notice:', e);
    }
  }, [products]);

  // Auth actions
  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      showToast('Signed in successfully with Google!');
    } catch (err: any) {
      showToast(err?.message || 'Sign in failed');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      showToast('Signed out');
    } catch (err: any) {
      showToast('Sign out error');
    }
  };

  // Optimistic quantity change handler with background Firestore sync
  const handleUpdateQuantity = (productId: string, delta: number) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;
    const newQty = Math.max(0, target.quantity + delta);

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, quantity: newQty } : p))
    );

    if (selectedProduct?.id === productId) {
      setSelectedProduct((prev) => (prev ? { ...prev, quantity: newQty } : null));
    }

    updateProductQuantity(productId, newQty).catch((e) => {
      console.warn('Saved quantity locally in offline mode:', e);
    });
  };

  // Optimistic delete product
  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    if (selectedProduct?.id === productId) {
      setSelectedProduct(null);
    }
    showToast('Item removed from inventory');

    deleteProductDoc(productId).catch((e) => {
      console.warn('Deleted locally in offline mode:', e);
    });
  };

  // Optimistic add product
  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === newProduct.id);
      if (exists) {
        return prev.map((p) => (p.id === newProduct.id ? newProduct : p));
      }
      return [newProduct, ...prev];
    });

    setIsAddOpen(false);
    setPrefilledBarcode(undefined);
    showToast(`Added "${newProduct.name}" to inventory`);

    addOrUpdateProduct(newProduct).catch((e) => {
      console.warn('Saved product locally in offline mode:', e);
    });
  };

  // Barcode detection from camera scanner
  const handleBarcodeDetected = (code: string) => {
    setIsScannerOpen(false);
    const found = products.find((p) => p.barcode === code || p.barcode?.endsWith(code));

    if (found) {
      setSelectedProduct(found);
      showToast(`Found product: ${found.name}`);
    } else {
      setPrefilledBarcode(code);
      setIsAddOpen(true);
      showToast(`Barcode ${code} not in database. Enter details to add.`);
    }
  };

  // Export handlers
  const handleExportJSON = () => {
    exportToJSONFile(products);
    showToast('Exported medicine_catalog.json file');
  };

  const handleExportCSV = () => {
    exportToCSVFile(products);
    showToast('Exported medicine_catalog.csv file');
  };

  // Filtered and Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchGeneric = p.genericName?.toLowerCase().includes(q);
          const matchBarcode = p.barcode?.toLowerCase().includes(q);
          const matchManufacturer = p.manufacturer?.toLowerCase().includes(q);
          const matchUses = p.uses?.toLowerCase().includes(q);
          if (!matchName && !matchGeneric && !matchBarcode && !matchManufacturer && !matchUses) {
            return false;
          }
        }

        if (categoryFilter !== 'all') {
          const nameLower = (p.name + ' ' + (p.packSize || '') + ' ' + (p.genericName || '')).toLowerCase();
          if (categoryFilter === 'tablets' && !nameLower.includes('tablet') && !nameLower.includes('capsule') && !nameLower.includes('cap') && !nameLower.includes('tab')) {
            return false;
          }
          if (categoryFilter === 'syrups' && !nameLower.includes('syrup') && !nameLower.includes('suspension') && !nameLower.includes('liquid') && !nameLower.includes('solution') && !nameLower.includes('drops')) {
            return false;
          }
          if (categoryFilter === 'inhalers' && !nameLower.includes('inhaler') && !nameLower.includes('resp') && !nameLower.includes('spray')) {
            return false;
          }
          if (categoryFilter === 'injections' && !nameLower.includes('injection') && !nameLower.includes('inj') && !nameLower.includes('vial') && !nameLower.includes('ampoule')) {
            return false;
          }
          if (categoryFilter === 'creams' && !nameLower.includes('cream') && !nameLower.includes('gel') && !nameLower.includes('ointment')) {
            return false;
          }
          if (categoryFilter === 'drops' && !nameLower.includes('drop') && !nameLower.includes('eye') && !nameLower.includes('ear') && !nameLower.includes('nasal')) {
            return false;
          }
        }

        const days = getDaysRemaining(p.expiryDate);
        if (statusFilter === 'expired' && days >= 0) return false;
        if (statusFilter === 'critical' && (days < 0 || days > 3)) return false;
        if (statusFilter === 'warning' && (days < 0 || days > 7)) return false;
        if (statusFilter === 'safe' && days <= 7) return false;

        return true;
      })
      .sort((a, b) => {
        return getDaysRemaining(a.expiryDate) - getDaysRemaining(b.expiryDate);
      });
  }, [products, searchQuery, statusFilter, categoryFilter]);

  // Counts for status chips
  const counts = useMemo(() => {
    let expired = 0;
    let critical = 0;
    let warning = 0;
    let safe = 0;

    products.forEach((p) => {
      const days = getDaysRemaining(p.expiryDate);
      if (days < 0) expired++;
      else if (days <= 3) critical++;
      else if (days <= 7) warning++;
      else safe++;
    });

    return {
      total: products.length,
      expired,
      critical,
      warning,
      safe,
    };
  }, [products]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/90 backdrop-blur text-white text-sm px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2.5 animate-bounce">
          <AlertCircle size={16} className="text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Header with offline / low-network support & File Export */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenIdentify={() => setIsIdentifyOpen(true)}
        onOpenAdd={() => {
          setPrefilledBarcode(undefined);
          setIsAddOpen(true);
        }}
        onExportJSON={handleExportJSON}
        onExportCSV={handleExportCSV}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isFirebaseConnected={isFirebaseConnected}
        networkStatus={networkStatus}
        counts={counts}
      />

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 flex-1 w-full">
        {/* Offline Notice Banner */}
        {networkStatus === 'offline' && (
          <div className="mb-4 bg-slate-800 text-slate-200 border border-slate-700 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-2.5">
              <WifiOff size={16} className="text-amber-400 shrink-0" />
              <span>
                <strong>Working Offline:</strong> All barcode scans, searches, and inventory updates are saved locally and will automatically sync when network returns.
              </span>
            </div>
          </div>
        )}

        {/* Active Filter Indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
            {statusFilter !== 'all' && (
              <span className="ml-1.5 text-teal-700">({statusFilter})</span>
            )}
            {categoryFilter !== 'all' && (
              <span className="ml-1.5 text-teal-700">({categoryFilter})</span>
            )}
          </div>
          {(statusFilter !== 'all' || categoryFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setCategoryFilter('all');
                setSearchQuery('');
              }}
              className="text-xs text-teal-700 hover:text-teal-900 font-semibold cursor-pointer underline underline-offset-2"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm my-6 max-w-lg mx-auto">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <PackageX size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No medicines found</h3>
            <p className="text-sm text-slate-500 mb-6">
              {searchQuery
                ? `No items match "${searchQuery}". Try searching with a different keyword or barcode.`
                : 'No products in this category or expiry status filter.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {(statusFilter !== 'all' || categoryFilter !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setCategoryFilter('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={() => {
                  setPrefilledBarcode(undefined);
                  setIsAddOpen(true);
                }}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                + Add New Medicine
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onUpdateQuantity={handleUpdateQuantity}
          onDeleteProduct={handleDeleteProduct}
        />
      )}

      {/* Live Barcode Camera Scanner */}
      {isScannerOpen && (
        <ScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onBarcodeDetected={handleBarcodeDetected}
          onSwitchToImage={() => {
            setIsScannerOpen(false);
            setIsIdentifyOpen(true);
          }}
        />
      )}

      {/* Identify Barcode / GTIN Lookup */}
      {isIdentifyOpen && (
        <IdentifyModal
          isOpen={isIdentifyOpen}
          onClose={() => setIsIdentifyOpen(false)}
          products={products}
          onProductFound={(product) => {
            setIsIdentifyOpen(false);
            setSelectedProduct(product);
          }}
        />
      )}

      {/* Add New Product Modal */}
      {isAddOpen && (
        <AddProductModal
          isOpen={isAddOpen}
          onClose={() => {
            setIsAddOpen(false);
            setPrefilledBarcode(undefined);
          }}
          onAddProduct={handleAddProduct}
          prefilledBarcode={prefilledBarcode}
        />
      )}
    </div>
  );
}

export default App;
