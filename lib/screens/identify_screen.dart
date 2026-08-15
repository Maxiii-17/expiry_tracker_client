import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';

import '../services/barcode_identifier.dart';
import '../services/gs1_verify_service.dart';
import '../services/product_service.dart';
import 'product_detail_screen.dart';

class IdentifyScreen extends StatefulWidget {
  const IdentifyScreen({super.key});

  @override
  State<IdentifyScreen> createState() => _IdentifyScreenState();
}

class _IdentifyScreenState extends State<IdentifyScreen> {
  final _productService = ProductService();
  final TextEditingController _codeController = TextEditingController();
  bool _busy = false;
  String? _code;
  String? _status;
  Gs1Result? _gs1;

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }

  Future<void> _pickAndIdentify() async {
    final result = await FilePicker.pickFiles(
      type: FileType.image,
      withData: true,
    );
    if (result == null || result.files.single.bytes == null) return;

    setState(() {
      _busy = true;
      _status = 'Decoding barcode with ZXing...';
    });

    final code = await BarcodeIdentifier.decodeImage(
      result.files.single.bytes!,
    );
    if (!mounted) return;
    if (code == null || code.isEmpty) {
      setState(() {
        _busy = false;
        _status = 'No barcode found in that image. Try a clearer photo.';
      });
      return;
    }
    await _findByCode(code);
  }

  Future<void> _typeAndFind() async {
    final code = _codeController.text.trim();
    if (code.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Type a barcode number first')),
      );
      return;
    }
    setState(() {
      _busy = true;
      _status = 'Searching catalog for $code...';
    });
    await _findByCode(code);
  }

  Future<void> _findByCode(String code) async {
    final product = await _productService.findByBarcode(code);
    if (!mounted) return;
    setState(() {
      _busy = false;
      _code = code;
    });

    if (product != null) {
      Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => ProductDetailScreen(product: product)),
      );
      return;
    }

    setState(() => _status = 'Not in local catalog — checking GS1…');
    Gs1Result? gs1Result;
    if (Gs1VerifyService.backendConfigured) {
      gs1Result = await Gs1VerifyService.checkBackend(code);
    }
    if (!mounted) return;
    setState(() {
      _gs1 = gs1Result;
      _status = null;
    });
  }

  Future<void> _openGs1() async {
    final code = _code;
    if (code == null) return;
    await Gs1VerifyService.openGs1India(code);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F6F8),
      appBar: AppBar(title: const Text('Identify Product')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.qr_code_scanner,
                size: 84,
                color: Color(0xFF00897B),
              ),
              const SizedBox(height: 24),
              const Text(
                'Pick a photo of a medicine barcode\n'
                'and ZXing will decode it, then open the\n'
                'matching product automatically.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 15, height: 1.5),
              ),
              const SizedBox(height: 24),
              if (_busy)
                const CircularProgressIndicator()
              else ...[
                TextField(
                  controller: _codeController,
                  keyboardType: TextInputType.number,
                  onSubmitted: (_) => _typeAndFind(),
                  decoration: InputDecoration(
                    hintText: 'Type barcode / GTIN number',
                    prefixIcon: const Icon(Icons.qr_code),
                    suffixIcon: IconButton(
                      icon: const Icon(Icons.arrow_forward),
                      onPressed: _typeAndFind,
                    ),
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'or',
                  style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                ),
                const SizedBox(height: 12),
                FilledButton.icon(
                  onPressed: _pickAndIdentify,
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFF00897B),
                  ),
                  icon: const Icon(Icons.photo_library),
                  label: const Text('Choose barcode image'),
                ),
              ],
              if (_code != null && _status == null) ...[
                const SizedBox(height: 16),
                Text(
                  'Decoded: $_code',
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 12),
                if (_gs1 != null && _gs1!.found) ...[
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.green.shade50,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: Colors.green.shade400),
                    ),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.verified_user,
                                color: Colors.green),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                _gs1!.verified
                                    ? 'Verified by GS1'
                                    : 'Product found via GS1',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: Colors.green,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        if (_gs1!.name != null)
                          Text(_gs1!.name!, textAlign: TextAlign.center),
                        if (_gs1!.genericName != null)
                          Text(
                            'Generic: ${_gs1!.genericName}',
                            textAlign: TextAlign.center,
                            style: const TextStyle(fontSize: 12),
                          ),
                        if (_gs1!.manufacturer != null)
                          Text(
                            'Mfr: ${_gs1!.manufacturer}',
                            textAlign: TextAlign.center,
                            style: const TextStyle(fontSize: 12),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  OutlinedButton.icon(
                    onPressed: _openGs1,
                    icon: const Icon(Icons.open_in_new),
                    label: const Text('Open GS1 India'),
                  ),
                ] else ...[
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.orange.shade50,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: Colors.orange.shade300),
                    ),
                    child: const Column(
                      children: [
                        Text(
                          'Barcode not found in the local catalog\n'
                          'and could not be verified automatically.',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontWeight: FontWeight.w600),
                        ),
                        SizedBox(height: 6),
                        Text(
                          'Not found / unverified — checking manually is safer '
                          'than guessing.',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 12, color: Colors.black54),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  OutlinedButton.icon(
                    onPressed: _openGs1,
                    icon: const Icon(Icons.open_in_new),
                    label: const Text('Check on GS1 India'),
                  ),
                ],
              ],
              if (_status != null) ...[
                const SizedBox(height: 16),
                Text(
                  _status!,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.blueGrey),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}