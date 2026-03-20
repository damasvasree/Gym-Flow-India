# Gymflow - Make App Run & Fix Errors

## Current Status
✅ Firebase CLI v15.11.0 installed & logged in (damasvasree@gmail.com)
✅ Dev server ready (npm run dev)
✅ Firebase emulators initialized (Auth 9099, Firestore 8080, UI 4000)
✅ Dev server running localhost:3003
✅ Emulators setup but Java 17→21 needed (skipped safely)
✅ Prod Firebase mode (no warning)
✅ Test login at localhost:3003
🔄 Optional: JDK21 for emulators

## Step-by-Step Plan (In Progress)
### 1. Install Firebase CLI [PENDING]
```
npm install -g firebase-tools
```
Verify: `firebase --version`

### 2. Login [PENDING]
```
firebase login
```

### 3. Init Local Firebase Project [PENDING]
```
firebase init emulators
# Select Firestore + Auth, use existing 'gymflow-india-local' or create new
```

### 4. Start Emulators [PENDING]
```
firebase emulators:start --only auth,firestore
```
(Expect ports 9099 auth, 8080 firestore - matches firebase.ts)

### 5. Test App
- Refresh http://localhost:3000
- Try Google login (should use emulator)
- Check browser console/network

### 6. Production Setup (Later)
- Create/update Firebase Console project
- Update firebase-applet-config.json
- Deploy rules

## Known Issues
- Emulator warning normal
- Ensure .env GEMINI_API_KEY set if used

Run step 1 command next.

