import React from 'react'
import { View, Text, FlatList, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import BottomNav from '../../components/common/BottomNav'
import { orders } from '../../data/orders'
import type { Order } from '../../types'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

const OrdersScreen: React.FC = () => {
  const navigation = useNavigation<any>()
  const insets = useSafeAreaInsets()
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Simple blue header for context */}
      <View style={{ backgroundColor: '#2563eb', paddingHorizontal: 16, paddingTop: 6, paddingBottom: 10 }}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800' }}>Orders</Text>
      </View>
      {orders.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Ionicons name="cart-outline" size={64} color="#9ca3af" />
          <Text style={{ fontSize: 20, fontWeight: '700', marginTop: 12 }}>No orders yet</Text>
          <Text style={{ color: '#6b7280', marginTop: 6, textAlign: 'center' }}>Your purchases will show up here.</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ padding: 12, paddingBottom: 80 + insets.bottom }}
          data={orders}
          keyExtractor={(o) => o.id}
          renderItem={({ item }) => <OrderRow order={item} onPress={() => navigation.navigate('ListingDetail', { id: item.item.id, item: item.item })} />}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
      <BottomNav currentTab="orders" />
    </SafeAreaView>
  )
}

const statusColor = (s: Order['status']) => {
  switch (s) {
    case 'delivered': return '#22c55e'
    case 'shipped': return '#2563eb'
    case 'processing': return '#f59e0b'
    case 'cancelled': return '#ef4444'
    default: return '#6b7280'
  }
}

const OrderRow: React.FC<{ order: Order; onPress: () => void }> = ({ order, onPress }) => {
  const img = order.item.images?.[0]?.uri
  return (
    <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', elevation: 0.5 }}>
      <View style={{ width: 64, height: 64, borderRadius: 8, overflow: 'hidden', backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}>
        {img ? (
          <Image source={{ uri: img }} style={{ width: '100%', height: '100%' }} />
        ) : (
          <Ionicons name="image-outline" size={24} color="#9ca3af" />
        )}
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text numberOfLines={1} style={{ fontWeight: '600' }}>{order.item.title}</Text>
        <Text style={{ color: '#6b7280', marginTop: 2 }}>{new Date(order.createdAt).toLocaleDateString()}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
          <View style={{ backgroundColor: statusColor(order.status), paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>
            <Text style={{ color: '#fff', fontSize: 12, textTransform: 'capitalize' }}>{order.status}</Text>
          </View>
          <Text style={{ marginLeft: 10, fontWeight: '700' }}>₹{order.total}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={22} color="#9ca3af" onPress={onPress} />
    </View>
  )
}

export default OrdersScreen
