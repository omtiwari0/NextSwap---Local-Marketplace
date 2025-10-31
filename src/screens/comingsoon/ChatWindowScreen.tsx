import React, { useEffect, useRef, useState } from 'react'
import { View, Text, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform, Image } from 'react-native'
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native'
import { fetchMessages, sendMessage, fetchChatMeta, clearChat, fetchDeal, confirmDeal } from '../../services/chats.service'
import { connectSocket, getSocket } from '../../services/socket'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuthStore } from '../../store/authStore'
import { Ionicons } from '@expo/vector-icons'

const ChatWindowScreen: React.FC = () => {
  const route = useRoute<any>()
  const navigation = useNavigation<any>()
  const insets = useSafeAreaInsets()
  const { chatId, title } = route.params || {}
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const listRef = useRef<FlatList>(null)
  const myUid = useAuthStore((s: any) => s.user?.uid)
  const [meta, setMeta] = useState<{ listing?: { id: string; title: string; imageUri?: string | null } | null; other?: { id: string; name: string; photoUrl?: string | null } | null } | null>(null)
  const [deal, setDeal] = useState<{ role: 'buyer' | 'seller'; status: 'none' | 'pending' | 'confirmed' }>({ role: 'buyer', status: 'none' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const m = await fetchChatMeta(chatId)
        setMeta({ listing: m.listing, other: m.other })
        try {
          const d = await fetchDeal(chatId)
          setDeal({ role: d.role, status: d.status })
        } catch {}
        const composed = title ?? `${m.other?.name ?? 'Seller'} - ${m.listing?.title ?? 'Chat'}`
        navigation.setOptions({
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {m.other?.photoUrl ? (
                <Image source={{ uri: m.other.photoUrl }} style={{ width: 28, height: 28, borderRadius: 999, marginRight: 8 }} />
              ) : null}
              <View>
                <Text style={{ fontWeight: '700' }}>{m.other?.name ?? 'Seller'}</Text>
                <Text style={{ color: '#6b7280', fontSize: 12 }} numberOfLines={1}>{m.listing?.title ?? 'Chat'}</Text>
              </View>
            </View>
          ),
          headerRight: () => (
            <Pressable
              onPress={async () => {
                // Simple clear chat action
                try {
                  await clearChat(chatId)
                  setMessages([])
                } catch {}
              }}
              hitSlop={10}
              style={{ paddingHorizontal: 8 }}
            >
              <Ionicons name="trash-outline" size={20} color="#111827" />
            </Pressable>
          ),
        })
      } catch {
        navigation.setOptions({ title: title ?? 'Chat' })
      }
    })()
  }, [chatId, title])

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchMessages(chatId)
        setMessages(data)
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50)
      } catch {}
    })()
  }, [chatId])

  // On focus, refresh messages (also marks read server-side)
  useFocusEffect(
    React.useCallback(() => {
      let active = true
      ;(async () => {
        try {
          const data = await fetchMessages(chatId)
          if (active) {
            setMessages(data)
            setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50)
          }
        } catch {}
      })()
      // Realtime wiring
      const s = connectSocket()
      const handleNew = (msg: any) => {
        if (!msg || msg.senderId == null) return
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]))
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 20)
      }
      const handleRead = (payload: any) => {
        if (!payload || payload.chatId !== chatId) return
        const lastReadAt = payload.lastReadAt ? new Date(payload.lastReadAt) : null
        if (!lastReadAt) return
        setMessages((prev) => prev.map((m) => (m.senderId === myUid && new Date(m.createdAt) <= lastReadAt ? { ...m, read: true } : m)))
      }
      s?.emit('chat:join', chatId)
      s?.on('message:new', handleNew)
      s?.on('chat:read', handleRead)
      return () => {
        active = false
        const s2 = getSocket()
        s2?.emit('chat:leave', chatId)
        s2?.off('message:new', handleNew)
        s2?.off('chat:read', handleRead)
      }
    }, [chatId])
  )

  const onSend = async () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    try {
      const s = getSocket()
      if (s && s.connected) {
        s.emit('message:send', { chatId, body: text })
      } else {
        const msg = await sendMessage(chatId, text)
        setMessages((prev) => [...prev, msg])
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50)
      }
    } catch {}
  }

  const onConfirmDeal = async () => {
    try {
      setSubmitting(true)
      const resp = await confirmDeal(chatId)
      // If buyer, first click sets pending; if seller, it confirms
      setDeal((prev) => ({ ...prev, status: resp.status }))
    } catch (e) {
      // noop for now
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        ref={listRef}
        contentContainerStyle={{ padding: 12, paddingBottom: 12 }}
        data={messages}
        keyExtractor={(m) => m.id}
        ListHeaderComponent={meta?.listing ? (
          <Pressable
            onPress={() => navigation.navigate('ListingDetail', { id: meta.listing!.id })}
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}
          >
            {meta.listing?.imageUri ? (
              <Image source={{ uri: meta.listing.imageUri }} style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#e5e7eb', marginRight: 10 }} />
            ) : (
              <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#e5e7eb', marginRight: 10 }} />
            )}
            <Text style={{ fontWeight: '700' }}>{meta.listing?.title}</Text>
          </Pressable>
        ) : null}
        ListFooterComponent={
          <View style={{ marginTop: 6 }}>
            {deal.status === 'confirmed' ? (
              <View style={{ alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ color: '#16a34a', fontWeight: '700' }}>Deal confirmed. This item is sold.</Text>
              </View>
            ) : deal.role === 'buyer' ? (
              deal.status === 'pending' ? (
                <View style={{ alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ color: '#9ca3af', fontWeight: '600' }}>Waiting for seller confirmation…</Text>
                </View>
              ) : (
                <View style={{ alignItems: 'center', marginBottom: 8 }}>
                  <Pressable onPress={onConfirmDeal} disabled={submitting} style={{ backgroundColor: '#2563eb', opacity: submitting ? 0.6 : 1, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999 }}>
                    <Text style={{ color: '#fff', fontWeight: '700' }}>Confirm Deal</Text>
                  </Pressable>
                </View>
              )
            ) : deal.role === 'seller' && deal.status === 'pending' ? (
              <View style={{ alignItems: 'center', marginBottom: 8 }}>
                <Pressable onPress={onConfirmDeal} disabled={submitting} style={{ backgroundColor: '#16a34a', opacity: submitting ? 0.6 : 1, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999 }}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Confirm Deal with buyer</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => {
          const mine = item.senderId === myUid
          return (
            <View style={{ marginBottom: 8, alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
              <View style={{ backgroundColor: mine ? '#2563eb' : '#f3f4f6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 }}>
                <Text style={{ color: mine ? '#fff' : '#111827' }}>{item.body}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: mine ? 'flex-end' : 'flex-start', marginTop: 2 }}>
                <Text style={{ color: '#9ca3af', fontSize: 11, marginRight: mine ? 4 : 0 }}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
                {mine ? (
                  <Ionicons
                    name={item.read ? 'checkmark-done' : 'checkmark'}
                    size={14}
                    color={item.read ? '#60a5fa' : '#9ca3af'}
                  />
                ) : null}
              </View>
            </View>
          )
        }}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 12 + insets.bottom, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
        <Pressable style={{ marginRight: 8 }}>
          <Ionicons name="attach" size={22} color="#6b7280" />
        </Pressable>
        <TextInput value={input} onChangeText={setInput} placeholder="Type a message" style={{ flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, marginRight: 8 }} />
        <Pressable onPress={onSend} style={{ backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999 }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

export default ChatWindowScreen
