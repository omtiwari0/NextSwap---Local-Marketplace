import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, FlatList, Dimensions, Pressable } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import ListingCard from '../../components/common/ListingCard'
import { fetchListings } from '../../services/listings.service'
import { useNavigation } from '@react-navigation/native'
import { useFavoritesStore } from '../../store/favoritesStore'
import { Ionicons } from '@expo/vector-icons'

const NearbyProductsScreen: React.FC = () => {
  const navigation = useNavigation<any>()
  const insets = useSafeAreaInsets()
  const { isFavorite, toggle } = useFavoritesStore()
  const { width } = Dimensions.get('window')
  const CARD_WIDTH = (width - 12*2 - 8) / 2

  const [items, setItems] = useState<any[]>([])
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchListings()
        setItems(data)
      } catch {}
    })()
  }, [])
  const nearby = useMemo(() => {
    const list = items.filter(i => (i.location || '').toLowerCase().includes('hostel') || (i.location || '').toLowerCase().includes('near'))
    return (list.length ? list : items).slice(0, 20)
  }, [items])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={{ backgroundColor: '#2563eb', paddingHorizontal: 16, paddingTop: 6, paddingBottom: 12, flexDirection: 'row', alignItems: 'center' }}>
        <Pressable onPress={() => navigation.goBack()} style={{ marginRight: 8, padding: 4 }} accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800' }}>Nearby Products</Text>
      </View>
      <FlatList
        contentContainerStyle={{ padding: 12, paddingBottom: 80 + insets.bottom }}
        data={nearby}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
        renderItem={({ item }) => (
          <View style={{ width: CARD_WIDTH }}>
            <ListingCard item={item} onPress={() => navigation.navigate('ListingDetail', { id: item.id, item })} />
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}

export default NearbyProductsScreen
