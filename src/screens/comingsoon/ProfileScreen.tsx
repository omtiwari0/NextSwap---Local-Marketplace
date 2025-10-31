import React, { useEffect, useState } from 'react'
import { View, Text, Pressable, Alert, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import BottomNav from '../../components/common/BottomNav'
import { useAuthStore } from '../../store/authStore'
import { Auth } from '../../services/auth.service'
import { useFavoritesStore } from '../../store/favoritesStore'
import { orders } from '../../data/orders'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { fetchListings } from '../../services/listings.service'
// Inline quick edit removed; editing happens in dedicated Edit Profile screen

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>()
  const insets = useSafeAreaInsets()
  const { user, clearAuth } = useAuthStore()
  const { ids: favoriteIds } = useFavoritesStore()
  const [myListingsCount, setMyListingsCount] = useState<number>(0)
  // Removed inline editing state (name/phone/photo)

  useEffect(() => {
    if (!user) {
      Alert.alert('Login required', 'Please login to view your profile.', [
        { text: 'Cancel', style: 'cancel', onPress: () => navigation.goBack() },
        { text: 'Login', onPress: () => navigation.navigate('Auth') },
      ])
    }
  }, [user])

  useEffect(() => {
    (async () => {
      if (!user) return
      try {
        const list = await fetchListings({ userId: user.uid })
        setMyListingsCount(list.length)
      } catch {}
    })()
  }, [user])

  const logout = async () => {
    try {
      await Auth.logout()
    } catch {}
    clearAuth()
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Blue header */}
      <View style={{ backgroundColor: '#2563eb', paddingHorizontal: 16, paddingTop: 6, paddingBottom: 10 }}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800' }}>Account</Text>
      </View>
      <View style={{ flex: 1, padding: 16, paddingBottom: 80 + insets.bottom }}>
        {/* Horizontal profile row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 as any, marginBottom: 16 }}>
          <View>
            {user?.photoUrl ? (
              <Image source={{ uri: user.photoUrl }} style={{ width: 72, height: 72, borderRadius: 999, backgroundColor: '#e5e7eb' }} />
            ) : (
              <View style={{ width: 72, height: 72, borderRadius: 999, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="person" size={36} color="#9ca3af" />
              </View>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '800' }}>{user ? (user.name || user.email || `User ${user.uid.slice(0, 6)}...`) : 'Guest'}</Text>
            <Text style={{ color: '#6b7280', marginTop: 2 }}>{user ? (user.phone || user.email || 'Signed in') : 'Not signed in'}</Text>
          </View>
          {!user ? (
            <Pressable onPress={() => navigation.navigate('Auth')} style={{ backgroundColor: '#2563eb', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Login</Text>
            </Pressable>
          ) : null}
        </View>
        {/* Inline quick edit removed. Use the Profile option below to edit */}

        {/* Options list */}
        <View style={{ backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden' }}>
          {user && (
              <>
                <OptionRow icon="person" label="Profile" onPress={() => navigation.navigate('EditProfile')} />
                <Separator />
                <OptionRow icon="list" label="My Listings" onPress={() => navigation.navigate('MyListings')} />
                <Separator />
                <OptionRow icon="heart" label="My Wishlist" onPress={() => navigation.navigate('FavoritesSoon')} />
                <Separator />
              </>
          )}
          <OptionRow icon="document-text" label="Terms & Conditions" onPress={() => navigation.navigate('Terms')} />
          <Separator />
          <OptionRow icon="help-circle" label="FAQs" onPress={() => navigation.navigate('Faqs')} />
          {user && (
            <>
              <Separator />
              <OptionRow icon="log-out" label="Log out" danger onPress={logout} />
            </>
          )}
        </View>

        {/* Overview moved below options */}
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e5e7eb', marginTop: 16 }}>
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
              <Text style={{ fontSize: 18, fontWeight: '800' }}>{myListingsCount}</Text>
              <Text style={{ color: '#6b7280' }}>Listings</Text>
            </View>
          </View>
        </View>
      </View>
      <BottomNav currentTab="profile" />
    </SafeAreaView>
  )
}

export default ProfileScreen

const OptionRow = ({ icon, label, onPress, danger }: { icon: any; label: string; onPress: () => void; danger?: boolean }) => (
  <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 }}>
    <Ionicons name={(icon + '-outline') as any} size={20} color={danger ? '#ef4444' : '#111827'} />
    <Text style={{ marginLeft: 12, fontWeight: '600', color: danger ? '#ef4444' : '#111827', flex: 1 }}>{label}</Text>
    <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
  </Pressable>
)

const Separator = () => <View style={{ height: 1, backgroundColor: '#e5e7eb' }} />
