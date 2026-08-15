import 'package:flutter/material.dart';

import '../models/product.dart';
import '../utils/product_visuals.dart';

class ProductDetailScreen extends StatelessWidget {
  const ProductDetailScreen({super.key, required this.product});

  final Product product;

  @override
  Widget build(BuildContext context) {
    final days = product.daysRemaining;
    final Color badgeColor;
    final String badgeText;
    if (days < 0) {
      badgeColor = Colors.grey.shade500;
      badgeText = 'EXPIRED';
    } else if (days < 3) {
      badgeColor = const Color(0xFFE53935);
      badgeText = '$days day${days == 1 ? '' : 's'} left!';
    } else if (days < 7) {
      badgeColor = Colors.orange;
      badgeText = '$days days left';
    } else {
      badgeColor = const Color(0xFF43A047);
      badgeText = '$days days left';
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF4F6F8),
      appBar: AppBar(title: const Text('Product Details')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.06),
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Column(
                children: [
                  ProductPhoto(
                    name: product.name,
                    imageUrl: product.imageUrl,
                    size: 132,
                    borderRadius: 20,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    product.name,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: badgeColor,
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: Text(
                      badgeText,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            if (product.verificationSource != null) ...[
              _VerificationBadge(product: product),
              const SizedBox(height: 10),
            ],
            _InfoRow(
              icon: Icons.category,
              label: 'Category',
              value: product.category == 'medicine' ? 'Medicine' : 'Grocery',
            ),
            _InfoRow(
              icon: Icons.event,
              label: 'Expiry date',
              value:
                  '${product.expiryDate.day}/${product.expiryDate.month}/${product.expiryDate.year}',
            ),
            _InfoRow(
              icon: Icons.numbers,
              label: 'Quantity',
              value: '${product.quantity}',
            ),
            if (product.price != null)
              _InfoRow(
                icon: Icons.currency_rupee,
                label: 'Price',
                value: '₹${product.price}',
              ),
            _InfoRow(
              icon: product.quantity > 0
                  ? Icons.check_circle_outline
                  : Icons.remove_circle_outline,
              label: 'Availability',
              value: product.quantity > 0
                  ? 'In stock (${product.quantity})'
                  : 'Out of stock',
            ),
            if (product.barcode != null)
              _InfoRow(
                icon: Icons.qr_code,
                label: 'Barcode',
                value: product.barcode!,
              ),
            if (product.uses != null) ...[
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(
                      Icons.medical_information,
                      color: Color(0xFF00897B),
                      size: 22,
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Text(
                        product.uses!,
                        style: const TextStyle(fontSize: 14, height: 1.5),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            if (product.dosage != null)
              _InfoRow(
                icon: Icons.medical_services,
                label: 'Dosage',
                value: product.dosage!,
              ),
            if (product.genericName != null)
              _InfoRow(
                icon: Icons.science_outlined,
                label: 'Generic name',
                value: product.genericName!,
              ),
            if (product.composition != null)
              _InfoRow(
                icon: Icons.biotech_outlined,
                label: 'Composition',
                value: product.composition!,
              ),
            if (product.packSize != null)
              _InfoRow(
                icon: Icons.inventory_outlined,
                label: 'Pack size',
                value: product.packSize!,
              ),
            if (product.batchNumber != null)
              _InfoRow(
                icon: Icons.tag,
                label: 'Batch no.',
                value: product.batchNumber!,
              ),
          ],
        ),
      ),
    );
  }
}

class _VerificationBadge extends StatelessWidget {
  const _VerificationBadge({required this.product});

  final Product product;

  @override
  Widget build(BuildContext context) {
    final source = product.verificationSource;
    final bool gs1Verified = source == 'gs1-verified';
    final Color color =
        gs1Verified ? const Color(0xFF43A047) : const Color(0xFFFB8C00);
    final String date = product.verifiedAt == null
        ? ''
        : ' on ${product.verifiedAt!.day}/${product.verifiedAt!.month}/${product.verifiedAt!.year}';

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color, width: 1.2),
      ),
      child: Row(
        children: [
          Icon(
            gs1Verified ? Icons.verified_user : Icons.info_outline,
            color: color,
            size: 20,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              gs1Verified
                  ? 'Verified$date via GS1'
                  : 'Not independently verified$date. Local catalog data only.',
              style: TextStyle(
                color: color,
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFF00897B), size: 22),
          const SizedBox(width: 14),
          Text(
            label,
            style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}