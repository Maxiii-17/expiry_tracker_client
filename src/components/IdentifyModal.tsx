import React, { useState, useRef } from 'react';
import {
  X,
  QrCode,
  Upload,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
  Search,
  Sparkles,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { Product, Gs1Result } from '../types';
import { decodeBarcodeFromImage, verifyGs1Barcode, openGs1IndiaPortal } from '../services/barcodeService';

interface IdentifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductFound: (product: Product) => void;
  products: Product[];
}

export const IdentifyModal: React.FC<IdentifyModalProps> = ({
  isOpen,
  onClose,
  onProductFound,
  products,
}) => {
  const [typedCode, setTypedCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [decodedCode, setDecodedCode] = useState<string | null>(null);
  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);
  const [gs1Result, setGs1Result] = useState<Gs1Result | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processImageFile(file);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processImageFile(file);
  };

  const processImageFile = async (file: File) => {
    setBusy(true);
    setStatus('Decoding barcode with ZXing / QR Engine...');
    setMatchedProduct(null);
    setGs1Result(null);

    try {
      const code = await decodeBarcodeFromImage(file);
      if (!code) {
        setBusy(false);
        setStatus('No barcode found in that image. Try a clearer or higher-contrast photo.');
        return;
      }
      await lookupBarcode(code);
    } catch {
      setBusy(false);
      setStatus('Failed to process image.');
    }
  };

  const handleTypeAndFind = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = typedCode.trim();
    if (!clean) {
      setStatus('Please type a barcode or GTIN number first.');
      return;
    }
    await lookupBarcode(clean);
  };

  const lookupBarcode = async (code: string) => {
    setBusy(true);
    setStatus(`Searching catalog for GTIN ${code}...`);
    setDecodedCode(code);

    // 1. Search local catalog
    const found = products.find((p) => p.barcode === code);
    if (found) {
      setMatchedProduct(found);
      setStatus(null);
      setBusy(false);
      return;
    }

    // 2. Not in local catalog -> verify GS1
    setStatus('Not in local catalog — verifying against GS1 Registry...');
    const result = await verifyGs1Barcode(code);
    setGs1Result(result);
    setStatus(null);
    setBusy(false);
  };

  const sampleBarcodes = products.filter((p) => p.barcode).slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-lg bg-[#F4F6F8] rounded-3xl shadow-2xl overflow-hidden my-6 border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#00897B] text-white px-5 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <QrCode size={20} />
            <h2 className="text-lg font-bold">Identify Product by Barcode</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Main instruction */}
          <div className="text-center space-y-1">
            <div className="w-14 h-14 bg-teal-100 text-teal-800 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <QrCode size={30} />
            </div>
            <p className="text-sm text-slate-600 max-w-xs mx-auto pt-2 leading-relaxed">
              Upload a photo of a medicine barcode, or type the GTIN number to decode and verify authenticity.
            </p>
          </div>

          {/* Manual GTIN Search Form */}
          <form onSubmit={handleTypeAndFind} className="relative flex items-center">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={typedCode}
              onChange={(e) => setTypedCode(e.target.value)}
              placeholder="Type barcode / GTIN (e.g. 8900000469574)"
              className="w-full pl-10 pr-24 py-3 bg-white text-slate-800 rounded-2xl border border-slate-200 text-sm shadow-xs focus:ring-2 focus:ring-teal-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              <span>Find</span>
              <ArrowRight size={13} />
            </button>
          </form>

          {/* Divider with 'OR' */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-semibold uppercase">Or Upload Image</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Drag and Drop Image Box */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/50 hover:bg-teal-50 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center text-teal-700 group-hover:scale-110 transition">
              <Upload size={18} />
            </div>
            <p className="text-xs font-semibold text-slate-700">
              Click to select or drag & drop barcode photo
            </p>
            <p className="text-[11px] text-slate-400">
              Supports JPEG, PNG, WEBP, and camera photos
            </p>
          </div>

          {/* Sample Barcodes Quick Test Pill list */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <Sparkles size={12} className="text-teal-600" />
              <span>Quick Test Samples:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sampleBarcodes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setTypedCode(item.barcode!);
                    lookupBarcode(item.barcode!);
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-teal-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-600 transition cursor-pointer"
                >
                  {item.name.split(' ')[0]} ({item.barcode?.slice(-4)})
                </button>
              ))}
            </div>
          </div>

          {/* Busy indicator */}
          {busy && (
            <div className="py-4 text-center space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-teal-600 mx-auto" />
              <p className="text-xs text-slate-600 font-medium">{status}</p>
            </div>
          )}

          {/* Status message */}
          {status && !busy && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl text-center">
              {status}
            </div>
          )}

          {/* Local Match Found Card */}
          {matchedProduct && (
            <div className="bg-white rounded-2xl p-4 border border-emerald-300 shadow-sm space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <CheckCircle2 size={18} />
                <span>Product Found in Local Catalog!</span>
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <div className="font-bold text-sm text-slate-900">{matchedProduct.name}</div>
                <div>Expiry Date: {matchedProduct.expiryDate}</div>
                {matchedProduct.manufacturer && <div>Manufacturer: {matchedProduct.manufacturer}</div>}
                <div className="font-mono text-slate-500">GTIN: {matchedProduct.barcode}</div>
              </div>
              <button
                onClick={() => {
                  onProductFound(matchedProduct);
                  onClose();
                }}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Eye size={14} />
                <span>View Full Product Details</span>
              </button>
            </div>
          )}

          {/* GS1 Verified Result Card (when not in local catalog) */}
          {gs1Result && !matchedProduct && decodedCode && (
            <div className="space-y-3">
              {gs1Result.found ? (
                <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 text-emerald-900 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                    <ShieldCheck size={18} className="text-emerald-600" />
                    <span>Verified by GS1 GTIN Registry</span>
                  </div>
                  <p className="text-slate-700">
                    <strong>Decoded GTIN:</strong> {decodedCode}
                  </p>
                  {gs1Result.name && (
                    <p className="text-slate-700">
                      <strong>Name:</strong> {gs1Result.name}
                    </p>
                  )}
                  {gs1Result.manufacturer && (
                    <p className="text-slate-700">
                      <strong>Manufacturer:</strong> {gs1Result.manufacturer}
                    </p>
                  )}
                  <p className="text-slate-500 text-[11px]">
                    Source: {gs1Result.source || 'GS1 Global Registry'}
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => openGs1IndiaPortal(decodedCode)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-emerald-300 rounded-xl font-bold text-emerald-800 hover:bg-emerald-100/50 transition"
                    >
                      <ExternalLink size={13} />
                      <span>Open Official GS1 India Portal</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-amber-900 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
                    <ShieldAlert size={18} className="text-amber-600" />
                    <span>GTIN Not in Catalog</span>
                  </div>
                  <p className="text-slate-700">
                    Barcode <strong>{decodedCode}</strong> was not found in the local catalog. You can check it directly on the GS1 portal.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => openGs1IndiaPortal(decodedCode)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-300 rounded-xl font-bold text-amber-900 hover:bg-amber-100/50 transition"
                    >
                      <ExternalLink size={13} />
                      <span>Check on GS1 India</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
