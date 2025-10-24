import React, { useEffect, useState } from 'react'
import { View, Text, Image, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native'
import { useRoute } from '@react-navigation/native'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../navigation/types'
import type { Listing } from '../../types'
import { fetchListings } from '../../services/listings.service'

const ListingDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'ListingDetail'>>()
  const { id, item } = route.params
  const [listing, setListing] = useState<Listing | undefined>(item)
  const [loading, setLoading] = useState(!item)

  useEffect(() => {
    if (item) return
    ;(async () => {
      try {
        setLoading(true)
        const list = await fetchListings()
        setListing(list.find((l) => l.id === id))
      } finally {
        setLoading(false)
      }
    })()
  }, [id, item])

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    )
  }

  if (!listing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <Text>Listing not found.</Text>
      </View>
    )
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      {listing.images?.[0]?.uri ? (
        <Image source={{ uri: listing.images[0].uri }} style={{ width: '100%', height: 240, backgroundColor: '#eee' }} />
      ) : (
        <View style={{ width: '100%', height: 240, backgroundColor: '#eee' }} />
      )}

      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: '700' }}>{listing.title}</Text>
        <Text style={{ marginTop: 4, color: '#6b7280' }}>{listing.category}</Text>
        <Text style={{ marginTop: 8, fontSize: 18, fontWeight: '700' }}>${listing.price}</Text>
        {listing.barter ? (
          <Text style={{ marginTop: 4, color: '#16a34a', fontWeight: '600' }}>Open to barter</Text>
        ) : null}

        <Text style={{ marginTop: 16, fontWeight: '600' }}>Description</Text>
        <Text style={{ marginTop: 6, lineHeight: 20 }}>{listing.description}</Text>

        <View style={{ flexDirection: 'row', marginTop: 16 }}>
          <Pressable onPress={() => Alert.alert('Chat', 'Chat feature coming soon')} style={{ backgroundColor: '#2563eb', padding: 12, borderRadius: 8, marginRight: 12 }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Chat</Text>
          </Pressable>
          <Pressable onPress={() => Alert.alert('Boost', 'Boost feature coming soon')} style={{ backgroundColor: '#f59e0b', padding: 12, borderRadius: 8 }}>
            <Text style={{ color: '#111827', fontWeight: '700' }}>Boost</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  )
}

export default ListingDetailScreen
