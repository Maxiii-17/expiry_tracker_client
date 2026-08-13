import 'dart:convert';

import 'package:flutter/services.dart' show rootBundle;
import 'package:flutter_test/flutter_test.dart';

import 'package:expiry_tracker/models/product.dart';

void main() {
  test('daysRemaining is negative for expired products', () {
    final product = Product(
      id: '1',
      name: 'Old Medicine',
      expiryDate: DateTime(2020, 1, 1),
      category: 'medicine',
    );
    expect(product.daysRemaining, lessThan(0));
  });

  test('daysRemaining is positive for future products', () {
    final product = Product(
      id: '2',
      name: 'Fresh Medicine',
      expiryDate: DateTime(2030, 1, 1),
      category: 'medicine',
    );
    expect(product.daysRemaining, greaterThan(0));
  });

  test('demo medicines asset loads with 500 entries and valid barcodes',
      () async {
    TestWidgetsFlutterBinding.ensureInitialized();
    final raw = await rootBundle.loadString('assets/demo_medicines.json');
    final list = jsonDecode(raw) as List<dynamic>;

    expect(list.length, 500, reason: 'must contain exactly 500 medicines');

    final checkDigits = <String>{};
    for (final item in list) {
      final map = item as Map<String, dynamic>;
      final barcode = map['barcode'] as String;
      expect(barcode.length, 13, reason: '${map['name']} barcode must be EAN-13');
      final name = map['name'] as String;
      expect(name.isNotEmpty, isTrue);
      final expiry = map['expiryDate'] as String;
      expect(expiry.length, 10, reason: 'exact expiry format DD-MM-YYYY');
      expect(checkDigits.add(barcode), isTrue, reason: 'duplicate barcode $barcode');
    }

    final first = list.first as Map<String, dynamic>;
    expect(first['barcode'], startsWith('890'));
    expect(first['category'], isNull); // local entries carry name/manufacturer only
  });
}