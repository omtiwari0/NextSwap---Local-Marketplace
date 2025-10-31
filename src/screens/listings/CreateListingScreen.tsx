import React, { useState } from 'react'
import { View, Text, Alert, Pressable } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { createListing } from '../../services/listings.service'
import { useAuthStore } from '../../store/authStore'
import ListingForm, { ListingFormValues } from '../../components/forms/ListingForm'

const CreateListingScreen: React.FC = () => {
  const [publishing, setPublishing] = useState(false)

  const user = useAuthStore((s) => s.user)
  const navigation = useNavigation<any>()

  const onSubmit = async (values: ListingFormValues) => {
    const userId = user?.uid ?? 'guest'
    try {
      setPublishing(true)
      const created = await createListing({
        ...values,
        userId,
      } as any)
      Alert.alert('Created', 'Your listing has been created.')
      if (created?.id) {
        navigation.reset({
          index: 1,
          routes: [
            { name: 'Home' as any },
            { name: 'ListingDetail' as any, params: { id: created.id, item: created } },
          ],
        })
      } else {
        navigation.navigate('Home')
      }
    } finally {
      setPublishing(false)
    }
  }

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', padding: 16, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: '800', marginBottom: 8 }}>Login to list products</Text>
        <Text style={{ color: '#6b7280', textAlign: 'center' }}>Sign in to create and publish your listings.</Text>
        <Pressable onPress={() => navigation.navigate('Auth')} style={{ marginTop: 16, backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Go to Login</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <ListingForm
      initial={{}}
      submitting={publishing}
      submitLabel="List Item"
      onSubmit={onSubmit}
    />
  )
}

export default CreateListingScreen
