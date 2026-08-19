import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Product } from '../types';
import { getDefaultImageForType, getMedicineType } from '../utils/productVisuals';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Product) => void;
  prefilledBarcode?: string;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
  prefilledBarcode,
}) => {
  const [name, setName] = useState('');
  const [expiryDate, setExpiryDate] = useState(
    new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [category, setCategory] = useState<'medicine' | 'grocery'>('medicine');
  const [quantity, setQuantity] = useState(1);
  const [barcode, setBarcode] = useState(prefilledBarcode || '');
  const [manufacturer, setManufacturer] = useState('');
  const [dosage, setDosage] = useState('');
  const [price, setPrice] = useState('120');
  const [packSize, setPackSize] = useState('10 Tablets');
  const [uses, setUses] = useState('');

  useEffect(() => {
    if (prefilledBarcode) {
      setBarcode(prefilledBarcode);
    }
  }, [prefilledBarcode]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !expiryDate) return;

    const type = getMedicineType(name);
    const newProduct: Product = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      expiryDate,
      category,
      quantity: Math.max(1, quantity),
      barcode: barcode.trim() || undefined,
      manufacturer: manufacturer.trim() || undefined,
      dosage: dosage.trim() || undefined,
      packSize: packSize.trim() || undefined,
      price: price ? parseFloat(price) : undefined,
      uses: uses.trim() || undefined,
      imageUrl: getDefaultImageForType(type),
      verificationSource: barcode ? 'gs1-verified' : 'manual',
      verifiedAt: new Date().toISOString().split('T')[0],
    };

    onAddProduct(newProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-lg bg-[#F4F6F8] rounded-3xl shadow-2xl overflow-hidden my-6 border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#00897B] text-white px-5 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Plus size={20} />
            <h2 className="text-lg font-bold">Add Medicine / Product</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs sm:text-sm">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Medicine / Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Paracetamol 500mg, Augmentin 625 Duo"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-teal-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Expiry Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-teal-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Quantity in Stock</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-teal-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Barcode / GTIN</label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="e.g. 8900000469574"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono text-xs focus:ring-2 focus:ring-teal-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-teal-400 focus:outline-none"
              >
                <option value="medicine">Medicine</option>
                <option value="grocery">Grocery / General</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Manufacturer</label>
              <input
                type="text"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="e.g. Cipla, Abbott, Sun Pharma"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-teal-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Price (₹)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="150"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-teal-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Dosage Advice</label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 1 tablet twice daily"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-teal-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Pack Size</label>
              <input
                type="text"
                value={packSize}
                onChange={(e) => setPackSize(e.target.value)}
                placeholder="e.g. 10 Tablets, 100ml Syrup"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-teal-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Uses & Indications</label>
            <textarea
              rows={2}
              value={uses}
              onChange={(e) => setUses(e.target.value)}
              placeholder="Indicated for fever, pain relief, cough, etc."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-teal-400 focus:outline-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#00897B] hover:bg-[#00796B] text-white rounded-xl font-bold shadow-xs transition cursor-pointer"
            >
              Add to Catalog
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
