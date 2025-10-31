import React, { useState } from 'react'
import { View, Text, TextInput, Switch, Pressable, Image, Alert, ActivityIndicator, ScrollView } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import SelectField from '../common/SelectField'

export type ListingFormValues = {
  title: string
  category: string
  price: number
  barter: boolean
  description: string
  condition?: 'new' | 'like-new' | 'good' | 'fair'
  location?: string
  images: { uri: string }[]
}

export default function ListingForm({
  initial,
  submitting,
  submitLabel,
  onSubmit,
  titleText = 'List Your Item',
}: {
  initial: Partial<ListingFormValues>
  submitting?: boolean
  submitLabel: string
  onSubmit: (values: ListingFormValues) => Promise<void> | void
  titleText?: string
}) {
  const [title, setTitle] = useState(initial.title || '')
  const [category, setCategory] = useState(initial.category || 'General')
  const [price, setPrice] = useState(initial.price != null ? String(initial.price) : '')
  const [barter, setBarter] = useState(!!initial.barter)
  const [description, setDescription] = useState(initial.description || '')
  const [condition, setCondition] = useState<any>(initial.condition || '')
  const [location, setLocation] = useState(initial.location || '')
  const [images, setImages] = useState<{ uri: string }[]>(initial.images || [])
  const [formError, setFormError] = useState<string | null>(null)

  const categoryOptions = [
    'General','Electronics','Books','Clothing','Home','Sports','Accessories','Other'
  ].map((c) => ({ label: c, value: c }))
  const conditionOptions = [
    { label: 'New', value: 'new' },
    { label: 'Like New', value: 'like-new' },
    { label: 'Good', value: 'good' },
    { label: 'Fair', value: 'fair' },
  ]

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
      selectionLimit: Math.max(0, 5 - images.length) || 1,
    })
    if (!(res as any).canceled) {
      const assets = (res as any).assets ?? (res as any).selected ?? []
      const uris = assets.map((a: any) => ({ uri: a.uri }))
      setImages((prev) => [...prev, ...uris].slice(0, 5))
    }
  }

  const handleSubmit = async () => {
    const missing: string[] = []
    const priceDigits = String(price).replace(/\D/g, '')
    if (!title.trim()) missing.push('Title')
    if (!category.trim()) missing.push('Category')
    if (!priceDigits) missing.push('Price')
    if (!description.trim()) missing.push('Description')
    if (!images.length) missing.push('Image(s)')
    if (missing.length) {
      setFormError(`Please fill: ${missing.join(', ')}`)
      return
    }
    const priceValue = Math.min(5000, Number(priceDigits))
    setFormError(null)
    await onSubmit({
      title: title.trim(),
      category: category.trim(),
      price: priceValue,
      barter,
      description: description.trim(),
      condition: (initial.condition ? String(initial.condition) : condition)
        ? ((condition as 'new' | 'like-new' | 'good' | 'fair'))
        : undefined,
      location: location || undefined,
      images,
    })
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f3f4f6' }} contentContainerStyle={{ padding: 16 }}>
      <View style={{ alignSelf: 'center', width: '100%', maxWidth: 560 }}>
        <View style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 16 }}>{titleText}</Text>

          <Text style={{ fontWeight: '600' }}>Title</Text>
          <TextInput
            placeholder="e.g., Vintage Leather Jacket"
            value={title}
            onChangeText={setTitle}
            style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, marginTop: 6, marginBottom: 12, backgroundColor: '#f9fafb' }}
          />

          <SelectField label="Category" value={category} onChange={setCategory} options={categoryOptions} placeholder="Select category" />

          <Text style={{ fontWeight: '600' }}>Price</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, marginBottom: 6 }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 10, backgroundColor: '#f9fafb' }}>
              <View style={{ width: 30, height: 30, borderRadius: 6, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                <Text style={{ color: '#0284c7', fontWeight: '800' }}>₹</Text>
              </View>
              <TextInput
                style={{ flex: 1, paddingVertical: 10 }}
                placeholder="Set a price"
                keyboardType="numeric"
                value={price}
                onChangeText={(t) => {
                  const digits = t.replace(/\D/g, '')
                  const capped = String(Math.min(Number(digits || '0'), 5000))
                  setPrice(digits === '' ? '' : capped)
                }}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 12 }}>
              <Text style={{ marginRight: 6, color: '#374151' }}>Barter?</Text>
              <Switch value={barter} onValueChange={setBarter} />
            </View>
          </View>
          <Text style={{ color: '#6b7280', fontSize: 12, marginTop: -2, marginBottom: 12 }}>Max ₹5000</Text>

          {formError ? (
            <View style={{ backgroundColor: '#fee2e2', borderColor: '#ef4444', borderWidth: 1, padding: 10, borderRadius: 8, marginTop: 4 }}>
              <Text style={{ color: '#b91c1c', fontWeight: '600' }}>{formError}</Text>
            </View>
          ) : null}

          <Text style={{ fontWeight: '600' }}>Description</Text>
          <TextInput
            placeholder="Tell buyers about your item..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, marginTop: 6, marginBottom: 12, textAlignVertical: 'top', backgroundColor: '#f9fafb' }}
          />

          <SelectField label="Condition" value={condition} onChange={setCondition} options={conditionOptions} placeholder="Select condition" />

          <Text style={{ fontWeight: '600' }}>Location</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 10, marginTop: 6, marginBottom: 12, backgroundColor: '#f9fafb' }}>
            <View style={{ width: 30, height: 30, borderRadius: 6, backgroundColor: '#ecfeff', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
              <Text style={{ color: '#0891b2', fontWeight: '800' }}>⌖</Text>
            </View>
            <TextInput
              placeholder="San Francisco, CA"
              value={location}
              onChangeText={setLocation}
              style={{ flex: 1, paddingVertical: 10 }}
            />
          </View>

          <Text style={{ fontWeight: '600', marginBottom: 6 }}>Images</Text>
          <Pressable
            onPress={images.length >= 5 ? undefined : pickImages}
            style={{ borderWidth: 2, borderStyle: 'dashed', borderColor: '#cbd5e1', borderRadius: 12, padding: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}
          >
            <Text style={{ fontSize: 28, color: '#0ea5e9', fontWeight: '800', marginBottom: 6 }}>＋</Text>
            <Text style={{ color: '#64748b' }}>{images.length >= 5 ? 'Maximum 5 photos selected' : 'Upload up to 5 photos'}</Text>
          </Pressable>

          {images.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
              {images.map((img, idx) => (
                <View key={idx} style={{ position: 'relative', marginRight: 8, marginBottom: 8 }}>
                  <Image source={{ uri: img.uri }} style={{ width: 96, height: 96, borderRadius: 12, backgroundColor: '#e5e7eb' }} />
                  <Pressable
                    onPress={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                    style={{ position: 'absolute', top: -8, right: -8, backgroundColor: '#ef4444', width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '800' }}>×</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          <Pressable
            onPress={submitting ? undefined : handleSubmit}
            disabled={!!submitting}
            style={{ backgroundColor: '#2dd4bf', padding: 14, borderRadius: 10, marginTop: 24, opacity: submitting ? 0.7 : 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
          >
            {submitting && <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />}
            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '800' }}>{submitting ? 'Saving…' : submitLabel}</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  )
}
