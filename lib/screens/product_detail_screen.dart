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
      badgeColor = Colors.orange;
      badgeText = '$days day${days == 1 ? '' : 's'} left!';
    } else if (days < 7) {
      badgeColor = const Color(0xFFE53935);
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
            if (product.dosage != null)
              _InfoRow(
                icon: Icons.medical_services,
                label: 'Dosage',
                value: product.dosage!,
              ),
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
          ],
        ),
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