export const PALETTE = [
  '#00897B',
  '#3949AB',
  '#6A1B9A',
  '#00838F',
  '#2E7D32',
  '#AD1457',
  '#EF6C00',
  '#283593',
  '#00695C',
  '#C62828',
];

export function getProductColor(name: string): string {
  let h = 17;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) & 0x7fffffff;
  }
  return PALETTE[h % PALETTE.length];
}

export type MedicineType = 'syrup' | 'injection' | 'inhaler' | 'cream' | 'drops' | 'capsule' | 'tablet';

export function getMedicineType(name: string): MedicineType {
  const n = name.toLowerCase();
  if (n.includes('syrup') || n.includes('suspension') || n.includes('solution') || n.includes('liquid') || n.includes('elixir') || n.includes('oral')) {
    return 'syrup';
  }
  if (n.includes('injection') || n.includes(' inj') || n.includes('infusion') || n.includes('ampoule')) {
    return 'injection';
  }
  if (n.includes('inhaler') || n.includes('rotacap') || n.includes('respules') || n.includes('spray')) {
    return 'inhaler';
  }
  if (n.includes('cream') || n.includes('ointment') || n.includes('gel') || n.includes('lotion') || n.includes('lacquer')) {
    return 'cream';
  }
  if (n.includes('drop') || n.includes('eye drop') || n.includes('ear drop')) {
    return 'drops';
  }
  if (n.includes('capsule') || n.includes('cap')) {
    return 'capsule';
  }
  return 'tablet';
}

export function getDefaultImageForType(type: MedicineType): string {
  switch (type) {
    case 'syrup':
      return '/images/syrup.jpg';
    case 'injection':
      return '/images/injection.jpg';
    case 'inhaler':
      return '/images/inhaler.jpg';
    case 'cream':
      return '/images/cream.jpg';
    case 'drops':
      return '/images/drops.jpg';
    case 'capsule':
      return '/images/capsule.jpg';
    case 'tablet':
    default:
      return '/images/tablet.jpg';
  }
}

export function getDaysRemaining(expiryDateStr: string): number {
  if (!expiryDateStr) return 0;
  
  let target: Date;
  if (expiryDateStr.includes('-')) {
    const parts = expiryDateStr.split('-');
    if (parts[0].length === 2 && parts[2]?.length === 4) {
      // DD-MM-YYYY
      target = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    } else {
      target = new Date(expiryDateStr);
    }
  } else {
    target = new Date(expiryDateStr);
  }

  if (isNaN(target.getTime())) {
    return 0;
  }

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());

  const diffMs = startOfTarget.getTime() - startOfToday.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function formatExpiryDate(expiryDateStr: string): string {
  if (!expiryDateStr) return 'N/A';
  let target: Date;
  if (expiryDateStr.includes('-')) {
    const parts = expiryDateStr.split('-');
    if (parts[0].length === 2 && parts[2]?.length === 4) {
      target = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    } else {
      target = new Date(expiryDateStr);
    }
  } else {
    target = new Date(expiryDateStr);
  }

  if (isNaN(target.getTime())) {
    return expiryDateStr;
  }

  return target.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getExpiryBadge(daysRemaining: number): {
  text: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  status: 'expired' | 'critical' | 'warning' | 'safe';
} {
  if (daysRemaining < 0) {
    return {
      text: 'EXPIRED',
      bgColor: 'bg-slate-500',
      textColor: 'text-white',
      borderColor: 'border-slate-600',
      status: 'expired',
    };
  }
  if (daysRemaining < 3) {
    return {
      text: `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left!`,
      bgColor: 'bg-red-600',
      textColor: 'text-white',
      borderColor: 'border-red-700',
      status: 'critical',
    };
  }
  if (daysRemaining < 7) {
    return {
      text: `${daysRemaining} days left`,
      bgColor: 'bg-amber-500',
      textColor: 'text-white',
      borderColor: 'border-amber-600',
      status: 'warning',
    };
  }
  return {
    text: `${daysRemaining} days left`,
    bgColor: 'bg-emerald-600',
    textColor: 'text-white',
    borderColor: 'border-emerald-700',
    status: 'safe',
  };
}
