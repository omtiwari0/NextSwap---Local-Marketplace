import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native'
import { useAuthStore } from '../../store/authStore'
import { fetchListings } from '../../services/listings.service'
import ListingCard from '../../components/common/ListingCard'
import { useNavigation } from '@react-navigation/native'

const MyListingsScreen: React.FC = () => {
  const navigation = useNavigation<any>()
  const user = useAuthStore((s) => s.user)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      if (!user) { setLoading(false); return }
      try {
        const data = await fetchListings({ userId: user.uid })
        setItems(data)
      } catch (e: any) {
        setError(e?.message || 'Failed to load listings')
      } finally {
        setLoading(false)
      }
    })()
  }, [user])

  if (!user) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '800', marginBottom: 6 }}>Login to view your listings</Text>
        <Pressable onPress={() => navigation.navigate('Auth')} style={{ backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Go to Login</Text>
        </Pressable>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    )
  }

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <Text style={{ color: '#b91c1c' }}>{error}</Text>
      </View>
    )
  }

  return (
    <FlatList
      contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ListingCard item={item} onPress={() => navigation.navigate('ListingDetail', { id: item.id, item })} />
      )}
      ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#6b7280', marginTop: 24 }}>You have no listings yet.</Text>}
    />
  )
}

export default MyListingsScreen
