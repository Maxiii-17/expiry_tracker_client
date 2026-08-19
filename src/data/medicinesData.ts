import rawDemoMedicines from '../../assets/demo_medicines.json';
import { Product } from '../types';
import { getDefaultImageForType, getMedicineType } from '../utils/productVisuals';

// Parse demo medicines into typed Product objects
export const INITIAL_MEDICINES: Product[] = rawDemoMedicines.map((item, index) => {
  const type = getMedicineType(item.name);
  
  // Format expiry date from DD-MM-YYYY to YYYY-MM-DD or standard
  let formattedExpiry = item.expiryDate;
  if (item.expiryDate && item.expiryDate.includes('-')) {
    const parts = item.expiryDate.split('-');
    if (parts[0].length === 2 && parts[2]?.length === 4) {
      formattedExpiry = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }

  // Derive realistic demo metadata based on medicine name
  const isSuspensionOrSyrup = type === 'syrup';
  const isInjection = type === 'injection';
  const isDrops = type === 'drops';
  const isCream = type === 'cream';
  const isCapsule = type === 'capsule';

  let packSize = '10 Tablets';
  if (isSuspensionOrSyrup) packSize = '100 ml Syrup';
  else if (isInjection) packSize = '1 Vial (2ml)';
  else if (isDrops) packSize = '10 ml Bottle';
  else if (isCream) packSize = '30 g Tube';
  else if (isCapsule) packSize = '10 Capsules';

  const defaultImage = getDefaultImageForType(type);

  return {
    id: `prod_${item.barcode || index + 1}`,
    name: item.name,
    expiryDate: formattedExpiry,
    category: 'medicine',
    quantity: (index % 5) + 1,
    barcode: item.barcode,
    manufacturer: item.manufacturer,
    genericName: item.name.split(' ')[0] + (item.name.includes('Duo') || item.name.includes('Plus') ? ' Complex' : ' Formulation'),
    composition: `${item.name.split(' ')[0]} Active Pharma Ingredient (IP/BP)`,
    packSize,
    dosage: isSuspensionOrSyrup ? '5-10 ml twice daily as prescribed' : isInjection ? 'As directed by Physician' : isDrops ? '1-2 drops as prescribed' : isCream ? 'Apply thin layer 2 times daily' : '1 tablet once or twice daily after meals',
    uses: `Indicated for clinical therapeutic treatment and symptom relief as prescribed by a licensed healthcare professional.`,
    batchNumber: `BAT-${item.barcode ? item.barcode.slice(-5) : 10000 + index}`,
    price: Math.round(((index * 13) % 450 + 45)),
    imageUrl: defaultImage,
    verificationSource: index % 3 === 0 ? 'gs1-verified' : 'local-catalog',
    verifiedAt: index % 3 === 0 ? '2026-05-12' : undefined,
  };
});
