import React from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import type { Listing } from '../../types'
import { useFavoritesStore } from '../../store/favoritesStore'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../../store/authStore'

type Props = {
  item: Listing
  onPress?: () => void
}

const ListingCard: React.FC<Props> = ({ item, onPress }) => {
  const imageUri = item.images?.[0]?.uri
  const { isFavorite, toggle } = useFavoritesStore()
  const fav = isFavorite(item.id)
  const me = useAuthStore((s:any)=>s.user)
  const isOwner = me?.uid && item.user?.id === me.uid
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <View>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]} />
        )}
        {!isOwner && (
          <TouchableOpacity onPress={() => toggle(item.id)} style={styles.heartBtn} accessibilityLabel="Toggle favorite">
            <Ionicons name={fav ? 'heart' : 'heart-outline'} size={18} color={fav ? '#ef4444' : '#111827'} />
          </TouchableOpacity>
        )}
        {item.barter ? (
          <View style={styles.barterTag}>
            <Text style={styles.barterText}>Barter</Text>
          </View>
        ) : null}
        {item as any && (item as any).sold ? (
          <View style={styles.soldTag}>
            <Text style={styles.soldText}>Sold</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.row}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
  <Text style={styles.price}>₹{item.price}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.category}>{item.category}</Text>
        {item.user?.verified && (
          <View style={styles.badge}><Text style={styles.badgeText}>Verified</Text></View>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', marginBottom: 12 },
  image: { width: '100%', height: 160, backgroundColor: '#eee' },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  heartBtn: { position: 'absolute', right: 8, top: 8, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 999, padding: 6 },
  barterTag: { position: 'absolute', left: 8, top: 8, backgroundColor: '#22c55e', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  barterText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  soldTag: { position: 'absolute', left: 8, bottom: 8, backgroundColor: '#111827', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  soldText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8 },
  title: { fontSize: 16, fontWeight: '600', flex: 1, marginRight: 8 },
  price: { fontSize: 16, fontWeight: '700' },
  category: { fontSize: 12, color: '#666' },
  badge: { backgroundColor: '#16a34a', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
})

export default ListingCard
