import { Platform } from 'react-native'
import { getAuthInstance } from './firebase'

export type User = { id: string; email: string | null; phoneNumber?: string | null } | null

export const Auth = {
    async loginEmail(email: string, password: string) {
        const auth = await getAuthInstance()
        if (!auth) throw new Error('Firebase not configured')
        const { signInWithEmailAndPassword } = await import('firebase/auth')
        const res = await signInWithEmailAndPassword(auth, email, password)
        const idToken = await res.user.getIdToken()
        return { user: { id: res.user.uid, email: res.user.email }, idToken }
    },
    async registerEmail(email: string, password: string, phoneNumber?: string | null) {
        const auth = await getAuthInstance()
        if (!auth) throw new Error('Firebase not configured')
        const { createUserWithEmailAndPassword } = await import('firebase/auth')
        const res = await createUserWithEmailAndPassword(auth, email, password)
        const idToken = await res.user.getIdToken()
        return { user: { id: res.user.uid, email: res.user.email, phoneNumber: phoneNumber ?? null }, idToken }
    },
        async loginGoogle() {
            const auth = await getAuthInstance()
            if (!auth) throw new Error('Firebase not configured')
            if (Platform.OS === 'web') {
            const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth')
            const provider = new GoogleAuthProvider()
            const res = await signInWithPopup(auth, provider)
            const idToken = await res.user.getIdToken()
            return { user: { id: res.user.uid, email: res.user.email }, idToken }
        }
            throw new Error('Google sign-in on native requires additional setup. Use web for now or provide native client IDs and we will wire it up.')
    },
    async logout() {
        const auth = await getAuthInstance()
        if (!auth) return
        const { signOut } = await import('firebase/auth')
        await signOut(auth)
    },
    async getCurrentUser(): Promise<User> {
        const auth = await getAuthInstance()
        if (!auth) return null
            const { onAuthStateChanged } = await import('firebase/auth')
            return new Promise((resolve) => {
                const unsub = onAuthStateChanged(auth as any, (u) => {
                unsub()
                if (!u) return resolve(null)
                resolve({ id: u.uid, email: u.email })
            })
        })
    },
}