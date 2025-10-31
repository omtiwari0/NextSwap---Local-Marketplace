import React, { useEffect, useState } from 'react'
import { View, Text, TextInput, Button, Alert, Pressable } from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import { Auth } from '../../services/auth.service'
import { useAuthStore } from '../../store/authStore'
import { Ionicons } from '@expo/vector-icons'

const OTPScreen: React.FC = () => {
	const route = useRoute<any>()
	const navigation = useNavigation<any>()
	const { setAuth } = useAuthStore.getState() as any
	const [code, setCode] = useState('')
	const [submitting, setSubmitting] = useState(false)
	const [email, setEmail] = useState(route.params?.email as string)
	const profile = route.params?.profile as { email: string; phone: string; name: string; photoURL?: string | null; password: string }
	const [editingEmail, setEditingEmail] = useState(false)
	const [cooldown, setCooldown] = useState(0)

	useEffect(() => {
		if (cooldown <= 0) return
		const id = setInterval(() => setCooldown((c) => c - 1), 1000)
		return () => clearInterval(id)
	}, [cooldown])

		const handleVerify = async () => {
		setSubmitting(true)
		try {
			// Verify email OTP via API and create account
			const res = await Auth.verifyEmailOtp(email, code, { displayName: profile?.name, photoURL: profile?.photoURL ?? undefined, phone: profile.phone, password: profile.password })
			// 3) Set store and move to app with full profile
			setAuth({
				uid: res.user.id,
				email: res.user.email,
				name: (res.user as any).name ?? profile?.name ?? null,
				phone: (res.user as any).phone ?? profile?.phone ?? null,
				photoUrl: (res.user as any).photoUrl ?? profile?.photoURL ?? null,
			}, res.idToken)
			Alert.alert('Verified', 'Email verified successfully.')
			navigation.navigate('Home')
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to verify OTP'
			Alert.alert('Verification failed', msg)
		} finally {
			setSubmitting(false)
		}
	}

	const resend = async () => {
		if (!/^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(email.trim())) {
			Alert.alert('Invalid email', 'Only Gmail addresses can sign up (example@gmail.com).')
			return
		}
		try {
			await Auth.startEmailOtp(email.trim(), profile.name, profile.phone, profile.password)
			setCooldown(30)
			Alert.alert('OTP sent', `We sent a new code to ${email}`)
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to resend OTP'
			Alert.alert('Resend failed', msg)
		}
	}

	return (
		<View style={{ flex: 1, justifyContent: 'center', padding: 16 }}>
			<Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 8 }}>Enter verification code</Text>
			<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, justifyContent: 'space-between' }}>
				{editingEmail ? (
					<View style={{ flex: 1, marginRight: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 10, backgroundColor: '#f9fafb' }}>
						<Ionicons name="mail-outline" size={18} color="#9ca3af" />
						<TextInput
							value={email}
							onChangeText={setEmail}
							placeholder="you@example.com"
							keyboardType="email-address"
							autoCapitalize="none"
							style={{ flex: 1, paddingVertical: 10, paddingLeft: 8 }}
						/>
					</View>
				) : (
					<Text style={{ color: '#6b7280' }}>We sent a code to {email}</Text>
				)}
				<Pressable onPress={() => setEditingEmail((e) => !e)} accessibilityRole="button" accessibilityLabel="Edit email">
					<Text style={{ color: '#2563eb', fontWeight: '600' }}>{editingEmail ? 'Cancel' : 'Edit'}</Text>
				</Pressable>
			</View>
			{editingEmail && (
				<Pressable onPress={resend} style={{ alignSelf: 'flex-start', marginBottom: 12 }}>
					<Text style={{ color: '#2563eb', fontWeight: '600' }}>Update email & resend</Text>
				</Pressable>
			)}
			<TextInput
				keyboardType="number-pad"
				value={code}
				onChangeText={setCode}
				placeholder="6-digit code"
				style={{ borderWidth: 1, borderColor: '#e5e7eb', padding: 10, borderRadius: 8, marginBottom: 12 }}
				maxLength={6}
			/>
			<Button title={submitting ? 'Verifying…' : 'Verify'} onPress={handleVerify} disabled={code.length < 6 || submitting} />
			<Pressable onPress={resend} disabled={cooldown > 0} style={{ marginTop: 12, alignSelf: 'center', opacity: cooldown > 0 ? 0.6 : 1 }}>
				<Text style={{ color: '#2563eb', fontWeight: '600' }}>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}</Text>
			</Pressable>
		</View>
	)
}

export default OTPScreen
