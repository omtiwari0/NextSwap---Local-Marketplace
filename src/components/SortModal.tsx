import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

type Sort = 'newest' | 'price-low' | 'price-high' | 'popular'

type Props = {
  visible: boolean
  onClose: () => void
  sortBy: Sort
  setSortBy: (s: Sort) => void
}

const SortModal: React.FC<Props> = ({ visible, onClose, sortBy, setSortBy }) => {
  if (!visible) return null

  const options: { id: Sort; name: string }[] = [
    { id: 'newest', name: 'Newest First' },
    { id: 'price-low', name: 'Price: Low to High' },
    { id: 'price-high', name: 'Price: High to Low' },
    { id: 'popular', name: 'Most Popular' },
  ]

  return (
    <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
      <Pressable style={{ flex: 1 }} onPress={onClose} />
      <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, maxHeight: 360 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '700' }}>Sort By</Text>
          <Pressable onPress={onClose}><Ionicons name="close" size={22} /></Pressable>
        </View>
        {options.map((opt) => (
          <Pressable key={opt.id} onPress={() => { setSortBy(opt.id); onClose() }} style={{ paddingVertical: 12, paddingHorizontal: 8, borderRadius: 8, backgroundColor: sortBy === opt.id ? '#dbeafe' : 'transparent', marginBottom: 8 }}>
            <Text style={{ color: sortBy === opt.id ? '#2563eb' : '#111827', fontWeight: sortBy === opt.id ? '700' as any : '400' }}>{opt.name}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}

export default SortModal
