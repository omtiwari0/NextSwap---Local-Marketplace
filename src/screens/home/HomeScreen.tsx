import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, FlatList, ActivityIndicator, Alert, Animated, TextInput, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ListingCard from '../../components/common/ListingCard';
import { fetchListings } from '../../services/listings.service';
import type { Listing } from '../../types';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [data, setData] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const slideY = useRef(new Animated.Value(-180)).current
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const [priceMin, setPriceMin] = useState<string>('0')
  const [priceMax, setPriceMax] = useState<string>('50000')
  const [selectedConditions, setSelectedConditions] = useState<Array<'new' | 'like-new' | 'good' | 'fair'>>([])
  const [barterOnly, setBarterOnly] = useState(false)
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'popular'>('newest')

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const list = await fetchListings()
        setData(list)
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const openSearch = () => {
    setShowSearch(true)
    Animated.timing(slideY, { toValue: 0, duration: 220, useNativeDriver: true })
      .start()
  }

  const closeSearch = () => {
    Animated.timing(slideY, { toValue: -180, duration: 200, useNativeDriver: true })
      .start(() => setShowSearch(false))
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = data
    if (q) {
      list = list.filter((item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q)
      )
    }
    if (selectedCategory !== 'all') {
      list = list.filter((item) => item.category.toLowerCase() === selectedCategory)
    }
    const min = Number(priceMin) || 0
    const max = Number(priceMax) || Number.MAX_SAFE_INTEGER
    list = list.filter((item) => item.price >= min && item.price <= max)
    if (selectedConditions.length > 0) {
      list = list.filter((item) => selectedConditions.includes((item.condition as any) ?? ''))
    }
    if (barterOnly) {
      list = list.filter((item) => !!item.barter)
    }
    // Sort
    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'popular':
          return (b.user?.verified ? 1 : 0) - (a.user?.verified ? 1 : 0)
        default:
          return 0
      }
    })
    return list
  }, [data, query, selectedCategory, priceMin, priceMax, selectedConditions, barterOnly, sortBy])

  const categories = useMemo(() => {
    const set = new Set<string>()
    data.forEach((d) => set.add(d.category.toLowerCase()))
    return ['all', ...Array.from(set)]
  }, [data])

  const conditions: Array<'new' | 'like-new' | 'good' | 'fair'> = ['new', 'like-new', 'good', 'fair']

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Text style={{ fontWeight: '800', fontSize: 16 }}>NearSwap</Text>
      ),
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable
            onPress={openSearch}
            accessibilityLabel="Search"
            style={{ paddingHorizontal: 8, paddingVertical: 4 }}
          >
            <Ionicons name="search-outline" size={22} color="#111827" />
          </Pressable>
          <Pressable
            onPress={() => Alert.alert('Wishlist', 'Wishlist feature coming soon')}
            accessibilityLabel="Wishlist"
            style={{ paddingHorizontal: 8, paddingVertical: 4 }}
          >
            <Ionicons name="heart-outline" size={22} color="#111827" />
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('Auth')}
            accessibilityLabel="Account"
            style={{ paddingHorizontal: 8, paddingVertical: 4 }}
          >
            <Ionicons name="person-circle-outline" size={24} color="#2563eb" />
          </Pressable>
        </View>
      ),
    })
  }, [navigation])

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
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListingCard item={item} onPress={() => navigation.navigate('ListingDetail', { id: item.id, item })} />
        )}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Actions: Sort & Filters */}
            <View className="flex-row gap-2 mb-3">
              <Pressable onPress={() => setShowSort(true)} className="flex-1 bg-blue-600 rounded-lg py-2 items-center justify-center">
                <Text className="text-white font-semibold">Sort</Text>
              </Pressable>
              <Pressable onPress={() => setShowFilters(true)} className="flex-1 bg-blue-600 rounded-lg py-2 items-center justify-center">
                <Text className="text-white font-semibold">Filters</Text>
              </Pressable>
            </View>

            {/* Category chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
              <View className="flex-row gap-2">
                {categories.map((cat) => (
                  <Pressable
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full ${selectedCategory === cat ? 'bg-blue-600' : 'bg-gray-200'}`}
                  >
                    <Text className={`${selectedCategory === cat ? 'text-white' : 'text-gray-700'} capitalize`}>{cat}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            {/* Active filters badge */}
            {(selectedConditions.length > 0 || barterOnly || Number(priceMin) > 0 || (Number(priceMax) || 0) < 50000 || selectedCategory !== 'all' || query.trim().length > 0) && (
              <View className="bg-blue-50 p-3 rounded-lg mb-3 flex-row items-center justify-between">
                <Text className="text-blue-700 text-sm">
                  {selectedConditions.length + (barterOnly ? 1 : 0) + (Number(priceMin) > 0 || (Number(priceMax) || 0) < 50000 ? 1 : 0) + (selectedCategory !== 'all' ? 1 : 0) + (query.trim() ? 1 : 0)} filters active
                </Text>
                <Pressable onPress={() => { setPriceMin('0'); setPriceMax('50000'); setSelectedConditions([]); setBarterOnly(false); setSelectedCategory('all'); setQuery(''); }}>
                  <Text className="text-blue-600 font-semibold text-sm">Clear All</Text>
                </Pressable>
              </View>
            )}
          </View>
        }
      />
      <Pressable
        onPress={() => navigation.navigate('CreateListing')}
        style={{ position: 'absolute', bottom: 24, right: 24, backgroundColor: '#2563eb', borderRadius: 9999, paddingVertical: 14, paddingHorizontal: 18, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4 }}
      >
        <Text style={{ color: 'white', fontWeight: '800', fontSize: 18 }}>＋</Text>
      </Pressable>

      {showSearch && (
        <Pressable onPress={closeSearch} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.25)' }}>
          {/* Spacer to allow closing when tapping outside */}
        </Pressable>
      )}

      <Animated.View
        pointerEvents={showSearch ? 'auto' : 'none'}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, transform: [{ translateY: slideY }], backgroundColor: '#fff', paddingTop: 12, paddingBottom: 12, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ fontWeight: '800', fontSize: 16 }}>NearSwap</Text>
          <Pressable onPress={closeSearch} accessibilityLabel="Close search" style={{ padding: 6 }}>
            <Ionicons name="close" size={22} color="#111827" />
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 }}>
          <Ionicons name="search-outline" size={20} color="#6b7280" />
          <TextInput
            placeholder="Search items..."
            value={query}
            onChangeText={setQuery}
            autoFocus
            style={{ marginLeft: 8, flex: 1 }}
            returnKeyType="search"
            onSubmitEditing={() => closeSearch()}
          />
        </View>
      </Animated.View>

      {/* Sort Modal */}
      {showSort && (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
          <Pressable style={{ flex: 1 }} onPress={() => setShowSort(false)} />
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, maxHeight: 360 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: '700' }}>Sort By</Text>
              <Pressable onPress={() => setShowSort(false)}><Ionicons name="close" size={22} /></Pressable>
            </View>
            {[
              { id: 'newest', name: 'Newest First' },
              { id: 'price-low', name: 'Price: Low to High' },
              { id: 'price-high', name: 'Price: High to Low' },
              { id: 'popular', name: 'Most Popular' },
            ].map((opt) => (
              <Pressable key={opt.id} onPress={() => { setSortBy(opt.id as any); setShowSort(false) }} style={{ paddingVertical: 12, paddingHorizontal: 8, borderRadius: 8, backgroundColor: sortBy === opt.id ? '#dbeafe' : 'transparent', marginBottom: 8 }}>
                <Text style={{ color: sortBy === opt.id ? '#2563eb' : '#111827', fontWeight: sortBy === opt.id ? '700' as any : '400' }}>{opt.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Filters Modal */}
      {showFilters && (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
          <Pressable style={{ flex: 1 }} onPress={() => setShowFilters(false)} />
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: '700' }}>Filters</Text>
              <Pressable onPress={() => setShowFilters(false)}><Ionicons name="close" size={22} /></Pressable>
            </View>

            {/* Price Range */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontWeight: '600', marginBottom: 6 }}>Price Range</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 as any }}>
                <TextInput value={priceMin} onChangeText={setPriceMin} keyboardType="numeric" placeholder="Min" style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, width: 100 }} />
                <Text>to</Text>
                <TextInput value={priceMax} onChangeText={setPriceMax} keyboardType="numeric" placeholder="Max" style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, width: 100 }} />
              </View>
            </View>

            {/* Conditions */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontWeight: '600', marginBottom: 6 }}>Condition</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 as any }}>
                {conditions.map((c) => {
                  const active = selectedConditions.includes(c)
                  return (
                    <Pressable key={c} onPress={() => setSelectedConditions((prev) => active ? prev.filter(p => p !== c) : [...prev, c])} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: active ? '#2563eb' : '#e5e7eb' }}>
                      <Text style={{ color: active ? '#fff' : '#374151', textTransform: 'capitalize' }}>{c.replace('-', ' ')}</Text>
                    </Pressable>
                  )
                })}
              </View>
            </View>

            {/* Barter Only */}
            <View style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '600' }}>Barter Allowed Only</Text>
              <Switch value={barterOnly} onValueChange={setBarterOnly} />
            </View>

            <View style={{ flexDirection: 'row', gap: 12 as any, marginTop: 8, marginBottom: 8 }}>
              <Pressable onPress={() => { setPriceMin('0'); setPriceMax('50000'); setSelectedConditions([]); setBarterOnly(false); }} style={{ flex: 1, backgroundColor: '#e5e7eb', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}>
                <Text style={{ color: '#374151', fontWeight: '700' }}>Clear All</Text>
              </Pressable>
              <Pressable onPress={() => setShowFilters(false)} style={{ flex: 1, backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Apply</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default HomeScreen;