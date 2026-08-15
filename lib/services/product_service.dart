import 'package:cloud_firestore/cloud_firestore.dart';

import '../models/product.dart';

class ProductService {
  final CollectionReference _products =
      FirebaseFirestore.instance.collection('products');

  Stream<List<Product>> watchCatalog() {
    return _products
        .orderBy('expiryDate')
        .snapshots()
        .map((snap) => snap.docs
            .map((doc) =>
                Product.fromMap(doc.id, doc.data() as Map<String, dynamic>))
            .toList());
  }

  Future<Product?> findByBarcode(String barcode) async {
    final snap =
        await _products.where('barcode', isEqualTo: barcode).limit(1).get();
    if (snap.docs.isEmpty) return null;
    return Product.fromMap(
      snap.docs.first.id,
      snap.docs.first.data() as Map<String, dynamic>,
    );
  }
}
