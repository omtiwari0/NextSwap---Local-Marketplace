// Lazy-load Firebase on demand to avoid bundling ESM with import.meta on web
import { Platform } from 'react-native'

// Helper to access Expo public env without Node typings
const getEnv = (key: string) => (globalThis as any)?.process?.env?.[key] ?? ''

// TODO: Replace with your Firebase Web configuration (or set EXPO_PUBLIC_* envs)
export const firebaseConfig = {
  apiKey: getEnv('EXPO_PUBLIC_FIREBASE_API_KEY'),
  authDomain: getEnv('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('EXPO_PUBLIC_FIREBASE_APP_ID'),
}
// Only initialize if minimally configured to avoid runtime crashes during setup.
const isConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
)

let app: any | undefined
let initialized = false

export async function ensureFirebase() {
  if (initialized) return
  if (!isConfigured) return
  try {
    const { initializeApp, getApps } = await import('firebase/app')
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
    initialized = true
  } catch (e) {
    console.warn('Firebase initialization failed. Check your .env config.', e)
  }
}

export async function getAuthInstance() {
  await ensureFirebase()
  if (!initialized) return null
  const { getAuth, setPersistence, browserLocalPersistence } = await import('firebase/auth')
  const auth = getAuth(app)
  if (Platform.OS === 'web') {
    try { await setPersistence(auth as any, browserLocalPersistence as any) } catch {}
  }
  return auth
}

export default app

export async function getStorageInstance() {
  await ensureFirebase()
  if (!initialized) return null
  const { getStorage } = await import('firebase/storage')
  return getStorage(app)
}

export async function getFirestoreInstance() {
  await ensureFirebase()
  if (!initialized) return null
  const { getFirestore } = await import('firebase/firestore')
  return getFirestore(app)
}
