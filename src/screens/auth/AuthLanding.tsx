import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { useNavigation } from '@react-navigation/native'

const AuthLanding: React.FC = () => {
  const navigation = useNavigation<any>()
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 24 }}>Welcome to NearSwap</Text>
      <Pressable
        style={{ backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginBottom: 12 }}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={{ color: 'white', fontWeight: '600' }}>Log in</Text>
      </Pressable>
      <Pressable
        style={{ backgroundColor: '#10b981', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 }}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={{ color: 'white', fontWeight: '600' }}>Create account</Text>
      </Pressable>
    </View>
  )
}

export default AuthLanding
