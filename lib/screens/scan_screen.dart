import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import '../services/product_service.dart';
import 'identify_screen.dart';
import 'product_detail_screen.dart';

class ScanScreen extends StatefulWidget {
  const ScanScreen({super.key});

  @override
  State<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> {
  final MobileScannerController _controller =
      MobileScannerController(formats: [BarcodeFormat.all]);
  final _productService = ProductService();
  bool _busy = false;
  String _message = 'Point the camera at a barcode';
  String? _lookedUpCode;

  void _onDetect(BarcodeCapture capture) {
    if (_busy) return;
    final code = capture.barcodes.firstOrNull?.rawValue;
    if (code == null || code.isEmpty) return;
    _busy = true;
    _controller.stop();
    _lookup(code);
  }

  Future<void> _lookup(String code) async {
    setState(() => _message = 'Looking up $code…');
    final product = await _productService.findByBarcode(code);
    if (!mounted) return;
    if (product != null) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => ProductDetailScreen(product: product)),
      );
      return;
    }
    if (!mounted) return;
    setState(() {
      _busy = false;
      _lookedUpCode = code;
      _message = 'No match in catalog for $code';
    });
    await _safeStart();
  }

  Future<void> _safeStart() async {
    try {
      await _controller.start();
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _message = 'Camera stopped. Use the "image" option instead, '
            'or scan in a brighter area.';
      });
    }
  }

  void _resume() {
    setState(() {
      _lookedUpCode = null;
      _message = 'Point the camera at a barcode';
    });
    _safeStart();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('Scan Barcode'),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        actions: [
          TextButton.icon(
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const IdentifyScreen()),
            ),
            style: TextButton.styleFrom(foregroundColor: Colors.white),
            icon: const Icon(Icons.photo_library, size: 18),
            label: const Text('Use image instead'),
          ),
        ],
      ),
      body: Stack(
        children: [
          MobileScanner(
            controller: _controller,
            onDetect: _onDetect,
            errorBuilder: (context, error) => _ErrorOverlay(
              message: switch (error.errorCode) {
                MobileScannerErrorCode.permissionDenied =>
                  'Camera permission was denied. '
                      'Allow camera access in your browser settings, '
                      'or use the image option instead.',
                MobileScannerErrorCode.unsupported =>
                  'Camera is not supported here. '
                      'Use the image option instead.',
                _ => 'Camera error: $error\nUse the image option instead.',
              },
              onRetry: _safeStart,
            ),
          ),
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 260,
                  height: 160,
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.white, width: 3),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Center(
                    child: Text(
                      'Point camera at the barcode',
                      style: TextStyle(color: Colors.white),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 10),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.65),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        _busy ? Icons.hourglass_top : Icons.center_focus_weak,
                        color: Colors.white,
                        size: 18,
                      ),
                      const SizedBox(width: 8),
                      Flexible(
                        child: Text(
                          _message,
                          style: const TextStyle(color: Colors.white),
                        ),
                      ),
                    ],
                  ),
                ),
                if (_lookedUpCode != null) ...[
                  const SizedBox(height: 12),
                  ElevatedButton.icon(
                    onPressed: _resume,
                    icon: const Icon(Icons.refresh),
                    label: const Text('Scan again'),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ErrorOverlay extends StatelessWidget {
  const _ErrorOverlay({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.no_photography, color: Colors.white, size: 56),
            const SizedBox(height: 16),
            Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.white),
            ),
            const SizedBox(height: 20),
            FilledButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }
}