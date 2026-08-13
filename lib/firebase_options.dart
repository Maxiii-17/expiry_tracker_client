import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      default:
        throw UnsupportedError(
            'Firebase not supported on $defaultTargetPlatform');
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyB1FpJxNs04tYo10sRM7iRActthm_3YA3g',
    appId: '1:159273998672:web:f203f191341032bb57f455',
    messagingSenderId: '159273998672',
    projectId: 'medicine-tracker-60d56',
    authDomain: 'medicine-tracker-60d56.firebaseapp.com',
    storageBucket: 'medicine-tracker-60d56.firebasestorage.app',
  );

  // TODO: replace with real values after registering an Android app in
  // the Firebase console and adding google-services.json.
  static const FirebaseOptions android = FirebaseOptions(
    apiKey: '',
    appId: '',
    messagingSenderId: '159273998672',
    projectId: 'medicine-tracker-60d56',
    storageBucket: 'medicine-tracker-60d56.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: '',
    appId: '',
    messagingSenderId: '159273998672',
    projectId: 'medicine-tracker-60d56',
    storageBucket: 'medicine-tracker-60d56.firebasestorage.app',
    iosBundleId: 'com.example.expiryTracker',
  );
}