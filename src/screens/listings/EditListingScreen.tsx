import React, { useState } from 'react'
import { View, Text, Alert } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../navigation/types'
import type { Listing } from '../../types'
import { updateListing } from '../../services/listings.service'
import { useAuthStore } from '../../store/authStore'
import ListingForm, { ListingFormValues } from '../../components/forms/ListingForm'

const EditListingScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'EditListing'>>()
  const { id, item } = route.params
  const initial = (item as Listing) || ({} as Listing)

  const [submitting, setSubmitting] = useState(false)

  const user = useAuthStore((s) => s.user)
  const navigation = useNavigation<any>()

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', padding: 16, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: '800', marginBottom: 8 }}>Login to edit listing</Text>
        <Text style={{ color: '#6b7280', textAlign: 'center' }}>Sign in to edit your listing.</Text>
      </View>
    )
  }

  const onSubmit = async (values: ListingFormValues) => {
    try {
      setSubmitting(true)
      const updated = await updateListing(id, values)
      Alert.alert('Updated', 'Your listing has been updated.')
      navigation.replace('ListingDetail', { id: updated.id, item: updated })
    } catch (e: any) {
      let msg = e?.message || 'Failed to update listing'
      try {
        const parsed = JSON.parse(msg)
        msg = parsed?.error || msg
      } catch {}
      Alert.alert('Error', msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ListingForm
      initial={{
        title: initial.title,
        category: initial.category,
        price: initial.price,
        barter: !!initial.barter,
        description: initial.description,
        condition: initial.condition,
        location: initial.location,
        images: initial.images || [],
      }}
      submitting={submitting}
      submitLabel="Save Changes"
      titleText="Edit Your Item"
      onSubmit={onSubmit}
    />
  )
}

export default EditListingScreen
