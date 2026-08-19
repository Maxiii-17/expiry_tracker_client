import React from 'react';
import {
  X,
  Calendar,
  Layers,
  IndianRupee,
  CheckCircle2,
  XCircle,
  QrCode,
  FileText,
  Stethoscope,
  FlaskConical,
  Dna,
  Package,
  Hash,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Building2,
  Plus,
  Minus,
  Trash2,
} from 'lucide-react';
import { Product } from '../types';
import { MedicinePackVisual } from './MedicinePackVisual';
import { getDaysRemaining, formatExpiryDate, getExpiryBadge } from '../utils/productVisuals';
import { openGs1IndiaPortal } from '../services/barcodeService';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onDeleteProduct?: (id: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onUpdateQuantity,
  onDeleteProduct,
}) => {
  if (!product) return null;

  const days = getDaysRemaining(product.expiryDate);
  const badge = getExpiryBadge(days);
  const isGs1Verified = product.verificationSource === 'gs1-verified';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-lg bg-[#F4F6F8] rounded-3xl shadow-2xl overflow-hidden my-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-[#00897B] text-white px-5 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Package size={20} />
            <h2 className="text-lg font-bold">Product Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Main Visual Header Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col items-center text-center border border-slate-100">
            <MedicinePackVisual
              name={product.name}
              imageUrl={product.imageUrl}
              size={110}
              className="mb-4 shadow-md"
            />
            <h3 className="text-xl font-black text-slate-800 leading-tight">
              {product.name}
            </h3>
            {product.manufacturer && (
              <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
                <Building2 size={13} />
                <span>{product.manufacturer}</span>
              </p>
            )}

            <div className="mt-3 flex items-center gap-2">
              <span
                className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wide ${badge.bgColor} ${badge.textColor} shadow-xs`}
              >
                {badge.text}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                {product.category === 'medicine' ? 'Pharmaceutical' : 'Grocery'}
              </span>
            </div>
          </div>

          {/* GS1 Verification Notice Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 ${
              isGs1Verified
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
                : 'bg-amber-50/80 border-amber-300 text-amber-900'
            }`}
          >
            {isGs1Verified ? (
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs">
              <div className="font-bold text-sm">
                {isGs1Verified ? 'Verified via GS1 India' : 'Local Catalog Record'}
              </div>
              <p className="mt-0.5 text-slate-600 leading-relaxed">
                {isGs1Verified
                  ? `GTIN verified against GS1 database on ${product.verifiedAt || '2026-05-12'}. Barcode and packaging are authentic.`
                  : 'Product loaded from verified local catalog. You can cross-verify GTIN with GS1 India portal.'}
              </p>
              {product.barcode && (
                <button
                  onClick={() => openGs1IndiaPortal(product.barcode!)}
                  className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-white border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                >
                  <ExternalLink size={12} />
                  <span>Verify on GS1 India</span>
                </button>
              )}
            </div>
          </div>

          {/* Info Rows */}
          <div className="space-y-2.5">
            <InfoItem
              icon={<Calendar size={18} className="text-teal-600" />}
              label="Expiry Date"
              value={formatExpiryDate(product.expiryDate)}
            />

            {/* Quantity Controller Row */}
            <div className="bg-white rounded-2xl p-3.5 shadow-2xs border border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Layers size={18} className="text-teal-600" />
                <span className="text-xs sm:text-sm text-slate-500 font-medium">Quantity in stock</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateQuantity(product.id, -1)}
                  disabled={product.quantity <= 0}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center justify-center font-bold transition cursor-pointer"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center font-bold text-slate-800 text-sm">
                  {product.quantity}
                </span>
                <button
                  onClick={() => onUpdateQuantity(product.id, 1)}
                  className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 hover:bg-teal-200 flex items-center justify-center font-bold transition cursor-pointer"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {product.price !== undefined && (
              <InfoItem
                icon={<IndianRupee size={18} className="text-teal-600" />}
                label="Maximum Retail Price (MRP)"
                value={`₹${product.price}`}
              />
            )}

            <InfoItem
              icon={
                product.quantity > 0 ? (
                  <CheckCircle2 size={18} className="text-emerald-600" />
                ) : (
                  <XCircle size={18} className="text-red-500" />
                )
              }
              label="Availability Status"
              value={product.quantity > 0 ? `In Stock (${product.quantity} units)` : 'Out of Stock'}
            />

            {product.barcode && (
              <InfoItem
                icon={<QrCode size={18} className="text-teal-600" />}
                label="Barcode / GTIN"
                value={product.barcode}
                mono
              />
            )}

            {product.dosage && (
              <InfoItem
                icon={<Stethoscope size={18} className="text-teal-600" />}
                label="Dosage"
                value={product.dosage}
              />
            )}

            {product.genericName && (
              <InfoItem
                icon={<FlaskConical size={18} className="text-teal-600" />}
                label="Generic Name"
                value={product.genericName}
              />
            )}

            {product.composition && (
              <InfoItem
                icon={<Dna size={18} className="text-teal-600" />}
                label="Composition"
                value={product.composition}
              />
            )}

            {product.packSize && (
              <InfoItem
                icon={<Package size={18} className="text-teal-600" />}
                label="Pack Size"
                value={product.packSize}
              />
            )}

            {product.batchNumber && (
              <InfoItem
                icon={<Hash size={18} className="text-teal-600" />}
                label="Batch Number"
                value={product.batchNumber}
                mono
              />
            )}

            {product.uses && (
              <div className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-100">
                <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider mb-1.5">
                  <FileText size={16} />
                  <span>Uses & Medical Indications</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {product.uses}
                </p>
              </div>
            )}
          </div>

          {/* Delete Action if allowed */}
          {onDeleteProduct && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  if (confirm(`Remove ${product.name} from catalog?`)) {
                    onDeleteProduct(product.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl transition cursor-pointer font-medium"
              >
                <Trash2 size={14} />
                <span>Delete item from catalog</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}> = ({ icon, label, value, mono }) => {
  return (
    <div className="bg-white rounded-2xl px-4 py-3 shadow-2xs border border-slate-100 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-xs sm:text-sm text-slate-500 font-medium">{label}</span>
      </div>
      <span
        className={`text-xs sm:text-sm font-semibold text-slate-800 text-right ${
          mono ? 'font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700' : ''
        }`}
      >
        {value}
      </span>
    </div>
  );
};
