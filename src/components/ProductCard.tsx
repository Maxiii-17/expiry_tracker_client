import React from 'react';
import { ChevronRight, QrCode, ShieldCheck, Building2, Package, AlertTriangle, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { MedicinePackVisual } from './MedicinePackVisual';
import { getDaysRemaining, formatExpiryDate, getExpiryBadge } from '../utils/productVisuals';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const days = getDaysRemaining(product.expiryDate);
  const badge = getExpiryBadge(days);
  const isOutOfStock = product.quantity === 0;
  const isLowStock = product.quantity > 0 && product.quantity <= 2;

  // Determine card border & background accent based on stock level
  let cardBorderClass = 'border-slate-100/90 hover:border-teal-200';
  let cardBgClass = 'bg-white';

  if (isOutOfStock) {
    cardBorderClass = 'border-red-300 ring-1 ring-red-200/70 hover:border-red-400';
    cardBgClass = 'bg-red-50/20';
  } else if (isLowStock) {
    cardBorderClass = 'border-amber-300 ring-1 ring-amber-200/70 hover:border-amber-400';
    cardBgClass = 'bg-amber-50/25';
  }

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onSelect(product)}
      className={`group ${cardBgClass} rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 border ${cardBorderClass} cursor-pointer flex items-center justify-between gap-4 relative overflow-hidden`}
    >
      {/* Visual Stock Accent Strip */}
      {isOutOfStock && (
        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-red-500 rounded-l-2xl" />
      )}
      {isLowStock && (
        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-amber-500 rounded-l-2xl" />
      )}

      <div className="flex items-center gap-3.5 min-w-0 flex-1 pl-1">
        {/* Medicine Pack Graphic / Image */}
        <MedicinePackVisual
          name={product.name}
          imageUrl={product.imageUrl}
          size={58}
        />

        {/* Product Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm sm:text-base font-bold text-slate-800 truncate group-hover:text-teal-700 transition">
              {product.name}
            </h2>
            {product.verificationSource === 'gs1-verified' && (
              <span title="GS1 Verified Product" className="shrink-0 text-emerald-600">
                <ShieldCheck size={16} />
              </span>
            )}
          </div>

          {/* Expiry & Barcode Info */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
            <span className="font-medium text-slate-600">
              Exp: {formatExpiryDate(product.expiryDate)}
            </span>
            {product.barcode && (
              <>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  <QrCode size={11} className="text-slate-400" />
                  {product.barcode}
                </span>
              </>
            )}
          </div>

          {/* Manufacturer & Stock status badge */}
          <div className="flex items-center gap-2.5 text-[11px] mt-2 flex-wrap">
            {product.manufacturer && (
              <span className="flex items-center gap-1 text-slate-400 truncate max-w-[160px]">
                <Building2 size={11} className="shrink-0" />
                <span className="truncate">{product.manufacturer}</span>
              </span>
            )}

            {/* Low Stock / Out of Stock / Normal Qty Badge */}
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 px-2 py-0.5 rounded-full border border-red-200">
                <AlertCircle size={11} className="shrink-0" />
                <span>Out of Stock</span>
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">
                <AlertTriangle size={11} className="shrink-0" />
                <span>Low Stock: {product.quantity} left</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                <Package size={11} />
                <span>Qty: {product.quantity}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Trailing Expiry Badge & Chevron */}
      <div className="flex items-center gap-2 shrink-0">
        <div
          className={`px-3 py-1.5 rounded-full text-xs font-bold ${badge.bgColor} ${badge.textColor} shadow-xs tracking-wide whitespace-nowrap`}
        >
          {badge.text}
        </div>
        <ChevronRight size={18} className="text-slate-300 group-hover:text-teal-600 transition" />
      </div>
    </div>
  );
};
