import React, { useEffect, useState, useCallback, useRef } from 'react'
import { View, Text, Image, ScrollView, Pressable, Alert, ActivityIndicator, Dimensions, Modal, FlatList, Animated } from 'react-native'
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../navigation/types'
import type { Listing } from '../../types'
import { fetchListings, deleteListing } from '../../services/listings.service'
import { startChat } from '../../services/chats.service'
import { useAuthStore } from '../../store/authStore'
import { useFavoritesStore } from '../../store/favoritesStore'
import { Ionicons } from '@expo/vector-icons'

const ListingDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'ListingDetail'>>()
  const { id, item } = route.params
  const [listing, setListing] = useState<Listing | undefined>(item)
  const [loading, setLoading] = useState(!item)
  const [activeImage, setActiveImage] = useState(0)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)
  const [descExpanded, setDescExpanded] = useState(false)
  const user = useAuthStore((s: any) => s.user)
  const navigation = useNavigation<any>()
  const { width, height: screenHeight } = Dimensions.get('window')
  const heroHeight = Math.round(width * 0.6) // slightly taller than 16:9 (~0.56)
  const carouselRef = useRef<FlatList<any> | null>(null)
  const viewerListRef = useRef<FlatList<any> | null>(null)
  const overlayOpacity = useRef(new Animated.Value(0)).current
  const imageScale = useRef(new Animated.Value(0.98)).current
  const isOwner = user?.uid === (listing as any)?.user?.id
  const isSold = !!(listing as any)?.sold
  const { isFavorite, toggle } = useFavoritesStore()
  const fav = listing ? isFavorite(listing.id) : false
  const hasMRP = !!(listing as any)?.originalPrice && !!listing && (listing as any).originalPrice > listing.price
  const discountPct = hasMRP && listing ? Math.max(0, Math.round((((listing as any).originalPrice - listing.price) / (listing as any).originalPrice) * 100)) : 0

  // Always refresh on focus to reflect edits/deletes
  useFocusEffect(
    useCallback(() => {
      let cancelled = false
      ;(async () => {
        try {
          setLoading(true)
          const list = await fetchListings({ ids: [id] })
          if (!cancelled) setListing(list.find((l) => l.id === id))
        } finally {
          if (!cancelled) setLoading(false)
        }
      })()
      return () => {
        cancelled = true
      }
    }, [id])
  )

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
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero image carousel (enlarged photos) */}
  <View style={{ width: '100%', height: heroHeight, backgroundColor: '#f3f4f6' }}>
          {listing.images && listing.images.length > 0 ? (
            <>
              <FlatList
                ref={carouselRef}
                data={listing.images}
                keyExtractor={(_, i) => `carousel-${i}`}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                renderItem={({ item, index }) => (
                  <Pressable onPress={() => {
                    setViewerIndex(index)
                    setViewerOpen(true)
                    overlayOpacity.setValue(0)
                    imageScale.setValue(0.98)
                    Animated.parallel([
                      Animated.timing(overlayOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
                      Animated.spring(imageScale, { toValue: 1, useNativeDriver: true, friction: 7, tension: 80 }),
                    ]).start()
                  }}>
                    <Image source={{ uri: item.uri }} style={{ width, height: heroHeight, backgroundColor: '#eee', resizeMode: 'cover' }} />
                  </Pressable>
                )}
                onMomentumScrollEnd={(e) => {
                  const idx = Math.round(e.nativeEvent.contentOffset.x / width)
                  setActiveImage(idx)
                }}
                getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
              />
              {listing.images.length > 1 ? (
                <View style={{ position: 'absolute', bottom: 12, width: '100%', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', gap: 6, backgroundColor: 'rgba(0,0,0,0.25)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 }}>
                    {listing.images.map((_, i) => (
                      <View
                        key={i}
                        style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: i === activeImage ? '#fff' : 'rgba(255,255,255,0.5)' }}
                      />
                    ))}
                  </View>
                </View>
              ) : null}
            </>
          ) : (
            <View style={{ width: '100%', height: heroHeight, backgroundColor: '#e5e7eb' }} />
          )}
        </View>
      {/* Fullscreen viewer modal for any image tap */}
      <Modal visible={viewerOpen} transparent animationType="none" onRequestClose={() => setViewerOpen(false)}>
        <Animated.View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', opacity: overlayOpacity }}>
          <View style={{ position: 'absolute', top: 40, left: 16, zIndex: 10 }}>
            <Pressable onPress={() => setViewerOpen(false)} style={{ backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Close</Text>
            </Pressable>
          </View>
          <FlatList
            ref={viewerListRef}
            data={listing.images || []}
            keyExtractor={(_, i) => String(i)}
            horizontal
            pagingEnabled
            style={{ flex: 1 }}
            initialScrollIndex={viewerIndex}
            getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
            onScrollToIndexFailed={() => {
              // Fallback if initial index fails: scroll after layout
              setTimeout(() => viewerListRef.current?.scrollToIndex?.({ index: viewerIndex, animated: false }), 0)
            }}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / width)
              setViewerIndex(idx)
            }}
            renderItem={({ item }) => (
              <View style={{ width, height: screenHeight, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {/* Overlay only catches taps on empty area (below zIndex of image) */}
                <Pressable
                  onPress={() => setViewerOpen(false)}
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}
                />
                <Animated.Image
                  source={{ uri: item.uri }}
                  style={{ width, height: screenHeight, resizeMode: 'contain', transform: [{ scale: imageScale }], position: 'relative', zIndex: 2 }}
                />
              </View>
            )}
            showsHorizontalScrollIndicator={false}
          />
          {listing.images && listing.images.length > 1 ? (
            <View style={{ position: 'absolute', bottom: 24, width: '100%', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', gap: 6, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 }}>
                {listing.images.map((_, i) => (
                  <View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: i === viewerIndex ? '#fff' : 'rgba(255,255,255,0.5)' }} />
                ))}
              </View>
            </View>
          ) : null}
        </Animated.View>
      </Modal>

    {/* Content section - full width */}
  <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>

          {/* Title and details now follow the enlarged images above */}

          {/* Title */}
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827' }}>{listing.title}</Text>

          {/* Price block like Flipkart */}
          <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 28, fontWeight: '800', color: '#111827' }}>₹{listing.price}</Text>
            {hasMRP ? (
              <Text style={{ marginLeft: 10, color: '#6b7280', textDecorationLine: 'line-through' }}>₹{(listing as any).originalPrice}</Text>
            ) : null}
            {hasMRP ? (
              <Text style={{ marginLeft: 10, color: '#16a34a', fontWeight: '800' }}>{discountPct}% off</Text>
            ) : null}
          </View>

          {/* Chips */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            {listing.barter ? (
              <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#a7f3d0', marginRight: 8 }}>
                <Text style={{ color: '#059669', fontWeight: '700' }}>Barter</Text>
              </View>
            ) : null}
            {isSold ? (
              <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fecaca' }}>
                <Text style={{ color: '#b91c1c', fontWeight: '800' }}>Sold</Text>
              </View>
            ) : null}
          </View>

          {/* Highlights card */}
          <View style={{ marginTop: 14, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, backgroundColor: '#ffffff' }}>
            <View style={{ paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="sparkles-outline" size={18} color="#111827" style={{ marginRight: 8 }} />
              <Text style={{ fontWeight: '700' }}>Highlights</Text>
            </View>
            <View style={{ paddingHorizontal: 12, paddingVertical: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name="cube-outline" size={18} color="#6b7280" style={{ marginRight: 8 }} />
                <Text style={{ color: '#111827' }}>
                  <Text style={{ fontWeight: '700' }}>Category: </Text>
                  <Text>{listing.category}</Text>
                </Text>
              </View>
              {listing.condition ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#10b981" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#111827' }}>
                    <Text style={{ fontWeight: '700' }}>Condition: </Text>
                    <Text>Used - {String(listing.condition).replace(/\b\w/g, (c) => c.toUpperCase()).replace('Like-New', 'Like New')}</Text>
                  </Text>
                </View>
              ) : null}
              {listing.location ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="location-outline" size={18} color="#0ea5e9" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#111827' }}>{listing.location}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Offers card */}
          <View style={{ marginTop: 14, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, backgroundColor: '#f8fafc' }}>
            <View style={{ paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="pricetag-outline" size={18} color="#111827" style={{ marginRight: 8 }} />
              <Text style={{ fontWeight: '700' }}>Offers</Text>
            </View>
            <View style={{ paddingHorizontal: 12, paddingVertical: 10 }}>
              {listing.barter ? (
                <Text style={{ marginBottom: 6, color: '#111827' }}>• Barter available on this item</Text>
              ) : (
                <Text style={{ marginBottom: 6, color: '#6b7280' }}>• Chat to ask for a barter</Text>
              )}
              <Text style={{ color: '#111827' }}>• Secure in-app chat deal</Text>
            </View>
          </View>

          {/* Description with read more/less */}
          {listing.description ? (
            <>
              <Text style={{ marginTop: 12, color: '#374151', lineHeight: 20 }} numberOfLines={descExpanded ? undefined : 4}>{listing.description}</Text>
              {listing.description && listing.description.length > 180 ? (
                <Pressable onPress={() => setDescExpanded((v) => !v)}>
                  <Text style={{ color: '#0ea5e9', fontWeight: '700', marginTop: 6 }}>{descExpanded ? 'Read less' : 'Read more'}</Text>
                </Pressable>
              ) : null}
            </>
          ) : null}

          {/* Seller info */}
          <View style={{ marginTop: 16 }}>
            <Text style={{ fontWeight: '700', marginBottom: 8 }}>Seller Information</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                <Text style={{ fontWeight: '800', color: '#6b7280' }}>{(listing.user?.name || 'S').slice(0,1).toUpperCase()}</Text>
              </View>
              <View>
                <Text style={{ fontWeight: '600' }}>{listing.user?.name || 'Seller'}</Text>
                {listing.user?.verified ? (
                  <Text style={{ color: '#6b7280' }}>Verified seller</Text>
                ) : null}
              </View>
            </View>
          </View>

          {/* Action row */}
          <View style={{ flexDirection: 'row', marginTop: 18 }}>
          {isOwner ? (
            <>
              <Pressable
                onPress={() => {
                  Alert.alert(
                    'Delete listing',
                    'This action will permanently remove this listing. Any chats linked to it will no longer show a product preview. This cannot be undone.',
                    [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete', style: 'destructive', onPress: async () => {
                        try {
                          await deleteListing(listing.id)
                          Alert.alert('Deleted', 'Your listing has been deleted.')
                          navigation.goBack()
                        } catch (e: any) {
                          Alert.alert('Delete failed', e?.message || 'Unable to delete')
                        }
                      }
                    }
                  ])
                }}
                style={{ backgroundColor: '#ef4444', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, marginRight: 12 }}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Delete</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  // Navigate to edit screen with current listing
                  navigation.navigate('EditListing', { id: listing.id, item: listing })
                }}
                style={{ backgroundColor: '#14b8a6', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, marginRight: 12 }}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Edit</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable
                onPress={isSold ? undefined : async () => {
                  try {
                    if (!user) { Alert.alert('Login required', 'Please login to chat with the seller.'); return }
                    const { chatId, listing: l, other } = await startChat(listing.id)
                    const composedTitle = `${other?.name ?? 'Seller'} - ${l?.title || listing.title}`
                    navigation.navigate('ChatWindow', { chatId, title: composedTitle })
                  } catch (e: any) {
                    Alert.alert('Chat failed', e?.message || 'Could not start chat')
                  }
                }}
                style={{ backgroundColor: isSold ? '#d1d5db' : '#34d399', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 10, flex: 1, opacity: isSold ? 0.7 : 1 }}
              >
                <Text style={{ color: '#fff', fontWeight: '800', textAlign: 'center' }}>{isSold ? 'Item Sold' : 'Chat with Seller'}</Text>
              </Pressable>
            </>
          )}
          </View>
      </View>
      </ScrollView>

      {/* Bottom action bar for buyers */}
      {!isOwner && (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb', padding: 12, flexDirection: 'row', alignItems: 'center' }}>
          <Pressable
            onPress={() => listing && toggle(listing.id)}
            style={{ borderWidth: 1, borderColor: fav ? '#fecaca' : '#e5e7eb', backgroundColor: fav ? '#fee2e2' : '#fff', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, marginRight: 12, flexDirection: 'row', alignItems: 'center' }}
            accessibilityLabel={fav ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Ionicons name={fav ? 'heart' : 'heart-outline'} size={22} color={fav ? '#ef4444' : '#6b7280'} />
            <Text style={{ marginLeft: 8, fontWeight: '700', color: fav ? '#ef4444' : '#374151' }}>{fav ? 'Wishlisted' : 'Wishlist'}</Text>
          </Pressable>
          <Pressable
            onPress={isSold ? undefined : async () => {
              try {
                if (!user) { Alert.alert('Login required', 'Please login to chat with the seller.'); return }
                const { chatId, listing: l, other } = await startChat(listing!.id)
                const composedTitle = `${other?.name ?? 'Seller'} - ${l?.title || listing!.title}`
                navigation.navigate('ChatWindow', { chatId, title: composedTitle })
              } catch (e: any) {
                Alert.alert('Chat failed', e?.message || 'Could not start chat')
              }
            }}
            style={{ flex: 1, backgroundColor: isSold ? '#d1d5db' : '#34d399', paddingVertical: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center', opacity: isSold ? 0.7 : 1 }}
            accessibilityLabel={isSold ? 'Item Sold' : 'Chat with Seller'}
          >
            <Text style={{ color: '#fff', fontWeight: '800' }}>{isSold ? 'Item Sold' : 'Chat with Seller'}</Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}

export default ListingDetailScreen
