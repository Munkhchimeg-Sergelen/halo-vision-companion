# 📱 Mobile Deployment Guide

## Capacitor Setup Complete! ✅

Your Halo Vision Companion app is now ready for iOS and Android deployment.

---

## 🚀 Quick Commands

### Build for Production
```bash
npm run build
```

### Sync Changes to Mobile
```bash
npx cap sync
```

### Open in Xcode (iOS)
```bash
npx cap open ios
```

### Open in Android Studio (Android)
```bash
npx cap open android
```

---

## 📱 iOS Deployment

### Requirements:
- macOS with Xcode installed
- Apple Developer Account (for device testing/App Store)

### Steps:
1. **Build the web app:**
   ```bash
   npm run build
   npx cap sync ios
   ```

2. **Open in Xcode:**
   ```bash
   npx cap open ios
   ```

3. **In Xcode:**
   - Select your development team
   - Choose a device or simulator
   - Click the Play button to run

4. **Permissions Added:**
   - ✅ Camera access
   - ✅ Microphone access
   - ✅ Speech recognition

---

## 🤖 Android Deployment

### Requirements:
- Android Studio installed
- Android SDK

### Steps:
1. **Build the web app:**
   ```bash
   npm run build
   npx cap sync android
   ```

2. **Open in Android Studio:**
   ```bash
   npx cap open android
   ```

3. **In Android Studio:**
   - Wait for Gradle sync to complete
   - Select a device or emulator
   - Click the Run button

4. **Permissions Added:**
   - ✅ Camera access
   - ✅ Microphone access
   - ✅ Audio settings

---

## 🔄 Development Workflow

### When you make changes to your web code:

1. **Build:**
   ```bash
   npm run build
   ```

2. **Sync to mobile:**
   ```bash
   npx cap sync
   ```

3. **Run on device** (Xcode or Android Studio will hot-reload)

### Live Reload (Optional):
```bash
npx cap run ios --livereload
# or
npx cap run android --livereload
```

---

## 📦 What's Included

### iOS Platform:
- Native Xcode project in `ios/`
- Info.plist with camera/mic permissions
- Splash screen configured

### Android Platform:
- Native Android Studio project in `android/`
- AndroidManifest.xml with permissions
- Gradle configuration

### Configuration:
- `capacitor.config.json` - Main config
- Permissions properly set for both platforms
- Web assets automatically synced to `dist/`

---

## 🎯 Testing on Real Devices

### iOS:
1. Connect iPhone/iPad via USB
2. Trust the device in Xcode
3. Select device from dropdown
4. Run the app

### Android:
1. Enable Developer Mode on Android device
2. Enable USB Debugging
3. Connect via USB
4. Select device in Android Studio
5. Run the app

---

## 🌐 Web vs Mobile

Your app works in both environments:
- **Web:** `npm run dev` → http://localhost:5173
- **iOS:** Native app via Xcode
- **Android:** Native app via Android Studio

All using the same codebase! 🎉

---

## 🔧 Troubleshooting

### "Command not found: cap"
```bash
npm install
```

### iOS build fails:
- Update Xcode to latest version
- Clean build folder in Xcode (Cmd+Shift+K)

### Android build fails:
- Update Android Studio
- File → Invalidate Caches / Restart

### Camera/Mic not working:
- Check device settings → App permissions
- Ensure permissions are in manifest files

---

## 📝 Next Steps

1. **Test on devices** - Run on real iOS/Android devices
2. **Add app icons** - Replace default icons in native projects
3. **Configure splash screen** - Customize in capacitor.config.json
4. **Deploy to stores** - Follow Apple/Google store guidelines

---

## 🎬 Demo Video Tips

Record your demo on:
- Real iOS device (best for accessibility demo)
- Android device
- Or web browser (easiest)

Show:
1. Voice conversation feature
2. Camera scene capture
3. Accessibility features working

Good luck with your hackathon! 🚀
