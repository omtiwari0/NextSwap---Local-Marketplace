import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuthStore } from '../../store/authStore'

type TabId = 'home' | 'chats' | 'post' | 'favorites' | 'orders' | 'profile'

type Props = {
  currentTab: TabId
}

const BottomNav: React.FC<Props> = ({ currentTab }) => {
  const navigation = useNavigation<any>()
  const insets = useSafeAreaInsets()
  const user = useAuthStore((s:any)=>s.user)

  const tabs: { id: TabId; icon: string; label: string }[] = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'chats', icon: 'chatbubbles', label: 'Chats' },
    { id: 'post', icon: 'add-circle', label: 'Add' },
    { id: 'orders', icon: 'cart', label: 'Orders' },
    { id: 'profile', icon: 'person', label: 'Account' },
  ]

  const onPress = (id: TabId) => {
    if (id === 'home') navigation.navigate('Home')
  if (id === 'post') {
    if (!user) return navigation.navigate('Auth')
    return navigation.navigate('CreateListing')
  }
  if (id === 'chats') navigation.navigate('ChatsSoon')
    if (id === 'favorites') navigation.navigate('FavoritesSoon')
  if (id === 'orders') navigation.navigate('OrdersSoon')
  if (id === 'profile') navigation.navigate('ProfileSoon')
  }

  return (
    <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 6, paddingBottom: 8 + insets.bottom, paddingHorizontal: 8, flexDirection: 'row' }}>
      {tabs.map((tab) => {
        const active = currentTab === tab.id
        if (tab.id === 'post') {
          return (
            <Pressable key={tab.id} style={{ flex: 1, alignItems: 'center' }} onPress={() => onPress(tab.id)}>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center', marginTop: -18, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 5 }}>
                <Ionicons name="add" size={30} color="#fff" />
              </View>
              <Text style={{ fontSize: 11, color: '#2563eb', marginTop: 2 }}>Add</Text>
            </Pressable>
          )
        }
        const iconName = (tab.icon + (active ? '' : '-outline')) as any
        const color = active ? '#2563eb' : '#6b7280'
        return (
          <Pressable key={tab.id} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }} onPress={() => onPress(tab.id)}>
            <Ionicons name={iconName} size={22} color={color} />
            <Text style={{ fontSize: 11, color, marginTop: 2 }}>{tab.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

export default BottomNav
