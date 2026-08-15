import 'package:cloud_firestore/cloud_firestore.dart';

class Product {
  final String id;
  final String name;
  final DateTime expiryDate;
  final String category;
  final int quantity;
  final String? barcode;
  final String? uses;
  final String? dosage;
  final String? imageUrl;
  final String? genericName;
  final String? composition;
  final String? packSize;
  final String? batchNumber;
  final double? price;
  final String? verificationSource;
  final DateTime? verifiedAt;

  const Product({
    required this.id,
    required this.name,
    required this.expiryDate,
    required this.category,
    this.quantity = 1,
    this.barcode,
    this.uses,
    this.dosage,
    this.imageUrl,
    this.genericName,
    this.composition,
    this.packSize,
    this.batchNumber,
    this.price,
    this.verificationSource,
    this.verifiedAt,
  });

  int get daysRemaining =>
      DateTime(expiryDate.year, expiryDate.month, expiryDate.day)
          .difference(DateTime(
              DateTime.now().year, DateTime.now().month, DateTime.now().day))
          .inDays;

  factory Product.fromMap(String id, Map<String, dynamic> map) {
    return Product(
      id: id,
      name: map['name'] as String? ?? 'Unknown',
      expiryDate: (map['expiryDate'] as Timestamp?)?.toDate() ?? DateTime.now(),
      category: map['category'] as String? ?? 'grocery',
      quantity: (map['quantity'] as num?)?.toInt() ?? 1,
      barcode: map['barcode'] as String?,
      uses: (map['uses'] as String?) ?? (map['usage'] as String?),
      dosage: map['dosage'] as String?,
      imageUrl: map['imageUrl'] as String?,
      genericName: map['genericName'] as String?,
      composition: map['composition'] as String?,
      packSize: map['packSize'] as String?,
      batchNumber: map['batchNumber'] as String?,
      price: (map['price'] as num?)?.toDouble(),
      verificationSource: map['verificationSource'] as String?,
      verifiedAt: (map['verifiedAt'] as Timestamp?)?.toDate(),
    );
  }
}