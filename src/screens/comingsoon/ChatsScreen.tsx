import React from 'react'
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import BottomNav from '../../components/common/BottomNav'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

const ChatsScreen: React.FC = () => {
  const insets = useSafeAreaInsets()
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Simple blue header for context */}
      <View style={{ backgroundColor: '#2563eb', paddingHorizontal: 16, paddingTop: 6, paddingBottom: 10 }}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800' }}>Chats</Text>
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Ionicons name="chatbubbles-outline" size={64} color="#9ca3af" />
        <Text style={{ fontSize: 20, fontWeight: '700', marginTop: 12 }}>No chats yet</Text>
        <Text style={{ color: '#6b7280', marginTop: 6, textAlign: 'center' }}>Start a conversation with sellers or buyers.</Text>
      </View>

      <View style={{ height: 80 + insets.bottom }} />
      <BottomNav currentTab="chats" />
    </SafeAreaView>
  )
}

export default ChatsScreen
