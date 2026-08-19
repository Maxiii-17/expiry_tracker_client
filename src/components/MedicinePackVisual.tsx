import React, { useState } from 'react';
import { Pill, Droplets, Syringe, Wind, Sparkles, Eye } from 'lucide-react';
import { getProductColor, getMedicineType, MedicineType } from '../utils/productVisuals';

interface MedicinePackVisualProps {
  name: string;
  imageUrl?: string;
  size?: number;
  className?: string;
}

export const MedicinePackVisual: React.FC<MedicinePackVisualProps> = ({
  name,
  imageUrl,
  size = 56,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);
  const color = getProductColor(name);
  const type = getMedicineType(name);

  const renderIcon = (type: MedicineType, iconSize: number) => {
    switch (type) {
      case 'syrup':
        return <Droplets size={iconSize} className="text-white" />;
      case 'injection':
        return <Syringe size={iconSize} className="text-white" />;
      case 'inhaler':
        return <Wind size={iconSize} className="text-white" />;
      case 'cream':
        return <Sparkles size={iconSize} className="text-white" />;
      case 'drops':
        return <Eye size={iconSize} className="text-white" />;
      case 'capsule':
      case 'tablet':
      default:
        return <Pill size={iconSize} className="text-white" />;
    }
  };

  if (imageUrl && !imageError) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`relative shrink-0 overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200/80 ${className}`}
      >
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // Fallback to custom stylized medicine packaging representation
  const innerWidth = size * 0.76;
  const innerHeight = size * 0.84;

  return (
    <div
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${color}, #1f2937)`,
      }}
      className={`relative shrink-0 flex items-center justify-center rounded-2xl shadow-sm overflow-hidden ${className}`}
    >
      <div
        style={{ width: innerWidth, height: innerHeight }}
        className="bg-white rounded-lg shadow-inner flex flex-col overflow-hidden border border-slate-300"
      >
        {/* Top color bar with icon */}
        <div
          style={{ height: size * 0.28, backgroundColor: color }}
          className="flex items-center justify-center shrink-0"
        >
          {renderIcon(type, Math.max(12, size * 0.18))}
        </div>

        {/* Packaging label body */}
        <div className="flex-1 p-1 flex flex-col justify-between items-center text-center bg-slate-50">
          <p
            style={{ fontSize: Math.max(9, size * 0.12) }}
            className="font-bold text-slate-800 line-clamp-2 leading-tight tracking-tight px-0.5"
          >
            {name || 'Medicine'}
          </p>

          {/* Stylized blister pill indicators */}
          <div className="flex items-center justify-center gap-1 w-full pb-0.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: Math.max(5, size * 0.14),
                  height: Math.max(3, size * 0.08),
                  borderColor: color,
                }}
                className="bg-white border rounded-full flex items-center justify-center"
              >
                <div
                  style={{ width: '50%', height: '40%', backgroundColor: color }}
                  className="rounded-full opacity-60"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
