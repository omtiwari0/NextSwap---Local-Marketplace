import React from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import type { Listing } from '../../types'

type Props = {
  item: Listing
  onPress?: () => void
}

const ListingCard: React.FC<Props> = ({ item, onPress }) => {
  const imageUri = item.images?.[0]?.uri
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]} />
      )}
      <View style={styles.row}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.price}>${item.price}</Text>
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
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8 },
  title: { fontSize: 16, fontWeight: '600', flex: 1, marginRight: 8 },
  price: { fontSize: 16, fontWeight: '700' },
  category: { fontSize: 12, color: '#666' },
  badge: { backgroundColor: '#16a34a', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
})

export default ListingCard
