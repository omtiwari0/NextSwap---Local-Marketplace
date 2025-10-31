import React, { useState } from 'react'
import { View, Text, TextInput, Pressable, Alert, Platform, Image } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuthStore } from '../../store/authStore'
import * as ImagePicker from 'expo-image-picker'

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>()
  const { user, idToken, setAuth } = useAuthStore() as any
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [photo, setPhoto] = useState<string | undefined>(user?.photoUrl ?? undefined)
  const [saving, setSaving] = useState(false)

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Please login to edit your profile.</Text>
      </SafeAreaView>
    )
  }

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) { Alert.alert('Permission required', 'We need photo access to update your avatar.'); return }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1,1], quality: 0.8 })
    if (!(res as any).canceled) setPhoto((res as any).assets?.[0]?.uri)
  }

  const onSave = async () => {
    setSaving(true)
    try {
      const API = (globalThis as any)?.process?.env?.EXPO_PUBLIC_API_URL || 'http://localhost:4000'
      let uploadedUrl: string | undefined = photo
      if (uploadedUrl && !/^https?:\/\//i.test(uploadedUrl)) {
        const form = new FormData()
        if (Platform.OS === 'web') {
          const blob = await fetch(uploadedUrl).then((r) => r.blob())
          // @ts-ignore
          form.append('file', blob as any, 'avatar.jpg')
        } else {
          // @ts-ignore
          form.append('file', { uri: uploadedUrl, name: 'avatar.jpg', type: 'image/jpeg' } as any)
        }
        const resp = await fetch(`${API}/files/upload`, { method: 'POST', body: form as any })
        if (!resp.ok) throw new Error(await resp.text())
        const data = await resp.json()
        uploadedUrl = data.secure_url
      }

      const payload: any = {}
      if (name && name !== user.name) payload.name = name
      const digits = phone.replace(/\D/g, '')
      if (digits && digits !== user.phone) payload.phone = digits
      if (uploadedUrl && uploadedUrl !== user.photoUrl) payload.photoUrl = uploadedUrl

      if (Object.keys(payload).length === 0) {
        Alert.alert('Nothing changed', 'No changes to save.')
        setSaving(false)
        return
      }

      const r = await fetch(`${API}/auth/me`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` }, body: JSON.stringify(payload) })
      if (!r.ok) throw new Error(await r.text())
      const data = await r.json()
      // Update local store
      setAuth({ uid: data.user.id, email: data.user.email, name: data.user.name, phone: data.user.phone, photoUrl: data.user.photoUrl }, idToken)
      Alert.alert('Saved', 'Profile updated successfully.')
      navigation.goBack()
    } catch (e: any) {
      Alert.alert('Save failed', e?.message || 'Could not update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: '800', marginBottom: 12 }}>Edit Profile</Text>
        <View style={{ alignItems: 'center', marginBottom: 12 }}>
          {photo ? (
            <Image source={{ uri: photo }} style={{ width: 96, height: 96, borderRadius: 999 }} />
          ) : (
            <View style={{ width: 96, height: 96, borderRadius: 999, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 28 }}>🙂</Text>
            </View>
          )}
          <Pressable onPress={pickPhoto} style={{ marginTop: 8 }}>
            <Text style={{ color: '#2563eb', fontWeight: '700' }}>Change photo</Text>
          </Pressable>
        </View>

        <Text style={{ fontWeight: '600', marginBottom: 6 }}>Email (read-only)</Text>
        <View style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 10, marginBottom: 12 }}>
          <Text>{user.email}</Text>
        </View>

        <Text style={{ fontWeight: '600', marginBottom: 6 }}>Full name</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Full name" style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 10, marginBottom: 12 }} />

        <Text style={{ fontWeight: '600', marginBottom: 6 }}>Phone</Text>
        <TextInput value={phone} onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0,10))} placeholder="10-digit phone" keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'} style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 10, marginBottom: 12 }} />

        <Pressable onPress={onSave} disabled={saving} style={{ backgroundColor: '#2563eb', padding: 14, borderRadius: 8, alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>{saving ? 'Saving…' : 'Save'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

export default EditProfileScreen
