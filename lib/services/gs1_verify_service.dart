import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';

import '../api_keys.dart';

class Gs1Result {
  final bool found;
  final bool verified;
  final String? name;
  final String? genericName;
  final String? brandName;
  final String? manufacturer;
  final String? composition;
  final String? packSize;
  final String? source;

  const Gs1Result({
    required this.found,
    required this.verified,
    this.name,
    this.genericName,
    this.brandName,
    this.manufacturer,
    this.composition,
    this.packSize,
    this.source,
  });

  factory Gs1Result.fromJson(Map<String, dynamic> json) {
    final med = json['medicine'] as Map<String, dynamic>? ?? {};
    return Gs1Result(
      found: json['found'] as bool? ?? false,
      verified: json['verified'] as bool? ?? false,
      name: med['medicine_name'] as String? ?? med['name'] as String?,
      genericName: med['generic_name'] as String?,
      brandName: med['brand_name'] as String?,
      manufacturer: med['manufacturer'] as String?,
      composition: med['composition'] as String?,
      packSize: med['pack_size'] as String? ?? med['packSize'] as String?,
      source: json['source'] as String? ?? med['verification_source'] as String?,
    );
  }
}

class Gs1VerifyService {
  static const gs1IndiaValidationUrl =
      'https://www.gs1india.org/services/gtin-validation';

  static bool get backendConfigured => ApiKeys.gs1VerifyBaseUrl.isNotEmpty;

  static Future<Gs1Result?> checkBackend(String gtin) async {
    final base = ApiKeys.gs1VerifyBaseUrl;
    if (base.isEmpty) return null;
    try {
      final uri = Uri.parse('$base/api/verify/${Uri.encodeComponent(gtin)}');
      final resp =
          await http.get(uri).timeout(const Duration(seconds: 10));
      if (resp.statusCode != 200) return null;
      final json = jsonDecode(resp.body) as Map<String, dynamic>;
      return Gs1Result.fromJson(json);
    } catch (_) {
      return null;
    }
  }

  static Future<void> openGs1India(String gtin) async {
    final uri = Uri.parse(gs1IndiaValidationUrl);
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }
}