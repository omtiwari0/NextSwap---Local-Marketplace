import React from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import type { Listing } from '../types'
import { Ionicons } from '@expo/vector-icons'

type Props = {
  item: Listing
  isFavorite?: boolean
  onToggleFavorite?: (id: string) => void
  onPress?: () => void
}

const ProductCard: React.FC<Props> = ({ item, isFavorite, onToggleFavorite, onPress }) => {
  const fallbackEmoji = (() => {
    const cat = (item.category || '').toLowerCase()
    if (cat.includes('book')) return '📚'
    if (cat.includes('elect')) return '💻'
    if (cat.includes('fashion') || cat.includes('cloth') || cat.includes('apparel')) return '👕'
    if (cat.includes('shoe')) return '👟'
    return '📦'
  })()

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <View style={styles.imageWrap}>
        {item.images?.[0]?.uri ? (
          <Image source={{ uri: item.images[0].uri }} style={styles.image} />
        ) : (
          <View style={[styles.image, { backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ fontSize: 52 }}>{fallbackEmoji}</Text>
          </View>
        )}
        <TouchableOpacity
          onPress={() => onToggleFavorite?.(item.id)}
          style={styles.heart}
        >
          <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={18} color={isFavorite ? '#ef4444' : '#9ca3af'} />
        </TouchableOpacity>
        {item.barter && (
          <View style={styles.barter}><Text style={styles.barterText}>Barter</Text></View>
        )}
      </View>
      <View style={{ padding: 10 }}>
        <Text numberOfLines={1} style={{ fontWeight: '600' }}>{item.title}</Text>
        {item.location ? (
          <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{item.location}</Text>
        ) : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
          <View>
            <Text style={{ color: '#2563eb', fontWeight: '700' }}>₹{item.price}</Text>
            {item.originalPrice ? (
              <Text style={{ fontSize: 12, color: '#9ca3af', textDecorationLine: 'line-through' }}>₹{item.originalPrice}</Text>
            ) : null}
          </View>
          {item.condition ? (
            <Text style={{ fontSize: 12, backgroundColor: '#e5e7eb', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, textTransform: 'capitalize' }}>
              {item.condition}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', height: 300 },
  imageWrap: { position: 'relative', height: 180, backgroundColor: '#f3f4f6' },
  image: { width: '100%', height: '100%' },
  heart: { position: 'absolute', top: 8, right: 8, backgroundColor: '#fff', borderRadius: 999, padding: 6, elevation: 1 },
  barter: { position: 'absolute', top: 8, left: 8, backgroundColor: '#22c55e', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  barterText: { color: '#fff', fontSize: 10, fontWeight: '700' },
})

export default ProductCard
