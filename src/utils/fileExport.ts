import { Product } from '../types';

/**
 * Downloads data as a JSON file
 */
export function exportToJSONFile(products: Product[], filename = 'medicine_catalog.json') {
  const jsonStr = JSON.stringify(products, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Downloads data as a CSV file (Excel format)
 */
export function exportToCSVFile(products: Product[], filename = 'medicine_catalog.csv') {
  const headers = [
    'ID',
    'Name',
    'Expiry Date',
    'Quantity',
    'Category',
    'Barcode (GTIN)',
    'Manufacturer',
    'Generic Name',
    'Composition',
    'Dosage',
    'Pack Size',
    'Price (INR)',
    'Batch Number',
    'Uses',
    'Verification Status',
    'Verified Date',
  ];

  const escapeCSV = (val: any) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = products.map((p) => [
    escapeCSV(p.id),
    escapeCSV(p.name),
    escapeCSV(p.expiryDate),
    escapeCSV(p.quantity),
    escapeCSV(p.category),
    escapeCSV(p.barcode || ''),
    escapeCSV(p.manufacturer || ''),
    escapeCSV(p.genericName || ''),
    escapeCSV(p.composition || ''),
    escapeCSV(p.dosage || ''),
    escapeCSV(p.packSize || ''),
    escapeCSV(p.price || ''),
    escapeCSV(p.batchNumber || ''),
    escapeCSV(p.uses || ''),
    escapeCSV(p.verificationSource || ''),
    escapeCSV(p.verifiedAt || ''),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
