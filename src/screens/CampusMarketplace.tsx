import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { View, Text, FlatList, Pressable, TextInput, Dimensions, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { products as initialProducts } from '../data/products'
import type { Listing } from '../types'
import ProductCard from '../components/ProductCard'
import { useNavigation } from '@react-navigation/native'
import BottomNav from '../components/common/BottomNav'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFavoritesStore } from '../store/favoritesStore'

const CampusMarketplace: React.FC = () => {
  const navigation = useNavigation<any>()
  const insets = useSafeAreaInsets()

  // Header/search state
  const [query, setQuery] = useState('')
  // Data
  const [items] = useState<Listing[]>(initialProducts)
  const { ids: favoriteIds, toggle: toggleFavoriteId, isFavorite } = useFavoritesStore()

  // Simple banner carousel config
  const BANNER_URI = 'https://static.vecteezy.com/system/resources/previews/004/700/728/non_2x/education-with-computer-concept-banner-with-copy-space-vector.jpg'
  const banners = [
    { id: 'b1', uri: BANNER_URI },
    { id: 'b2', uri: BANNER_URI },
    { id: 'b3', uri: BANNER_URI },
  ]
  const bannerListRef = useRef<FlatList<any>>(null)
  const [bannerIndex, setBannerIndex] = useState(0)
  const categories = [
    {id:'all',label:'All',emoji:'📦'},
    {id:'books',label:'Books',emoji:'📚'},
    {id:'electronics',label:'Electronics',emoji:'💻'},
    {id:'fashion',label:'Fashion',emoji:'👕'},
    {id:'accessories',label:'Accessories',emoji:'🕶️'},
    {id:'sports',label:'Sports',emoji:'🏀'},
    {id:'furniture',label:'Furniture',emoji:'🪑'},
  ]
  useEffect(() => {
    const id = setInterval(() => {
      const next = (bannerIndex + 1) % banners.length
      setBannerIndex(next)
      bannerListRef.current?.scrollToIndex({ index: next, animated: true })
    }, 3000)
    return () => clearInterval(id)
  }, [bannerIndex])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((item) =>
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.description || '').toLowerCase().includes(q)
    )
  }, [items, query])

  const toggleFavorite = (id: string) => toggleFavoriteId(id)

  useLayoutEffect(() => {
    // Header hidden by navigator; no-op
  }, [navigation])

  const { width } = Dimensions.get('window')
  const CARD_WIDTH = (width - 12*2 - 8) / 2 // padding 12 and gap ~8

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Blue header with title only */}
      <View style={{ backgroundColor: '#2563eb', paddingHorizontal: 16, paddingTop: 6, paddingBottom: 12 }}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800' }}>NextSwap</Text>
      </View>

      {/* Search below header */}
      <View style={{ paddingHorizontal: 12, paddingTop: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 }}>
          <Ionicons name="search-outline" size={20} color="#9ca3af" />
          <TextInput placeholder="Search products..." placeholderTextColor="#9ca3af" value={query} onChangeText={setQuery} style={{ marginLeft: 8, flex: 1, color: '#111827' }} />
        </View>
      </View>
      <FlatList
        contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 12, paddingBottom: 80 + insets.bottom }}
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
        renderItem={({ item }) => (
          <View style={{ width: CARD_WIDTH }}>
            <ProductCard item={item} isFavorite={isFavorite(item.id)} onToggleFavorite={toggleFavorite} onPress={() => navigation.navigate('ListingDetail', { id: item.id, item })} />
          </View>
        )}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Banners carousel */}
            <FlatList
              ref={bannerListRef}
              data={banners}
              keyExtractor={(b) => b.id}
              renderItem={({ item }) => (
                <Image source={{ uri: item.uri }} style={{ width: width - 24, height: 200, borderRadius: 12, backgroundColor: '#e5e7eb' }} />
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              onScrollToIndexFailed={() => {}}
              ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
              contentContainerStyle={{ paddingBottom: 12 }}
            />
            {/* Nearby section */}
            <View style={{ marginBottom: 12 }}>
              <Pressable onPress={() => navigation.navigate('NearbyProducts')} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: '700' }}>Your nearby products</Text>
                <Ionicons name="chevron-forward" size={18} color="#6b7280" />
              </Pressable>
              <FlatList
                data={items.filter(i => (i.location || '').toLowerCase().includes('hostel') || (i.location || '').toLowerCase().includes('near')).slice(0, 10) || items.slice(0, 10)}
                keyExtractor={(it) => it.id}
                renderItem={({ item }) => (
                  <View style={{ width: 200, marginRight: 10 }}>
                    <ProductCard item={item} isFavorite={isFavorite(item.id)} onToggleFavorite={toggleFavorite} onPress={() => navigation.navigate('ListingDetail', { id: item.id, item })} />
                  </View>
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 4 }}
              />
            </View>

            {/* Promotional banner same size as slideshow */}
            <Image source={{ uri: BANNER_URI }} style={{ width: width - 24, height: 200, borderRadius: 12, backgroundColor: '#e5e7eb', alignSelf: 'center', marginBottom: 12 }} />

            {/* Shop by categories */}
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 8 }}>Shop by categories</Text>
              <FlatList
                data={categories}
                keyExtractor={(c:any)=>c.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({item:c}:any)=> {
                  const q = query.trim().toLowerCase()
                  const isActive = (!q && c.id === 'all') || q === c.id || q === c.label.toLowerCase()
                  return (
                    <Pressable onPress={() => setQuery(c.id === 'all' ? '' : c.label.toLowerCase())} style={{ width: 110, height: 110, borderRadius: 12, backgroundColor: isActive ? '#2563eb' : '#fff', borderWidth: 1, borderColor: isActive ? '#2563eb' : '#e5e7eb', marginRight: 10, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 28 }}>{c.emoji}</Text>
                      <Text style={{ marginTop: 6, fontWeight: '700', color: isActive ? '#fff' : '#111827' }}>{c.label}</Text>
                    </Pressable>
                  )
                }}
                contentContainerStyle={{ paddingRight: 4 }}
              />
            </View>

            <Text style={{ color: '#6b7280', marginBottom: 8 }}>{filtered.length} products</Text>
          </View>
        }
        
      />

      {/* Bottom Navigation */}
      <BottomNav currentTab="home" />

      {/* sort/filters removed for now */}
    </SafeAreaView>
  )
}

export default CampusMarketplace
