import React, { useCallback, useEffect, useState } from 'react'
import { View, Text, Pressable, FlatList, Image, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import BottomNav from '../../components/common/BottomNav'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuthStore } from '../../store/authStore'
import { useNavigation } from '@react-navigation/native'
import { fetchChats } from '../../services/chats.service'

const ChatsScreen: React.FC = () => {
  const insets = useSafeAreaInsets()
  const user = useAuthStore((s: any) => s.user)
  const navigation = useNavigation<any>()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [refreshing, setRefreshing] = useState<boolean>(false)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await fetchChats()
      setItems(data)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    load()
  }, [user])

  const onRefresh = useCallback(async () => {
    if (!user) return
    setRefreshing(true)
    try {
      const data = await fetchChats()
      setItems(data)
    } finally {
      setRefreshing(false)
    }
  }, [user])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Simple blue header for context */}
      <View style={{ backgroundColor: '#2563eb', paddingHorizontal: 16, paddingTop: 6, paddingBottom: 10 }}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800' }}>Chats</Text>
      </View>

      {user ? (
        items.length === 0 && !loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <Ionicons name="chatbubbles-outline" size={64} color="#9ca3af" />
            <Text style={{ fontSize: 20, fontWeight: '700', marginTop: 12 }}>No chats yet</Text>
            <Text style={{ color: '#6b7280', marginTop: 6, textAlign: 'center' }}>Start a conversation with sellers or buyers.</Text>
          </View>
        ) : (
          <FlatList
            contentContainerStyle={{ padding: 12 }}
            data={items}
            keyExtractor={(it) => it.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  const composed = `${item.other?.name ?? 'Seller'} - ${item.listing?.title ?? 'Chat'}`
                  navigation.navigate('ChatWindow', { chatId: item.id, title: composed })
                }}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}
              >
                {item.other?.photoUrl ? (
                  <Image source={{ uri: item.other.photoUrl }} style={{ width: 44, height: 44, borderRadius: 999, backgroundColor: '#e5e7eb', marginRight: 12 }} />
                ) : item.listing?.imageUri ? (
                  <Image source={{ uri: item.listing.imageUri }} style={{ width: 44, height: 44, borderRadius: 8, backgroundColor: '#e5e7eb', marginRight: 12 }} />
                ) : (
                  <View style={{ width: 44, height: 44, borderRadius: 8, backgroundColor: '#e5e7eb', marginRight: 12, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="chatbubbles-outline" size={20} color="#9ca3af" />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700' }}>{item.other?.name ?? 'Chat'}</Text>
                  <Text style={{ color: '#6b7280' }} numberOfLines={1}>{item.listing?.title ?? item.lastMessage?.body ?? 'No messages yet'}</Text>
                </View>
                {item.unreadCount > 0 ? (
                  <View style={{ backgroundColor: '#ef4444', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, marginRight: 8 }}>
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>{item.unreadCount}</Text>
                  </View>
                ) : null}
                <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
              </Pressable>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#e5e7eb' }} />}
          />
        )
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Ionicons name="chatbubbles-outline" size={64} color="#9ca3af" />
          <Text style={{ fontSize: 20, fontWeight: '700', marginTop: 12 }}>Login to chat</Text>
          <Text style={{ color: '#6b7280', marginTop: 6, textAlign: 'center' }}>Sign in to see and start conversations.</Text>
          <Pressable onPress={() => navigation.navigate('Auth')} style={{ marginTop: 16, backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Go to Login</Text>
          </Pressable>
        </View>
      )}

      <View style={{ height: 80 + insets.bottom }} />
      <BottomNav currentTab="chats" />
    </SafeAreaView>
  )
}

export default ChatsScreen
