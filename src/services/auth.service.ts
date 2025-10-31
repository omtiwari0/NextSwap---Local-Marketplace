const API = (globalThis as any)?.process?.env?.EXPO_PUBLIC_API_URL || 'http://localhost:4000'
import { Platform } from 'react-native'

export type User = { id: string; email: string | null; name?: string | null; phone?: string | null; photoUrl?: string | null } | null

export const Auth = {
    async loginEmail(email: string, password: string) {
        const r = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
        if (!r.ok) throw new Error(await r.text())
    const data = await r.json()
    return { user: { id: data.user.id, email: data.user.email, name: data.user.name, phone: data.user.phone, photoUrl: data.user.photoUrl }, idToken: data.token }
    },
    // Not used with OTP flow; kept for compatibility
    async registerEmail(email: string, password: string, phoneNumber?: string | null) {
        return this.loginEmail(email, password)
    },
        async loginGoogle() {
            // Supports Web via Firebase Auth popup. For native, extend with Expo Auth Session and Firebase credential.
            const { getAuthInstance } = await import('./firebase')
            const auth = await getAuthInstance()
            if (!auth) throw new Error('Firebase not configured. Set EXPO_PUBLIC_FIREBASE_* env values.')
            if (Platform.OS !== 'web') {
                throw new Error('Google sign-in on native not configured yet. Use email/OTP or enable Expo Google Auth.')
            }
            const { GoogleAuthProvider, signInWithPopup, signInWithRedirect } = await import('firebase/auth')
            const provider = new GoogleAuthProvider()
            // Force account chooser each time so the Google account dialog shows
            try { (provider as any).setCustomParameters?.({ prompt: 'select_account' }) } catch {}
            let idToken: string | null = null
            try {
                const cred = await signInWithPopup(auth as any, provider as any)
                idToken = await (cred.user as any).getIdToken()
            } catch (e: any) {
                const code = e?.code || ''
                if (code === 'auth/operation-not-allowed') {
                    throw new Error('Google sign-in is disabled in Firebase. Enable Google provider in Firebase Console > Authentication > Sign-in method.')
                }
                if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
                    // Fallback to redirect if popup blocked or unsupported (e.g., some embedded browsers)
                    await signInWithRedirect(auth as any, provider as any)
                    return Promise.resolve({ user: null as any, idToken: '' }) // redirect will navigate; this value is ignored
                }
                throw new Error(e?.message || 'Google sign-in failed')
            }
            if (!idToken) throw new Error('Missing Google token')
            const r = await fetch(`${API}/auth/google`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken }) })
            if (!r.ok) throw new Error(await r.text())
            const data = await r.json()
            return { user: { id: data.user.id, email: data.user.email, name: data.user.name, phone: data.user.phone, photoUrl: data.user.photoUrl }, idToken: data.token }
        },
    async logout() {
            // Stateless JWT: simply clear client state on logout
            return
    },
        async me(token: string): Promise<User> {
            const r = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
            if (!r.ok) return null
            const data = await r.json()
            const u = data?.user
            if (!u) return null
            return { id: u.id, email: u.email, name: u.name, phone: u.phone, photoUrl: u.photoUrl }
        },
    async startEmailOtp(email: string, name: string, phone: string, password: string) {
        const r = await fetch(`${API}/auth/start`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, name, phone, password }) })
        if (!r.ok) throw new Error(await r.text())
        return r.json()
    },
    async verifyEmailOtp(email: string, code: string, profile: { displayName: string; photoURL?: string | null; phone: string; password: string }) {
        // If we have a local photo uri, upload to server to get a Cloudinary URL
        let uploadedUrl = profile.photoURL ?? undefined
        if (uploadedUrl && !/^https?:\/\//i.test(uploadedUrl)) {
            const form = new FormData()
            if (Platform.OS === 'web') {
                // Convert local/web URI to Blob for browser FormData
                const blob = await fetch(uploadedUrl).then((r) => r.blob())
                // @ts-ignore: web FormData accepts (Blob, filename)
                form.append('file', blob as any, 'profile.jpg')
            } else {
                // @ts-ignore react-native FormData types
                form.append('file', { uri: uploadedUrl, name: 'profile.jpg', type: 'image/jpeg' } as any)
            }
            const resp = await fetch(`${API}/files/upload`, { method: 'POST', body: form as any })
            if (!resp.ok) {
                const msg = await resp.text().catch(() => 'Image upload failed')
                throw new Error(msg || 'Image upload failed')
            }
            const data = await resp.json()
            uploadedUrl = data.secure_url
        }
        const payload = { email, code, name: profile.displayName, phone: profile.phone, password: profile.password, photoUrl: uploadedUrl }
        const r = await fetch(`${API}/auth/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (!r.ok) throw new Error(await r.text())
    const data = await r.json()
    return { user: { id: data.user.id, email: data.user.email, name: data.user.name, phone: data.user.phone, photoUrl: data.user.photoUrl }, idToken: data.token }
    },
    async updateUserProfile(opts: { name?: string | null; phone?: string | null; photoUrl?: string | null }, token: string) {
        const r = await fetch(`${API}/auth/me`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name: opts.name, phone: opts.phone, photoUrl: opts.photoUrl }) })
        if (!r.ok) throw new Error(await r.text())
        const data = await r.json()
        const u = data?.user
        return { user: { id: u.id, email: u.email, name: u.name, phone: u.phone, photoUrl: u.photoUrl } }
    },
}