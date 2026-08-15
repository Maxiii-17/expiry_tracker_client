import 'dart:typed_data';

import 'package:image/image.dart' as img;
import 'package:zxing_lib/common.dart' show HybridBinarizer;
import 'package:zxing_lib/zxing.dart' hide BarcodeFormat;

class BarcodeIdentifier {
  static Future<String?> decodeImage(Uint8List bytes) async {
    final decoded = img.decodeImage(bytes);
    if (decoded == null) return null;
    final resized = img.copyResize(
      decoded,
      width: 800,
      interpolation: img.Interpolation.average,
    );
    final pixels = <int>[];
    for (final p in resized) {
      pixels.add((p.r.toInt() << 16) | (p.g.toInt() << 8) | p.b.toInt());
    }
    try {
      final source = RGBLuminanceSource(resized.width, resized.height, pixels);
      final bitmap = BinaryBitmap(HybridBinarizer(source));
      final reader = MultiFormatReader();
      return reader.decode(bitmap, DecodeHint(tryHarder: true)).text;
    } catch (_) {
      return null;
    }
  }
}