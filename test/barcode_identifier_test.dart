import 'dart:convert';
import 'dart:math';

import 'package:flutter/services.dart' show rootBundle;
import 'package:flutter_test/flutter_test.dart';
import 'package:image/image.dart' as img;
import 'package:zxing_lib/oned.dart' show EAN13Writer;
import 'package:zxing_lib/zxing.dart' show BarcodeFormat;

import 'package:expiry_tracker/services/barcode_identifier.dart';

img.Image renderEan13(String barcode, {int scale = 4}) {
  final matrix = EAN13Writer().encode(
    barcode,
    BarcodeFormat.ean13,
    0,
    0,
  );
  final quiet = 10 * scale;
  final width = matrix.width * scale + quiet * 2;
  final height = 40 * scale;
  final image = img.Image(width: width, height: height);
  img.fill(image, color: img.ColorRgb8(255, 255, 255));
  for (var x = 0; x < matrix.width; x++) {
    for (var y = 0; y < matrix.height; y++) {
      if (matrix.get(x, y)) {
        img.fillRect(
          image,
          x1: quiet + x * scale,
          y1: y * scale,
          x2: quiet + (x + 1) * scale,
          y2: (y + 1) * scale,
          color: img.ColorRgb8(0, 0, 0),
        );
      }
    }
  }
  return image;
}

img.Image addNoise(img.Image source, {int salt = 1}) {
  final rng = Random(salt);
  final noisy = img.Image.from(source);
  for (var i = 0; i < 200; i++) {
    final x = rng.nextInt(noisy.width);
    final y = rng.nextInt(noisy.height);
    final v = rng.nextInt(256);
    noisy.setPixelRgb(x, y, v, v, v);
  }
  return noisy;
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('ZXing decodes every catalog EAN-13 barcode (clean render)', () async {
    final raw = await rootBundle.loadString('assets/demo_medicines.json');
    final list = jsonDecode(raw) as List<dynamic>;
    final barcodes = [for (final item in list) item['barcode'] as String];

    final failures = <String>[];
    var ok = 0;
    for (final barcode in barcodes) {
      final png = img.encodePng(renderEan13(barcode));
      final decoded = await BarcodeIdentifier.decodeImage(png);
      if (decoded == barcode) {
        ok++;
      } else {
        failures.add('$barcode -> ${decoded ?? 'null'}');
      }
    }

    expect(failures, isEmpty,
        reason: '${failures.length}/${barcodes.length} failed to decode: '
            '${failures.take(10).join(', ')}');
    expect(ok, barcodes.length,
        reason: 'expected 100% decode rate on ${barcodes.length} barcodes');
  });

  test('ZXing decodes noisy/stale barcode images too', () async {
    final raw = await rootBundle.loadString('assets/demo_medicines.json');
    final list = jsonDecode(raw) as List<dynamic>;
    final barcodes = [
      for (final item in list.take(50)) item['barcode'] as String,
    ];

    final failures = <String>[];
    var ok = 0;
    for (var i = 0; i < barcodes.length; i++) {
      final barcode = barcodes[i];
      final png = img.encodePng(addNoise(renderEan13(barcode), salt: i + 1));
      final decoded = await BarcodeIdentifier.decodeImage(png);
      if (decoded == barcode) {
        ok++;
      } else {
        failures.add('$barcode -> ${decoded ?? 'null'}');
      }
    }

    expect(failures, isEmpty,
        reason: '${failures.length}/${barcodes.length} noisy renders failed: '
            '${failures.take(10).join(', ')}');
    expect(ok, barcodes.length,
        reason: 'expected 100% decode rate on noisy renders');
  });
}