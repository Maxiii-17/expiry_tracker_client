import 'package:flutter/material.dart';

const _palette = [
  Color(0xFF00897B),
  Color(0xFF3949AB),
  Color(0xFF6A1B9A),
  Color(0xFF00838F),
  Color(0xFF2E7D32),
  Color(0xFFAD1457),
  Color(0xFFEF6C00),
  Color(0xFF283593),
  Color(0xFF00695C),
  Color(0xFFC62828),
];

Color productColor(String name) {
  var h = 17;
  for (final c in name.toLowerCase().codeUnits) {
    h = (h * 31 + c) & 0x7fffffff;
  }
  return _palette[h % _palette.length];
}

IconData productIcon(String name) {
  final n = name.toLowerCase();
  if (n.contains('syrup') ||
      n.contains('suspension') ||
      n.contains('solution') ||
      n.contains('drop') ||
      n.contains('oral')) {
    return Icons.local_drink;
  }
  if (n.contains('injection') || n.contains(' inj')) {
    return Icons.vaccines;
  }
  if (n.contains('inhaler')) {
    return Icons.air;
  }
  if (n.contains('cream') ||
      n.contains('ointment') ||
      n.contains('gel') ||
      n.contains('lotion')) {
    return Icons.spa;
  }
  return Icons.medication;
}

class MedicinePackImage extends StatelessWidget {
  const MedicinePackImage({super.key, required this.name, this.size = 56});

  final String name;
  final double size;

  @override
  Widget build(BuildContext context) {
    final color = productColor(name);
    final darker = Color.lerp(color, Colors.black, 0.35)!;

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [color, darker],
        ),
        borderRadius: BorderRadius.circular(size * 0.28),
      ),
      child: Center(
        child: Container(
          width: size * 0.74,
          height: size * 0.82,
          clipBehavior: Clip.antiAlias,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(size * 0.09),
            border: Border.all(color: Colors.black.withValues(alpha: 0.12)),
          ),
          child: Column(
            children: [
              Container(
                height: size * 0.18,
                color: color,
                alignment: Alignment.center,
                child: Icon(
                  productIcon(name),
                  color: Colors.white,
                  size: size * 0.11,
                ),
              ),
              Expanded(
                child: Padding(
                  padding: EdgeInsets.symmetric(
                    horizontal: size * 0.06,
                    vertical: size * 0.05,
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(
                        name.isEmpty ? 'Medicine' : name,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: Colors.black87,
                          fontSize: size * 0.115,
                          fontWeight: FontWeight.bold,
                          height: 1.1,
                        ),
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(3, (_) {
                          return Container(
                            width: size * 0.15,
                            height: size * 0.075,
                            margin: EdgeInsets.symmetric(
                              horizontal: size * 0.02,
                            ),
                            decoration: BoxDecoration(
                              color: color.withValues(alpha: 0.25),
                              borderRadius: BorderRadius.circular(size * 0.04),
                              border: Border.all(
                                color: color.withValues(alpha: 0.5),
                              ),
                            ),
                            child: Center(
                              child: Container(
                                width: size * 0.06,
                                height: size * 0.035,
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius:
                                      BorderRadius.circular(size * 0.015),
                                ),
                              ),
                            ),
                          );
                        }),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class ProductPhoto extends StatelessWidget {
  const ProductPhoto({
    super.key,
    required this.name,
    this.imageUrl,
    this.size = 56,
    this.borderRadius = 16,
  });

  final String name;
  final String? imageUrl;
  final double size;
  final double borderRadius;

  @override
  Widget build(BuildContext context) {
    final url = imageUrl;
    if (url == null || url.isEmpty) {
      return MedicinePackImage(name: name, size: size);
    }
    final fallback = MedicinePackImage(name: name, size: size);
    final Widget image;
    if (url.startsWith('assets/')) {
      image = Image.asset(
        url,
        width: size,
        height: size,
        fit: BoxFit.cover,
        errorBuilder: (_, _, _) => fallback,
      );
    } else {
      image = Image.network(
        url,
        width: size,
        height: size,
        fit: BoxFit.cover,
        errorBuilder: (_, _, _) => fallback,
      );
    }
    return ClipRRect(
      borderRadius: BorderRadius.circular(borderRadius),
      child: image,
    );
  }
}
