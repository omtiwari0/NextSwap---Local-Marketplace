import React, { useMemo } from 'react'
import { View, Text, FlatList, Dimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import BottomNav from '../../components/common/BottomNav'
import { useFavoritesStore } from '../../store/favoritesStore'
import { products } from '../../data/products'
import ProductCard from '../../components/ProductCard'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<any>()
  const { ids, isFavorite, toggle } = useFavoritesStore()
  const insets = useSafeAreaInsets()
  const { width } = Dimensions.get('window')
  const CARD_WIDTH = (width - 12*2 - 8) / 2

  const favItems = useMemo(() => products.filter(p => ids.includes(p.id)), [ids])
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Simple blue header for context */}
      <View style={{ backgroundColor: '#2563eb', paddingHorizontal: 16, paddingTop: 6, paddingBottom: 10 }}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800' }}>Favorites</Text>
      </View>
      {favItems.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Ionicons name="heart-outline" size={64} color="#9ca3af" />
          <Text style={{ fontSize: 20, fontWeight: '700', marginTop: 12 }}>No favorites yet</Text>
          <Text style={{ color: '#6b7280', marginTop: 6, textAlign: 'center' }}>Tap the heart on products to add them here.</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ padding: 12, paddingBottom: 80 + insets.bottom }}
          data={favItems}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
          renderItem={({ item }) => (
            <View style={{ width: CARD_WIDTH }}>
              <ProductCard
                item={item}
                isFavorite={isFavorite(item.id)}
                onToggleFavorite={() => toggle(item.id)}
                onPress={() => navigation.navigate('ListingDetail', { id: item.id, item })}
              />
            </View>
          )}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<Text style={{ color: '#6b7280', marginBottom: 8 }}>{favItems.length} favorites</Text>}
        />
      )}
      <BottomNav currentTab="favorites" />
    </SafeAreaView>
  )
}

export default FavoritesScreen
