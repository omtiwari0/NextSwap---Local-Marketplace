import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import BottomNav from '../../components/common/BottomNav'
import { useAuthStore } from '../../store/authStore'
import { Auth } from '../../services/auth.service'
import { useFavoritesStore } from '../../store/favoritesStore'
import { orders } from '../../data/orders'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>()
  const insets = useSafeAreaInsets()
  const { user, clearAuth } = useAuthStore()
  const { ids: favoriteIds, clear: clearFavorites } = useFavoritesStore()

  const logout = async () => {
    try {
      await Auth.logout()
    } catch {}
    clearAuth()
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Simple blue header for context */}
      <View style={{ backgroundColor: '#2563eb', paddingHorizontal: 16, paddingTop: 6, paddingBottom: 10 }}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800' }}>Profile</Text>
      </View>
  <View style={{ flex: 1, padding: 16, paddingBottom: 80 + insets.bottom }}>
        <View style={{ alignItems: 'center', marginVertical: 16 }}>
          <View style={{ width: 80, height: 80, borderRadius: 999, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="person" size={40} color="#9ca3af" />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '800', marginTop: 12 }}>
            {user ? `User ${user.uid.slice(0, 6)}...` : 'Guest'}
          </Text>
          <Text style={{ color: '#6b7280', marginTop: 4 }}>{user?.phoneNumber ?? 'Not signed in'}</Text>
        </View>

        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e5e7eb' }}>
          <Text style={{ fontWeight: '700', marginBottom: 12 }}>Overview</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: '800' }}>{favoriteIds.length}</Text>
              <Text style={{ color: '#6b7280' }}>Favorites</Text>
            </View>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: '800' }}>{orders.length}</Text>
              <Text style={{ color: '#6b7280' }}>Orders</Text>
            </View>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: '800' }}>{0}</Text>
              <Text style={{ color: '#6b7280' }}>Listings</Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 16, gap: 12 as any }}>
          {!user ? (
            <Pressable onPress={() => navigation.navigate('Auth')} style={{ backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Log in / Register</Text>
            </Pressable>
          ) : (
            <>
              <Pressable onPress={logout} style={{ backgroundColor: '#ef4444', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Log out</Text>
              </Pressable>
              <Pressable onPress={clearFavorites} style={{ backgroundColor: '#e5e7eb', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}>
                <Text style={{ color: '#374151', fontWeight: '700' }}>Clear Favorites</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
      <BottomNav currentTab="profile" />
    </SafeAreaView>
  )
}

export default ProfileScreen
