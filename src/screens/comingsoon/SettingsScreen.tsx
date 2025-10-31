import React, { useMemo, useState } from 'react'
import { View, Text, TextInput, Pressable, Image, Alert, Switch, Platform, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { useAuthStore } from '../../store/authStore'

const API = (globalThis as any)?.process?.env?.EXPO_PUBLIC_API_URL || 'http://localhost:4000'

const SettingsScreen: React.FC = () => {
  const { user, idToken } = useAuthStore.getState() as any
  const setAuth = useAuthStore((s: any) => s.setAuth)
  const [name, setName] = useState<string>(user?.name || '')
  const [phone, setPhone] = useState<string>(user?.phone || '')
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(user?.photoUrl || undefined)
  const [pushEnabled, setPushEnabled] = useState(false)
  const canSave = useMemo(() => (name?.trim().length ?? 0) >= 2 && (phone?.trim().length ?? 0) >= 6, [name, phone])
  const [saving, setSaving] = useState(false)

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      Alert.alert('Permission needed', 'We need access to your photos to change your profile picture.')
      return
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.85, allowsEditing: true, aspect: [1,1] })
    if (res.canceled) return
    const uri = res.assets?.[0]?.uri
    if (!uri) return
    // Upload to server -> Cloudinary, then set URL
    try {
      const form = new FormData()
      if (Platform.OS === 'web') {
        const blob = await fetch(uri).then((r) => r.blob())
        // @ts-ignore web FormData supports Blob + filename
        form.append('file', blob as any, 'profile.jpg')
      } else {
        // @ts-ignore RN File type
        form.append('file', { uri, name: 'profile.jpg', type: 'image/jpeg' } as any)
      }
      const resp = await fetch(`${API}/files/upload`, { method: 'POST', body: form as any })
      if (!resp.ok) throw new Error(await resp.text())
      const data = await resp.json()
      setPhotoUrl(data.secure_url)
    } catch (e: any) {
      Alert.alert('Upload failed', e?.message || 'Could not upload image')
    }
  }

  const onSave = async () => {
    if (!idToken) {
      Alert.alert('Not logged in', 'Please log in to update your profile.')
      return
    }
    try {
      setSaving(true)
      const resp = await fetch(`${API}/auth/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), photoUrl }),
      })
      if (!resp.ok) throw new Error(await resp.text())
      const data = await resp.json()
      const newUser = { uid: data.user.id, email: data.user.email, name: data.user.name, phone: data.user.phone, photoUrl: data.user.photoUrl }
      setAuth(newUser, idToken)
      Alert.alert('Saved', 'Your profile has been updated.')
    } catch (e: any) {
      Alert.alert('Update failed', e?.message || 'Could not update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ backgroundColor: '#2563eb', paddingHorizontal: 16, paddingTop: 6, paddingBottom: 10 }}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800' }}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Photo */}
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={{ width: 96, height: 96, borderRadius: 999, backgroundColor: '#e5e7eb' }} />
          ) : (
            <View style={{ width: 96, height: 96, borderRadius: 999, backgroundColor: '#e5e7eb' }} />
          )}
          <Pressable onPress={pickPhoto} style={{ marginTop: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#e5e7eb', borderRadius: 8 }}>
            <Text style={{ fontWeight: '700', color: '#111827' }}>Change Photo</Text>
          </Pressable>
        </View>

        {/* Name */}
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontWeight: '600', marginBottom: 6 }}>Full Name</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Your name" style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }} />
        </View>
        {/* Phone */}
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontWeight: '600', marginBottom: 6 }}>Phone</Text>
          <TextInput value={phone} onChangeText={setPhone} placeholder="Phone number" keyboardType="phone-pad" style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }} />
        </View>

        {/* Notifications */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 }}>
          <Text style={{ fontWeight: '600' }}>Push Notifications</Text>
          <Switch value={pushEnabled} onValueChange={setPushEnabled} />
        </View>

        {/* Save */}
        <Pressable onPress={onSave} disabled={!canSave || saving} style={{ backgroundColor: '#2563eb', opacity: !canSave || saving ? 0.6 : 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 16 }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>{saving ? 'Saving…' : 'Save Changes'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SettingsScreen
