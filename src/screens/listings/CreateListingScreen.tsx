import React, { useState } from 'react'
import { View, Text, TextInput, Switch, ScrollView, Pressable, Image, Alert } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import * as ImagePicker from 'expo-image-picker'
import { createListing } from '../../services/listings.service'
import { useAuthStore } from '../../store/authStore'

const CreateListingScreen: React.FC = () => {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('General')
  const [price, setPrice] = useState('')
  const [barter, setBarter] = useState(false)
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<{ uri: string }[]>([])

  const user = useAuthStore((s) => s.user)
  const navigation = useNavigation<any>()

  const pickImages = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      Alert.alert('Permission needed', 'We need access to your photos to select images.')
      return
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      quality: 0.8,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      selectionLimit: 5,
    })
    if (!res.canceled) {
      // @ts-ignore - Web returns assets array; older native may return single asset
      const assets = res.assets ?? (res as any).selected ?? []
      const uris = assets.map((a: any) => ({ uri: a.uri }))
      setImages((prev) => [...prev, ...uris])
    }
  }

  const onSubmit = async () => {
    if (!title.trim()) return Alert.alert('Missing title', 'Please add a title')
    if (!price) return Alert.alert('Missing price', 'Please add a price')

    const userId = user?.uid ?? 'guest'

    try {
      const payload = {
        title: title.trim(),
        category: category.trim() || 'General',
        price: Number(price),
        barter,
        description: description.trim(),
        images,
        userId,
      }
      const created = await createListing(payload as any)
      Alert.alert('Created', 'Your listing has been created.')
      if (created?.id) {
        navigation.navigate('ListingDetail', { id: created.id, item: created })
      } else {
        navigation.navigate('Home')
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to create listing')
    }
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12 }}>Create Listing</Text>

      <Text style={{ fontWeight: '600' }}>Title</Text>
      <TextInput
        placeholder="e.g., Gaming Laptop"
        value={title}
        onChangeText={setTitle}
        style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, marginTop: 6, marginBottom: 12 }}
      />

      <Text style={{ fontWeight: '600' }}>Category</Text>
      <TextInput
        placeholder="e.g., Electronics"
        value={category}
        onChangeText={setCategory}
        style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, marginTop: 6, marginBottom: 12 }}
      />

      <Text style={{ fontWeight: '600' }}>Price (USD)</Text>
      <TextInput
        placeholder="e.g., 200"
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
        style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, marginTop: 6, marginBottom: 12 }}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <Text style={{ fontWeight: '600' }}>Open to Barter</Text>
        <Switch value={barter} onValueChange={setBarter} />
      </View>

      <Text style={{ fontWeight: '600' }}>Description</Text>
      <TextInput
        placeholder="Describe your item..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, marginTop: 6, marginBottom: 12, textAlignVertical: 'top' }}
      />

      <Text style={{ fontWeight: '600', marginBottom: 6 }}>Images</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {images.map((img, idx) => (
          <Image key={idx} source={{ uri: img.uri }} style={{ width: 96, height: 96, borderRadius: 8, marginRight: 8, marginBottom: 8, backgroundColor: '#eee' }} />
        ))}
        <Pressable onPress={pickImages} style={{ width: 96, height: 96, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#2563eb', fontWeight: '700' }}>+ Add</Text>
        </Pressable>
      </View>

      <Pressable onPress={onSubmit} style={{ backgroundColor: '#2563eb', padding: 14, borderRadius: 8, marginTop: 24 }}>
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}>Publish</Text>
      </Pressable>
    </ScrollView>
  )
}

export default CreateListingScreen
